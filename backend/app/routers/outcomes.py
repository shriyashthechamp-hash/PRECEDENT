from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.outcome import BidOutcome
from app.models.proposal import Proposal, ProposalStatus
from app.schemas.outcome import BidOutcomeCreate, BidOutcomeOut
from app.schemas.memory import HindsightRetainRequest
from app.services.hindsight import hindsight_service

router = APIRouter(prefix="/outcomes", tags=["Bid Outcome Intelligence"])

@router.get("", response_model=List[BidOutcomeOut])
def list_outcomes(db: Session = Depends(get_db)):
    return db.query(BidOutcome).order_by(BidOutcome.recorded_at.desc()).all()

@router.post("", response_model=BidOutcomeOut)
async def record_bid_outcome(payload: BidOutcomeCreate, db: Session = Depends(get_db)):
    proposal = db.query(Proposal).filter(Proposal.id == payload.proposal_id).first()
    if not proposal:
        raise HTTPException(status_code=404, detail="Proposal not found.")

    # Check if outcome already exists
    existing = db.query(BidOutcome).filter(BidOutcome.proposal_id == payload.proposal_id).first()
    if existing:
        existing.outcome = payload.outcome
        existing.contract_value = payload.contract_value
        existing.evaluator_feedback = payload.evaluator_feedback
        existing.primary_reason = payload.primary_reason
        existing.strengths_noted = payload.strengths_noted
        existing.weaknesses_noted = payload.weaknesses_noted
        existing.recorded_by = payload.recorded_by
        outcome_record = existing
    else:
        outcome_record = BidOutcome(
            proposal_id=payload.proposal_id,
            outcome=payload.outcome,
            contract_value=payload.contract_value,
            evaluator_feedback=payload.evaluator_feedback,
            primary_reason=payload.primary_reason,
            strengths_noted=payload.strengths_noted,
            weaknesses_noted=payload.weaknesses_noted,
            recorded_by=payload.recorded_by
        )
        db.add(outcome_record)

    # Retain confirmed outcome into Hindsight
    if payload.evaluator_feedback:
        content = (
            f"Bid Outcome ({payload.outcome}) for '{proposal.title}'. "
            f"Primary Factor: {payload.primary_reason}. "
            f"Evaluator Feedback: {payload.evaluator_feedback}."
        )
        await hindsight_service.retain(HindsightRetainRequest(
            content=content,
            context="evaluator_feedback",
            metadata={
                "proposal_id": payload.proposal_id,
                "client_id": proposal.client_id,
                "sector_id": proposal.sector_id,
                "outcome": payload.outcome,
                "factor": payload.primary_reason
            },
            tags=["bid_outcome", payload.outcome.lower(), payload.primary_reason.lower()]
        ))

    db.commit()
    db.refresh(outcome_record)
    return outcome_record
