import pytest
import uuid
from fastapi.testclient import TestClient
from app.main import app
from app.database import SessionLocal
from app.models.proposal import Proposal, RfpQuestion, ProposalResponse, ProposalStatus, ResponseStatus
from app.models.claim import ClaimLedgerItem, ContradictionAlert, ContradictionSeverity, ContradictionStatus, ContradictionAuditLog
from app.models.review import ReviewCorrectionEvent
from app.services.contradiction import ContradictionEngine
from app.services.hindsight import HindsightService
from app.schemas.memory import HindsightRetainRequest, HindsightRecallRequest

@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c

# -----------------------------------------------------------------------------
# PRINCIPLE 1: HUMAN REVIEW IS REQUIRED FOR INSTITUTIONAL TRUTH
# -----------------------------------------------------------------------------

def test_ai_response_is_draft_not_institutional_truth(client):
    """
    CRITICAL PRODUCT PRINCIPLE:
    AI-generated responses must NEVER automatically become approved institutional truth.
    - Initial status must be DRAFT.
    - Must NOT create a HUMAN_APPROVED ClaimLedgerItem.
    - verification_required must remain active.
    """
    db = SessionLocal()
    test_id = f"principle_{uuid.uuid4().hex[:6]}"
    try:
        # 1. Create a proposal with a question
        prop = Proposal(id=f"prp_{test_id}", title="Human Review Gate Test", status=ProposalStatus.DRAFT.value)
        db.add(prop)
        db.commit()

        q = RfpQuestion(
            id=f"qst_{test_id}",
            proposal_id=prop.id,
            question_index=1,
            section="Security",
            question_text="What are your standard support response SLAs?",
            category="support",
            is_mandatory=True
        )
        db.add(q)
        db.commit()

        # Count human approved claims before AI generation
        initial_claims_count = db.query(ClaimLedgerItem).filter(
            ClaimLedgerItem.approval_status == "HUMAN_APPROVED"
        ).count()
    finally:
        db.close()

    # 2. Trigger AI Generation
    gen_res = client.post("/api/proposals/generate-response", json={
        "proposal_id": f"prp_{test_id}",
        "question_id": f"qst_{test_id}",
        "generation_mode": "MEMORY_ON"
    })
    assert gen_res.status_code == 200
    gen_data = gen_res.json()["response"]

    # 3. Verify AI response is strictly in DRAFT state
    assert gen_data["status"] == ResponseStatus.DRAFT.value
    response_id = gen_data["id"]

    # 4. Verify NO unapproved claim was promoted to the Claim Ledger
    db = SessionLocal()
    try:
        current_claims_count = db.query(ClaimLedgerItem).filter(
            ClaimLedgerItem.approval_status == "HUMAN_APPROVED"
        ).count()
        assert current_claims_count == initial_claims_count, (
            "Regression: AI generation automatically created a HUMAN_APPROVED claim!"
        )

        # 5. Reviewer Accepts Response -> transitions to ACCEPTED and clears verification_required
        accept_res = client.post(f"/api/review/accept/{response_id}")
        assert accept_res.status_code == 200
        assert accept_res.json()["status"] == "accepted"

        resp_in_db = db.query(ProposalResponse).filter(ProposalResponse.id == response_id).first()
        assert resp_in_db.status == ResponseStatus.ACCEPTED.value
        assert resp_in_db.verification_required is False
    finally:
        db.close()

