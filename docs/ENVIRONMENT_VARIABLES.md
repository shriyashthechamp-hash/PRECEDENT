# PRECEDENT — Production Environment Variables Audit & Inventory

This document defines the definitive environment variable inventory for PRECEDENT across the Render backend service, PostgreSQL database, and Vercel frontend.

---

## 1. Inventory Matrix

| Variable Name | Service | Visibility | Required in Prod? | Phase Consumed | Example Production Value | Purpose & Notes |
|---|---|---|---|---|---|---|
| `PORT` | Backend (Render) | Private | Injected by Render | Runtime | `10000` | Port on which FastAPI binds. Automatically provided by Render runtime. |
| `ENVIRONMENT` | Backend (Render) | Private | **Yes** | Runtime | `production` | Switches off stack traces, enforces CORS allowlist, hardens error responses. |
| `LOG_LEVEL` | Backend (Render) | Private | Optional | Runtime | `INFO` | Logging verbosity (`INFO`, `WARNING`, `ERROR`). |
| `DATABASE_URL` | Backend (Render) | **Secret** | **Yes** | Runtime | `postgresql://user:pass@host:5432/db` | Connection string to Render Managed PostgreSQL or Persistent Disk SQLite. |
| `GROQ_API_KEY` | Backend (Render) | **Secret** | **Yes** | Runtime | `gsk_********************` | API key for high-speed LLM proposal generation. **Never expose to frontend.** |
| `GROQ_MODEL` | Backend (Render) | Private | Optional | Runtime | `openai/gpt-oss-120b` | Flagship 120B parameter inference model on Groq. |
| `GROQ_FALLBACK_MODEL` | Backend (Render) | Private | Optional | Runtime | `openai/gpt-oss-20b` | Resilient fallback inference model on Groq. |
| `HINDSIGHT_API_URL` | Backend (Render) | Private | Optional | Runtime | `http://localhost:8888` | Base URL for Hindsight biomimetic memory daemon. Defaults to SQLite fallback if offline. |
| `HINDSIGHT_API_KEY` | Backend (Render) | **Secret** | Optional | Runtime | `hs_********************` | Bearer token for authenticated Hindsight instances. |
| `HINDSIGHT_BANK_ID` | Backend (Render) | Private | Optional | Runtime | `precedent-institutional-memory` | Target memory bank identifier in Hindsight. |
| `CORS_ORIGINS` | Backend (Render) | Private | **Yes** | Runtime | `https://precedent-ui.vercel.app` | Comma-separated list of allowed frontend origins. Replaces wildcard in prod. |
| `SECRET_KEY` | Backend (Render) | **Secret** | **Yes** | Runtime | *(Generate 64-char hex)* | Cryptographic salt and session secret. |
| `UPLOAD_DIR` | Backend (Render) | Private | Optional | Runtime | `uploads` | Local upload directory. |
| `DEFAULT_ORGANIZATION_ID` | Backend (Render) | Private | Optional | Runtime | `org_precedent_demo` | Multi-tenant organization scope default. |
| `NEXT_PUBLIC_API_URL` | Frontend (Vercel) | **Public** | **Yes** | Build & Runtime | `https://precedent-api.onrender.com/api` | Full URL to the public Render backend API (including `/api` suffix). |
| `NEXT_PUBLIC_APP_NAME` | Frontend (Vercel) | **Public** | Optional | Build & Runtime | `PRECEDENT` | Application display name. |

---

## 2. Platform Configuration Instructions

### Render Dashboard (Backend Web Service)
In the Render Web Service Settings -> **Environment Variables**:

1. `ENVIRONMENT` = `production`
2. `LOG_LEVEL` = `INFO`
3. `DATABASE_URL` = Link to your Render PostgreSQL database via Render's connection string, OR set `sqlite:////var/data/precedent.db` if using a Persistent Disk.
4. `GROQ_API_KEY` = Your secret Groq API key (starts with `gsk_`).
5. `GROQ_MODEL` = `openai/gpt-oss-120b`
6. `GROQ_FALLBACK_MODEL` = `openai/gpt-oss-20b`
7. `HINDSIGHT_API_URL` = `http://localhost:8888` (or your hosted Hindsight endpoint)
8. `HINDSIGHT_BANK_ID` = `precedent-institutional-memory`
9. `CORS_ORIGINS` = `https://YOUR-APP-NAME.vercel.app` (replace with your actual Vercel domain once deployed)
10. `SECRET_KEY` = Generate a secure random string (e.g., using `openssl rand -hex 32`).

### Vercel Dashboard (Frontend Next.js Project)
In the Vercel Project Settings -> **Environment Variables**:

1. `NEXT_PUBLIC_API_URL` = `https://YOUR-BACKEND.onrender.com/api` (replace with your actual Render service URL, ensuring `/api` is included).
2. `NEXT_PUBLIC_APP_NAME` = `PRECEDENT`

> [!CAUTION]
> **Security Rule:** Never place `GROQ_API_KEY`, `DATABASE_URL`, or `SECRET_KEY` inside `NEXT_PUBLIC_` variables. Variables prefixed with `NEXT_PUBLIC_` are baked directly into client-side JavaScript bundles and are visible to anyone inspecting web traffic in their browser.

