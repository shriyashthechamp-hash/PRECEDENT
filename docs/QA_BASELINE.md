# PRECEDENT — QA Baseline Audit & Pre-Existing Test Report

**Date**: 2026-11-18  
**Audit Scope**: Full repository audit (Frontend Next.js application, Backend FastAPI service, existing test suites, build pipelines, and environment dependencies).  
**Repository State**: Clean working tree on branch `qa/regression-tests` branched from `main` (`commit 048694e`).

---

## 1. Executive Summary

A comprehensive baseline audit was executed across PRECEDENT prior to authoring any new regression suites. The existing application has a functional FastAPI backend and Next.js 15 App Router frontend.

- **Frontend Production Build**: **PASSED** (17/17 routes compiled cleanly, 0 build errors).
- **Frontend TypeScript Verification**: **PASSED** (`tsc --noEmit` exited code 0, 0 type errors).
- **Backend Pytest Suite (16 test items collected)**:
  - **13 PASSED**
  - **1 SKIPPED** (`test_live_hindsight_daemon_connectivity`: skips cleanly when local Hindsight daemon is offline)
  - **2 FAILED** (pre-existing environmental failures documented below)

---

## 2. Baseline Test Execution Details

### Command 1: Frontend TypeScript Check
```bash
cd frontend && npx tsc --noEmit
```
- **Exit Code**: 0
- **Duration**: ~2.1s
- **Output**: Clean exit, 0 errors.

### Command 2: Frontend Production Build Validation
```bash
cd frontend && npm run build
```
- **Exit Code**: 0
- **Duration**: ~2.6s
- **Compiled Routes**:
  - `○ /` (Public landing page, Hero, BentoGrid, WaveAnimation, DotTiles)
  - `○ /_not-found` (404 handler)
  - `○ /about` (Public about page)
  - `○ /analytics` (Audited dashboard KPIs & provenance)
  - `○ /app` (Application dashboard & overview)
  - `○ /claims` (Institutional Claim Ledger)
  - `○ /clients` (Enterprise client directory)
  - `○ /contradictions` (Contradiction Defense Center & Audit Trail)
  - `○ /lab` (Memory ON vs OFF A/B Laboratory)
  - `○ /memory` (Hindsight Institutional Memory Bank & Explorer)
  - `○ /outcomes` (Bid Outcome Intelligence)
  - `○ /proposals` (Active RFP workspace list)
  - `ƒ /proposals/[id]` (Dynamic proposal detail workspace)
  - `○ /proposals/upload` (RFP ingestion upload interface)
  - `○ /review` (Human-in-the-loop review & approval engine)
  - `○ /settings` (System settings & environment configuration)
- **Result**: All 17 pages generated cleanly with 0 compilation or bundling errors.

### Command 3: Backend Pytest Suite
```bash
cd backend && PYTHONPATH=. .venv/bin/pytest tests/ -v
```
- **Exit Code**: 1 (2 failures, 13 passes, 1 skip)
- **Platform**: Darwin (Python 3.9.6, pytest-8.4.2)
- **Results Breakdown**:
  | Test Item | Status | Root Cause / Note |
  |-----------|--------|-------------------|
  | `test_api_e2e.py::test_api_health_endpoint` | **FAILED** | Assertion strictly expects `data["groq_inference"]["status"] == "configured_live"`. Without `GROQ_API_KEY` set in the test runner's environment, the endpoint returns `"unconfigured_using_deterministic_engine"`. |
  | `test_api_e2e.py::test_api_proposals_list` | **PASSED** | Verifies retrieval of seeded proposal workspaces. |
  | `test_api_e2e.py::test_api_generate_and_review_flow` | **PASSED** | Verifies response generation and reviewer correction. |
  | `test_api_e2e.py::test_api_comparison_endpoint` | **PASSED** | Verifies Memory ON vs OFF A/B execution. |
  | `test_api_e2e.py::test_api_analytics_summary` | **PASSED** | Verifies audited metrics and provenance. |
  | `test_contradiction_gate.py::test_contradiction_blocks_submission_and_audits_resolution` | **PASSED** | Verifies hard gate blocking submission on open HIGH contradictions and audit log creation. |
  | `test_core.py::test_rfp_parser_valid_text` | **PASSED** | Verifies text parsing and question extraction. |
  | `test_core.py::test_rfp_parser_empty_file` | **PASSED** | Verifies empty file validation. |
  | `test_core.py::test_hindsight_retain_and_recall` | **PASSED** | Verifies Retain and Recall contracts in SQLite persistent fallback. |
  | `test_core.py::test_hindsight_client_isolation` | **PASSED** | Verifies client-scoped memories do not leak. |
  | `test_core.py::test_contradiction_detection_deterministic` | **PASSED** | Verifies detection of predicate clashes. |
  | `test_full_lifecycle.py::test_full_precedent_lifecycle` | **FAILED** | Step 1 strictly asserts `health["groq_inference"]["status"] == "configured_live"`. Fails when `GROQ_API_KEY` is not exported. |
  | `test_hindsight_live.py::test_live_hindsight_daemon_connectivity` | **SKIPPED** | Expected skip when live Hindsight daemon at `localhost:8888` is not running. |
  | `test_hindsight_live.py::test_hindsight_service_honesty_mode` | **PASSED** | Verifies honest status reporting (`CONNECTED` vs `FALLBACK`). |
  | `test_learning_demonstration.py::test_institutional_learning_cycle_api` | **PASSED** | Verifies 9-step automated learning cycle. |
  | `test_persistence_restart.py::test_hindsight_persistence_survives_restart` | **PASSED** | Verifies retained memories survive process destruction. |

