# PRECEDENT
> **Your organization's memory. Your next unfair advantage.**
> *Every bid builds a better next bid.*

PRECEDENT is an enterprise-grade AI-native institutional intelligence platform designed for organizations that routinely respond to enterprise RFPs, security questionnaires, and high-stakes vendor assessments.

Unlike traditional proposal tools that merely store static past answers, PRECEDENT records **why** answers were revised, detects historical contradictions before submission, retains verified institutional memory using **Hindsight**, and systematically compounds past experience into higher win rates.

---

## Key Features

- **RFP Parsing & Workspace**: Automatic sectioning and line-item requirement extraction from PDF and DOCX tenders.
- **AI Proposal Generation (Groq)**: Evidence-grounded response generation with confidence indicators, precedent citations, and missing evidence warnings.
- **Review & Learning Engine**: Captures human-in-the-loop edits with structured rationales, preserving complete audit trails.
- **Hindsight Institutional Memory**: Real `retain`, `recall`, and `reflect` multi-bank memory integration with client and sector isolation.
- **Contradiction Intelligence & Claim Ledger**: Deterministic and semantic detection of conflicts between new draft claims and historically approved commitments (support hours, SLAs, retention periods, certifications).
- **Memory ON vs Memory OFF A/B Laboratory**: Live side-by-side comparison demonstrating measurable reviewer edit reduction and precedent accuracy.
- **Bid Outcome Intelligence**: Binds win/loss feedback directly into organizational reflection.
- **Enterprise Dark Interface**: Linear/Palantir-inspired aesthetic engineered for high-density, mission-critical workflow efficiency.

---

## Architecture

- **Frontend**: Next.js 14+ (App Router), React, TypeScript, Tailwind CSS, Lucide Icons.
- **Backend**: Python 3.11+ FastAPI asynchronous API, Pydantic v2 data models.
- **Database**: Relational SQLite / PostgreSQL with SQLAlchemy ORM, indexed claim ledger, foreign keys, and audit logs.
- **AI Models**: Groq API (`llama-3.3-70b-versatile` / `llama-3.1-8b-instant`) with deterministic schema validation and resilient fallbacks.
- **Memory Engine**: Hindsight REST API (`POST /memories`, `POST /memories/recall`, `POST /reflect`) with embedded local fallback.

---

## Quickstart

### 1. Environment Setup
```bash
cp .env.example .env
# Edit .env to set GROQ_API_KEY and HINDSIGHT_API_URL (optional)
```

### 2. Backend Installation & Startup
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 3. Frontend Installation & Startup
```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000` to access PRECEDENT.
