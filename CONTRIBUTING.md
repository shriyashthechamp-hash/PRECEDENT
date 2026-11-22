# Contributing to PRECEDENT

Thanks for your interest in contributing. This document describes how to set up the project, the
conventions used in this repository, and how to get a change merged.

## Getting started

Follow [`docs/DEVELOPMENT.md`](docs/DEVELOPMENT.md) to install dependencies and run the backend and
frontend locally. External services (Groq, Hindsight) are optional; the app runs without them using
its deterministic engine and persistent SQLite memory.

## Before you start

- Work on a branch, never directly on `main`.
- Use a descriptive branch name, for example `chore/code-quality-and-tests` or `fix/rfp-413-status`.
- Do not force-push shared branches.

## Running the checks

Run these before opening a pull request. CI runs the same steps (see
[`.github/workflows/ci.yml`](.github/workflows/ci.yml)).

```bash
# Backend
cd backend
PYTHONPATH=. .venv/bin/pytest tests/ -v

# Frontend
cd frontend
node --test tests/*.test.mjs
npx tsc --noEmit
npm run build
```

## Commit conventions

Commit subjects follow `type(scope): short action`:

- lowercase after the colon, imperative mood ("add", "fix", "cover"),
- at most 50 characters,
- one logical change per commit.

Common types: `feat`, `fix`, `test`, `docs`, `refactor`, `chore`, `ci`.

Examples:

- `test(api): cover 413 on large uploads`
- `docs(api): add endpoint reference`
- `refactor(backend): type hints for db module`

## Tests

- Do not weaken or rewrite existing tests to make a change pass.
- Prefer adding new tests that assert current behaviour over inventing behaviour.
- Keep unit tests free of network calls; the suite is designed to pass offline.

## Code style

- Python: 4-space indentation, type hints where practical, module and function docstrings for new
  code.
- TypeScript/React: 2-space indentation, double quotes, semicolons. Prettier and EditorConfig
  configuration are provided; do not reformat unrelated files in your change.

## Security

- Never commit secrets, real API keys, tokens, or `.env` files. `.env` is git-ignored.
- Never place secrets in `NEXT_PUBLIC_*` variables; those are embedded in the client bundle.
- Do not commit databases (`*.db`), uploaded files, or build output.

## Pull requests

1. Push your branch and open a pull request against `main`.
2. Describe what changed and why, and note any behaviour that is intentionally unchanged.
3. Ensure the CI checks pass.
4. Keep the diff focused on the stated change.
