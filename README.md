# PRECEDENT
> **Your organization's memory. Your next unfair advantage.**
> *Every bid builds a better next bid.*

PRECEDENT is an enterprise-grade AI-native institutional intelligence platform designed for organizations that routinely respond to enterprise RFPs, tenders, security questionnaires, and high-stakes vendor assessments.

Unlike traditional proposal tools that merely store static past answers, PRECEDENT records **why** answers were revised, detects historical contradictions before submission, retains verified institutional memory using **Hindsight**, and systematically compounds past experience into higher win rates.

---

## Key Capabilities (Phase 2 Audited & Hardened)

- **RFP Parsing & Document Provenance**: Line-item requirement extraction from PDF and DOCX tenders with page coordinates preserved.
- **AI Proposal Generation (Groq)**: Evidence-grounded response generation via `openai/gpt-oss-120b` (primary) and `openai/gpt-oss-20b` (fallback) with token likelihood estimation and non-certainty disclaimers.
- **Review & Learning Engine**: Captures human-in-the-loop edits with structured rationales, promoting verified statements into the Claim Ledger.
- **Persistent Hindsight Memory**: Real `retain`, `recall`, and `reflect` multi-bank memory engine with strict client/sector isolation and SQLite durable persistence that survives backend and process restarts.
- **Contradiction Defense & Hard Gate**: Detects conflicts between draft proposals and approved corporate commitments. Prevents proposal submission while unresolved HIGH-severity contradictions remain.
- **Permanent Contradiction Audit Trail**: Records every resolution (`ENFORCE_OLD`, `OVERRIDE_NEW`, `DISMISS`) with timestamp, user, action, and rationale.
- **Memory ON vs Memory OFF A/B Laboratory**: Side-by-side empirical testing comparing unassisted vs memory-assisted responses, measuring character diffs, recall latency, and contradiction avoidance without fabricated metrics.
- **Repeatable 9-Step Institutional Learning Demonstration**: Automated verification endpoint (`/api/demo/run-learning-cycle`) proving end-to-end memory retention, recall, and compliance across different proposals.
- **Audited Metrics**: All dashboard KPIs computed strictly from live database records, distinguishing synthetic demo records from live proposals.

---

## Architecture & Technology Stack

- **Frontend**: Next.js 15+ (App Router), React, TypeScript, Tailwind CSS, Lucide Icons.
- **Backend**: Python 3.11+ FastAPI asynchronous API, Pydantic v2 data models with `ConfigDict`.
- **Database**: Relational SQLite / PostgreSQL with SQLAlchemy ORM, indexed claim ledger, foreign keys, and audit logs.
- **AI Inference**: Live Groq API (`openai/gpt-oss-120b` primary, `openai/gpt-oss-20b` fallback) with deterministic schema validation.
- **Memory Engine**: Hindsight REST API (`retain`, `recall`, `reflect`) with automatic failover to durable SQLite persistent store (`MemoryBankRecord`) and accurate status reporting (`CONNECTED` vs `FALLBACK`).

---

## Quickstart & Verification

### 1. Environment Configuration
```bash
cp .env.example .env
# Fill in your GROQ_API_KEY in .env
```

### 2. Run Automated Verification Tests
```bash
./scripts/test.sh
```
Runs the full 14-test backend pytest suite and compiles all 15 Next.js production routes.

### 3. Start Both Services
```bash
./scripts/start.sh
```
- Backend API: `http://localhost:8000` (docs at `http://localhost:8000/docs`)
- Frontend Web App: `http://localhost:3000`

---

## Documented Test Suite (14 Passed)

| Test File | Test Case | Description |
|-----------|-----------|-------------|
| `test_api_e2e.py` | `test_api_health_endpoint` | Verifies live Groq inference and Hindsight status reporting |
| `test_api_e2e.py` | `test_api_proposals_list` | Verifies proposal workspace retrieval |
| `test_api_e2e.py` | `test_api_generate_and_review_flow` | Verifies generation, reviewer correction, and Hindsight retain |
| `test_api_e2e.py` | `test_api_comparison_endpoint` | Verifies Memory ON vs Memory OFF side-by-side execution |
| `test_api_e2e.py` | `test_api_analytics_summary` | Verifies audited metrics and query provenance |
| `test_contradiction_gate.py` | `test_contradiction_blocks_submission_and_audits_resolution` | Verifies submission blocking on open HIGH contradictions and permanent audit trail |
| `test_core.py` | `test_rfp_parser_valid_text` | Validates sectioning and line-item question extraction |
| `test_core.py` | `test_rfp_parser_empty_file` | Verifies defensive parser validation on invalid uploads |
| `test_core.py` | `test_hindsight_retain_and_recall` | Validates Retain, Recall, and Reflect contracts |
| `test_core.py` | `test_hindsight_client_isolation` | Verifies client-scoped memories never leak cross-client |
| `test_core.py` | `test_contradiction_detection_deterministic` | Verifies detection of conflicting commitments |
| `test_full_lifecycle.py` | `test_full_precedent_lifecycle` | End-to-end proposal lifecycle from ingest to submission |
| `test_learning_demonstration.py` | `test_institutional_learning_cycle_api` | 9-step repeatable learning demonstration |
| `test_persistence_restart.py` | `test_hindsight_persistence_survives_restart` | Proves retained memories survive complete backend restart |
