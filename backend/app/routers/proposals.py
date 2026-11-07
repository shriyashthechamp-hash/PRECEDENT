from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.proposal import Proposal, RfpQuestion, ProposalResponse, ProposalStatus, ResponseStatus
from app.models.client import Client, Sector, CompanyProfile
from app.schemas.proposal import (
    ProposalOut,
    ProposalCreate,
    QuestionOut,
    ProposalResponseOut,
    GenerateAnswerRequest
)
from app.schemas.memory import HindsightRecallRequest
from app.services.groq_engine import groq_proposal_engine
from app.services.hindsight import hindsight_service
from app.services.contradiction import contradiction_engine

router = APIRouter(prefix="/proposals", tags=["Proposals"])

@router.get("", response_model=List[ProposalOut])
def list_proposals(
    status: Optional[str] = None,
    client_id: Optional[str] = None,
    sector_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Proposal)
    if status:
        query = query.filter(Proposal.status == status)
    if client_id:
        query = query.filter(Proposal.client_id == client_id)
    if sector_id:
        query = query.filter(Proposal.sector_id == sector_id)
        
    proposals = query.order_by(Proposal.created_at.desc()).all()
    # update dynamic count fields
    for p in proposals:
        p.total_questions = len(p.questions)
        p.reviewed_questions = sum(1 for q in p.questions if any(r.status in [ResponseStatus.ACCEPTED.value, ResponseStatus.EDITED.value] for r in q.responses))
    return proposals

@router.post("", response_model=ProposalOut)
def create_proposal(payload: ProposalCreate, db: Session = Depends(get_db)):
    prop = Proposal(
        title=payload.title,
        rfp_reference=payload.rfp_reference,
        client_id=payload.client_id,
        sector_id=payload.sector_id,
        deadline=payload.deadline,
        status=ProposalStatus.DRAFT.value
    )
    db.add(prop)
    db.commit()
    db.refresh(prop)
    return prop

@router.get("/{proposal_id}")
def get_proposal_detail(proposal_id: str, db: Session = Depends(get_db)):
    prop = db.query(Proposal).filter(Proposal.id == proposal_id).first()
    if not prop:
        raise HTTPException(status_code=404, detail=f"Proposal '{proposal_id}' not found.")
        
    client = db.query(Client).filter(Client.id == prop.client_id).first() if prop.client_id else None
    sector = db.query(Sector).filter(Sector.id == prop.sector_id).first() if prop.sector_id else None
    
    questions_list = []
    for q in prop.questions:
        responses = [
            {
                "id": r.id,
                "proposed_answer": r.proposed_answer,
                "confidence_score": r.confidence_score,
                "supporting_sources": r.supporting_sources,
                "recalled_precedents": r.recalled_precedents,
                "missing_information": r.missing_information,
                "potential_risks": r.potential_risks,
                "verification_required": r.verification_required,
                "status": r.status,
                "version": r.version,
                "generation_mode": r.generation_mode,
                "generation_latency_ms": r.generation_latency_ms,
                "created_at": r.created_at.isoformat(),
                "review_events": [
                    {
                        "id": rev.id,
                        "original_answer": rev.original_answer,
                        "corrected_answer": rev.corrected_answer,
                        "correction_reason": rev.correction_reason,
                        "category_tag": rev.category_tag,
                        "reviewer_name": rev.reviewer_name,
                        "status": rev.status,
                        "is_retained_in_hindsight": rev.is_retained_in_hindsight,
                        "hindsight_memory_id": rev.hindsight_memory_id,
                        "created_at": rev.created_at.isoformat()
                    }
                    for rev in r.review_events
                ]
            }
            for r in q.responses
        ]
        questions_list.append({
            "id": q.id,
            "question_index": q.question_index,
            "section": q.section,
            "question_text": q.question_text,
            "category": q.category,
            "is_mandatory": q.is_mandatory,
            "required_evidence": q.required_evidence,
            "evaluation_criteria": q.evaluation_criteria,
            "page_reference": q.page_reference,
            "responses": responses
        })

    return {
        "id": prop.id,
        "title": prop.title,
        "rfp_reference": prop.rfp_reference,
        "status": prop.status,
        "deadline": prop.deadline,
        "source_file": prop.source_file,
        "client": {"id": client.id, "name": client.name, "industry": client.industry} if client else None,
        "sector": {"id": sector.id, "name": sector.name} if sector else None,
        "total_questions": len(prop.questions),
        "questions": questions_list,
        "created_at": prop.created_at.isoformat(),
        "updated_at": prop.updated_at.isoformat()
    }

