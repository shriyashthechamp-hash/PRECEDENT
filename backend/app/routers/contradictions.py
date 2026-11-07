from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.claim import ContradictionAlert, ContradictionStatus, ClaimLedgerItem
from app.models.proposal import Proposal, RfpQuestion, ProposalResponse
from app.schemas.claim import ContradictionAlertOut, ResolveContradictionRequest
from app.services.contradiction import contradiction_engine

router = APIRouter(prefix="/contradictions", tags=["Contradiction Intelligence"])

@router.get("", response_model=List[ContradictionAlertOut])
def list_contradiction_alerts(
    status: Optional[str] = None,
    proposal_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(ContradictionAlert)
    if status:
        query = query.filter(ContradictionAlert.status == status)
    if proposal_id:
        query = query.filter(ContradictionAlert.proposal_id == proposal_id)
        
    return query.order_by(ContradictionAlert.created_at.desc()).all()

@router.post("/{alert_id}/resolve")
def resolve_contradiction_alert(
    alert_id: str,
    payload: ResolveContradictionRequest,
    db: Session = Depends(get_db)
):
    """
    Resolve a contradiction by enforcing approved old precedent or explicitly overriding with a new corporate standard.
    """
    alert = contradiction_engine.resolve_alert(
        db=db,
        alert_id=alert_id,
        resolution_type=payload.resolution_type,
        resolved_by=payload.resolved_by
    )
    if not alert:
        raise HTTPException(status_code=404, detail="Contradiction alert not found.")

    # If user chose to ENFORCE_OLD, automatically update the response to match the approved precedent
    if payload.resolution_type == "ENFORCE_OLD" and alert.question_id:
        response = db.query(ProposalResponse).filter(
            ProposalResponse.proposal_id == alert.proposal_id,
            ProposalResponse.question_id == alert.question_id
        ).order_by(ProposalResponse.created_at.desc()).first()
        
        if response:
            response.proposed_answer = f"[PRECEDENT ENFORCED] {alert.conflicting_claim_text}"
            response.verification_required = False
            db.commit()

    return {
        "status": "resolved",
        "alert_id": alert.id,
        "resolution_type": payload.resolution_type,
        "resolved_at": alert.resolved_at.isoformat() if alert.resolved_at else None
    }

