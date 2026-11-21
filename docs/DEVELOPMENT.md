# PRECEDENT — Developer Setup Guide

This guide covers everything needed to run PRECEDENT locally, run the tests, and troubleshoot common
setup issues. Every command below was verified against this repository.

---

## 1. Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| Python | **3.12.8 recommended** | Pinned in `.python-version`. Newer 3.x normally works; the pinned version is what deployment uses. |
| Node.js | **20+** (22 tested) | Required for the Next.js frontend. |
| npm | bundled with Node | The frontend also ships a `pnpm-lock.yaml`, so `pnpm` is supported. |
| pnpm | 9+ (optional) | Only needed by `scripts/start.sh`; `npm` works for everything else. |
| Git | any recent | To clone the repository. |

External services are **optional**:

- **Groq API key** — enables live inference. Without it the deterministic fallback engine is used.
- **Hindsight daemon** — enables live external memory. Without it the SQLite fallback is used.

---

## 2. Clone and configure

```bash
git clone <your-repository-url> PRECEDENT
cd PRECEDENT

# Create your local environment file from the template
cp .env.example .env
```

The backend searches for `.env` in the repository root, then `backend/`, then the current directory.
`.env` is git-ignored and must never be committed. See the
[environment variables](ENVIRONMENT_VARIABLES.md) reference and
[section 5](#5-environment-setup) below.

---

## 3. Backend installation

```bash
cd backend
python3.12 -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install --upgrade pip
pip install -r requirements.txt
```

`backend/requirements.txt` installs FastAPI, Uvicorn, Pydantic v2, SQLAlchemy 2, httpx,
python-multipart, pypdf, python-docx, the Groq SDK, pytest, and psycopg2-binary.

---

## 4. Frontend installation

```bash
cd frontend
npm install          # or: pnpm install
```

---

## 5. Environment setup

All variables are optional for local development, but these are the ones you may want to set in
`.env`:

```env
# Live AI inference (optional — deterministic engine is used without it)
GROQ_API_KEY=
GROQ_MODEL=openai/gpt-oss-120b
GROQ_FALLBACK_MODEL=openai/gpt-oss-20b

# External Hindsight daemon (optional — SQLite fallback is used without it)
HINDSIGHT_API_URL=http://localhost:8888
HINDSIGHT_API_KEY=
HINDSIGHT_BANK_ID=precedent-institutional-memory

# Database (defaults to SQLite in the backend working directory)
DATABASE_URL=sqlite:///./precedent.db

# Frontend → backend URL for standalone local dev
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

> Keep real secrets out of `.env.example`, out of Git, and out of any `NEXT_PUBLIC_*` variable.

---

## 6. Frontend startup

```bash
cd frontend
npm run dev
```

- Runs on `http://localhost:3000` (`next dev -p 3000`).

For a production-style run:

```bash
npm run build
npm start
```

## 7. Backend startup

```bash
cd backend
source .venv/bin/activate
PYTHONPATH=. uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

- API root: `http://localhost:8000`
- Interactive docs (Swagger UI): `http://localhost:8000/docs`
- Alternative docs (ReDoc): `http://localhost:8000/redoc`
- Health: `http://localhost:8000/api/health`

On first startup the app creates all database tables and auto-seeds a synthetic dataset.

> `PYTHONPATH=.` (or running from the `backend/` directory) is required so the `app` package
> resolves. `backend/main.py` exposes the same ASGI `app` for platforms that expect it at the repo
> root of the service.

---

## 8. Local development

### Run both services together

```bash
./scripts/start.sh
```

This script starts the FastAPI backend (`backend/.venv`) and the Next.js frontend (`pnpm start`) and
prints both URLs. It assumes `backend/.venv` already exists and that `pnpm` is installed. If you use
`npm` or a differently named virtual environment, start the two services manually (sections 6 and 7).

### Backend reload

`uvicorn ... --reload` watches `backend/app` and restarts on code changes.

### Common development tasks

```bash
# Inspect the API
curl http://localhost:8000/api/health
curl http://localhost:8000/api/proposals

# Re-seed the synthetic dataset
curl -X POST "http://localhost:8000/api/seed?force=true"

# Run the automated institutional-learning cycle
curl -X POST http://localhost:8000/api/demo/run-learning-cycle
```

---

## 9. API documentation access

FastAPI generates interactive documentation automatically:

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`
- OpenAPI schema: `http://localhost:8000/openapi.json`

---

## 10. Test execution

### Full verification suite (recommended)

```bash
./scripts/test.sh
```

This runs, in order:

1. Backend pytest suite (`cd backend && PYTHONPATH=. .venv/bin/pytest tests/ -v`).
2. Frontend regression tests (`cd frontend && node --test tests/*.test.mjs`).
3. Frontend TypeScript check (`npx tsc --noEmit`).
4. Frontend production build (`pnpm build`, falling back to `npm run build`).

### Backend tests only

```bash
cd backend
PYTHONPATH=. .venv/bin/pytest tests/ -v
```

Verified result on a clean checkout: **39 passed, 1 skipped** (the skipped test is the optional live
Hindsight daemon connectivity check, which skips cleanly when no daemon is running). 40 test cases
are collected in total.

### Frontend tests only

```bash
cd frontend
npm test                 # equivalent to: node --test tests/*.test.mjs
```

Verified result: **24 passed, 0 failed** across four suites (API client, upload validation, review
workflow, routes and navigation).

### Type checking and build

```bash
cd frontend
npx tsc --noEmit   # exit code 0
npm run build      # compiles 17 routes
```

See [`TESTING.md`](TESTING.md) for the full test matrix and mocking strategy.

---

## 11. Troubleshooting

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| `ModuleNotFoundError: No module named 'app'` | Running Uvicorn from the wrong directory | Run from `backend/` or prefix with `PYTHONPATH=.` |
| `ImportError` for a dependency | Virtual environment not activated or deps not installed | `source backend/.venv/bin/activate && pip install -r backend/requirements.txt` |
| `Address already in use` on port 8000/3000 | Another process holds the port | Stop it or start with another port: `uvicorn ... --port 8001` / `npm run dev -- -p 3001` |
| Frontend shows "Unable to reach PRECEDENT API" | Backend not running, or wrong `NEXT_PUBLIC_API_URL` | Start the backend; ensure `NEXT_PUBLIC_API_URL=http://localhost:8000/api` for standalone dev |
| CORS errors in the browser console | Backend `CORS_ORIGINS` does not include the frontend origin | Add `http://localhost:3000` to `CORS_ORIGINS` and restart the backend |
| `health.hindsight_memory.status` is `FALLBACK` | No Hindsight daemon at `HINDSIGHT_API_URL` | Expected by default; memory still persists in SQLite. Point `HINDSIGHT_API_URL` at a live daemon to connect |
| `groq_inference.status` is `unconfigured_using_deterministic_engine` | No `GROQ_API_KEY` set | Set `GROQ_API_KEY` in `.env` for live inference, or continue with the deterministic engine |
| `scripts/start.sh` fails with command not found for `pnpm` | pnpm not installed | `npm install -g pnpm`, or start both services manually |
| SQLite `database is locked` | Multiple writer processes | Run a single Uvicorn worker locally, or migrate to PostgreSQL via `DATABASE_URL` |
| A test asserting live Groq/Hindsight state fails | No secrets in the test environment | The suite is written to accept `unconfigured`/`FALLBACK` states; ensure you are on the latest commit |

---

## 12. Project conventions

- **Backend changes:** add models to `backend/app/models/`, schemas to `backend/app/schemas/`, and
  endpoints to `backend/app/routers/`. Register new routers in `backend/app/main.py`.
- **Frontend changes:** add API calls to `frontend/src/lib/api.ts` and pages under
  `frontend/src/app/`.
- **Never commit** `.env`, `*.db`, `node_modules/`, `.venv/`, or build output — all are covered by
  `.gitignore`.