def test_reviewer_correction_promotes_to_ledger_and_hindsight(client):
    """
    CRITICAL PRODUCT PRINCIPLE:
    Only explicit human reviewer correction promotes an answer to:
    1. Status EDITED (version incremented).
    2. ReviewCorrectionEvent recorded in database.
    3. Promoted to ClaimLedgerItem with HUMAN_APPROVED.
    4. Retained into Hindsight when retain_in_hindsight is True.
    """
    db = SessionLocal()
    test_id = f"rev_{uuid.uuid4().hex[:6]}"
    try:
        prop = Proposal(id=f"prp_{test_id}", title="Review Promotion Test", status=ProposalStatus.IN_REVIEW.value)
        db.add(prop)
        q = RfpQuestion(
            id=f"qst_{test_id}",
            proposal_id=prop.id,
            question_index=1,
            section="Data Governance",
            question_text="What is your data retention policy post-termination?",
            category="data_retention",
            is_mandatory=True
        )
        db.add(q)
        resp = ProposalResponse(
            id=f"rsp_{test_id}",
            proposal_id=prop.id,
            question_id=q.id,
            proposed_answer="Draft statement: data stored for 90 days.",
            status=ResponseStatus.DRAFT.value,
            version=1,
            verification_required=True
        )
        db.add(resp)
        db.commit()
    finally:
        db.close()

    # Submit human correction with retain_in_hindsight=True
    corrected_statement = "Certified cryptographic purge within 30 days post-termination per SOC2 Trust Principles."
    correction_reason = "Enforced approved corporate 30-day data purge standard."

    rev_res = client.post("/api/review/correct", json={
        "response_id": f"rsp_{test_id}",
        "question_id": f"qst_{test_id}",
        "proposal_id": f"prp_{test_id}",
        "original_answer": "Draft statement: data stored for 90 days.",
        "corrected_answer": corrected_statement,
        "correction_reason": correction_reason,
        "category_tag": "data_retention",
        "reviewer_name": "Compliance Director",
        "retain_in_hindsight": True
    })
    assert rev_res.status_code == 200
    rev_data = rev_res.json()

    assert rev_data["status"] == "APPROVED"
    assert rev_data["is_retained_in_hindsight"] is True
    assert rev_data["hindsight_memory_id"] is not None

    db = SessionLocal()
    try:
        # Verify response record in DB
        updated_resp = db.query(ProposalResponse).filter(ProposalResponse.id == f"rsp_{test_id}").first()
        assert updated_resp.status == ResponseStatus.EDITED.value
        assert updated_resp.version == 2
        assert updated_resp.proposed_answer == corrected_statement
        assert updated_resp.verification_required is False

        # Verify Claim Ledger item was added as HUMAN_APPROVED
        promoted_claim = db.query(ClaimLedgerItem).filter(
            ClaimLedgerItem.source_proposal_id == f"prp_{test_id}",
            ClaimLedgerItem.approval_status == "HUMAN_APPROVED"
        ).first()
        assert promoted_claim is not None
        assert promoted_claim.approved_by == "Compliance Director"
        assert promoted_claim.subject == "data_retention"
    finally:
        db.close()

# -----------------------------------------------------------------------------
# PRINCIPLE 2: CONTRADICTION SEVERITY ISOLATION & HARD GATE
# -----------------------------------------------------------------------------

def test_medium_contradiction_does_not_block_submission(client):
    """
    CRITICAL PRODUCT PRINCIPLE:
    Non-blocking contradictions (LOW, MEDIUM) must NOT prevent proposal submission.
    Only HIGH severity contradictions should trigger the hard gate.
    """
    db = SessionLocal()
    test_id = f"med_gate_{uuid.uuid4().hex[:6]}"
    try:
        prop = Proposal(
            id=f"prp_{test_id}",
            title="Medium Conflict Test RFP",
            status=ProposalStatus.IN_REVIEW.value,
            total_questions=1
        )
        db.add(prop)
        db.commit()

        # Add MEDIUM severity contradiction alert
        alert = ContradictionAlert(
            id=f"cfl_{test_id}",
            proposal_id=prop.id,
            new_claim_text="Standard implementation timeline is 4-6 weeks.",
            conflicting_claim_id="clm_timeline_01",
            conflicting_claim_text="Standard implementation timeline is 6-8 weeks.",
            scope="global",
            conflict_explanation="Minor variance in standard implementation timeline estimates.",
            recommended_action="Verify with Delivery Team.",
            severity=ContradictionSeverity.MEDIUM.value,
            status=ContradictionStatus.OPEN.value
        )
        db.add(alert)
        db.commit()
    finally:
        db.close()

    # Submission should SUCCEED because conflict is MEDIUM, not HIGH
    submit_res = client.post(f"/api/proposals/prp_{test_id}/submit")
    assert submit_res.status_code == 200
    assert submit_res.json()["status"] == "SUBMITTED"

