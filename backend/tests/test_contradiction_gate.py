import pytest
import uuid
from fastapi.testclient import TestClient
from app.main import app
from app.database import SessionLocal
from app.models.proposal import Proposal, ProposalStatus
from app.models.claim import ContradictionAlert, ContradictionSeverity, ContradictionStatus

@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c

def test_contradiction_blocks_submission_and_audits_resolution(client):
    """
    Verifies that:
    1. Proposal with unresolved HIGH-severity contradiction CANNOT be submitted (400 Bad Request).
    2. Contradiction resolution creates permanent audit trail record.
    3. Proposal can be successfully submitted once all HIGH contradictions are resolved.
    """
    test_prop_id = f"prp_test_gate_{uuid.uuid4().hex[:8]}"
    
    # 1. Setup a dedicated proposal with an open HIGH contradiction
    db = SessionLocal()
    try:
        prop = Proposal(
            id=test_prop_id,
            title="Contradiction Defense Test RFP",
            status=ProposalStatus.IN_REVIEW.value,
            total_questions=1
        )
        db.add(prop)
        db.commit()

        alert = ContradictionAlert(
            id=f"cfl_test_{uuid.uuid4().hex[:8]}",
            proposal_id=test_prop_id,
            new_claim_text="Customer data is retained indefinitely for training internal models.",
            conflicting_claim_id="clm_data_retention",
            conflicting_claim_text="30 days post-termination with certified cryptographic wipe",
            scope="global",
            conflict_explanation="Asserts indefinite data retention, conflicting with approved 30-day purge standard.",
            recommended_action="Enforce 30-day purge standard.",
            severity=ContradictionSeverity.HIGH.value,
            status=ContradictionStatus.OPEN.value
        )
        db.add(alert)
        db.commit()
        alert_id = alert.id
    finally:
        db.close()

    # 2. Verify submission is strictly BLOCKED while open HIGH contradiction exists
    submit_res = client.post(f"/api/proposals/{test_prop_id}/submit")
    assert submit_res.status_code == 400
    error_data = submit_res.json()
    assert "detail" in error_data
    assert error_data["detail"]["error"] == "SUBMISSION_BLOCKED_UNRESOLVED_CONTRADICTIONS"
    assert len(error_data["detail"]["unresolved_conflicts"]) == 1

    # 3. Resolve the contradiction by enforcing approved precedent
    resolve_res = client.post(
        f"/api/contradictions/{alert_id}/resolve",
        json={
            "resolution_type": "ENFORCE_OLD",
            "reason": "Enforced 30-day corporate data destruction policy",
            "resolved_by": "Compliance Director"
        }
    )
    assert resolve_res.status_code == 200
    assert resolve_res.json()["status"] == "resolved"

    # 4. Verify audit trail was recorded permanently
    audit_res = client.get(f"/api/contradictions/audit-trail?proposal_id={test_prop_id}")
    assert audit_res.status_code == 200
    logs = audit_res.json()
    assert len(logs) == 1
    assert logs[0]["alert_id"] == alert_id
    assert logs[0]["action_type"] == "ENFORCE_OLD"
    assert logs[0]["resolved_by"] == "Compliance Director"

    # 5. Retry submission - now succeeds!
    submit_again = client.post(f"/api/proposals/{test_prop_id}/submit")
    assert submit_again.status_code == 200
    assert submit_again.json()["status"] == "SUBMITTED"
