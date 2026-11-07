#!/usr/bin/env bash
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." && pwd )"
cd "$DIR"

echo "=========================================================="
echo "  Starting PRECEDENT — Institutional Intelligence Platform"
echo "=========================================================="

# 1. Start Python FastAPI backend on port 8000
echo "[1/2] Starting FastAPI Backend on http://0.0.0.0:8000..."
cd "$DIR/backend"
PYTHONPATH=. .venv/bin/python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

# Trap signals to gracefully kill backend when script terminates
trap "kill $BACKEND_PID 2>/dev/null || true; exit" SIGINT SIGTERM EXIT

# 2. Start Next.js frontend on port 3000
echo "[2/2] Starting Next.js Frontend on http://localhost:3000..."
cd "$DIR/frontend"
pnpm start &
FRONTEND_PID=$!

echo "=========================================================="
echo "  PRECEDENT is running:"
echo "  → Frontend: http://localhost:3000"
echo "  → Backend API: http://localhost:8000"
echo "  → API Documentation: http://localhost:8000/docs"
echo "=========================================================="

wait $FRONTEND_PID

