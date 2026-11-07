# PRECEDENT — Project Status

## Product Positioning
> **Your organization's memory. Your next unfair advantage.**
> *Every bid builds a better next bid.*

## Current Architecture
- **Frontend**: Next.js 15+ / React 19 / TypeScript / Tailwind CSS / Lucide Icons. High-density enterprise SaaS interface inspired by Linear and Palantir. Statically verified with zero build or lint warnings across all 15 routes.
- **Backend**: Python 3.15+ FastAPI asynchronous architecture (`backend/app`), structured Pydantic v2 schemas with `ConfigDict`, automated PDF & DOCX question extractor, deterministic rule validation engine, and permanent audit logging.
- **Relational Persistence**: SQLAlchemy SQLite engine (`backend/precedent.db`) with full transactional constraints, cascading deletes, foreign keys, and indexed query tables (`proposals`, `rfp_questions`, `proposal_responses`, `review_correction_events`, `claim_ledger`, `contradiction_alerts`, `contradiction_audit_logs`, `memory_bank_records`, `bid_outcomes`, `clients`, `sectors`).
- **AI Proposal Engine (Groq Live)**: Live Groq API integration configured with flagship **`openai/gpt-oss-120b`** (120B parameter model) and resilient fallback **`openai/gpt-oss-20b`**, returning structured JSON validated by Pydantic schemas with statistical confidence notices.
- **Institutional Memory Engine (Hindsight)**: Dedicated Hindsight integration service (`backend/app/services/hindsight.py`) implementing official REST API contracts (`retain`, `recall`, `reflect`) with automatic failover to durable SQLite persistent store (`MemoryBankRecord`), surviving process restarts with full approval provenance and strict client isolation.
- **Contradiction Defense & Hard Gate**: Deterministic Claim Ledger auditing flagging clashes between draft text and approved commitments. Physically blocks proposal submission while unresolved HIGH-severity contradictions exist, and records every resolution in an immutable audit trail.
- **A/B Laboratory**: Live side-by-side execution comparing Memory OFF vs Memory ON with empirical delta metrics (reviewer character diff, recall latency, empirical finding) without fabricated numbers.
- **Repeatable 9-Step Learning Demo**: Automated endpoint `/api/demo/run-learning-cycle` proving end-to-end institutional memory compounding.

---

## Completed Phases
- [x] **PHASE 0: Repository Audit & Planning**
- [x] **PHASE 1: Foundation & Relational Database**
- [x] **PHASE 2: Enterprise Shell & Design System**
- [x] **PHASE 3: RFP Ingestion & Parsing**
- [x] **PHASE 4: AI Proposal Engine (Groq Live Inference)**
- [x] **PHASE 5: Review & Learning Engine**
- [x] **PHASE 6: Hindsight Memory Integration**
- [x] **PHASE 7: Contradiction Intelligence & Claim Ledger**
- [x] **PHASE 8: Outcome Intelligence**
- [x] **PHASE 9: Memory ON vs Memory OFF A/B Laboratory**
- [x] **PHASE 10: Synthetic Demo Environment & Test Hardening**
- [x] **PHASE 2 (Hardening): Intelligence Validation & Demo Hardening**
  - Audited every dashboard metric, eliminated hardcoded performance values, grounded all metrics in relational queries.
  - Verified Hindsight persistence across complete process restarts with `test_persistence_restart.py`.
  - Accurately exposed connection state (`CONNECTED` vs `FALLBACK`).
  - Implemented 9-step repeatable institutional learning cycle (`/api/demo/run-learning-cycle`).
  - Added contradiction submission blocking gate and permanent audit trail (`/api/contradictions/audit-trail`).
  - Cleaned all Pydantic v2 and datetime deprecation warnings.
  - 14/14 automated tests passing (100% pass rate).

---

## Running Services & Verification Results
- **FastAPI Backend Daemon**: Running on `http://0.0.0.0:8000`
- **Next.js Frontend Daemon**: Running on `http://localhost:3000`
- **Pytest Test Suite**: `14 passed, 0 failed` in 1.16s (100% pass rate).
- **Frontend Build**: Statically prerendered 15 routes (`/`, `/analytics`, `/claims`, `/clients`, `/contradictions`, `/lab`, `/memory`, `/outcomes`, `/proposals`, `/proposals/[id]`, `/proposals/upload`, `/review`, `/settings`).
- **Security Audit**: Zero secrets or database files tracked in Git.
