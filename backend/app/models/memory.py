from sqlalchemy import Column, String, Boolean, DateTime, Text, JSON, Float
from datetime import datetime, timezone
import uuid
from app.database import Base

def utc_now():
    return datetime.now(timezone.utc)

class MemoryBankRecord(Base):
    """
    Persistent SQLite storage for Hindsight memories.
    Ensures memories survive application and backend restarts, preserving full provenance.
    """
    __tablename__ = "memory_bank_records"
    
    id = Column(String(64), primary_key=True, default=lambda: f"mem_{uuid.uuid4().hex[:12]}")
    bank_id = Column(String(64), nullable=False, index=True, default="precedent-institutional-memory")
    content = Column(Text, nullable=False)
    context = Column(String(128), default="reviewer_correction")
    fact_type = Column(String(32), default="experience") # world, experience, observation, opinion
    
    # Institutional Provenance
    source_proposal_id = Column(String(64), nullable=True, index=True)
    source_review_id = Column(String(64), nullable=True, index=True)
    question_id = Column(String(64), nullable=True)
    client_id = Column(String(64), nullable=True, index=True)
    sector_id = Column(String(64), nullable=True, index=True)
    scope = Column(String(32), default="global") # global, sector, client
    
    approved_by = Column(String(128), default="Staff Proposal Reviewer")
    approval_status = Column(String(32), default="APPROVED")
    reviewer_rationale = Column(Text, nullable=True)
    
    tags = Column(JSON, default=list)
    entities = Column(JSON, default=list)
    metadata_json = Column(JSON, default=dict)
    
    relevance_score = Column(Float, default=1.0)
    is_active = Column(Boolean, default=True)
    
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)
