# PRECEDENT — Test Architecture & Quality Assurance Guide

This document details the automated testing architecture, verification commands, test categories, environmental requirements, and isolation guarantees for the PRECEDENT platform.

---

## 1. Quickstart & Verification Commands

### Run Complete Verification Suite (Backend + Frontend + Build)
```bash
./scripts/test.sh
```
Executes all 4 verification phases in sequence:
1. **Backend Pytest Suite**: 40 automated test cases (API, validation, product principles, persistence).
2. **Frontend Workflow Regression Tests**: 24 automated test cases (API client, upload validation, review transitions, navigation).
3. **Frontend TypeScript Check**: Full type validity check with `tsc --noEmit`.
4. **Frontend Production Build**: Complete compilation of all 17 Next.js static and dynamic App Router routes.

---

## 2. Granular Test Execution

### Backend Tests (Python Pytest)
```bash
cd backend
PYTHONPATH=. .venv/bin/pytest tests/ -v
```

To run a specific test suite:
```bash
cd backend
# RFP Ingestion & Boundary Protection
PYTHONPATH=. .venv/bin/pytest tests/test_rfp_ingestion_boundaries.py -v

# API Error Handling & 404/422 Validation
PYTHONPATH=. .venv/bin/pytest tests/test_api_validation_errors.py -v

# Core Institutional Product Principles (Human Review, Contradiction Hard Gate, Client Quarantine)
PYTHONPATH=. .venv/bin/pytest tests/test_product_principles.py -v

# Claims Ledger, Outcomes & Audited Analytics
PYTHONPATH=. .venv/bin/pytest tests/test_claims_and_outcomes.py -v

# Contradiction Hard Gate & Resolution
PYTHONPATH=. .venv/bin/pytest tests/test_contradiction_gate.py -v

# 9-Step Institutional Learning Demonstration API
PYTHONPATH=. .venv/bin/pytest tests/test_learning_demonstration.py -v

# Hindsight Persistence Restart Verification
PYTHONPATH=. .venv/bin/pytest tests/test_persistence_restart.py -v
```

### Frontend Tests (Node.js Native Test Runner)
```bash
cd frontend
npm test
# Or directly via Node test runner:
node --test tests/*.test.mjs
```

To run a specific frontend test suite:
```bash
cd frontend
node --test tests/api_client.test.mjs
node --test tests/upload_validation.test.mjs
node --test tests/review_workflow.test.mjs
node --test tests/routes_and_navigation.test.mjs
```

### Frontend Type Check & Production Build
```bash
cd frontend
npx tsc --noEmit
npm run build
```

---

## 3. Test Suites & Coverage Matrix

### A. Backend Test Matrix (40 Test Cases)

