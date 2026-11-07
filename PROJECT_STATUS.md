# PRECEDENT — Project Status

## Current Architecture
- **Frontend**: Next.js 14+ / React 18+ / TypeScript / Tailwind CSS / Lucide Icons / Enterprise Design System inspired by Linear/Palantir.
- **Backend**: Python 3.15+ FastAPI asynchronous service with Pydantic validation, structured AI generation schemas, deterministic contradiction reasoning, and provenance logging.
- **Database**: Relational SQLite / PostgreSQL via SQLAlchemy with transactional integrity, foreign key constraints, indexes, and full audit logs.
- **AI Inference Engine**: Groq API integration (`llama-3.3-70b-versatile` / `llama-3.1-8b-instant`) with structured Pydantic schema enforcement, latency tracking, and deterministic fallback.
- **Memory Engine**: Hindsight integration (`retain`, `recall`, `reflect`) with multi-bank scoping, temporal tracking, metadata isolation, and provenance explorer.
- **Collaboration**: Band AI Desktop multi-agent role architecture (Product Architect, Frontend, Backend, AI/Memory, QA/Security).

## Completed Phases
- [x] **PHASE 0: Repository Audit & Planning**
  - Audited local system environment: Node v25.8, pnpm v11.2, Python 3.15, pip 26.2, Band CLI found at `/Applications/Band.app/Contents/MacOS/band`.
  - Identified Hindsight REST API endpoints (`/v1/default/banks/{bank_id}/memories`, `/recall`, `/reflect`).
  - Created initial Git repository, `.gitignore`, `.env.example`, and architectural documentation.

## Current Phase
- [ ] **PHASE 1: Foundation Setup & Service Boundaries**

## Running Services
- None currently (preparing service setups).

## Environment Requirements
- Python 3.11+
- Node.js 18+ / pnpm / npm
- Optional: Running Hindsight server (port 8888) or fallback local client
- Optional: `GROQ_API_KEY` for live LLM inference (with deterministic verified engine fallback)

## Known Issues
- Sandboxed environment requires explicit bypass approval for external pip/npm network downloads.
- Docker daemon is inactive locally, so SQLite relational persistence and standalone Hindsight API/mock service are used for zero-dependency reliability.

## Next Actions
1. Scaffold Python FastAPI backend (`backend/`) with models, schemas, database, and routers.
2. Scaffold Next.js frontend (`frontend/`) with Tailwind CSS, design tokens, and components.
3. Implement Hindsight integration client with bank isolation and scoped queries.
4. Implement Groq proposal generation engine with structured schema validation.
5. Implement Contradiction Ledger & Claim verification engine.
