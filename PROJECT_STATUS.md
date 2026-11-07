# PRECEDENT — Project Status

## Product Positioning
> **Your organization's memory. Your next unfair advantage.**
> *Every bid builds a better next bid.*

## Current Architecture
- **Frontend**: Next.js 15+ / React 19 / TypeScript / Tailwind CSS / Lucide Icons. High-density enterprise SaaS interface inspired by Linear and Palantir. Statically verified with zero build or lint warnings.
- **Backend**: Python 3.15+ FastAPI asynchronous architecture (`backend/app`), structured Pydantic v2 schemas, automated PDF & DOCX question extractor, deterministic rule validation engine, and audit logging.
- **Relational Persistence**: SQLAlchemy SQLite engine (`backend/precedent.db`) with full transactional constraints, cascading deletes, foreign keys, and indexed query tables (`proposals`, `rfp_questions`, `proposal_responses`, `review_correction_events`, `claim_ledger`, `contradiction_alerts`, `bid_outcomes`, `clients`, `sectors`).
- **AI Proposal Engine**: Groq API integration (`llama-3.3-70b-versatile` / `llama-3.1-8b-instant`) with structured Pydantic schema output, confidence scoring, supporting evidence mapping, and resilient deterministic evidence-grounded fallback.
- **Institutional Memory Engine**: Dedicated Hindsight integration service (`backend/app/services/hindsight.py`) implementing official REST API contracts:
  - `POST /v1/default/banks/{bank_id}/memories` (Retain verified reviewer edits and outcomes)
  - `POST /v1/default/banks/{bank_id}/memories/recall` (Multi-strategy BM25, graph, and temporal search)
  - `POST /v1/default/banks/{bank_id}/reflect` (Agentic reasoning loop synthesizing institutional directives)
- **Signature Differentiator (Contradiction Intelligence)**: Deterministic Claim Ledger auditing that flags clashes between new unverified draft text and historical approved commitments (support hours, SLAs, retention periods, certifications, encryption standards).
- **A/B Laboratory**: Live side-by-side execution comparing Memory OFF vs Memory ON with empirical delta metrics (confidence lift, reviewer edit reduction %, token variance, latency).

---

## Completed Phases
- [x] **PHASE 0: Repository Audit & Planning**
  - Audited local machine environment: Python 3.15, Node v25.8, pnpm v11.2, Band CLI at `/Applications/Band.app/Contents/MacOS/band`.
  - Created `.env.example`, `.gitignore`, architectural specs, and Hindsight integration docs.
- [x] **PHASE 1: Foundation & Relational Database**
  - Configured FastAPI application with CORS and lifespan database migration.
  - Implemented 10 relational ORM models covering proposals, questions, responses, review events, claim ledger, contradiction alerts, outcomes, and clients.
- [x] **PHASE 2: Enterprise Shell & Design System**
  - Engineered dark theme design system in Tailwind CSS (`frontend/tailwind.config.js`).
  - Built Navigation Sidebar, Header, status indicators, and responsive views.
- [x] **PHASE 3: RFP Ingestion & Parsing**
  - Implemented `RfpParserService` supporting PDF, DOCX, and TXT tenders.
  - Automatic classification into 11 enterprise categories, page reference mapping, mandatory requirement detection.
- [x] **PHASE 4: AI Proposal Engine (Groq & Pydantic)**
  - Structured output generator adhering strictly to Pydantic models with confidence scores, source citations, and risk alerts.
- [x] **PHASE 5: Review & Learning Engine**
  - Human-in-the-loop review interface capturing original draft, human correction, mandatory rationale, and category tagging.
  - Retains approved corrections into Hindsight memory and promotes new verified corporate standards to the Claim Ledger.
- [x] **PHASE 6: Hindsight Memory Integration**
  - Verified REST endpoints for Retain, Recall, and Reflect with client-level memory isolation.
- [x] **PHASE 7: Contradiction Intelligence & Claim Ledger**
  - Deterministic conflict engine flagging support overcommitments, 90-day vs 30-day retention clashes, and unapproved SLAs.
  - Resolution actions: Enforce Approved Precedent, Override & Promote New Standard, or Dismiss.
- [x] **PHASE 8: Outcome Intelligence**
  - Bid outcome capture (Won/Lost/Withdrawn), contract values, and evaluator feedback remarks retained into Hindsight reflection.
- [x] **PHASE 9: Memory ON vs Memory OFF A/B Laboratory**
  - Live side-by-side comparison screen measuring empirical edit reduction and contradiction avoidance.
- [x] **PHASE 10: Synthetic Demo Environment & Test Hardening**
  - Realistic enterprise dataset (Vanguard Logic Systems) with pre-seeded proposals, won/lost bids, historical corrections, and active contradiction alerts.
  - 10 automated test suites passing with 100% success rate.
  - Next.js production build succeeded for all 15 routes.

---

## Running Services & Verification Results
- **Pytest Test Suite**: `10 passed, 0 failed` (`test_rfp_parser_valid_text`, `test_rfp_parser_empty_file`, `test_hindsight_retain_and_recall`, `test_hindsight_client_isolation`, `test_contradiction_detection_deterministic`, `test_api_health_endpoint`, `test_api_proposals_list`, `test_api_generate_and_review_flow`, `test_api_comparison_endpoint`, `test_api_analytics_summary`).
- **Frontend Build**: Statically prerendered 15 routes (`/`, `/analytics`, `/claims`, `/clients`, `/contradictions`, `/lab`, `/memory`, `/outcomes`, `/proposals`, `/proposals/[id]`, `/proposals/upload`, `/review`, `/settings`).
- **Band AI Desktop**: Detected CLI at `/Applications/Band.app/Contents/MacOS/band`.

---

## Environment Requirements
- Python 3.11+ (with virtualenv in `backend/.venv`)
- Node.js 18+ (with pnpm/npm dependencies in `frontend/node_modules`)
- Optional `GROQ_API_KEY` in `.env` (falls back gracefully to deterministic evidence-grounded inference engine when unconfigured)
- Optional `HINDSIGHT_API_URL` (falls back gracefully to embedded local Hindsight memory bank)
