from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime

class QuestionBase(BaseModel):
    section: str = "General Requirements"
    question_text: str
    category: str = "Other"
    is_mandatory: bool = True
    required_evidence: Optional[str] = None
    evaluation_criteria: Optional[str] = None
    page_reference: Optional[int] = None

class QuestionCreate(QuestionBase):
    question_index: int

class QuestionOut(QuestionBase):
    id: str
    proposal_id: str
    question_index: int
    
    class Config:
        from_attributes = True

class ProposalResponseBase(BaseModel):
    proposed_answer: str
    confidence_score: float = Field(ge=0.0, le=1.0)
    supporting_sources: List[str] = Field(default_factory=list)
    recalled_precedents: List[str] = Field(default_factory=list)
    missing_information: List[str] = Field(default_factory=list)
    potential_risks: List[str] = Field(default_factory=list)
    verification_required: bool = False
    status: str = "DRAFT"

class ProposalResponseOut(ProposalResponseBase):
    id: str
    question_id: str
    proposal_id: str
    version: int
    generation_mode: str
    generation_latency_ms: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class ProposalCreate(BaseModel):
    title: str
    rfp_reference: Optional[str] = None
    client_id: Optional[str] = None
    sector_id: Optional[str] = None
    deadline: Optional[str] = None

class ProposalOut(BaseModel):
    id: str
    title: str
    rfp_reference: Optional[str] = None
    client_id: Optional[str] = None
    sector_id: Optional[str] = None
    status: str
    deadline: Optional[str] = None
    source_file: Optional[str] = None
    total_questions: int
    reviewed_questions: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class GenerateAnswerRequest(BaseModel):
    proposal_id: str
    question_id: str
    generation_mode: str = "MEMORY_ON" # "MEMORY_ON" or "MEMORY_OFF"
    temperature: float = 0.2

class ReviewCorrectionCreate(BaseModel):
    response_id: str
    question_id: str
    proposal_id: str
    original_answer: str
    corrected_answer: str
    correction_reason: str
    category_tag: str
    reviewer_name: str = "Domain Lead"
    retain_in_hindsight: bool = True

class ReviewCorrectionOut(BaseModel):
    id: str
    response_id: str
    question_id: str
    proposal_id: str
    original_answer: str
    corrected_answer: str
    correction_reason: str
    category_tag: str
    reviewer_name: str
    status: str
    is_retained_in_hindsight: bool
    hindsight_memory_id: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True