| File | Category | Test Case | Target Capability |
|------|----------|-----------|-------------------|
| `test_rfp_ingestion_boundaries.py` | Integration / Security | `test_ingest_rejects_unsupported_extensions` | Blocks `.exe`, `.sh`, `.py`, `.csv`, `.png`, `.zip` with HTTP 400. |
| `test_rfp_ingestion_boundaries.py` | Integration / Security | `test_ingest_rejects_oversized_file` | Enforces 25MB maximum upload constraint with HTTP 413. |
| `test_rfp_ingestion_boundaries.py` | Boundary | `test_ingest_rejects_empty_file` | Validates zero-byte payloads produce descriptive HTTP 400. |
| `test_rfp_ingestion_boundaries.py` | Integration | `test_ingest_valid_text_with_metadata` | Multi-section line-item question parsing & workspace setup. |
| `test_rfp_ingestion_boundaries.py` | Unit | `test_ingest_auto_derives_title_when_omitted` | Fallback title generation from document filename. |
| `test_api_validation_errors.py` | API Validation | `test_proposal_not_found_returns_404` | Non-existent proposal detail returns HTTP 404. |
| `test_api_validation_errors.py` | API Validation | `test_generate_response_invalid_proposal_returns_404` | Answer generation for missing proposal returns HTTP 404. |
| `test_api_validation_errors.py` | API Validation | `test_generate_response_invalid_question_returns_404` | Answer generation for missing question returns HTTP 404. |
| `test_api_validation_errors.py` | API Validation | `test_submit_invalid_proposal_returns_404` | Submitting missing proposal returns HTTP 404. |
| `test_api_validation_errors.py` | API Validation | `test_review_correct_invalid_response_returns_404` | Review correction on missing response returns HTTP 404. |
| `test_api_validation_errors.py` | API Validation | `test_review_accept_invalid_response_returns_404` | Review accept on missing response returns HTTP 404. |
| `test_api_validation_errors.py` | API Validation | `test_contradiction_resolve_invalid_alert_returns_404` | Resolving missing contradiction returns HTTP 404. |
| `test_api_validation_errors.py` | API Validation | `test_claim_deactivate_invalid_claim_returns_404` | Deactivating missing claim returns HTTP 404. |
| `test_api_validation_errors.py` | API Validation | `test_outcome_invalid_proposal_returns_404` | Missing proposal in bid outcome returns HTTP 404. |
| `test_api_validation_errors.py` | API Validation | `test_pydantic_validation_error_on_missing_fields` | Schema enforcement returns HTTP 422 on missing required fields. |
| `test_product_principles.py` | Product Principle | `test_ai_response_is_draft_not_institutional_truth` | AI generation produces DRAFT status; does not write unapproved claim. |
| `test_product_principles.py` | Product Principle | `test_reviewer_correction_promotes_to_ledger_and_hindsight` | Reviewer correction promotes answer to Claim Ledger & Hindsight. |
| `test_product_principles.py` | Product Principle | `test_medium_contradiction_does_not_block_submission` | Non-blocking (MEDIUM/LOW) conflicts allow submission. |
| `test_product_principles.py` | Product Principle | `test_high_contradiction_enforce_old_resolution_flow` | HIGH conflict hard gate, ENFORCE_OLD rewrite & audit trail. |
| `test_product_principles.py` | Product Principle | `test_client_quarantine_in_contradiction_engine` | Client Alpha concession does not leak to Client Beta scan. |
| `test_claims_and_outcomes.py` | Integration | `test_claims_lifecycle_and_filtering` | Claim creation, scope filtering, active status, deactivation. |
| `test_claims_and_outcomes.py` | Integration | `test_bid_outcome_recording_and_updating` | Bid outcome recording (WON/LOST) & Hindsight feedback retention. |
| `test_claims_and_outcomes.py` | Integration | `test_memory_explorer_provenance_aggregation` | Aggregation of ReviewCorrectionEvent + Hindsight memories. |
| `test_claims_and_outcomes.py` | Auditing | `test_analytics_summary_live_computation_and_provenance` | Audited KPI computation and SQL query provenance disclosures. |
| `test_api_e2e.py` | End-to-End | `test_api_health_endpoint` | Verifies health endpoint reporting for DB, Hindsight, and Groq. |
| `test_api_e2e.py` | End-to-End | `test_api_proposals_list` | Verifies listing seeded proposal workspaces. |
| `test_api_e2e.py` | End-to-End | `test_api_generate_and_review_flow` | Verifies answer generation, reviewer correction, and persistence. |
| `test_api_e2e.py` | End-to-End | `test_api_comparison_endpoint` | Verifies Memory ON vs OFF side-by-side execution. |
| `test_api_e2e.py` | End-to-End | `test_api_analytics_summary` | Verifies KPI calculation from live database records. |
| `test_contradiction_gate.py` | Integration | `test_contradiction_blocks_submission_and_audits_resolution` | End-to-end hard gate submission block and audit log verification. |
| `test_core.py` | Unit | `test_rfp_parser_valid_text` | RFP parser sectioning and question extraction. |
| `test_core.py` | Unit | `test_rfp_parser_empty_file` | Parser validation on empty input. |
| `test_core.py` | Unit / Mocked | `test_hindsight_retain_and_recall` | Hindsight Retain and Recall contracts. |
| `test_core.py` | Unit / Isolation | `test_hindsight_client_isolation` | Hindsight client scoping quarantine. |
| `test_core.py` | Unit / Logic | `test_contradiction_detection_deterministic` | Deterministic conflict detection between commitments. |
| `test_full_lifecycle.py` | End-to-End | `test_full_precedent_lifecycle` | End-to-end proposal lifecycle from ingest to submission. |
| `test_hindsight_live.py` | Live / Skip | `test_live_hindsight_daemon_connectivity` | External Hindsight daemon connectivity (honestly skipped if offline). |
| `test_hindsight_live.py` | Unit / Honesty | `test_hindsight_service_honesty_mode` | Verifies service honestly reports CONNECTED vs FALLBACK. |
| `test_learning_demonstration.py` | E2E / Demo | `test_institutional_learning_cycle_api` | 9-step repeatable learning cycle endpoint verification. |
| `test_persistence_restart.py` | Integration / Durability | `test_hindsight_persistence_survives_restart` | Retained memories survive complete backend service destruction. |

### B. Frontend Test Matrix (24 Test Cases)

