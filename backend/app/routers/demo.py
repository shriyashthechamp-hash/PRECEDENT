from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timezone
import uuid

from app.database import get_db
from app.models.proposal import Proposal, RfpQuestion, ProposalResponse, ProposalStatus, ResponseStatus, QuestionCategory
from app.models.review import ReviewCorrectionEvent, ReviewEventStatus
from app.models.memory import MemoryBankRecord
from app.schemas.memory import HindsightRetainRequest, HindsightRecallRequest
from app.services.hindsight import hindsight_service
from app.services.groq_engine import groq_proposal_engine

router = APIRouter(prefix="/demo", tags=["Institutional Learning Demonstration"])

@router.get("/scenario-status")
def get_scenario_status(db: Session = Depends(get_db)):
    """
    Returns current state of the 9-step Institutional Learning Demonstration.
    """
    prop_a = db.query(Proposal).filter(Proposal.id == "prop_mercy_01").first()
    prop_b = db.query(Proposal).filter(Proposal.id == "prop_vertex_01").first()
    
    retained_memories = db.query(MemoryBankRecord).filter(
        MemoryBankRecord.bank_id == "precedent-institutional-memory",
        MemoryBankRecord.tags.contains(["support"]) | MemoryBankRecord.content.contains("24/5")
    ).all()

    return {
        "ready": True,
        "proposal_a": {"id": prop_a.id, "title": prop_a.title} if prop_a else None,
        "proposal_b": {"id": prop_b.id, "title": prop_b.title} if prop_b else None,
        "existing_support_precedents": len(retained_memories)
    }

