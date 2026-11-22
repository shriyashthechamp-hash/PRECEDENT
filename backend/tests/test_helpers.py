"""Unit tests for pure backend helper functions.

These tests exercise deterministic helpers only and make no network calls.
Groq and Hindsight services are instantiated without credentials, so the
deterministic code paths are used.
"""
from datetime import datetime, timezone

from app.database import utc_now
from app.services.hindsight import utc_now_iso
from app.services.rfp_parser import RfpParserService
from app.services.groq_engine import groq_proposal_engine
from app.schemas.memory import RecalledMemoryItem


def test_utc_now_is_timezone_aware_utc():
    value = utc_now()
    assert isinstance(value, datetime)
    assert value.tzinfo is not None
    assert value.utcoffset() == timezone.utc.utcoffset(None)


def test_utc_now_iso_round_trips_through_parser():
    parsed = datetime.fromisoformat(utc_now_iso())
    assert parsed.tzinfo is not None


def test_classify_category_maps_keywords_to_expected_labels():
    parser = RfpParserService()
    assert parser._classify_category("Provide your SOC2 Type II attestation.") == "Compliance"
    assert parser._classify_category("Describe your data retention and purge policy.") == "Data Privacy"
    assert parser._classify_category("Detail your support SLA and escalation tiers.") == "SLAs and Support"
    assert parser._classify_category("Unrelated sentence with no keywords.") == "Other"


def test_detect_deadline_parses_explicit_date_and_falls_back():
    parser = RfpParserService()
    assert parser._detect_deadline("Submission deadline: 2026-11-30") == "2026-11-30"
    assert parser._detect_deadline("No date present here.") == "14 business days from issuance"


def test_generate_fallback_returns_full_schema():
    result = groq_proposal_engine._generate_fallback(
        question_text="Describe your disaster recovery RTO and RPO.",
        category="SLAs and Support",
        memories=[],
        mode="MEMORY_OFF",
        client_name="Acme Corp",
    )
    expected_keys = {
        "proposed_answer",
        "confidence_score",
        "supporting_sources",
        "recalled_precedents",
        "missing_information",
        "potential_risks",
        "verification_required",
        "latency_ms",
    }
    assert expected_keys.issubset(result.keys())
    assert isinstance(result["proposed_answer"], str) and result["proposed_answer"]


def test_generate_fallback_memory_off_flags_verification():
    result = groq_proposal_engine._generate_fallback(
        question_text="What are your support hours?",
        category="SLAs and Support",
        memories=[],
        mode="MEMORY_OFF",
        client_name=None,
    )
    assert result["verification_required"] is True
    assert result["recalled_precedents"] == []


def test_generate_fallback_memory_on_cites_recalled_precedent():
    memory = RecalledMemoryItem(
        id="mem_unit_01",
        text="Approved enterprise support is 24/5 with 24/7 P1 escalation.",
        context="reviewer_correction",
        tags=["support"],
    )
    result = groq_proposal_engine._generate_fallback(
        question_text="What are your support hours?",
        category="SLAs and Support",
        memories=[memory],
        mode="MEMORY_ON",
        client_name=None,
    )
    assert result["recalled_precedents"]
    assert result["verification_required"] is False