@router.post("/generate-response")
async def generate_response_for_question(payload: GenerateAnswerRequest, db: Session = Depends(get_db)):
    prop = db.query(Proposal).filter(Proposal.id == payload.proposal_id).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Proposal not found.")
        
    question = db.query(RfpQuestion).filter(RfpQuestion.id == payload.question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found.")

    company_profile = db.query(CompanyProfile).first()
    company_facts = company_profile.facts if company_profile else {}
    
    client = db.query(Client).filter(Client.id == prop.client_id).first() if prop.client_id else None
    sector = db.query(Sector).filter(Sector.id == prop.sector_id).first() if prop.sector_id else None

    # Step 1: Recall relevant memories from Hindsight if mode == "MEMORY_ON"
    recalled_memories = []
    if payload.generation_mode == "MEMORY_ON":
        recall_res = await hindsight_service.recall(HindsightRecallRequest(
            query=f"{question.category}: {question.question_text}",
            limit=4,
            client_id=prop.client_id,
            sector_id=prop.sector_id
        ))
        recalled_memories = recall_res.results

    # Step 2: Generate response using Groq / Fallback Engine
    generated = groq_proposal_engine.generate_response(
        question_text=question.question_text,
        category=question.category,
        mandatory=question.is_mandatory,
        company_facts=company_facts,
        memories=recalled_memories,
        mode=payload.generation_mode,
        client_name=client.name if client else None,
        sector_name=sector.name if sector else None
    )

    # Step 3: Run Contradiction Intelligence check against Claim Ledger
    contradiction_alerts = contradiction_engine.scan_for_conflicts(
        db=db,
        proposal_id=prop.id,
        question_id=question.id,
        new_text=generated["proposed_answer"],
        client_id=prop.client_id,
        sector_id=prop.sector_id
    )

    # Step 4: Persist response
    response_record = ProposalResponse(
        question_id=question.id,
        proposal_id=prop.id,
        proposed_answer=generated["proposed_answer"],
        confidence_score=generated.get("confidence_score", 0.90),
        supporting_sources=generated.get("supporting_sources", []),
        recalled_precedents=generated.get("recalled_precedents", []),
        missing_information=generated.get("missing_information", []),
        potential_risks=generated.get("potential_risks", []),
        verification_required=bool(contradiction_alerts) or generated.get("verification_required", False),
        status=ResponseStatus.DRAFT.value,
        generation_mode=payload.generation_mode,
        generation_latency_ms=generated.get("latency_ms", 350)
    )
    db.add(response_record)
    db.commit()
    db.refresh(response_record)

    return {
        "response": {
            "id": response_record.id,
            "question_id": response_record.question_id,
            "proposal_id": response_record.proposal_id,
            "proposed_answer": response_record.proposed_answer,
            "confidence_score": response_record.confidence_score,
            "supporting_sources": response_record.supporting_sources,
            "recalled_precedents": response_record.recalled_precedents,
            "missing_information": response_record.missing_information,
            "potential_risks": response_record.potential_risks,
            "verification_required": response_record.verification_required,
            "status": response_record.status,
            "generation_mode": response_record.generation_mode,
            "latency_ms": response_record.generation_latency_ms
        },
        "contradictions_detected": len(contradiction_alerts),
        "contradiction_alerts": [
            {
                "id": a.id,
                "conflict_explanation": a.conflict_explanation,
                "conflicting_claim_text": a.conflicting_claim_text,
                "severity": a.severity,
                "status": a.status
            }
            for a in contradiction_alerts
        ]
    }

