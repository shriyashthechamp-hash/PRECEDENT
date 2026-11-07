import logging
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.models.client import Client, Sector, CompanyProfile
from app.models.proposal import Proposal, RfpQuestion, ProposalResponse, ProposalStatus, ResponseStatus, QuestionCategory
from app.models.review import ReviewCorrectionEvent, ReviewEventStatus
from app.models.claim import ClaimLedgerItem, ContradictionAlert, ContradictionSeverity, ContradictionStatus
from app.models.outcome import BidOutcome, OutcomeType, OutcomePrimaryReason
from app.services.hindsight import hindsight_service
from app.schemas.memory import HindsightRetainRequest

logger = logging.getLogger("precedent.seed")

async def seed_synthetic_environment(db: Session, force: bool = False):
    """Seed the database and Hindsight memory bank with Vanguard Logic Systems historical dataset."""
    
    # Check if already seeded
    existing_profile = db.query(CompanyProfile).first()
    if existing_profile and not force:
        logger.info("Database already seeded with synthetic enterprise data.")
        return {"status": "already_seeded"}
        
    logger.info("Seeding realistic synthetic enterprise dataset for Vanguard Logic Systems...")
    
    # 1. Company Profile
    profile = CompanyProfile(
        id="default_profile",
        company_name="Vanguard Logic Systems",
        tagline="AI-Native Enterprise Workflow Automation & Document Intelligence",
        description="Fictional B2B SaaS enterprise providing mission-critical document reasoning, automated compliance verification, and high-volume orchestration for regulated industries.",
        facts={
            "founded": "2021",
            "headquarters": "Boston, MA",
            "global_support": "24/5 Standard Support (Mon 00:00 - Fri 23:59 UTC), 24/7 Emergency Escalation for P1 Incidents",
            "uptime_commitment": "99.9% Monthly Availability SLA",
            "certifications": ["SOC2 Type II (Fictional Demo Fact)", "ISO/IEC 27001:2022 (Fictional Demo Fact)", "HIPAA Security Attestation"],
            "encryption": "AES-256 for data at rest, TLS 1.3 for data in transit with forward secrecy",
            "data_retention": "30 days post-contract termination with certified cryptographic destruction",
            "disaster_recovery": "RTO: 4 hours, RPO: 1 hour for Tier-1 services across multi-region AWS infrastructure"
        }
    )
    db.merge(profile)
    
    # 2. Sectors
    sectors_data = [
        {
            "id": "sec_healthcare",
            "name": "Healthcare & Life Sciences",
            "compliance_standards": ["HIPAA Security Rule", "HITECH Act", "HITRUST CSF", "SOC2 Type II"],
            "common_requirements": ["30-day PHI purge window", "Dedicated BAA execution", "Audit log immutable retention (7 years)"]
        },
        {
            "id": "sec_fintech",
            "name": "Financial Services & Banking",
            "compliance_standards": ["GLBA", "PCI-DSS v4.0", "SOC2 Type II", "FFIEC"],
            "common_requirements": ["Zero customer data co-mingling", "Strict MFA hardware token enforcement", "Annual external penetration testing reports"]
        },
        {
            "id": "sec_public",
            "name": "Public Sector & Defense",
            "compliance_standards": ["FedRAMP Moderate Equivalent", "NIST SP 800-53 Rev. 5", "ITAR controls"],
            "common_requirements": ["US-Soil Only data residency", "US Citizen personnel support", "FIPS 140-3 cryptographic modules"]
        }
    ]
    for s in sectors_data:
        sec = Sector(id=s["id"], name=s["name"], compliance_standards=s["compliance_standards"], common_requirements=s["common_requirements"])
        db.merge(sec)
        
    # 3. Enterprise Clients
    clients_data = [
        {
            "id": "cli_mercy_health",
            "name": "Mercy Health Consortium",
            "industry": "Healthcare & Life Sciences",
            "description": "Integrated healthcare network with 24 hospital locations and 40,000 active clinical personnel.",
            "preferences": {
                "preferred_tone": "Clinical rigor, precise compliance terminology, no marketing hyperbole",
                "non_negotiables": ["HIPAA BAA signed prior to trial", "30-day data destruction SLA", "24/7 P1 emergency response hotline"]
            }
        },
        {
            "id": "cli_apex_capital",
            "name": "Apex Global Capital",
            "industry": "Financial Services & Banking",
            "description": "Tier-1 investment bank and asset manager overseeing $80B in institutional transactions.",
            "preferences": {
                "preferred_tone": "Direct quantitative SLAs, architecture diagrams with network isolation points",
                "non_negotiables": ["SOC2 Type II report under NDA", "Dedicated VPC tenant deployment option"]
            }
        },
        {
            "id": "cli_vertex_bio",
            "name": "Vertex Therapeutics Global",
            "industry": "Healthcare & Life Sciences",
            "description": "Global biotechnology leader developing transformative genetic therapies.",
            "preferences": {
                "preferred_tone": "Data integrity focused, clear provenance of AI reasoning",
                "non_negotiables": ["FDA 21 CFR Part 11 electronic records alignment", "Audit trails with cryptographic hash chaining"]
            }
        }
    ]
    for c in clients_data:
        cli = Client(id=c["id"], name=c["name"], industry=c["industry"], description=c["description"], preferences=c["preferences"])
        db.merge(cli)

    # 4. Base Claim Ledger Items
    claims_data = [
        {
            "id": "clm_support_hours",
            "subject": "enterprise_support",
            "predicate": "coverage_hours",
            "value": "24/5 standard support with 24/7 emergency P1 escalation",
            "scope": "global",
            "approved_by": "VP of Customer Operations",
            "valid_from": datetime.utcnow() - timedelta(days=120)
        },
        {
            "id": "clm_data_retention",
            "subject": "data_retention",
            "predicate": "post_termination_days",
            "value": "30 days post-termination with certified cryptographic wipe",
            "scope": "global",
            "approved_by": "Chief Information Security Officer",
            "valid_from": datetime.utcnow() - timedelta(days=90)
        },
        {
            "id": "clm_uptime_sla",
            "subject": "uptime_sla",
            "predicate": "availability_percentage",
            "value": "99.9% monthly availability with financial penalty credits",
            "scope": "global",
            "approved_by": "Principal Cloud Architect",
            "valid_from": datetime.utcnow() - timedelta(days=150)
        },
        {
            "id": "clm_encryption_standard",
            "subject": "data_encryption",
            "predicate": "at_rest_and_transit",
            "value": "AES-256-GCM at rest, TLS 1.3 in transit with perfect forward secrecy",
            "scope": "global",
            "approved_by": "Security Lead",
            "valid_from": datetime.utcnow() - timedelta(days=200)
        },
        {
            "id": "clm_client_custom_apex",
            "subject": "vpc_peering",
            "predicate": "private_transit_gateway",
            "value": "Dedicated AWS Transit Gateway route with direct Connect peering for Apex Capital",
            "scope": "client",
            "scope_target": "cli_apex_capital",
            "approved_by": "Lead Solutions Engineer",
            "valid_from": datetime.utcnow() - timedelta(days=45)
        }
    ]
    for cl in claims_data:
        item = ClaimLedgerItem(
            id=cl["id"],
            subject=cl["subject"],
            predicate=cl["predicate"],
            value=cl["value"],
            scope=cl["scope"],
            scope_target=cl.get("scope_target"),
            approved_by=cl["approved_by"],
            valid_from=cl["valid_from"]
        )
        db.merge(item)

    # 5. Historical Proposal #1: Mercy Health Clinical Automation RFP (Completed & Won)
    prop1 = Proposal(
        id="prop_mercy_01",
        title="Mercy Health — Clinical Document Reasoning & Workflow Modernization RFP",
        rfp_reference="MHC-RFP-2026-089",
        client_id="cli_mercy_health",
        sector_id="sec_healthcare",
        status=ProposalStatus.SUBMITTED.value,
        deadline="2026-09-15",
        source_file="MercyHealth_RFP_Final.pdf",
        total_questions=5,
        reviewed_questions=5,
        created_at=datetime.utcnow() - timedelta(days=60)
    )
    db.merge(prop1)

    q1_1 = RfpQuestion(
        id="qst_mercy_01_support",
        proposal_id="prop_mercy_01",
        question_index=1,
        section="Operational SLAs",
        question_text="Detail your standard and emergency customer support hours, response SLA matrices, and escalation protocols.",
        category=QuestionCategory.SLAS_AND_SUPPORT.value,
        is_mandatory=True,
        evaluation_criteria="Evaluated on round-the-clock emergency handling and severity definitions."
    )
    db.merge(q1_1)

    resp1_1 = ProposalResponse(
        id="rsp_mercy_01_support",
        question_id="qst_mercy_01_support",
        proposal_id="prop_mercy_01",
        proposed_answer="Our enterprise support is available 24/5 (Mon-Fri). Emergency escalation for critical P1 incidents is available 24/7 with a 15-minute response SLA.",
        confidence_score=0.98,
        supporting_sources=["Enterprise Support Addendum v3.1"],
        status=ResponseStatus.ACCEPTED.value,
        generation_mode="MEMORY_ON"
    )
    db.merge(resp1_1)

    # Review correction event for Prop 1
    rev1 = ReviewCorrectionEvent(
        id="rev_mercy_01_support",
        response_id="rsp_mercy_01_support",
        question_id="qst_mercy_01_support",
        proposal_id="prop_mercy_01",
        original_answer="We provide 24/7 customer support for all enterprise users across phone and web chat.",
        corrected_answer="Our enterprise support is available 24/5 (Mon-Fri). Emergency escalation for critical P1 incidents is available 24/7 with a 15-minute response SLA.",
        correction_reason="Original draft overstated standard non-emergency coverage. Clarified 24/5 standard vs 24/7 P1 emergency escalation.",
        category_tag="support_coverage",
        reviewer_name="Sarah Jenkins (VP Customer Ops)",
        status=ReviewEventStatus.APPROVED.value,
        is_retained_in_hindsight=True,
        hindsight_memory_id="mem_hindsight_001",
        created_at=datetime.utcnow() - timedelta(days=59)
    )
    db.merge(rev1)

    # Retain this in Hindsight
    await hindsight_service.retain(HindsightRetainRequest(
        content="Our enterprise support is available 24/5 (Mon-Fri). Emergency escalation for critical P1 incidents is available 24/7 with a 15-minute response SLA. Reviewer rationale: Standard non-critical coverage is 24/5.",
        context="reviewer_correction",
        metadata={
            "proposal_id": "prop_mercy_01",
            "topic": "support_coverage",
            "sector": "Healthcare & Life Sciences",
            "approved_by": "Sarah Jenkins"
        },
        tags=["support", "sla", "reviewer_correction", "healthcare"]
    ))

    # Bid outcome for Proposal 1 (WON)
    outcome1 = BidOutcome(
        id="out_mercy_01",
        proposal_id="prop_mercy_01",
        outcome=OutcomeType.WON.value,
        contract_value="$520,000 ARR (3-Year Master Service Agreement)",
        evaluator_feedback="Vanguard Logic demonstrated unmatched architectural transparency. Their explicit 24/5 standard vs 24/7 P1 escalation model was praised by the clinical evaluation committee over competitors who promised generic 24/7 support without realistic staffing proof.",
        primary_reason=OutcomePrimaryReason.TECHNICAL_CAPABILITY.value,
        strengths_noted="Honest, verifiable SLAs; HIPAA BAA turnkey readiness; cryptographic destruction certificate.",
        recorded_at=datetime.utcnow() - timedelta(days=40)
    )
    db.merge(outcome1)

    # 6. Historical Proposal #2: Apex Global Capital Financial Pipeline RFP (Lost on Pricing/Timeline)
    prop2 = Proposal(
        id="prop_apex_01",
        title="Apex Global Capital — Enterprise Ingestion Engine RFP",
        rfp_reference="AGC-ENG-2026-44",
        client_id="cli_apex_capital",
        sector_id="sec_fintech",
        status=ProposalStatus.SUBMITTED.value,
        deadline="2026-10-01",
        source_file="Apex_Capital_Tender.docx",
        total_questions=6,
        reviewed_questions=6,
        created_at=datetime.utcnow() - timedelta(days=35)
    )
    db.merge(prop2)

    outcome2 = BidOutcome(
        id="out_apex_01",
        proposal_id="prop_apex_01",
        outcome=OutcomeType.LOST.value,
        contract_value="$850,000 ARR",
        evaluator_feedback="Proposal response quality was strong, but pricing model required high upfront professional services fee ($120k). Competitor offered turnkey fixed-bid implementation in 6 weeks vs Vanguard's 12 weeks.",
        primary_reason=OutcomePrimaryReason.PRICING.value,
        strengths_noted="Superior security posture and SOC2 Type II controls.",
        weaknesses_noted="Lengthy implementation onboarding timeline; inflexible professional services pricing.",
        recorded_at=datetime.utcnow() - timedelta(days=20)
    )
    db.merge(outcome2)

    # Retain evaluator reflection in Hindsight
    await hindsight_service.retain(HindsightRetainRequest(
        content="Apex Global Capital evaluator feedback on lost bid: In financial RFPs, heavy upfront professional service milestones create friction. Bids structuring implementation fees into phased monthly milestones with accelerated 6-8 week timelines win more favorably.",
        context="evaluator_feedback",
        metadata={
            "proposal_id": "prop_apex_01",
            "topic": "pricing_and_implementation",
            "sector": "Financial Services & Banking"
        },
        tags=["pricing", "implementation", "evaluator_feedback", "fintech"]
    ))

    # 7. Active Proposal #3: Vertex Therapeutics (In Review - Contains Contradiction Scenario!)
    prop3 = Proposal(
        id="prop_vertex_01",
        title="Vertex Therapeutics — Global Regulatory Dossier Intelligence RFP",
        rfp_reference="VTX-RFP-2026-102",
        client_id="cli_vertex_bio",
        sector_id="sec_healthcare",
        status=ProposalStatus.IN_REVIEW.value,
        deadline="2026-11-20",
        source_file="Vertex_Bio_Regulatory_RFP.pdf",
        total_questions=4,
        reviewed_questions=2,
        created_at=datetime.utcnow() - timedelta(days=2)
    )
    db.merge(prop3)

    q3_1 = RfpQuestion(
        id="qst_vtx_retention",
        proposal_id="prop_vertex_01",
        question_index=1,
        section="Data Governance & Lifecycle",
        question_text="State your customer data retention period post-termination and the verified timeline for certified destruction of all primary and replica storage.",
        category=QuestionCategory.DATA_PRIVACY.value,
        is_mandatory=True,
        evaluation_criteria="Must satisfy strict HIPAA and GxP data governance standards."
    )
    db.merge(q3_1)

    # Response with an intentional draft contradiction: 90 days instead of 30 days
    resp3_1 = ProposalResponse(
        id="rsp_vtx_retention",
        question_id="qst_vtx_retention",
        proposal_id="prop_vertex_01",
        proposed_answer="Customer data is retained in our secure repository for 90 days following service termination to allow for reactivation or audit extracts, after which data is decommissioned.",
        confidence_score=0.74,
        supporting_sources=["Default Data Terms §8"],
        status=ResponseStatus.DRAFT.value,
        generation_mode="MEMORY_OFF",
        verification_required=True
    )
    db.merge(resp3_1)

    # Active Contradiction Alert for Proposal 3
    alert1 = ContradictionAlert(
        id="cfl_vtx_01_retention",
        proposal_id="prop_vertex_01",
        question_id="qst_vtx_retention",
        new_claim_text="Customer data is retained in our secure repository for 90 days following service termination...",
        conflicting_claim_id="clm_data_retention",
        conflicting_claim_text="30 days post-termination with certified cryptographic wipe (Approved by CISO)",
        scope="global",
        conflict_explanation="New proposal draft asserts 90 days retention, contradicting the approved 30-day post-termination certified cryptographic wipe policy mandated for healthcare compliance.",
        recommended_action="Enforce approved 30-day cryptographic destruction standard per Claim #clm_data_retention.",
        severity=ContradictionSeverity.HIGH.value,
        status=ContradictionStatus.OPEN.value,
        created_at=datetime.utcnow() - timedelta(hours=3)
    )
    db.merge(alert1)

    # Additional question for live demonstration
    q3_2 = RfpQuestion(
        id="qst_vtx_support",
        proposal_id="prop_vertex_01",
        question_index=2,
        section="Operations & Escalation",
        question_text="Describe your enterprise SLA response commitments, business hours vs critical emergency support availability.",
        category=QuestionCategory.SLAS_AND_SUPPORT.value,
        is_mandatory=True,
        evaluation_criteria="Clear operational boundaries and escalation channels."
    )
    db.merge(q3_2)

    db.commit()
    logger.info("Successfully seeded synthetic enterprise dataset with proposals, claims, reviews, and contradictions.")
    return {"status": "seeded_successfully"}
