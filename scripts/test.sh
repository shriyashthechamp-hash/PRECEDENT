#!/usr/bin/env bash
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." && pwd )"

echo "=========================================================="
echo "  Running PRECEDENT Verification Test Suite"
echo "=========================================================="

echo "[1/2] Running Backend Pytest Suite..."
cd "$DIR/backend"
PYTHONPATH=. .venv/bin/pytest tests/ -v

echo "[2/2] Running Frontend Build Validation..."
cd "$DIR/frontend"
rm -rf .next
pnpm build

echo "=========================================================="
echo "  All PRECEDENT automated tests and builds PASSED!"
echo "=========================================================="

