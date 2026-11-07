from sqlalchemy import Column, String, DateTime, Text, ForeignKey
from datetime import datetime
import uuid
import enum
from app.database import Base

class OutcomeType(str, enum.Enum):
    WON = "WON"
    LOST = "LOST"
    WITHDRAWN = "WITHDRAWN"
    NO_DECISION = "NO_DECISION"
    PENDING = "PENDING"

class OutcomePrimaryReason(str, enum.Enum):
    PRICING = "Pricing"
    TECHNICAL_CAPABILITY = "Technical Capability"
    COMPLIANCE = "Compliance"
    IMPLEMENTATION = "Implementation"
    DELIVERY_TIMELINE = "Delivery Timeline"
    PRODUCT_FIT = "Product Fit"
    RESPONSE_QUALITY = "Response Quality"
    MISSING_EVIDENCE = "Missing Evidence"
    OTHER = "Other"

class BidOutcome(Base):
    __tablename__ = "bid_outcomes"
    
    id = Column(String(64), primary_key=True, default=lambda: f"out_{uuid.uuid4().hex[:12]}")
    proposal_id = Column(String(64), ForeignKey("proposals.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    
    outcome = Column(String(32), default=OutcomeType.PENDING.value)
    contract_value = Column(String(64), nullable=True) # e.g. "$450,000 ARR"
    evaluator_feedback = Column(Text, nullable=True)
    primary_reason = Column(String(64), default=OutcomePrimaryReason.TECHNICAL_CAPABILITY.value)
    strengths_noted = Column(Text, nullable=True)
    weaknesses_noted = Column(Text, nullable=True)
    recorded_by = Column(String(128), default="Commercial Director")
    recorded_at = Column(DateTime, default=datetime.utcnow)
