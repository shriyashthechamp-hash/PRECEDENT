from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.proposal import Proposal, RfpQuestion, ProposalResponse, ResponseStatus
from app.models.review import ReviewCorrectionEvent, ReviewEventStatus
from app.models.claim import ClaimLedgerItem
from app.schemas.proposal import ReviewCorrectionCreate, ReviewCorrectionOut
from app.schemas.memory import HindsightRetainRequest
from app.services.hindsight import hindsight_service

router = APIRouter(prefix="/review", tags=["Review & Learning Engine"])

@router.post("/correct", response_model=ReviewCorrectionOut)
async def submit_reviewer_correction(payload: ReviewCorrectionCreate, db: Session = Depends(get_db)):
    """
    Core human-in-the-loop review action:
    Captures human edit, rationale, category, and promotes approved correction to Hindsight memory and Claim Ledger.
    """
    response = db.query(ProposalResponse).filter(ProposalResponse.id == payload.response_id).first()
    if not response:
        raise HTTPException(status_code=404, detail="Proposal response not found.")

    proposal = db.query(Proposal).filter(Proposal.id == payload.proposal_id).first()
    question = db.query(RfpQuestion).filter(RfpQuestion.id == payload.question_id).first()

    # Create the structured review event
    review_event = ReviewCorrectionEvent(
        response_id=response.id,
        question_id=payload.question_id,
        proposal_id=payload.proposal_id,
        original_answer=payload.original_answer,
        corrected_answer=payload.corrected_answer,
        correction_reason=payload.correction_reason,
        category_tag=payload.category_tag,
        reviewer_name=payload.reviewer_name,
        status=ReviewEventStatus.APPROVED.value,
        is_retained_in_hindsight=False
    )
    db.add(review_event)

    # Update response text and status
    response.proposed_answer = payload.corrected_answer
    response.status = ResponseStatus.EDITED.value
    response.version += 1
    response.verification_required = False

    # Retain in Hindsight if requested
    hindsight_id = None
    if payload.retain_in_hindsight:
        content_for_memory = (
            f"Approved Claim ({payload.category_tag}): {payload.corrected_answer}. "
            f"Reviewer Correction Reason: {payload.correction_reason}."
        )
        retain_res = await hindsight_service.retain(HindsightRetainRequest(
            content=content_for_memory,
            context="reviewer_correction",
            metadata={
                "org_id": "org_precedent_demo",
                "proposal_id": payload.proposal_id,
                "client_id": proposal.client_id if proposal else None,
                "sector_id": proposal.sector_id if proposal else None,
                "topic": payload.category_tag,
                "approved_by": payload.reviewer_name,
                "scope": "organization"
            },
            tags=[payload.category_tag, "approved_correction", "proposal_review"]
        ))
        review_event.is_retained_in_hindsight = True
        review_event.hindsight_memory_id = retain_res.memory_id
        hindsight_id = retain_res.memory_id

    # Add or update Claim Ledger item if this correction creates a verified corporate standard
    claim_item = ClaimLedgerItem(
        subject=payload.category_tag,
        predicate="approved_statement",
        value=payload.corrected_answer[:255],
        scope="global",
        source_proposal_id=payload.proposal_id,
        source_review_id=review_event.id,
        approval_status="HUMAN_APPROVED",
        approved_by=payload.reviewer_name
    )
    db.add(claim_item)

    db.commit()
    db.refresh(review_event)
    return review_event

@router.post("/accept/{response_id}")
def accept_response(response_id: str, db: Session = Depends(get_db)):
    """Approve an answer without edits."""
    response = db.query(ProposalResponse).filter(ProposalResponse.id == response_id).first()
    if not response:
        raise HTTPException(status_code=404, detail="Response not found.")
    
    response.status = ResponseStatus.ACCEPTED.value
    response.verification_required = False
    db.commit()
    return {"status": "accepted", "response_id": response_id}
