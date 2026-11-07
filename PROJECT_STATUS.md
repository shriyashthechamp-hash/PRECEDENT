# PRECEDENT — Project Status

## Product Positioning
> **Your organization's memory. Your next unfair advantage.**
> *Every bid builds a better next bid.*

## Current Architecture
- **Frontend**: Next.js 15+ / React 19 / TypeScript / Tailwind CSS / Lucide Icons. High-density enterprise SaaS interface inspired by Linear and Palantir. Statically verified with zero build or lint warnings across all 15 routes.
- **Backend**: Python 3.15+ FastAPI asynchronous architecture (`backend/app`), structured Pydantic v2 schemas, automated PDF & DOCX question extractor, deterministic rule validation engine, and audit logging.
- **Relational Persistence**: SQLAlchemy SQLite engine (`backend/precedent.db`) with full transactional constraints, cascading deletes, foreign keys, and indexed query tables (`proposals`, `rfp_questions`, `proposal_responses`, `review_correction_events`, `claim_ledger`, `contradiction_alerts`, `bid_outcomes`, `clients`, `sectors`).
- **AI Proposal Engine (Groq Live)**: Live Groq API integration configured with flagship **`openai/gpt-oss-120b`** (120B parameter model) and resilient fallback **`openai/gpt-oss-20b`**, returning structured JSON validated by Pydantic schemas.
- **Institutional Memory Engine (Hindsight)**: Dedicated Hindsight integration service (`backend/app/services/hindsight.py`) implementing official REST API contracts:
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
- [x] **PHASE 4: AI Proposal Engine (Groq Live Inference)**
  - Configured user's Groq API key, validated account access to 11 models, configured `openai/gpt-oss-120b` as primary model, and verified live JSON completions.
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
  - 11 automated test suites passing with 100% success rate.
  - Next.js production build verified for all 15 routes.

---

## Running Services & Verification Results
- **FastAPI Backend**: Running on `http://0.0.0.0:8000` (PID 94676)
- **Next.js Frontend**: Running on `http://localhost:3000` (PID 93685)
- **Pytest Test Suite**: `11 passed, 0 failed` in 0.64s.
- **Frontend Build**: Statically prerendered 15 routes (`/`, `/analytics`, `/claims`, `/clients`, `/contradictions`, `/lab`, `/memory`, `/outcomes`, `/proposals`, `/proposals/[id]`, `/proposals/upload`, `/review`, `/settings`).
- **Security Audit**: Zero secrets or database files tracked in Git.
