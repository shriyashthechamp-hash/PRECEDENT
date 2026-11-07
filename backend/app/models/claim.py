from sqlalchemy import Column, String, Boolean, DateTime, Text, Float, ForeignKey
from datetime import datetime
import uuid
import enum
from app.database import Base

class ContradictionSeverity(str, enum.Enum):
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"

class ContradictionStatus(str, enum.Enum):
    OPEN = "OPEN"
    RESOLVED_ENFORCED_OLD = "RESOLVED_ENFORCED_OLD"
    RESOLVED_OVERRIDDEN_NEW = "RESOLVED_OVERRIDDEN_NEW"
    DISMISSED = "DISMISSED"

class ClaimLedgerItem(Base):
    __tablename__ = "claim_ledger"
    
    id = Column(String(64), primary_key=True, default=lambda: f"clm_{uuid.uuid4().hex[:12]}")
    subject = Column(String(128), nullable=False, index=True) # e.g. "enterprise_support"
    predicate = Column(String(128), nullable=False, index=True) # e.g. "coverage_hours"
    value = Column(String(255), nullable=False) # e.g. "24/5 with 24/7 P1 escalation"
    
    scope = Column(String(32), default="global") # global, sector, client
    scope_target = Column(String(128), nullable=True) # sector_id or client_id
    
    valid_from = Column(DateTime, default=datetime.utcnow)
    valid_until = Column(DateTime, nullable=True) # null = perpetual until superseded
    
    source_proposal_id = Column(String(64), nullable=True)
    source_review_id = Column(String(64), nullable=True)
    approval_status = Column(String(32), default="HUMAN_APPROVED")
    approved_by = Column(String(128), default="Principal Architect")
    confidence = Column(Float, default=1.0)
    version = Column(String(16), default="1.0")
    is_active = Column(Boolean, default=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class ContradictionAlert(Base):
    __tablename__ = "contradiction_alerts"
    
    id = Column(String(64), primary_key=True, default=lambda: f"cfl_{uuid.uuid4().hex[:12]}")
    proposal_id = Column(String(64), ForeignKey("proposals.id", ondelete="CASCADE"), nullable=False, index=True)
    question_id = Column(String(64), nullable=True)
    
    new_claim_text = Column(Text, nullable=False)
    conflicting_claim_id = Column(String(64), ForeignKey("claim_ledger.id"), nullable=False)
    conflicting_claim_text = Column(Text, nullable=False)
    
    scope = Column(String(32), default="global")
    conflict_explanation = Column(Text, nullable=False)
    recommended_action = Column(Text, nullable=True)
    severity = Column(String(16), default=ContradictionSeverity.HIGH.value)
    status = Column(String(32), default=ContradictionStatus.OPEN.value)
    
    resolved_by = Column(String(128), nullable=True)
    resolved_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
