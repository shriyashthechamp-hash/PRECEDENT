#!/usr/bin/env bash
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." && pwd )"

echo "=========================================================="
echo "  Running PRECEDENT Verification Test Suite"
echo "=========================================================="

echo "[1/4] Running Backend Pytest Suite (40 Test Cases)..."
cd "$DIR/backend"
PYTHONPATH=. .venv/bin/pytest tests/ -v

echo "[2/4] Running Frontend Workflow Regression Tests (24 Test Cases)..."
cd "$DIR/frontend"
node --test tests/*.test.mjs

echo "[3/4] Running Frontend TypeScript Verification..."
cd "$DIR/frontend"
npx tsc --noEmit

echo "[4/4] Running Frontend Production Build Validation..."
cd "$DIR/frontend"
rm -rf .next
if command -v pnpm &> /dev/null; then
  pnpm build
else
  npm run build
fi

echo "=========================================================="
echo "  All PRECEDENT automated tests and builds PASSED!"
echo "=========================================================="

