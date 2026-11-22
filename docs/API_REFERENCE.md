# PRECEDENT — API Reference

Base URL: `/api` for all application routes (the backend also serves `/` and `/ready`).
Interactive docs are available at `/docs` (Swagger UI) and `/redoc`. Error responses use FastAPI's
`{"detail": ...}` shape; validation failures return HTTP `422`.

Unless noted, requests and responses are JSON. The route source lives in `backend/app/routers/`.

---

## Service

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/` | Product metadata and links. |
| `GET` | `/ready`, `/api/ready` | Readiness probe. Returns `{status, product, version}`. |

## Health

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/health` | Reports database status, memory mode (`CONNECTED`/`FALLBACK`), and Groq status. |

**Response shape**
```json
{
  "status": "operational",
  "product": "PRECEDENT",
  "version": "1.0.0",
  "database": { "status": "connected", "engine": "sqlite" },
  "hindsight_memory": { "status": "...", "mode": "..." },
  "groq_inference": { "status": "...", "primary_model": "...", "fallback_model": "..." },
  "environment": "development",
  "synthetic_demo_mode": true
}
```

## Proposals

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/proposals` | List proposals. Optional query: `status`, `client_id`, `sector_id`. |
| `POST` | `/api/proposals` | Create a draft proposal. Body: `ProposalCreate`. |
| `GET` | `/api/proposals/{proposal_id}` | Full workspace: questions, responses, review events. `404` if missing. |
| `POST` | `/api/proposals/generate-response` | Generate a draft answer. Body: `GenerateAnswerRequest`. |
| `POST` | `/api/proposals/{proposal_id}/submit` | Submit the proposal. `400` if open `HIGH` contradictions exist. |

**`ProposalCreate`**: `title` (required), `rfp_reference?`, `client_id?`, `sector_id?`, `deadline?`.

**`GenerateAnswerRequest`**: `proposal_id`, `question_id`, `generation_mode` (`"MEMORY_ON"` default,
or `"MEMORY_OFF"`), `temperature` (default `0.2`).

**Generate response returns**: `{ response: {...}, contradictions_detected, contradiction_alerts: [...] }`.

## RFP ingestion

| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/api/rfp/ingest` | Upload and parse an RFP document. |

**Request**: `multipart/form-data` — `file` (`.pdf`, `.docx`, `.doc`, or `.txt`) plus optional
`title`, `rfp_reference`, `client_id`, `sector_id`. Max size 25 MB.

**Errors**: `400` unsupported format or empty/unparseable file; `413` file exceeds 25 MB.

**Response**: `{ status, proposal_id, title, total_questions, detected_deadline, sample_questions }`.

## Review and learning

| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/api/review/correct` | Record a reviewer correction; promotes the claim and optionally retains it in memory. |
| `POST` | `/api/review/accept/{response_id}` | Accept a response unchanged. `404` if missing. |

**`ReviewCorrectionCreate`**: `response_id`, `question_id`, `proposal_id`, `original_answer`,
`corrected_answer`, `correction_reason` (required), `category_tag`, `reviewer_name` (default
`"Domain Lead"`), `retain_in_hindsight` (default `true`).

**Response**: `ReviewCorrectionOut` — the created review event, including `status`,
`is_retained_in_hindsight`, and `hindsight_memory_id`.

## Institutional memory

| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/api/memory/retain` | Retain a memory. Body: `HindsightRetainRequest`. |
| `POST` | `/api/memory/recall` | Recall memories. Body: `HindsightRecallRequest`. |
| `POST` | `/api/memory/reflect` | Synthesise a reflection. Body: `HindsightReflectRequest`. |
| `GET` | `/api/memory/explorer` | Provenance feed of review events plus bank memories. Optional query: `topic`, `client_id`, `sector_id`. |

**`HindsightRetainRequest`**: `content` (required), `context` (default `"reviewer_correction"`),
`metadata` (object), `tags` (array), `async_mode` (bool), `bank_id?`.

**`HindsightRecallRequest`**: `query` (required), `limit` (default `5`), `fact_types?`, `tags?`,
`tags_match` (default `"any"`), `client_id?`, `sector_id?`.

**`HindsightReflectRequest`**: `query` (required), `max_tokens` (default `600`), `include_facts`,
`sector_id?`.

## Contradictions

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/contradictions` | List alerts. Optional query: `status`, `proposal_id`. |
| `GET` | `/api/contradictions/audit-trail` | Permanent resolution log. Optional query: `proposal_id`. |
| `POST` | `/api/contradictions/{alert_id}/resolve` | Resolve an alert. `404` if missing. |

**`ResolveContradictionRequest`**: `resolution_type` (`"ENFORCE_OLD"`, `"OVERRIDE_NEW"`,
`"DISMISS"`), `reason?`, `resolved_by` (default `"Lead Reviewer"`). `ENFORCE_OLD` rewrites the latest
response to the approved precedent.

## Claim ledger

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/claims` | List claims. Optional query: `scope`, `subject`, `is_active` (default `true`). |
| `POST` | `/api/claims` | Create a human-approved claim. Body: `ClaimItemCreate`. |
| `POST` | `/api/claims/{claim_id}/deactivate` | Deactivate a claim. `404` if missing. |

**`ClaimItemCreate`**: `subject`, `predicate`, `value` (all required), `scope` (default `"global"`),
`scope_target?`, `confidence` (default `1.0`), `source_proposal_id?`, `source_review_id?`,
`approved_by` (default `"Principal Architect"`).

## Bid outcomes

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/outcomes` | List bid outcomes (newest first). |
| `POST` | `/api/outcomes` | Record or update an outcome; retains evaluator feedback when provided. `404` if the proposal is unknown. |

**`BidOutcomeCreate`**: `proposal_id` (required), `outcome` (default `"WON"`), `contract_value?`,
`evaluator_feedback?`, `primary_reason` (default `"Technical Capability"`), `strengths_noted?`,
`weaknesses_noted?`, `recorded_by` (default `"Commercial Director"`).

## Memory ON vs OFF comparison

| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/api/comparison/execute` | Run the same question with and without memory. Body: `{proposal_id, question_id}`. |

**Response** (`ComparisonResponse`): `question_id`, `question_text`, `category`, `variant_off`,
`variant_on`, and `delta_metrics` (measured values such as recalled precedent count, contradiction
delta, text similarity ratio, recall latency, and a descriptive `empirical_finding`).

## Analytics

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/analytics/summary` | Audited KPIs with `query_auditing` and `metric_provenance`. |

## Clients, sectors and company

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/clients` | List clients. |
| `GET` | `/api/sectors` | List sectors. |
| `GET` | `/api/company-profile` | Return the company profile and approved facts. |
| `POST` | `/api/seed` | Seed synthetic demo data. Optional query: `force` (default `false`). |

## Institutional learning demonstration

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/demo/scenario-status` | Demo readiness and existing support precedents. |
| `POST` | `/api/demo/run-learning-cycle` | Execute the 9-step retain → recall → reuse cycle and return a timeline. |
