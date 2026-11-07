import pytest
from fastapi.testclient import TestClient
from app.main import app

def test_full_precedent_lifecycle():
    with TestClient(app) as client:
        # 1. Health check
        health = client.get("/api/health").json()
        assert health["status"] == "operational"
        assert health["groq_inference"]["status"] == "configured_live"
        assert health["groq_inference"]["primary_model"] == "openai/gpt-oss-120b"
        
        # 2. RFP Document Ingestion
        sample_rfp_text = """
SECTION 1: CLINICAL COMPLIANCE & PRIVACY
1. State your customer data retention period post-termination and the verified timeline for certified destruction of all primary and replica storage.
2. Detail your standard and emergency customer support hours, response SLA matrices, and escalation protocols for clinical workflows.
3. Detail your multi-region disaster recovery architecture, including target RTO and RPO metrics.
"""
        files = {"file": ("Lifecycle_Test_RFP.txt", sample_rfp_text.encode("utf-8"), "text/plain")}
        data = {"title": "Full Lifecycle Verification RFP", "rfp_reference": "LFC-2026-TEST"}
        
        ingest_res = client.post("/api/rfp/ingest", data=data, files=files)
        assert ingest_res.status_code == 200
        ingest_data = ingest_res.json()
        proposal_id = ingest_data["proposal_id"]
        assert ingest_data["total_questions"] >= 3

        # 3. Fetch structured proposal workspace
        prop_res = client.get(f"/api/proposals/{proposal_id}")
        assert prop_res.status_code == 200
        prop_data = prop_res.json()
        assert len(prop_data["questions"]) >= 3
        
        # Question 1: Data Retention
        q_retention = prop_data["questions"][0]
        # Question 2: Support
        q_support = prop_data["questions"][1]

        # 4. Generate answer with MEMORY_ON
        gen_res = client.post("/api/proposals/generate-response", json={
            "proposal_id": proposal_id,
            "question_id": q_support["id"],
            "generation_mode": "MEMORY_ON"
        })
        assert gen_res.status_code == 200
        gen_data = gen_res.json()
        assert "response" in gen_data
        response_id = gen_data["response"]["id"]
        assert len(gen_data["response"]["proposed_answer"]) > 50

        # 5. Reviewer submits correction with mandatory rationale
        rev_res = client.post("/api/review/correct", json={
            "response_id": response_id,
            "question_id": q_support["id"],
            "proposal_id": proposal_id,
            "original_answer": gen_data["response"]["proposed_answer"],
            "corrected_answer": "Standard support operates 24/5 (Mon-Fri). Critical P1 incidents escalate to 24/7 dedicated coverage with a 15-minute response SLA.",
            "correction_reason": "Enforced strict 24/5 standard vs 24/7 emergency boundary.",
            "category_tag": "support_coverage",
            "reviewer_name": "Clinical IT Director",
            "retain_in_hindsight": True
        })
        assert rev_res.status_code == 200
        rev_data = rev_res.json()
        assert rev_data["is_retained_in_hindsight"] is True
        assert rev_data["status"] == "APPROVED"

        # 6. Verify Hindsight recall returns newly retained memory
        recall_res = client.post("/api/memory/recall", json={
            "query": "What are our support hours and escalation coverage?",
            "limit": 3
        })
        assert recall_res.status_code == 200
        recall_data = recall_res.json()
        assert recall_data["total_results"] > 0
        assert any("24/5" in r["text"] for r in recall_data["results"])

        # 7. Contradiction Detection: Generate answer with contradictory statement
        contra_gen_res = client.post("/api/proposals/generate-response", json={
            "proposal_id": proposal_id,
            "question_id": q_retention["id"],
            "generation_mode": "MEMORY_OFF" # Memory off generates 90-day draft that triggers conflict
        })
        assert contra_gen_res.status_code == 200
        
        # Check active contradiction alerts
        cfl_res = client.get(f"/api/contradictions?proposal_id={proposal_id}")
        assert cfl_res.status_code == 200
        cfl_list = cfl_res.json()
        if len(cfl_list) > 0:
            alert = cfl_list[0]
            # Resolve contradiction by enforcing approved precedent
            resolve_res = client.post(f"/api/contradictions/{alert['id']}/resolve", json={
                "resolution_type": "ENFORCE_OLD",
                "reason": "Enforced approved 30-day deletion policy",
                "resolved_by": "Compliance Officer"
            })
            assert resolve_res.status_code == 200
            assert resolve_res.json()["status"] == "resolved"

        # 8. Memory ON vs Memory OFF A/B Laboratory
        comp_res = client.post("/api/comparison/execute", json={
            "proposal_id": proposal_id,
            "question_id": q_support["id"]
        })
        assert comp_res.status_code == 200
        comp_data = comp_res.json()
        assert comp_data["variant_on"]["confidence_score"] >= comp_data["variant_off"]["confidence_score"]
        assert "delta_metrics" in comp_data
        assert comp_data["delta_metrics"]["live_measured"] is True

        # 9. Record Bid Outcome
        out_res = client.post("/api/outcomes", json={
            "proposal_id": proposal_id,
            "outcome": "WON",
            "contract_value": "$620,000 ARR",
            "evaluator_feedback": "Clinical committee commended the transparent 24/5 vs 24/7 P1 SLA distinction.",
            "primary_reason": "Technical Capability"
        })
        assert out_res.status_code == 200
        assert out_res.json()["outcome"] == "WON"
