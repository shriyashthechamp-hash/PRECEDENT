from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.review import ReviewCorrectionEvent
from app.models.proposal import Proposal
from app.schemas.memory import (
    HindsightRetainRequest,
    HindsightRetainResponse,
    HindsightRecallRequest,
    HindsightRecallResponse,
    HindsightReflectRequest,
    HindsightReflectResponse
)
from app.services.hindsight import hindsight_service

router = APIRouter(prefix="/memory", tags=["Hindsight Institutional Memory"])

@router.post("/retain", response_model=HindsightRetainResponse)
async def retain_memory(payload: HindsightRetainRequest):
    return await hindsight_service.retain(payload)

@router.post("/recall", response_model=HindsightRecallResponse)
async def recall_memories(payload: HindsightRecallRequest):
    return await hindsight_service.recall(payload)

@router.post("/reflect", response_model=HindsightReflectResponse)
async def reflect_memories(payload: HindsightReflectRequest):
    return await hindsight_service.reflect(payload)

@router.get("/explorer")
async def list_institutional_memories(
    topic: Optional[str] = None,
    client_id: Optional[str] = None,
    sector_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Returns full institutional memory feed combining Hindsight bank records and Review events for complete provenance.
    """
    # 1. Fetch review correction events with their proposals
    corrections = db.query(ReviewCorrectionEvent).order_by(ReviewCorrectionEvent.created_at.desc()).all()
    
    memory_records = []
    for c in corrections:
        prop = db.query(Proposal).filter(Proposal.id == c.proposal_id).first()
        memory_records.append({
            "id": c.hindsight_memory_id or f"mem_{c.id}",
            "text": f"Approved Claim: {c.corrected_answer}",
            "original_draft": c.original_answer,
            "correction_reason": c.correction_reason,
            "category": c.category_tag,
            "proposal_title": prop.title if prop else "Historical RFP",
            "proposal_id": c.proposal_id,
            "reviewer": c.reviewer_name,
            "retained_in_hindsight": c.is_retained_in_hindsight,
            "scope": "organization",
            "created_at": c.created_at.isoformat()
        })

    # Also recall high-level memories from the Hindsight bank
    general_recall = await hindsight_service.recall(HindsightRecallRequest(
        query="enterprise support SLAs data retention architecture compliance",
        limit=10,
        client_id=client_id,
        sector_id=sector_id
    ))
    
    return {
        "total_institutional_memories": len(memory_records) + len(general_recall.results),
        "review_provenance_memories": memory_records,
        "hindsight_bank_memories": general_recall.results
    }
