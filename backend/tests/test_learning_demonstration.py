import pytest
import asyncio
from fastapi.testclient import TestClient
from app.main import app

@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c

def test_institutional_learning_cycle_api(client):
    """
    Executes and verifies the 9-step Institutional Learning Demonstration via API.
    A. Proposal A review
    B. Seeded error presentation
    C. Reviewer correction & rationale
    D. Human approval
    E. Hindsight Retain
    F. Proposal B open
    G. Hindsight Recall
    H. Influenced generated answer
    I. Final answer respects approved precedent
    """
    res = client.post("/api/demo/run-learning-cycle")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "SUCCESS"
    assert data["institutional_learning_verified"] is True
    
    # Verify timeline has all steps
    timeline = data["timeline"]
    steps = [item["step"] for item in timeline]
    assert "A" in steps
    assert "B" in steps
    assert "C_D" in steps
    assert "E" in steps
    assert "F" in steps
    assert "G" in steps
    assert "H_I" in steps

    # Check Step H_I details
    step_hi = next(s for s in timeline if s["step"] == "H_I")
    assert step_hi["respects_approved_precedent"] is True
    assert step_hi["avoids_seeded_error"] is True
    assert "24/5" in step_hi["proposal_b_answer"]

