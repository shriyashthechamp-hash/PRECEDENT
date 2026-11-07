from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class ComparisonExecutionRequest(BaseModel):
    proposal_id: str
    question_id: str

class ComparisonVariantResult(BaseModel):
    mode: str # "MEMORY_OFF" or "MEMORY_ON"
    answer: str
    confidence_score: float
    recalled_memories_count: int
    recalled_precedents: List[str]
    missing_information: List[str]
    potential_risks: List[str]
    contradictions_detected: int
    unsupported_claims_count: int = 0
    historical_consistency_score: float = 1.0
    estimated_reviewer_edits_chars: int = 0
    recall_latency_ms: int = 0
    latency_ms: int
    char_count: int
    word_count: int

class ComparisonResponse(BaseModel):
    question_id: str
    question_text: str
    category: str
    variant_off: ComparisonVariantResult
    variant_on: ComparisonVariantResult
    delta_metrics: Dict[str, Any]
