import pytest
from fastapi.testclient import TestClient
from app.main import app

@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c

def test_api_health_endpoint(client):
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "operational"
    assert data["product"] == "PRECEDENT"
    assert "hindsight_memory" in data
    assert data["groq_inference"]["status"] == "configured_live"
    assert data["groq_inference"]["primary_model"] == "openai/gpt-oss-120b"

def test_api_proposals_list(client):
    res = client.get("/api/proposals")
    assert res.status_code == 200
    props = res.json()
    assert len(props) >= 2 # Seeded proposals present

def test_api_generate_and_review_flow(client):
    # 1. Fetch proposal
    res = client.get("/api/proposals")
    assert res.status_code == 200
    props = res.json()
    prop = props[0]
    
    # 2. Get proposal detail to get a question
    detail_res = client.get(f"/api/proposals/{prop['id']}")
    assert detail_res.status_code == 200
    detail = detail_res.json()
    assert len(detail["questions"]) > 0
    q = detail["questions"][0]

    # 3. Generate response with MEMORY_ON
    gen_res = client.post("/api/proposals/generate-response", json={
        "proposal_id": prop["id"],
        "question_id": q["id"],
        "generation_mode": "MEMORY_ON"
    })
    assert gen_res.status_code == 200
    gen_data = gen_res.json()
    assert "response" in gen_data
    assert gen_data["response"]["proposed_answer"] is not None
    rsp_id = gen_data["response"]["id"]

    # 4. Human reviewer submits correction & retains in Hindsight
    rev_res = client.post("/api/review/correct", json={
        "response_id": rsp_id,
        "question_id": q["id"],
        "proposal_id": prop["id"],
        "original_answer": gen_data["response"]["proposed_answer"],
        "corrected_answer": "Verified enterprise response with strict SLA adherence.",
        "correction_reason": "Refined wording to emphasize strict audit compliance.",
        "category_tag": "compliance_sla",
        "reviewer_name": "Senior Audit Officer",
        "retain_in_hindsight": True
    })
    assert rev_res.status_code == 200
    rev_data = rev_res.json()
    assert rev_data["is_retained_in_hindsight"] == True
    assert rev_data["status"] == "APPROVED"

def test_api_comparison_endpoint(client):
    res = client.get("/api/proposals")
    prop = res.json()[0]
    detail = client.get(f"/api/proposals/{prop['id']}").json()
    q = detail["questions"][0]

    comp_res = client.post("/api/comparison/execute", json={
        "proposal_id": prop["id"],
        "question_id": q["id"]
    })
    assert comp_res.status_code == 200
    comp_data = comp_res.json()
    assert "variant_off" in comp_data
    assert "variant_on" in comp_data
    assert "delta_metrics" in comp_data
    assert comp_data["variant_on"]["confidence_score"] >= comp_data["variant_off"]["confidence_score"]

def test_api_analytics_summary(client):
    res = client.get("/api/analytics/summary")
    assert res.status_code == 200
    data = res.json()
    assert "metrics" in data
    assert "metric_provenance" in data
    assert data["metrics"]["total_proposals"] > 0