| File | Suite | Test Case | Target Capability |
|------|-------|-----------|-------------------|
| `api_client.test.mjs` | API Client | `should normalize endpoints and construct correct request headers` | Verifies endpoint leading slashes and JSON headers. |
| `api_client.test.mjs` | API Client | `should correctly propagate structured API error details` | Verifies propagation of backend detail messages. |
| `api_client.test.mjs` | API Client | `should fall back to HTTP statusText when error body is not JSON` | Non-JSON error body fallback. |
| `api_client.test.mjs` | API Client | `should format Render cold start guidance on network connection drop` | Render 30-50s spin-up advisory on fetch failure. |
| `api_client.test.mjs` | API Client | `should validate query parameter serialization for Memory Explorer` | URLSearchParams serialization for filters. |
| `api_client.test.mjs` | API Client | `should correctly structure review correction payload` | Contract validation for review correction schema. |
| `upload_validation.test.mjs` | Validation | `should reject submissions when no file is selected` | Missing file prompt validation. |
| `upload_validation.test.mjs` | Validation | `should accept valid PDF, DOCX, DOC, and TXT files` | Allowed extension whitelist (.pdf, .docx, .doc, .txt). |
| `upload_validation.test.mjs` | Validation | `should reject disallowed extensions (.exe, .sh, .json, .py, .csv, .png)` | Malicious/unsupported extension rejection. |
| `upload_validation.test.mjs` | Validation | `should reject files exceeding the 25MB boundary` | 25MB file size constraint boundary check. |
| `upload_validation.test.mjs` | Validation | `should accept files exactly at or below the 25MB limit` | Boundary acceptance at exactly 25MB. |
| `upload_validation.test.mjs` | Validation | `should auto-generate clean title from filename when title is omitted` | Filename-to-title formatting. |
| `upload_validation.test.mjs` | Validation | `should preserve custom title and reference when provided` | Custom title and reference preservation. |
| `upload_validation.test.mjs` | Validation | `should validate preset synthetic sample configurations` | Healthcare & FinTech preset structure verification. |
| `review_workflow.test.mjs` | Workflow | `should initialize AI responses in DRAFT state with verification required` | Initial state machine status. |
| `review_workflow.test.mjs` | Workflow | `should transition DRAFT to ACCEPTED and clear verification_required` | Direct acceptance workflow. |
| `review_workflow.test.mjs` | Workflow | `should transition DRAFT to EDITED, bump version, and attach review provenance` | Edit & review event creation. |
| `review_workflow.test.mjs` | Workflow | `should enforce mandatory correction reason (reject empty rationale)` | Mandatory human rationale validation. |
| `review_workflow.test.mjs` | Workflow | `should load accurate preset for support coverage` | 24/5 vs 24/7 P1 preset accuracy. |
| `review_workflow.test.mjs` | Workflow | `should load accurate preset for data retention` | 30-day cryptographic purge preset accuracy. |
| `routes_and_navigation.test.mjs` | Navigation | `should verify all sidebar navigation links match valid application routes` | All sidebar hrefs point to active routes. |
| `routes_and_navigation.test.mjs` | Navigation | `should correctly compute active navigation state based on current pathname` | Active highlight state calculation. |
| `routes_and_navigation.test.mjs` | Navigation | `should validate empty state messaging contracts across critical views` | Empty state contracts for 0-record states. |
| `routes_and_navigation.test.mjs` | Navigation | `should validate dynamic proposal URL parameter formatting` | URL encoding for proposal workspace routes. |

---

## 4. Test Categorization & Mocking Strategy

The PRECEDENT test architecture strictly differentiates between test types to prevent false confidence:

### 1. Unit Tests
- Execute purely within local memory without external processes.
- Examples: RFP text parsing (`test_core.py`), conflict detection (`test_contradiction_detection_deterministic`), client isolation logic.

### 2. Integration Tests
- Exercise FastAPI routes and SQLite relational persistence.
- Auto-seed synthetic initial datasets and test relational foreign key cascades, transaction rollbacks, and data persistence across requests.

### 3. Mocked & Fallback Tests
- When external network services are unconfigured:
  - **Groq Inference**: The backend operates in `unconfigured_using_deterministic_engine` mode, providing deterministic responses strictly matching `ProposalResponseBase`. Tests verify schema compliance without network calls.
  - **Hindsight Memory**: Falls back to durable SQLite persistent store (`MemoryBankRecord`) reporting mode `EMBEDDED_SQLITE_PERSISTENT` and status `FALLBACK`. Retain, Recall, and Reflect operations persist and execute deterministically.

### 4. Live Service Tests
- **Hindsight Live Test** (`test_hindsight_live.py`):
  - Checks connectivity to `HINDSIGHT_API_URL` (default `http://localhost:8888`).
  - If unreachable, honestly skips with an explanatory message.
- **Groq Live Verification** (`verify_groq.py`):
  - Runs outside standard unit testing.
  - Requires `GROQ_API_KEY` in `.env` to execute live model completions against `openai/gpt-oss-120b` and `openai/gpt-oss-20b`.

---

## 5. Environmental Requirements

- **Python**: 3.9+ (Python 3.12 recommended for production).
- **Node.js**: v20+ (Node.js v22 tested).
- **Virtual Environment**: `backend/.venv` with dependencies from `backend/requirements.txt`.
- **Frontend Dependencies**: `frontend/node_modules` installed via `npm install` or `pnpm install`.
- **Environment File**: Copy `.env.example` to `.env` or set required environment variables:
  ```bash
  DATABASE_URL=sqlite:///./precedent.db
  GROQ_API_KEY=your_groq_api_key_here  # Optional for deterministic fallback mode
  HINDSIGHT_API_URL=http://localhost:8888  # Optional; uses SQLite fallback if offline
  ```
