from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime

class BidOutcomeCreate(BaseModel):
    proposal_id: str
    outcome: str = "WON"
    contract_value: Optional[str] = None
    evaluator_feedback: Optional[str] = None
    primary_reason: str = "Technical Capability"
    strengths_noted: Optional[str] = None
    weaknesses_noted: Optional[str] = None
    recorded_by: str = "Commercial Director"

class BidOutcomeOut(BidOutcomeCreate):
    model_config = ConfigDict(from_attributes=True)
    id: str
    recorded_at: datetime
