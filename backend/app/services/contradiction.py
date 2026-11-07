import re
import logging
from typing import List, Dict, Any, Optional, Tuple
from sqlalchemy.orm import Session
from app.models.claim import ClaimLedgerItem, ContradictionAlert, ContradictionSeverity, ContradictionStatus

logger = logging.getLogger("precedent.contradiction")

# Deterministic patterns for enterprise proposal claim validation
DETERMINISTIC_RULES = [
    {
        "subject": "enterprise_support",
        "predicate": "coverage_hours",
        "approved_value": "24/5 standard support with 24/7 emergency P1 escalation",
        "conflict_patterns": [
            (r"\b24/7\s+(standard|dedicated|all\s+tiers|regular)\b", "New proposal claims 24/7 standard support across all tiers, but approved precedent specifies 24/5 standard with 24/7 emergency P1 escalation only."),
            (r"\b(24/7\s+support\s+for\s+all|round-the-clock\s+standard)\b", "Overstates baseline support availability beyond verified 24/5 enterprise coverage."),
        ],
        "recommended_action": "Change response to specify standard support is 24/5 with 24/7 emergency escalation for critical P1 incidents."
    },
    {
        "subject": "data_retention",
        "predicate": "post_termination_days",
        "approved_value": "30 days post-termination with certified cryptographic wipe",
        "conflict_patterns": [
            (r"\b90\s+days?\b", "New proposal states 90 days retention, contradicting the approved 30-day post-termination cryptographic wipe policy."),
            (r"\b60\s+days?\b", "New proposal specifies 60-day retention window, which conflicts with standard 30-day compliance commitment."),
            (r"\bindefinitely\b", "Claims indefinite retention, directly violating regulated data destruction compliance standards.")
        ],
        "recommended_action": "Align data retention timeline with verified 30-day post-termination certified deletion standard."
    },
    {
        "subject": "uptime_sla",
        "predicate": "availability_percentage",
        "approved_value": "99.9% monthly availability with financial penalty credits",
        "conflict_patterns": [
            (r"\b99\.999%\b", "Claims 'five nines' (99.999%) availability, which exceeds the contractual 99.9% SLA commitment."),
            (r"\b100%\s+uptime\b", "Guarantees 100% uptime, which is legally unapproved and contractually invalid.")
        ],
        "recommended_action": "Restrict availability commitment to approved 99.9% SLA tier."
    },
    {
        "subject": "disaster_recovery",
        "predicate": "rto_rpo",
        "approved_value": "RTO: 4 hours, RPO: 1 hour for Tier-1 services",
        "conflict_patterns": [
            (r"\bRTO\s*:\s*(15|30)\s*minutes?\b", "Claims 15-30 min RTO, which contradicts certified 4-hour disaster recovery SLA."),
            (r"\bzero\s+data\s+loss\b", "Claims zero data loss (RPO 0), which exceeds verified multi-region RPO of 1 hour.")
        ],
        "recommended_action": "Update RTO/RPO metrics to match verified disaster recovery specifications."
    }
]

class ContradictionEngine:
    def __init__(self):
        pass

    def scan_for_conflicts(
        self,
        db: Session,
        proposal_id: str,
        question_id: str,
        new_text: str,
        client_id: Optional[str] = None,
        sector_id: Optional[str] = None
    ) -> List[ContradictionAlert]:
        """
        Inspect newly generated or edited text against the Claim Ledger and deterministic rule sets.
        Creates ContradictionAlert database records and returns detected conflicts.
        """
        alerts: List[ContradictionAlert] = []
        
        # 1. Check against active Claim Ledger items in DB
        active_claims = db.query(ClaimLedgerItem).filter(ClaimLedgerItem.is_active == True).all()
        
        # Filter claims: respect client scope isolation
        # Client-specific claims should only trigger if same client!
        relevant_claims = []
        for claim in active_claims:
            if claim.scope == "client":
                if client_id and claim.scope_target == client_id:
                    relevant_claims.append(claim)
            else:
                relevant_claims.append(claim)
                
        # 2. Check deterministic conflict rules
        for rule in DETERMINISTIC_RULES:
            for pattern, reason in rule["conflict_patterns"]:
                if re.search(pattern, new_text, re.IGNORECASE):
                    # Find matching claim or create virtual alert
                    matching_claim = next((c for c in relevant_claims if c.subject == rule["subject"]), None)
                    claim_id = matching_claim.id if matching_claim else "clm_baseline_rule"
                    claim_text = matching_claim.value if matching_claim else rule["approved_value"]
                    
                    # Check if alert already exists for this proposal & question
                    existing = db.query(ContradictionAlert).filter(
                        ContradictionAlert.proposal_id == proposal_id,
                        ContradictionAlert.question_id == question_id,
                        ContradictionAlert.conflicting_claim_id == claim_id,
                        ContradictionAlert.status == ContradictionStatus.OPEN.value
                    ).first()
                    
                    if not existing:
                        alert = ContradictionAlert(
                            proposal_id=proposal_id,
                            question_id=question_id,
                            new_claim_text=new_text[:300],
                            conflicting_claim_id=claim_id,
                            conflicting_claim_text=claim_text,
                            scope="global",
                            conflict_explanation=reason,
                            recommended_action=rule["recommended_action"],
                            severity=ContradictionSeverity.HIGH.value,
                            status=ContradictionStatus.OPEN.value
                        )
                        db.add(alert)
                        db.commit()
                        db.refresh(alert)
                        alerts.append(alert)
                    else:
                        alerts.append(existing)

        return alerts

    def resolve_alert(
        self,
        db: Session,
        alert_id: str,
        resolution_type: str, # ENFORCE_OLD, OVERRIDE_NEW, DISMISS
        resolved_by: str
    ) -> Optional[ContradictionAlert]:
        alert = db.query(ContradictionAlert).filter(ContradictionAlert.id == alert_id).first()
        if not alert:
            return None
            
        status_map = {
            "ENFORCE_OLD": ContradictionStatus.RESOLVED_ENFORCED_OLD.value,
            "OVERRIDE_NEW": ContradictionStatus.RESOLVED_OVERRIDDEN_NEW.value,
            "DISMISS": ContradictionStatus.DISMISSED.value
        }
        alert.status = status_map.get(resolution_type, ContradictionStatus.DISMISSED.value)
        alert.resolved_by = resolved_by
        from datetime import datetime
        alert.resolved_at = datetime.utcnow()
        
        db.commit()
        db.refresh(alert)
        return alert

contradiction_engine = ContradictionEngine()

