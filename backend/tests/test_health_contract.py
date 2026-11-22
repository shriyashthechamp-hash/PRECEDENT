"""Contract tests for the health and readiness endpoints.

These assert the current response shape only; they do not require live Groq or
Hindsight services and accept both configured and fallback states.
"""
import pytest
from fastapi.testclient import TestClient
from app.main import app


@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c


def test_health_reports_required_sections(client):
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "operational"
    assert data["product"] == "PRECEDENT"
    assert isinstance(data["version"], str)
    assert set(["database", "hindsight_memory", "groq_inference"]).issubset(data.keys())


def test_health_reports_groq_model_configuration(client):
    data = client.get("/api/health").json()
    groq = data["groq_inference"]
    assert groq["status"] in ["configured_live", "unconfigured_using_deterministic_engine"]
    assert groq["primary_model"] == "openai/gpt-oss-120b"
    assert groq["fallback_model"] == "openai/gpt-oss-20b"


def test_health_reports_database_engine(client):
    data = client.get("/api/health").json()
    assert data["database"]["engine"] in ["sqlite", "postgresql"]


def test_ready_endpoints_return_ready_status(client):
    for path in ["/ready", "/api/ready"]:
        res = client.get(path)
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "ready"
        assert data["product"] == "PRECEDENT"
