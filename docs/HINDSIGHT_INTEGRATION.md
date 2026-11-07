# Hindsight Memory Integration Specification (Phase 2 Audited)

## 1. Overview
Hindsight (`vectorize-io/hindsight`) is the persistent, biomimetic agent-memory system powering PRECEDENT's institutional retention.

Unlike standard RAG vector stores that perform naive chunk similarity searches, Hindsight:
1. Processes incoming facts at write time (mapping entities, temporal bounds, and relationships).
2. Retrieves context using parallel multi-strategy search (BM25 keyword overlap, tag matching, sector bonus, and strict client scoping).
3. Provides an LLM-driven synthesis layer via `reflect` to synthesize strategic policies and mental models from accumulated memories.

---

## 2. Connection State Architecture

PRECEDENT accurately exposes the connection state via `/api/health` and `/api/memory/explorer`:

| State | Mode | Description |
|-------|------|-------------|
| **CONNECTED** | `LIVE_EXTERNAL` | External Hindsight daemon reachable at `HINDSIGHT_API_URL/health` (HTTP 200). Requests proxy live to the external daemon. |
| **FALLBACK** | `EMBEDDED_SQLITE_PERSISTENT` | External daemon unreachable. Operates zero-downtime fallback backed by durable SQLite `memory_bank_records` table. Survives process restarts. |
| **DISCONNECTED** | `OFFLINE` | Critical failure accessing both external daemon and persistent SQLite storage. |

> **Audit Guarantee**: Local database fallback is explicitly disclosed as `FALLBACK` mode and never misrepresented as a live external connection.

---

## 3. Persistent Data Model (`MemoryBankRecord`)

All retained memories are stored in the relational database to ensure 100% persistence across backend process restarts and multi-worker deployments:

```sql
CREATE TABLE memory_bank_records (
    id VARCHAR(64) PRIMARY KEY,
    bank_id VARCHAR(64) NOT NULL INDEX,
    content TEXT NOT NULL,
    context VARCHAR(128) DEFAULT 'reviewer_correction',
    fact_type VARCHAR(32) DEFAULT 'experience',
    source_proposal_id VARCHAR(64) INDEX,
    source_review_id VARCHAR(64) INDEX,
    question_id VARCHAR(64),
    client_id VARCHAR(64) INDEX,
    sector_id VARCHAR(64) INDEX,
    scope VARCHAR(32) DEFAULT 'global',
    approved_by VARCHAR(128) DEFAULT 'Staff Proposal Reviewer',
    approval_status VARCHAR(32) DEFAULT 'APPROVED',
    reviewer_rationale TEXT,
    tags JSON,
    entities JSON,
    metadata_json JSON,
    relevance_score FLOAT DEFAULT 1.0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

---

## 4. API Contract & Endpoints

### A. Retain (Writing Memories)
- **Path**: `POST /v1/default/banks/{bank_id}/memories`
- **Internal API**: `POST /api/memory/retain`
- **Payload**:
  ```json
  {
    "content": "Our standard enterprise support is available 24/5 with 24/7 emergency escalation for P1 incidents.",
    "context": "reviewer_correction",
    "metadata": {
      "org_id": "org_precedent_demo",
      "proposal_id": "prop_mercy_01",
      "topic": "support_coverage",
      "approved_by": "Sarah Jenkins (VP Customer Operations)",
      "scope": "global",
      "rationale": "Standard customer operations policy: 24/5 core, with 24/7 escalation strictly restricted to P1 outages to protect engineering on-call sustainability."
    },
    "tags": ["support", "sla", "approved_correction"]
  }
  ```

### B. Recall (Multi-Strategy Retrieval with Strict Isolation)
- **Path**: `POST /v1/default/banks/{bank_id}/memories/recall`
- **Internal API**: `POST /api/memory/recall`
- **Payload**:
  ```json
  {
    "query": "What is our enterprise support coverage and response time SLA?",
    "limit": 5,
    "tags": ["support", "sla"],
    "tags_match": "any",
    "client_id": "cli_vertex_bio",
    "sector_id": "sec_healthcare"
  }
  ```
- **Returns**: Prioritized memories with relevance scoring, entity associations, context, reviewer rationales, and timestamps.
- **Client Isolation**: If a memory record has `client_id` or `scope == 'client'`, it is strictly quarantined and excluded from queries unless `request.client_id` matches.

### C. Reflect (Synthesizing Institutional Insights)
- **Path**: `POST /v1/default/banks/{bank_id}/reflect`
- **Internal API**: `POST /api/memory/reflect`
- **Payload**:
  ```json
  {
    "query": "What patterns and common reviewer corrections have occurred across our security and SLA proposals?",
    "max_tokens": 500,
    "include_facts": true
  }
  ```
- **Execution**: Synthesizes accumulated memories using Groq inference (`openai/gpt-oss-120b`) to extract:
  - Recurring human reviewer corrections.
  - Policy hardening patterns.
  - Strategic recommendations for upcoming bids.

---

## 5. Verification Test Evidence

All Hindsight capabilities have been empirically tested and verified in the automated test suite:

1. `tests/test_persistence_restart.py`: Retains memory in Service Instance #1, destroys instance, launches fresh Service Instance #2, recalls memory, and asserts complete retention across restart.
2. `tests/test_core.py::test_hindsight_client_isolation`: Proves client-specific concessions never leak into cross-client proposals.
3. `tests/test_learning_demonstration.py`: Proves end-to-end institutional learning cycle across Proposal A and Proposal B.
