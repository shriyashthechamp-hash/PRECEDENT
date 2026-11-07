from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone

class HindsightMemoryMetadata(BaseModel):
    org_id: str = "org_precedent_demo"
    proposal_id: Optional[str] = None
    client_id: Optional[str] = None
    sector_id: Optional[str] = None
    topic: Optional[str] = None
    approved_by: Optional[str] = None
    scope: str = "organization" # "organization", "sector", "client"
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class HindsightRetainRequest(BaseModel):
    bank_id: Optional[str] = None
    content: str
    context: str = "reviewer_correction"
    metadata: Dict[str, Any] = Field(default_factory=dict)
    tags: List[str] = Field(default_factory=list)
    async_mode: bool = False

class HindsightRetainResponse(BaseModel):
    status: str = "retained"
    memory_id: str
    bank_id: str
    content: str
    extracted_entities: List[str] = Field(default_factory=list)
    created_at: str

class HindsightRecallRequest(BaseModel):
    bank_id: Optional[str] = None
    query: str
    limit: int = 5
    fact_types: Optional[List[str]] = Field(default_factory=lambda: ["world", "experience", "observation"])
    tags: Optional[List[str]] = None
    tags_match: str = "any"
    client_id: Optional[str] = None
    sector_id: Optional[str] = None

class RecalledMemoryItem(BaseModel):
    id: str
    text: str
    type: str = "experience"
    context: str = "reviewer_correction"
    score: float = 0.92
    metadata: Dict[str, Any] = Field(default_factory=dict)
    tags: List[str] = Field(default_factory=list)
    occurred_at: Optional[str] = None

class HindsightRecallResponse(BaseModel):
    query: str
    bank_id: str
    total_results: int
    results: List[RecalledMemoryItem]

class HindsightReflectRequest(BaseModel):
    bank_id: Optional[str] = None
    query: str
    max_tokens: int = 600
    fact_types: Optional[List[str]] = None
    include_facts: bool = True
    sector_id: Optional[str] = None

class HindsightReflectResponse(BaseModel):
    query: str
    text: str
    based_on_memories: List[Dict[str, Any]] = Field(default_factory=list)
    mental_models: List[str] = Field(default_factory=list)
    strategic_recommendation: Optional[str] = None