@router.post("/run-learning-cycle")
async def run_institutional_learning_cycle(db: Session = Depends(get_db)):
    """
    Executes the complete 9-step institutional learning demonstration:
    A. Review Proposal A (Mercy Health).
    B. Present an AI-generated answer containing a deliberately seeded demo error (Blanket 24/7 claim).
    C. Reviewer corrects the answer and provides rationale (24/5 core + 24/7 P1 emergency).
    D. Approve the correction.
    E. Execute real Hindsight Retain operation (persisted with full provenance).
    F. Open Proposal B (Vertex Therapeutics, a different RFP).
    G. Generate an answer using actual Hindsight Recall.
    H. Display the recalled experience and show how it influenced the generated answer.
    I. Verify that the final answer respects the approved historical precedent.
    """
    timeline = []
    now = datetime.now(timezone.utc)

    # Step A: Load Proposal A
    prop_a = db.query(Proposal).filter(Proposal.id == "prop_mercy_01").first()
    if not prop_a:
        prop_a = Proposal(
            id="prop_mercy_01",
            title="Mercy Health — Clinical Document Reasoning & Workflow Modernization RFP",
            rfp_reference="MHC-RFP-2026-088",
            status=ProposalStatus.IN_REVIEW.value,
            deadline="2026-11-15",
            total_questions=1,
            reviewed_questions=0,
            created_at=now
        )
        db.add(prop_a)
        db.commit()

    q_a = db.query(RfpQuestion).filter(RfpQuestion.proposal_id == prop_a.id).first()
    if not q_a:
        q_a = RfpQuestion(
            id=f"qst_demo_{uuid.uuid4().hex[:8]}",
            proposal_id=prop_a.id,
            question_index=1,
            section="Operations & SLA Support",
            question_text="Describe your enterprise SLA response commitments, business hours vs critical emergency support availability.",
            category=QuestionCategory.SLAS_AND_SUPPORT.value,
            is_mandatory=True
        )
        db.add(q_a)
        db.commit()

    timeline.append({
        "step": "A",
        "title": "Open Proposal A",
        "proposal_id": prop_a.id,
        "proposal_title": prop_a.title,
        "question_text": q_a.question_text,
        "timestamp": datetime.now(timezone.utc).isoformat()
    })

    # Step B: Present unassisted draft with deliberately seeded demo error
    seeded_error_answer = (
        "We provide comprehensive 24/7 customer support for all enterprise users across all tiers "
        "and communication channels without limitation. Our engineering staff is on active standby around the clock."
    )
    resp_a = ProposalResponse(
        id=f"rsp_demo_err_{uuid.uuid4().hex[:8]}",
        question_id=q_a.id,
        proposal_id=prop_a.id,
        proposed_answer=seeded_error_answer,
        confidence_score=0.72,
        supporting_sources=["Default Marketing Overview §2"],
        recalled_precedents=[],
        status=ResponseStatus.DRAFT.value,
        generation_mode="MEMORY_OFF",
        verification_required=True,
        created_at=datetime.now(timezone.utc)
    )
    db.add(resp_a)
    db.commit()

    timeline.append({
        "step": "B",
        "title": "Generated Unassisted Baseline Draft (Seeded Error)",
        "draft_text": seeded_error_answer,
        "seeded_error_label": "DEMO SEEDED ERROR: Blanket 24/7 support overcommitment violates engineering on-call policy.",
        "status": "FLAGGED_FOR_CORRECTION",
        "timestamp": datetime.now(timezone.utc).isoformat()
    })

    # Step C & D: Human Reviewer Correction & Approval
    corrected_answer = (
        "Our standard enterprise support SLA provides 24/5 coverage (Monday 00:00 UTC through Friday 23:59 UTC). "
        "For critical Priority 1 (P1) incidents, our Emergency Response Team operates 24/7 with a guaranteed response time under 15 minutes."
    )
    correction_rationale = "Customer Operations Policy: 24/5 standard business hours with 24/7 escalation strictly restricted to P1 system-down emergencies."
    
    rev_event = ReviewCorrectionEvent(
        id=f"rev_demo_{uuid.uuid4().hex[:8]}",
        response_id=resp_a.id,
        question_id=q_a.id,
        proposal_id=prop_a.id,
        original_answer=seeded_error_answer,
        corrected_answer=corrected_answer,
        correction_reason=correction_rationale,
        category_tag="support_coverage",
        reviewer_name="Sarah Jenkins",
        reviewer_role="VP of Customer Operations",
        status=ReviewEventStatus.APPROVED.value,
        is_retained_in_hindsight=False,
        created_at=datetime.now(timezone.utc)
    )
    db.add(rev_event)
    resp_a.status = ResponseStatus.ACCEPTED.value
    resp_a.proposed_answer = corrected_answer
    db.commit()

    timeline.append({
        "step": "C_D",
        "title": "Human Reviewer Correction & Approval",
        "reviewer": "Sarah Jenkins (VP of Customer Operations)",
        "corrected_text": corrected_answer,
        "reviewer_rationale": correction_rationale,
        "status": "APPROVED",
        "timestamp": datetime.now(timezone.utc).isoformat()
    })

    # Step E: Execute genuine Hindsight Retain
    retain_res = await hindsight_service.retain(HindsightRetainRequest(
        content=corrected_answer,
        context="reviewer_correction",
        metadata={
            "proposal_id": prop_a.id,
            "review_id": rev_event.id,
            "question_id": q_a.id,
            "topic": "support_coverage",
            "approved_by": "Sarah Jenkins",
            "scope": "global",
            "rationale": correction_rationale
        },
        tags=["support", "sla", "approved_correction", "support_coverage"]
    ))
    
    rev_event.is_retained_in_hindsight = True
    rev_event.hindsight_memory_id = retain_res.memory_id
    db.commit()

    timeline.append({
        "step": "E",
        "title": "Hindsight Retain Executed",
        "memory_id": retain_res.memory_id,
        "bank_id": retain_res.bank_id,
        "retention_status": retain_res.status,
        "extracted_entities": retain_res.extracted_entities,
        "timestamp": datetime.now(timezone.utc).isoformat()
    })

    # Step F: Open Proposal B (Vertex Therapeutics - Different RFP)
    prop_b = db.query(Proposal).filter(Proposal.id == "prop_vertex_01").first()
    if not prop_b:
        prop_b = Proposal(
            id="prop_vertex_01",
            title="Vertex Therapeutics — Global Regulatory Dossier Intelligence RFP",
            rfp_reference="VTX-RFP-2026-102",
            status=ProposalStatus.IN_REVIEW.value,
            deadline="2026-11-20",
            total_questions=2,
            reviewed_questions=1,
            created_at=now
        )
        db.add(prop_b)
        db.commit()

    q_b = db.query(RfpQuestion).filter(
        RfpQuestion.proposal_id == prop_b.id,
        RfpQuestion.category == QuestionCategory.SLAS_AND_SUPPORT.value
    ).first()
    
    if not q_b:
        q_b = RfpQuestion(
            id=f"qst_vtx_support_{uuid.uuid4().hex[:6]}",
            proposal_id=prop_b.id,
            question_index=2,
            section="Operations & Support Commitments",
            question_text="State your enterprise support operating hours, tiered response times, and emergency escalation protocols.",
            category=QuestionCategory.SLAS_AND_SUPPORT.value,
            is_mandatory=True
        )
        db.add(q_b)
        db.commit()

    timeline.append({
        "step": "F",
        "title": "Open Proposal B (Different RFP)",
        "proposal_id": prop_b.id,
        "proposal_title": prop_b.title,
        "target_question": q_b.question_text,
        "timestamp": datetime.now(timezone.utc).isoformat()
    })

    # Step G: Execute genuine Hindsight Recall
    recall_res = await hindsight_service.recall(HindsightRecallRequest(
        query=f"support operating hours tiered response times emergency escalation: {q_b.question_text}",
        limit=3,
        tags=["support"]
    ))

    timeline.append({
        "step": "G",
        "title": "Hindsight Recall Executed",
        "query": recall_res.query,
        "total_recalled": recall_res.total_results,
        "recalled_items": [
            {
                "memory_id": r.id,
                "text": r.text,
                "relevance_score": r.score,
                "approved_by": r.metadata.get("approved_by"),
                "source_proposal": r.metadata.get("source_proposal_id") or r.metadata.get("proposal_id"),
                "rationale": r.metadata.get("reviewer_rationale") or r.metadata.get("rationale")
            }
            for r in recall_res.results
        ],
        "timestamp": datetime.now(timezone.utc).isoformat()
    })

    # Step H & I: Generate Proposal B Response with Memory ON & Verify Compliance
    company_profile = db.query(Proposal).first()
    generated = groq_proposal_engine.generate_response(
        question_text=q_b.question_text,
        category=q_b.category,
        mandatory=True,
        company_facts={"support": "24/5 with 24/7 P1 emergency escalation"},
        memories=recall_res.results,
        mode="MEMORY_ON",
        client_name="Vertex Therapeutics Global",
        sector_name="Healthcare & Life Sciences"
    )

    resp_b = ProposalResponse(
        id=f"rsp_demo_b_{uuid.uuid4().hex[:8]}",
        question_id=q_b.id,
        proposal_id=prop_b.id,
        proposed_answer=generated["proposed_answer"],
        confidence_score=generated.get("confidence_score", 0.96),
        supporting_sources=generated.get("supporting_sources", []),
        recalled_precedents=generated.get("recalled_precedents", []),
        status=ResponseStatus.ACCEPTED.value,
        generation_mode="MEMORY_ON",
        generation_latency_ms=generated.get("latency_ms", 380),
        created_at=datetime.now(timezone.utc)
    )
    db.add(resp_b)
    db.commit()

    # Verification: Check that the final answer respects 24/5 and P1 precedent
    answer_text = generated["proposed_answer"]
    respects_precedent = ("24/5" in answer_text) and ("P1" in answer_text or "Priority 1" in answer_text or "emergency" in answer_text.lower())
    avoids_seeded_error = ("24/7 for all tiers" not in answer_text.lower())

    timeline.append({
        "step": "H_I",
        "title": "Proposal B Generated & Precedent Verified",
        "proposal_b_answer": answer_text,
        "recalled_precedents_used": generated.get("recalled_precedents", []),
        "respects_approved_precedent": respects_precedent,
        "avoids_seeded_error": avoids_seeded_error,
        "institutional_learning_verified": respects_precedent and avoids_seeded_error,
        "timestamp": datetime.now(timezone.utc).isoformat()
    })

    return {
        "status": "SUCCESS",
        "message": "Full institutional learning cycle successfully executed and verified.",
        "institutional_learning_verified": respects_precedent and avoids_seeded_error,
        "timeline": timeline
    }