---

## 3. Pre-Existing Failures & Environmental Discrepancy

The two pre-existing failures (`test_api_health_endpoint` and `test_full_precedent_lifecycle`) stem from a hard-coded assertion:
```python
assert health["groq_inference"]["status"] == "configured_live"
```
In `backend/app/routers/health.py`:
```python
groq_status = "configured_live" if settings.GROQ_API_KEY else "unconfigured_using_deterministic_engine"
```
The previous maintainer ran tests in an environment where `GROQ_API_KEY` was populated in `.env`. On a clean repository checkout without secrets, the backend gracefully defaults to `unconfigured_using_deterministic_engine`. The test did not account for this valid state.

---

## 4. Test Coverage Gaps Identified

### Frontend Gaps
1. **No Automated Component/Behavioral Tests**: `frontend/package.json` had zero test dependencies (no Jest, Vitest, or testing-library). Only production compilation (`next build`) and type-checking (`tsc`) were run.
2. **Missing Form Validation Tests**: RFP file upload validations (file format restriction, empty file, size limit) were untested in frontend automated suites.
3. **Missing State Transition Tests**: Proposal status flow (`DRAFT` → `IN_REVIEW` → `SUBMITTED`), response status flow (`DRAFT` → `ACCEPTED` / `EDITED`), and contradiction resolution states were only tested via backend integration.
4. **Missing Navigation and Route Guard Tests**: Route rendering and URL parameter parsing were not guarded by regression assertions.

### Backend Gaps
1. **Document Ingestion Boundaries**:
   - Rejection of invalid file extensions (`.exe`, `.sh`, `.json`, `.png`) returning HTTP 400 with descriptive error message.
   - File size boundary enforcement (25 MB limit returning HTTP 413).
   - Malformed/corrupt PDF/DOCX byte payloads handling without crashing the server.
2. **API Input Validation & Error Handling**:
   - Requesting non-existent proposals (`/api/proposals/{invalid_id}`) returning HTTP 404.
   - Reviewing non-existent response (`/api/review/correct` and `/api/review/accept/{id}`) returning HTTP 404.
   - Submitting non-existent proposal returning HTTP 404.
   - Contradiction resolution on invalid alert ID returning HTTP 404.
   - Deactivating non-existent claim returning HTTP 404.
   - Invalid resolution types on contradictions.
3. **Core Product Principle Regression Protection**:
   - **Human Review Principle**: Generated AI responses must remain `DRAFT` status and must NOT be promoted to Claim Ledger or Hindsight memory until a human reviewer accepts or corrects them.
   - **Contradiction Severity Isolation**: Non-blocking contradictions (`LOW`, `MEDIUM`) should not block proposal submission, while `HIGH` severity contradictions must strictly block submission.
   - **Sector & Client Quarantine**: Claims and memories quarantined by sector and client must never be applied to un-scoped queries.
   - **Deterministic Fallback Engine Integrity**: In the absence of live Groq API keys, the fallback engine must produce structurally valid responses adhering to `ProposalResponseBase`.

---

## 5. Important Workflows Tested Manually

1. **RFP Ingestion Workflow**: Uploaded `sample_rfp.txt` via `/api/rfp/ingest` and verified line-item question extraction.
2. **Response Generation Workflow**: Executed `POST /api/proposals/generate-response` with `MEMORY_ON` and verified fallback engine produced schema-valid responses with confidence scores.
3. **Human Review Correction**: Executed `POST /api/review/correct` and verified the response updated to `EDITED`, created a `ReviewCorrectionEvent`, and registered an approved claim.
4. **Contradiction Block & Resolution**: Verified proposal submission is blocked with HTTP 400 when an open HIGH contradiction exists, and succeeds once resolved with `ENFORCE_OLD`.
5. **A/B Laboratory**: Executed `POST /api/comparison/execute` and verified delta metrics computation without errors.