def test_high_contradiction_enforce_old_resolution_flow(client):
    """
    CRITICAL PRODUCT PRINCIPLE:
    1. Unresolved HIGH severity contradiction strictly blocks submission (HTTP 400).
    2. Resolving via ENFORCE_OLD replaces draft response with verified precedent.
    3. Permanent audit trail log is created.
    4. Proposal submission succeeds immediately after resolution.
    """
    db = SessionLocal()
    test_id = f"high_gate_{uuid.uuid4().hex[:6]}"
    try:
        prop = Proposal(
            id=f"prp_{test_id}",
            title="High Severity Gate Verification RFP",
            status=ProposalStatus.IN_REVIEW.value,
            total_questions=1
        )
        db.add(prop)

        q = RfpQuestion(
            id=f"qst_{test_id}",
            proposal_id=prop.id,
            question_index=1,
            section="Support",
            question_text="What are your support hours?",
            category="support"
        )
        db.add(q)

        resp = ProposalResponse(
            id=f"rsp_{test_id}",
            proposal_id=prop.id,
            question_id=q.id,
            proposed_answer="We offer 24/7 blanket support on all tiers.",
            status=ResponseStatus.DRAFT.value
        )
        db.add(resp)

        alert = ContradictionAlert(
            id=f"cfl_{test_id}",
            proposal_id=prop.id,
            question_id=q.id,
            new_claim_text="We offer 24/7 blanket support on all tiers.",
            conflicting_claim_id="clm_support_precedent",
            conflicting_claim_text="24/5 core business hours with 24/7 P1 emergency response",
            scope="global",
            conflict_explanation="Claims 24/7 support for standard inquiries, conflicting with 24/5 corporate standard.",
            recommended_action="Enforce approved 24/5 corporate standard.",
            severity=ContradictionSeverity.HIGH.value,
            status=ContradictionStatus.OPEN.value
        )
        db.add(alert)
        db.commit()
    finally:
        db.close()

    # 1. Attempt submission -> MUST be blocked
    block_res = client.post(f"/api/proposals/prp_{test_id}/submit")
    assert block_res.status_code == 400
    block_data = block_res.json()["detail"]
    assert block_data["error"] == "SUBMISSION_BLOCKED_UNRESOLVED_CONTRADICTIONS"
    assert len(block_data["unresolved_conflicts"]) == 1

    # 2. Resolve via ENFORCE_OLD
    resolve_res = client.post(f"/api/contradictions/cfl_{test_id}/resolve", json={
        "resolution_type": "ENFORCE_OLD",
        "reason": "Enforced verified corporate SLA commitment",
        "resolved_by": "VP of Operations"
    })
    assert resolve_res.status_code == 200
    assert resolve_res.json()["status"] == "resolved"

    # 3. Verify target response was updated to precedent
    db = SessionLocal()
    try:
        updated_resp = db.query(ProposalResponse).filter(ProposalResponse.id == f"rsp_{test_id}").first()
        assert "[PRECEDENT ENFORCED]" in updated_resp.proposed_answer
        assert "24/5" in updated_resp.proposed_answer
        assert updated_resp.verification_required is False

        # 4. Verify immutable audit log
        audit_log = db.query(ContradictionAuditLog).filter(
            ContradictionAuditLog.alert_id == f"cfl_{test_id}"
        ).first()
        assert audit_log is not None
        assert audit_log.action_type == "ENFORCE_OLD"
        assert audit_log.resolved_by == "VP of Operations"
    finally:
        db.close()

    # 5. Retry submission -> MUST now succeed
    resubmit_res = client.post(f"/api/proposals/prp_{test_id}/submit")
    assert resubmit_res.status_code == 200
    assert resubmit_res.json()["status"] == "SUBMITTED"

# -----------------------------------------------------------------------------
# PRINCIPLE 3: SCOPE & CLIENT QUARANTINE
# -----------------------------------------------------------------------------

def test_client_quarantine_in_contradiction_engine():
    """
    CRITICAL PRODUCT PRINCIPLE:
    Client-specific concessions (e.g. custom pricing or private terms for Client Alpha)
    must NEVER be flagged as contradictions or applied against Client Beta proposals.
    """
    db = SessionLocal()
    test_id = f"quar_{uuid.uuid4().hex[:6]}"
    engine = ContradictionEngine()

    try:
        # Create client-scoped claim for Client Alpha
        claim_alpha = ClaimLedgerItem(
            id=f"clm_alpha_{test_id}",
            subject="discount_terms",
            predicate="custom_concession",
            value="15% volume discount for Client Alpha",
            scope="client",
            scope_target="client_alpha_01",
            is_active=True
        )
        db.add(claim_alpha)

        # Create proposal for Client Beta
        prop_beta = Proposal(
            id=f"prp_beta_{test_id}",
            title="Client Beta RFP",
            client_id="client_beta_02",
            status=ProposalStatus.DRAFT.value
        )
        db.add(prop_beta)
        db.commit()

        # Scan text mentioning standard pricing for Client Beta
        alerts = engine.scan_for_conflicts(
            db=db,
            proposal_id=prop_beta.id,
            question_id="qst_pricing_01",
            new_text="Our pricing is standard rate card with 0% discount.",
            client_id="client_beta_02"
        )

        # Assert Client Alpha's concession was quarantined and NOT flagged for Client Beta
        assert not any(a.conflicting_claim_id == f"clm_alpha_{test_id}" for a in alerts), (
            "Regression: Client Alpha's private concession leaked to Client Beta contradiction scan!"
        )
    finally:
        db.close()
