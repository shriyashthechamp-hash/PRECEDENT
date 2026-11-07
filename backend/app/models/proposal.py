from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, Text, JSON, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
import enum
from app.database import Base

class ProposalStatus(str, enum.Enum):
    DRAFT = "DRAFT"
    IN_REVIEW = "IN_REVIEW"
    APPROVED = "APPROVED"
    SUBMITTED = "SUBMITTED"

class ResponseStatus(str, enum.Enum):
    DRAFT = "DRAFT"
    ACCEPTED = "ACCEPTED"
    EDITED = "EDITED"
    REJECTED = "REJECTED"
    FLAGGED = "FLAGGED"

class QuestionCategory(str, enum.Enum):
    COMPANY_INFO = "Company Information"
    PRODUCT_CAPABILITIES = "Product Capabilities"
    TECHNICAL_ARCHITECTURE = "Technical Architecture"
    SECURITY = "Security"
    COMPLIANCE = "Compliance"
    DATA_PRIVACY = "Data Privacy"
    SLAS_AND_SUPPORT = "SLAs and Support"
    IMPLEMENTATION = "Implementation"
    PRICING_COMMERCIAL = "Pricing and Commercial Terms"
    EXPERIENCE_CASE_STUDIES = "Experience and Case Studies"
    OTHER = "Other"

class Proposal(Base):
    __tablename__ = "proposals"
    
    id = Column(String(64), primary_key=True, default=lambda: f"prp_{uuid.uuid4().hex[:12]}")
    title = Column(String(255), nullable=False, index=True)
    rfp_reference = Column(String(128), nullable=True)
    client_id = Column(String(64), ForeignKey("clients.id"), nullable=True, index=True)
    sector_id = Column(String(64), ForeignKey("sectors.id"), nullable=True, index=True)
    status = Column(String(32), default=ProposalStatus.DRAFT.value, index=True)
    deadline = Column(String(64), nullable=True)
    source_file = Column(String(255), nullable=True)
    total_questions = Column(Integer, default=0)
    reviewed_questions = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    questions = relationship("RfpQuestion", back_populates="proposal", cascade="all, delete-orphan", order_by="RfpQuestion.question_index")
    responses = relationship("ProposalResponse", back_populates="proposal", cascade="all, delete-orphan")
    client = relationship("Client")
    sector = relationship("Sector")

class RfpQuestion(Base):
    __tablename__ = "rfp_questions"
    
    id = Column(String(64), primary_key=True, default=lambda: f"qst_{uuid.uuid4().hex[:12]}")
    proposal_id = Column(String(64), ForeignKey("proposals.id", ondelete="CASCADE"), nullable=False, index=True)
    question_index = Column(Integer, nullable=False)
    section = Column(String(128), default="General")
    question_text = Column(Text, nullable=False)
    category = Column(String(64), default=QuestionCategory.OTHER.value)
    is_mandatory = Column(Boolean, default=True)
    required_evidence = Column(Text, nullable=True)
    evaluation_criteria = Column(Text, nullable=True)
    page_reference = Column(Integer, nullable=True)
    
    proposal = relationship("Proposal", back_populates="questions")
    responses = relationship("ProposalResponse", back_populates="question", cascade="all, delete-orphan")

class ProposalResponse(Base):
    __tablename__ = "proposal_responses"
    
    id = Column(String(64), primary_key=True, default=lambda: f"rsp_{uuid.uuid4().hex[:12]}")
    question_id = Column(String(64), ForeignKey("rfp_questions.id", ondelete="CASCADE"), nullable=False, index=True)
    proposal_id = Column(String(64), ForeignKey("proposals.id", ondelete="CASCADE"), nullable=False, index=True)
    
    proposed_answer = Column(Text, nullable=False)
    confidence_score = Column(Float, default=0.85)
    supporting_sources = Column(JSON, default=list)
    recalled_precedents = Column(JSON, default=list)
    missing_information = Column(JSON, default=list)
    potential_risks = Column(JSON, default=list)
    verification_required = Column(Boolean, default=False)
    
    status = Column(String(32), default=ResponseStatus.DRAFT.value)
    version = Column(Integer, default=1)
    generation_mode = Column(String(32), default="MEMORY_ON") # MEMORY_ON or MEMORY_OFF
    generation_latency_ms = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    proposal = relationship("Proposal", back_populates="responses")
    question = relationship("RfpQuestion", back_populates="responses")
    review_events = relationship("ReviewCorrectionEvent", back_populates="response", cascade="all, delete-orphan")

