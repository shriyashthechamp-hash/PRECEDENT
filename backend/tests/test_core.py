import pytest
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database import Base
from app.models.client import Client, Sector, CompanyProfile
from app.models.proposal import Proposal, RfpQuestion, ProposalResponse, ProposalStatus, ResponseStatus
from app.models.claim import ClaimLedgerItem, ContradictionAlert, ContradictionStatus
from app.models.review import ReviewCorrectionEvent
from app.services.hindsight import HindsightService
from app.services.contradiction import ContradictionEngine
from app.services.rfp_parser import RfpParserService
from app.schemas.memory import HindsightRetainRequest, HindsightRecallRequest, HindsightReflectRequest

# Setup test in-memory SQLite
test_engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
TestSession = sessionmaker(bind=test_engine)

@pytest.fixture
def db():
    Base.metadata.create_all(bind=test_engine)
    session = TestSession()
    yield session
    session.close()
    Base.metadata.drop_all(bind=test_engine)

def test_rfp_parser_valid_text():
    parser = RfpParserService()
    sample_rfp = """
    Section 1: General Information
    1. Describe your company's operational history and executive leadership.
    2. Detail your standard customer support hours, response SLA matrices, and escalation protocols.
    3. What is your customer data retention policy post contract termination?
    4. Provide your SOC2 Type II compliance audit certification.
    """
    res = parser.parse_file(sample_rfp.encode("utf-8"), "sample_rfp.txt")
    assert res["total_questions_detected"] >= 3
    assert any("support" in q["question_text"].lower() for q in res["questions"])

def test_rfp_parser_empty_file():
    parser = RfpParserService()
    with pytest.raises(ValueError, match="empty"):
        parser.parse_file(b"", "empty.pdf")

import asyncio

def test_hindsight_retain_and_recall():
    async def _run():
        service = HindsightService()
        
        # 1. Retain memory
        retain_req = HindsightRetainRequest(
            content="Our enterprise support is 24/5 with 24/7 P1 emergency escalation.",
            context="reviewer_correction",
            metadata={"topic": "support_sla", "scope": "organization"},
            tags=["support", "sla"]
        )
        retain_res = await service.retain(retain_req)
        assert retain_res.memory_id is not None
        assert "24/5" in retain_res.content
        
        # 2. Recall memory
        recall_req = HindsightRecallRequest(
            query="What are our customer support hours?",
            limit=2,
            tags=["support"]
        )
        recall_res = await service.recall(recall_req)
        assert recall_res.total_results >= 1
        assert "24/5" in recall_res.results[0].text
    
    asyncio.run(_run())

def test_hindsight_client_isolation():
    async def _run():
        service = HindsightService()
        
        # Retain client-specific concession for Client Alpha
        await service.retain(HindsightRetainRequest(
            content="Private concession: 10% discount and dedicated Slack bridge for Client Alpha only.",
            metadata={"client_id": "cli_alpha", "scope": "client"},
            tags=["pricing", "custom_concession"]
        ))
        
        # Query for Client Beta should NOT leak Client Alpha's private concession
        recall_beta = await service.recall(HindsightRecallRequest(
            query="What is the pricing discount and Slack bridge?",
            client_id="cli_beta"
        ))
        assert not any("Client Alpha" in r.text for r in recall_beta.results)
    
    asyncio.run(_run())

def test_contradiction_detection_deterministic(db):
    engine = ContradictionEngine()
    
    # Seed approved claim
    claim = ClaimLedgerItem(
        id="clm_support_test",
        subject="enterprise_support",
        predicate="coverage_hours",
        value="24/5 standard support with 24/7 emergency P1 escalation",
        scope="global",
        is_active=True
    )
    db.add(claim)
    
    # Create dummy proposal
    prop = Proposal(id="prop_test_01", title="Test RFP", status=ProposalStatus.DRAFT.value)
    db.add(prop)
    db.commit()
    
    # Test contradictory statement
    conflicting_statement = "We provide 24/7 dedicated support for all enterprise users across all tiers."
    alerts = engine.scan_for_conflicts(
        db=db,
        proposal_id="prop_test_01",
        question_id="qst_test_01",
        new_text=conflicting_statement
    )
    assert len(alerts) >= 1
    assert "24/5" in alerts[0].conflicting_claim_text
    assert alerts[0].status == ContradictionStatus.OPEN.value
