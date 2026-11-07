from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.claim import ClaimLedgerItem
from app.schemas.claim import ClaimItemOut, ClaimItemCreate

router = APIRouter(prefix="/claims", tags=["Claim Ledger"])

@router.get("", response_model=List[ClaimItemOut])
def list_claims(
    scope: Optional[str] = None,
    subject: Optional[str] = None,
    is_active: bool = True,
    db: Session = Depends(get_db)
):
    query = db.query(ClaimLedgerItem).filter(ClaimLedgerItem.is_active == is_active)
    if scope:
        query = query.filter(ClaimLedgerItem.scope == scope)
    if subject:
        query = query.filter(ClaimLedgerItem.subject == subject)
        
    return query.order_by(ClaimLedgerItem.created_at.desc()).all()

@router.post("", response_model=ClaimItemOut)
def create_claim(payload: ClaimItemCreate, db: Session = Depends(get_db)):
    claim = ClaimLedgerItem(
        subject=payload.subject,
        predicate=payload.predicate,
        value=payload.value,
        scope=payload.scope,
        scope_target=payload.scope_target,
        approved_by=payload.approved_by,
        confidence=payload.confidence,
        approval_status="HUMAN_APPROVED",
        is_active=True
    )
    db.add(claim)
    db.commit()
    db.refresh(claim)
    return claim

@router.post("/{claim_id}/deactivate")
def deactivate_claim(claim_id: str, db: Session = Depends(get_db)):
    claim = db.query(ClaimLedgerItem).filter(ClaimLedgerItem.id == claim_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found.")
    claim.is_active = False
    db.commit()
    return {"status": "deactivated", "claim_id": claim_id}

