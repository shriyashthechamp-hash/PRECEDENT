from sqlalchemy import Column, String, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
import enum
from app.database import Base

class ReviewEventStatus(str, enum.Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"

class ReviewCorrectionEvent(Base):
    __tablename__ = "review_correction_events"
    
    id = Column(String(64), primary_key=True, default=lambda: f"rev_{uuid.uuid4().hex[:12]}")
    response_id = Column(String(64), ForeignKey("proposal_responses.id", ondelete="CASCADE"), nullable=False, index=True)
    question_id = Column(String(64), ForeignKey("rfp_questions.id"), nullable=False, index=True)
    proposal_id = Column(String(64), ForeignKey("proposals.id"), nullable=False, index=True)
    
    original_answer = Column(Text, nullable=False)
    corrected_answer = Column(Text, nullable=False)
    correction_reason = Column(Text, nullable=False)
    category_tag = Column(String(64), nullable=False) # e.g. "support_coverage", "data_retention"
    
    reviewer_name = Column(String(128), default="Staff Proposal Reviewer")
    reviewer_role = Column(String(64), default="Domain Lead")
    
    status = Column(String(32), default=ReviewEventStatus.APPROVED.value)
    is_retained_in_hindsight = Column(Boolean, default=False)
    hindsight_memory_id = Column(String(128), nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    response = relationship("ProposalResponse", back_populates="review_events")

