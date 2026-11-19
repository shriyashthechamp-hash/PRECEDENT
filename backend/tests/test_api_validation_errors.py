import pytest
from fastapi.testclient import TestClient
from app.main import app

@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c

def test_proposal_not_found_returns_404(client):
    """Verifies that querying a non-existent proposal ID returns HTTP 404."""
    res = client.get("/api/proposals/prp_non_existent_99999")
    assert res.status_code == 404
    assert "not found" in res.json()["detail"].lower()

def test_generate_response_invalid_proposal_returns_404(client):
    """Verifies generating a response for an invalid proposal ID returns HTTP 404."""
    res = client.post("/api/proposals/generate-response", json={
        "proposal_id": "prp_ghost_id",
        "question_id": "qst_ghost_id",
        "generation_mode": "MEMORY_ON"
    })
    assert res.status_code == 404
    assert "proposal not found" in res.json()["detail"].lower()

def test_generate_response_invalid_question_returns_404(client):
    """Verifies generating a response for a valid proposal but invalid question returns HTTP 404."""
    # Fetch an existing proposal
    props = client.get("/api/proposals").json()
    assert len(props) > 0
    valid_prop_id = props[0]["id"]

    res = client.post("/api/proposals/generate-response", json={
        "proposal_id": valid_prop_id,
        "question_id": "qst_non_existent_question",
        "generation_mode": "MEMORY_ON"
    })
    assert res.status_code == 404
    assert "question not found" in res.json()["detail"].lower()

def test_submit_invalid_proposal_returns_404(client):
    """Verifies submitting a non-existent proposal returns HTTP 404."""
    res = client.post("/api/proposals/prp_ghost_proposal/submit")
    assert res.status_code == 404
    assert "not found" in res.json()["detail"].lower()

def test_review_correct_invalid_response_returns_404(client):
    """Verifies submitting reviewer correction on non-existent response ID returns HTTP 404."""
    res = client.post("/api/review/correct", json={
        "response_id": "rsp_invalid_ghost",
        "question_id": "qst_001",
        "proposal_id": "prp_001",
        "original_answer": "Original",
        "corrected_answer": "Corrected",
        "correction_reason": "Rationale",
        "category_tag": "compliance"
    })
    assert res.status_code == 404
    assert "proposal response not found" in res.json()["detail"].lower()

def test_review_accept_invalid_response_returns_404(client):
    """Verifies accepting a non-existent response ID returns HTTP 404."""
    res = client.post("/api/review/accept/rsp_invalid_ghost_999")
    assert res.status_code == 404
    assert "not found" in res.json()["detail"].lower()

def test_contradiction_resolve_invalid_alert_returns_404(client):
    """Verifies resolving a non-existent contradiction alert returns HTTP 404."""
    res = client.post("/api/contradictions/cfl_invalid_alert_id/resolve", json={
        "resolution_type": "ENFORCE_OLD",
        "reason": "Test non-existent alert",
        "resolved_by": "Compliance Lead"
    })
    assert res.status_code == 404
    assert "contradiction alert not found" in res.json()["detail"].lower()

def test_claim_deactivate_invalid_claim_returns_404(client):
    """Verifies deactivating a non-existent claim returns HTTP 404."""
    res = client.post("/api/claims/clm_non_existent_claim/deactivate")
    assert res.status_code == 404
    assert "claim not found" in res.json()["detail"].lower()

def test_outcome_invalid_proposal_returns_404(client):
    """Verifies recording outcome for a non-existent proposal returns HTTP 404."""
    res = client.post("/api/outcomes", json={
        "proposal_id": "prp_ghost_outcome",
        "outcome": "WON",
        "primary_reason": "Superior architecture"
    })
    assert res.status_code == 404
    assert "proposal not found" in res.json()["detail"].lower()

def test_pydantic_validation_error_on_missing_fields(client):
    """Verifies FastAPI/Pydantic returns HTTP 422 Unprocessable Entity when mandatory fields are omitted."""
    # Missing required field 'proposal_id' in outcome creation
    res = client.post("/api/outcomes", json={"outcome": "WON", "contract_value": "$500,000"})
    assert res.status_code == 422

    # Missing mandatory fields in review correct
    res2 = client.post("/api/review/correct", json={"response_id": "rsp_123"})
    assert res2.status_code == 422
