from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime

class ClaimItemBase(BaseModel):
    subject: str
    predicate: str
    value: str
    scope: str = "global"
    scope_target: Optional[str] = None
    confidence: float = 1.0

class ClaimItemCreate(ClaimItemBase):
    source_proposal_id: Optional[str] = None
    source_review_id: Optional[str] = None
    approved_by: str = "Principal Architect"

class ClaimItemOut(ClaimItemBase):
    id: str
    approval_status: str
    approved_by: str
    version: str
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class ContradictionAlertOut(BaseModel):
    id: str
    proposal_id: str
    question_id: Optional[str] = None
    new_claim_text: str
    conflicting_claim_id: str
    conflicting_claim_text: str
    scope: str
    conflict_explanation: str
    recommended_action: Optional[str] = None
    severity: str
    status: str
    resolved_by: Optional[str] = None
    resolved_at: Optional[datetime] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

class ResolveContradictionRequest(BaseModel):
    resolution_type: str # "ENFORCE_OLD", "OVERRIDE_NEW", "DISMISS"
    reason: str
    resolved_by: str = "Domain Lead"
