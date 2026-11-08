# PRECEDENT — Production Deployment Guide

This guide provides end-to-end instructions for deploying **PRECEDENT** to production using **Render** (FastAPI backend + Managed PostgreSQL) and **Vercel** (Next.js frontend).

---

## 1. Overview of Architecture

| Tier | Platform | Component | Configuration Source |
| :--- | :--- | :--- | :--- |
| **Frontend** | Vercel | Next.js 15 (App Router, React 19) | `frontend/vercel.json`, `frontend/next.config.mjs` |
| **Backend** | Render | Python / FastAPI (Uvicorn) | `render.yaml`, `backend/requirements.txt` |
| **Database** | Render | Managed PostgreSQL 16 (or Persistent Disk) | `render.yaml` or Render Dashboard |
| **AI Inference** | Groq Cloud | `openai/gpt-oss-120b` (or `llama-3.3-70b-versatile`) | Environment Variable `GROQ_API_KEY` |
| **Memory Engine** | Hindsight | Cloud Daemon or Embedded SQLite Fallback | Auto-detecting dual-path engine |

---

## 2. Pre-Deployment Checklist

Before proceeding, ensure you have:
- [x] Access to the GitHub repository: `https://github.com/shriyashthechamp-hash/PRECEDENT.git`
- [x] A valid [Groq Cloud API Key](https://console.groq.com/keys)
- [x] A [Render](https://render.com) account
- [x] A [Vercel](https://vercel.com) account

---

## 3. Option A: Render Blueprint Deployment (Recommended)

Render Blueprints automatically provision the database and web service simultaneously using [`render.yaml`](../render.yaml).

### Step 1: Create Blueprint Instance on Render
1. Navigate to the **[Render Dashboard](https://dashboard.render.com/)**.
2. Click **New +** in the top navigation bar and select **Blueprint**.
3. Connect your GitHub repository: `shriyashthechamp-hash/PRECEDENT`.
4. Render will parse `render.yaml` and display two resources:
   - **`precedent-db`**: PostgreSQL Database (Free tier).
   - **`precedent-api`**: Web Service (Python 3, Free tier).
5. Click **Apply**.

### Step 2: Configure Backend Environment Variables
Under the newly created `precedent-api` Web Service:
1. Navigate to **Environment**.
2. Add your secret Groq API key:
   - Key: `GROQ_API_KEY`
   - Value: `gsk_...` (your real Groq API key)
3. Note the public URL assigned to your backend (e.g., `https://precedent-api.onrender.com`).
4. Set `CORS_ORIGINS` to `*` temporarily or set it after provisioning Vercel in Section 5.
5. Click **Save Changes** (triggers an automated redeploy).

---

## 4. Option B: Render Manual Web Service + Database Deployment

If you prefer provisioning services manually:

### Step 1: Provision Render PostgreSQL
1. On the Render Dashboard, click **New +** → **PostgreSQL**.
2. Set Name: `precedent-db`.
3. Set Database: `precedent`.
4. Set User: `precedent_user`.
5. Select Region (e.g., `Frankfurt` or `Ohio`).
6. Select Plan: **Free**.
7. Click **Create Database**.
8. Once provisioned, copy the **Internal Database URL** (e.g., `postgres://precedent_user:...@dpg-...-a/precedent`).

### Step 2: Provision Render Web Service
1. On the Render Dashboard, click **New +** → **Web Service**.
2. Connect the repository: `shriyashthechamp-hash/PRECEDENT`.
3. Configure settings:
   - **Name:** `precedent-api`
   - **Region:** Same region as your database
   - **Branch:** `main`
   - **Root Directory:** `backend`
   - **Runtime:** `Python 3`
   - **Build Command:** `pip install --upgrade pip && pip install -r requirements.txt`
   - **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Plan:** Free
4. Click **Advanced** → **Add Environment Variable**:

| Variable Name | Value | Description |
| :--- | :--- | :--- |
| `PYTHON_VERSION` | `3.12.8` | Pinned stable LTS Python runtime |
| `ENVIRONMENT` | `production` | Enables production security & redacts traces |
| `DATABASE_URL` | *Paste Internal Database URL* | Connects backend to Render PostgreSQL |
| `GROQ_API_KEY` | `gsk_...` | Groq inference key |
| `GROQ_MODEL` | `openai/gpt-oss-120b` | Configured LLM model |
| `CORS_ORIGINS` | `https://your-frontend.vercel.app` | Allow Vercel domain (update after Vercel step) |

5. Click **Create Web Service**.

---

## 5. Vercel Frontend Deployment

### Step 1: Import Project into Vercel
1. Navigate to the **[Vercel Dashboard](https://vercel.com/dashboard)**.
2. Click **Add New...** → **Project**.
3. Import the `PRECEDENT` GitHub repository.
4. In the **Configure Project** screen:
   - **Project Name:** `precedent` (or `precedent-app`)
   - **Framework Preset:** `Next.js` (auto-detected)
   - **Root Directory:** Click **Edit** and select `frontend`.
5. Expand **Build and Output Settings**:
   - Build Command: `pnpm build` (auto-detected via pnpm lockfile)
   - Output Directory: `.next` (auto-detected)
   - Install Command: `pnpm install` (auto-detected)

### Step 2: Configure Environment Variables
Under **Environment Variables**, add:

| Key | Value | Notes |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | `https://precedent-api.onrender.com/api` | **Must include `/api` suffix** and point to your live Render backend URL |

6. Click **Deploy**.
7. Vercel will build and deploy the Next.js frontend, providing a production domain (e.g., `https://precedent.vercel.app`).

---

## 6. Closing the Loop: Syncing CORS on Render

Once Vercel assigns your production URL:
1. Return to the **Render Dashboard** → `precedent-api` → **Environment**.
2. Update `CORS_ORIGINS`:
   ```env
   CORS_ORIGINS=https://precedent.vercel.app,https://precedent-shriyashthechamp-hash.vercel.app
   ```
3. Click **Save Changes**. Render will automatically restart the service with strict CORS protection.

---

## 7. Post-Deployment Verification Runbook

Run these terminal checks against your deployed URLs:

### 1. Backend Liveness & Readiness
```bash
# Check basic health and database connectivity
curl -s -w "\nHTTP: %{http_code}\n" https://<YOUR-RENDER-URL>.onrender.com/api/health

# Check readiness probe
curl -s -w "\nHTTP: %{http_code}\n" https://<YOUR-RENDER-URL>.onrender.com/ready
```
*Expected response:* HTTP 200 with JSON payload `{"status":"healthy","database":"connected",...}`.

### 2. Verify CORS Headers
```bash
curl -I -X OPTIONS https://<YOUR-RENDER-URL>.onrender.com/api/health \
  -H "Origin: https://<YOUR-VERCEL-URL>.vercel.app" \
  -H "Access-Control-Request-Method: GET"
```
*Expected response:* HTTP 200/204 with `access-control-allow-origin: https://<YOUR-VERCEL-URL>.vercel.app`.

### 3. Verify Memory Engine Status
```bash
curl -s https://<YOUR-RENDER-URL>.onrender.com/api/memory/status | jq .
```
*Expected response:* Details whether operating in `REMOTE_DAEMON` or `EMBEDDED_SQLITE` mode.

### 4. End-to-End User Verification in Browser
1. Open `https://<YOUR-VERCEL-URL>.vercel.app` in your browser.
2. Verify dashboard loads with real metrics (or clean empty states).
3. Navigate to **New Proposal**:
   - Upload sample RFP text or document.
   - Run generation with Memory ON vs Memory OFF.
   - Observe live precedent retrieval and Groq streaming output.
4. Navigate to **Reviewer Workspace**:
   - Submit an edit/correction.
   - Confirm Retain operation captures precedent and updates analytics.

---

## 8. Troubleshooting & Common Issues

| Symptom | Root Cause | Fix |
| :--- | :--- | :--- |
| **Vercel API calls return 404** | `NEXT_PUBLIC_API_URL` missing `/api` suffix | In Vercel env settings, change `https://...onrender.com` to `https://...onrender.com/api`. Redeploy. |
| **CORS errors in browser console** | `CORS_ORIGINS` on Render does not match Vercel URL | In Render env settings, update `CORS_ORIGINS` with exact Vercel origin. Save and restart. |
| **Render cold start delay (50s)** | Render Free Tier spins down inactive instances | The frontend displays a persistent connecting indicator. Service responds normally once warm. |
| **SQLAlchemy connection error** | Render URL starts with `postgres://` | Backend automatically rewrites `postgres://` to `postgresql://` in `database.py`. Ensure `psycopg2-binary` is installed. |

