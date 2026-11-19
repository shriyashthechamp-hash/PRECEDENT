import pytest
import io
from fastapi.testclient import TestClient
from app.main import app

@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c

def test_ingest_rejects_unsupported_extensions(client):
    """
    Boundary Protection: Verifies that non-permitted file extensions are rejected
    with HTTP 400 and clear, actionable error details.
    Allowed: .pdf, .docx, .doc, .txt
    """
    unsupported_files = [
        ("malicious.exe", b"MZ\x90\x00BinaryPayload", "application/octet-stream"),
        ("script.sh", b"#!/bin/bash\nrm -rf /", "application/x-sh"),
        ("exploit.py", b"import os\nos.system('whoami')", "text/x-python"),
        ("data.csv", b"col1,col2\nval1,val2", "text/csv"),
        ("diagram.png", b"\x89PNG\r\n\x1a\nFakeImage", "image/png"),
        ("archive.zip", b"PK\x03\x04FakeZip", "application/zip"),
    ]

    for filename, content, mime in unsupported_files:
        files = {"file": (filename, content, mime)}
        res = client.post("/api/rfp/ingest", files=files)
        assert res.status_code == 400, f"Expected 400 for {filename}, got {res.status_code}"
        data = res.json()
        assert "detail" in data
        assert "Unsupported file format" in data["detail"]
        assert ".pdf, .docx, .doc, .txt" in data["detail"] or "Allowed extensions" in data["detail"]

def test_ingest_rejects_oversized_file(client):
    """
    Boundary Protection: Verifies files exceeding the 25MB constraint
    are rejected with HTTP 413 Payload Too Large.
    """
    # Simulate a file larger than 25MB (25 * 1024 * 1024 + 1)
    # Using a sparse/virtual memory representation to avoid heavy disk allocation
    oversized_size = 25 * 1024 * 1024 + 1024
    oversized_bytes = b"0" * oversized_size
    files = {"file": ("massive_tender.pdf", oversized_bytes, "application/pdf")}

    res = client.post("/api/rfp/ingest", files=files)
    assert res.status_code == 413
    data = res.json()
    assert "detail" in data
    assert "exceeds maximum permitted size of 25MB" in data["detail"]

def test_ingest_rejects_empty_file(client):
    """
    Boundary Protection: Verifies zero-byte files produce HTTP 400 Bad Request.
    """
    files = {"file": ("empty_rfp.txt", b"", "text/plain")}
    res = client.post("/api/rfp/ingest", files=files)
    assert res.status_code == 400
    data = res.json()
    assert "detail" in data
    assert "empty" in data["detail"].lower()

def test_ingest_valid_text_with_metadata(client):
    """
    Integration: Verifies structured proposal workspace creation, question parsing,
    and metadata association.
    """
    content = """
SECTION 1: ORGANIZATIONAL BACKGROUND
1. Detail company founding, ownership structure, and international operational hubs.
2. Provide audited financial statements for the preceding three fiscal years.

SECTION 2: SLA & SUPPORT
3. What is your guaranteed uptime SLA for cloud-hosted environments?
4. Detail your escalation pathway for Priority 1 operational outages.
"""
    files = {"file": ("Enterprise_Cloud_Tender.txt", content.encode("utf-8"), "text/plain")}
    data = {
        "title": "Global Enterprise Cloud Tender",
        "rfp_reference": "RFP-GBL-2026-001"
    }
    res = client.post("/api/rfp/ingest", files=files, data=data)
    assert res.status_code == 200
    res_data = res.json()

    assert "proposal_id" in res_data
    assert res_data["total_questions"] >= 4
    proposal_id = res_data["proposal_id"]

    # Verify proposal detail retrieval
    detail = client.get(f"/api/proposals/{proposal_id}").json()
    assert detail["title"] == "Global Enterprise Cloud Tender"
    assert detail["rfp_reference"] == "RFP-GBL-2026-001"
    assert len(detail["questions"]) >= 4

    # Verify questions extracted retain sections
    sections = {q["section"] for q in detail["questions"]}
    assert any("ORGANIZATIONAL" in s for s in sections)
    assert any("SLA" in s for s in sections)

def test_ingest_auto_derives_title_when_omitted(client):
    """
    Regression Protection: Verifies title is automatically derived cleanly from
    filename when the user leaves the title form field empty.
    """
    content = """
SECTION 1: CLINICAL
1. How does your platform isolate multi-tenant clinical records?
"""
    files = {"file": ("Saint_Jude_Clinical_RFP.txt", content.encode("utf-8"), "text/plain")}
    res = client.post("/api/rfp/ingest", files=files)
    assert res.status_code == 200
    data = res.json()
    prop_id = data["proposal_id"]

    prop = client.get(f"/api/proposals/{prop_id}").json()
    assert "Saint Jude Clinical Rfp" in prop["title"] or "Saint Jude" in prop["title"]
