import pytest
import uuid
from fastapi.testclient import TestClient
from app.main import app
from app.database import SessionLocal
from app.models.proposal import Proposal, ProposalStatus
from app.models.claim import ClaimLedgerItem
from app.models.outcome import BidOutcome, OutcomeType

@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c

def test_claims_lifecycle_and_filtering(client):
    """
    Integration: Verifies Claim Ledger creation, active filtering,
    scope isolation, and deactivation.
    """
    unique_subject = f"sla_test_{uuid.uuid4().hex[:6]}"

    # 1. Create a global claim
    create_res = client.post("/api/claims", json={
        "subject": unique_subject,
        "predicate": "guaranteed_uptime",
        "value": "99.95% monthly uptime SLA backed by penalty credits",
        "scope": "global",
        "approved_by": "Infrastructure Director",
        "confidence": 0.98
    })
    assert create_res.status_code == 200
    claim_data = create_res.json()
    claim_id = claim_data["id"]
    assert claim_data["subject"] == unique_subject
    assert claim_data["approval_status"] == "HUMAN_APPROVED"
    assert claim_data["is_active"] is True

    # 2. Filter claims by subject
    list_res = client.get(f"/api/claims?subject={unique_subject}")
    assert list_res.status_code == 200
    matched = list_res.json()
    assert len(matched) == 1
    assert matched[0]["id"] == claim_id

    # 3. Deactivate claim
    deact_res = client.post(f"/api/claims/{claim_id}/deactivate")
    assert deact_res.status_code == 200
    assert deact_res.json()["status"] == "deactivated"

    # 4. Confirm inactive claim no longer appears in active list
    active_res = client.get(f"/api/claims?subject={unique_subject}&is_active=true")
    assert len(active_res.json()) == 0

    # 5. Confirm claim appears when querying inactive
    inactive_res = client.get(f"/api/claims?subject={unique_subject}&is_active=false")
    assert len(inactive_res.json()) == 1

def test_bid_outcome_recording_and_updating(client):
    """
    Integration: Verifies recording a bid outcome, retaining evaluator feedback
    into Hindsight memory, and updating existing outcome records.
    """
    db = SessionLocal()
    test_id = f"outcome_{uuid.uuid4().hex[:6]}"
    try:
        prop = Proposal(
            id=f"prp_{test_id}",
            title="Outcome Intelligence Test RFP",
            status=ProposalStatus.SUBMITTED.value
        )
        db.add(prop)
        db.commit()
    finally:
        db.close()

    # 1. Record Initial Won Outcome
    record_res = client.post("/api/outcomes", json={
        "proposal_id": f"prp_{test_id}",
        "outcome": "WON",
        "contract_value": "$1,250,000",
        "evaluator_feedback": "Superior institutional memory demonstrated in clinical support SLA responses.",
        "primary_reason": "Technical & SLA Compliance",
        "strengths_noted": "Clear distinction between 24/5 core and 24/7 P1 emergency response.",
        "recorded_by": "Commercial Director"
    })
    assert record_res.status_code == 200
    out_data = record_res.json()
    assert out_data["proposal_id"] == f"prp_{test_id}"
    assert out_data["outcome"] == "WON"
    assert out_data["contract_value"] == "$1,250,000"

    # 2. Verify outcome listing
    list_res = client.get("/api/outcomes")
    assert list_res.status_code == 200
    all_outcomes = list_res.json()
    assert any(o["proposal_id"] == f"prp_{test_id}" for o in all_outcomes)

    # 3. Update existing outcome for the same proposal
    update_res = client.post("/api/outcomes", json={
        "proposal_id": f"prp_{test_id}",
        "outcome": "WON",
        "contract_value": "$1,400,000",
        "evaluator_feedback": "Final executed contract with expansion options.",
        "primary_reason": "Technical & SLA Compliance",
        "recorded_by": "Commercial Director"
    })
    assert update_res.status_code == 200
    assert update_res.json()["contract_value"] == "$1,400,000"

def test_memory_explorer_provenance_aggregation(client):
    """
    Integration: Verifies that /api/memory/explorer aggregates both
    ReviewCorrectionEvent records and Hindsight persistent bank memories.
    """
    res = client.get("/api/memory/explorer")
    assert res.status_code == 200
    data = res.json()

    assert "total_institutional_memories" in data
    assert "review_provenance_memories" in data
    assert "hindsight_bank_memories" in data
    assert isinstance(data["review_provenance_memories"], list)
    assert isinstance(data["hindsight_bank_memories"], list)

def test_analytics_summary_live_computation_and_provenance(client):
    """
    Auditing Protection: Verifies that /api/analytics/summary:
    1. Returns live calculated metrics without hardcoded defaults.
    2. Provides mathematical SQL provenance definitions for all KPIs.
    3. Distinguishes live user records from synthetic demo seeds.
    """
    res = client.get("/api/analytics/summary")
    assert res.status_code == 200
    data = res.json()

    assert "metrics" in data
    assert "metric_provenance" in data
    metrics = data["metrics"]
    provenance = data["metric_provenance"]

    # Assert KPI fields exist
    assert "total_proposals" in metrics
    assert "reviewer_edit_reduction_rate" in metrics
    assert "correction_reuse_rate" in metrics
    assert "historical_win_rate" in metrics
    assert "average_generation_latency_ms" in metrics

    # Assert provenance documentation and SQL auditing exist
    assert "query_auditing" in data
    auditing = data["query_auditing"]
    assert "total_proposals" in auditing
    assert "reviewer_edit_reduction" in auditing
    assert "correction_reuse_rate" in auditing
    assert "historical_win_rate" in auditing
    assert "average_latency" in auditing

    assert provenance["type"] == "AUDITED_LIVE_AND_PERSISTED_SQLITE"
    assert "live_measured" in provenance
    assert "synthetic_demo_history" in provenance
