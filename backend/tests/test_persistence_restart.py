import pytest
import asyncio
import uuid
from app.services.hindsight import HindsightService
from app.schemas.memory import HindsightRetainRequest, HindsightRecallRequest
from app.database import SessionLocal, Base, engine

def test_hindsight_persistence_survives_restart():
    """
    Verifies that memories retained in Hindsight survive backend application restart.
    1. Retain verified memory using Service Instance #1
    2. Completely destroy Service Instance #1
    3. Instantiate a fresh Service Instance #2
    4. Recall the memory from Service Instance #2
    5. Assert full provenance: text, approved_by, rationale, timestamp
    """
    Base.metadata.create_all(bind=engine)
    
    # 1. Instance 1 retains memory
    service_1 = HindsightService()
    unique_claim = f"Tier-4 disaster recovery RTO is guaranteed under 45 minutes for all sovereign cloud deployments {uuid.uuid4().hex[:6]}"
    
    async def run_retain():
        return await service_1.retain(HindsightRetainRequest(
            content=unique_claim,
            context="reviewer_correction",
            metadata={
                "proposal_id": "prop_test_restart",
                "approved_by": "Chief Information Security Officer",
                "rationale": "Sovereign cloud compliance requirement",
                "scope": "global"
            },
            tags=["disaster_recovery", "rto", "sovereign"]
        ))
    
    retain_res = asyncio.run(run_retain())
    assert retain_res.memory_id is not None
    saved_id = retain_res.memory_id
    
    # 2. Destroy instance 1
    del service_1
    
    # 3. Create fresh instance 2 (simulating fresh backend process startup)
    service_2 = HindsightService()
    
    async def run_recall():
        return await service_2.recall(HindsightRecallRequest(
            query="disaster recovery RTO sovereign cloud deployment guarantee",
            limit=5,
            tags=["disaster_recovery"]
        ))
        
    recall_res = asyncio.run(run_recall())
    assert recall_res.total_results > 0
    
    # 4. Verify memory survived and retained full provenance
    matched = next((m for m in recall_res.results if m.id == saved_id), None)
    assert matched is not None
    assert unique_claim in matched.text
    assert matched.metadata.get("approved_by") == "Chief Information Security Officer"
    assert matched.metadata.get("reviewer_rationale") == "Sovereign cloud compliance requirement"
    assert matched.occurred_at is not None
