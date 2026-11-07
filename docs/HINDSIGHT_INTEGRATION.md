# Hindsight Memory Integration Specification

## 1. Overview
Hindsight (`vectorize-io/hindsight`) is the persistent, biomimetic agent-memory system powering PRECEDENT's institutional retention.

Unlike standard RAG vector stores that perform naive chunk similarity searches, Hindsight processes incoming facts at write time (mapping entities, temporal bounds, and relationships), retrieves context using a 4-way parallel search (BM25, vector, graph traversal, temporal filter) with Reciprocal Rank Fusion (RRF), and provides an LLM-driven synthesis layer via `reflect`.

## 2. API Contract & Endpoints
The PRECEDENT integration communicates with Hindsight via standard REST JSON endpoints:

### A. Retain (Writing Memories)
- **Path**: `POST /v1/default/banks/{bank_id}/memories`
- **Payload**:
  ```json
  {
    "content": "Our standard enterprise support is available 24/5 with 24/7 emergency escalation for P1 incidents.",
    "context": "reviewer_correction",
    "metadata": {
      "org_id": "org_precedent_demo",
      "proposal_id": "prop_healthcare_01",
      "topic": "support_coverage",
      "approved_by": "vp_compliance",
      "scope": "organization",
      "created_at": "2026-11-07T14:30:00Z"
    },
    "tags": ["support", "sla", "approved_correction"]
  }
  ```

### B. Recall (Multi-Strategy Retrieval)
- **Path**: `POST /v1/default/banks/{bank_id}/memories/recall`
- **Payload**:
  ```json
  {
    "query": "What is our enterprise support coverage and response time SLA?",
    "limit": 5,
    "tags": ["support", "sla"],
    "tags_match": "any"
  }
  ```
- **Returns**: Prioritized facts with relevance scoring, entity associations, context, and timestamps.

### C. Reflect (Synthesizing Institutional Learnings)
- **Path**: `POST /v1/default/banks/{bank_id}/reflect`
- **Payload**:
  ```json
  {
    "query": "What patterns and common reviewer corrections have occurred in healthcare security proposals?",
    "max_tokens": 500,
    "include": {
      "facts": true
    }
  }
  ```
- **Returns**: Synthesized strategic insights grounded directly in stored memories.

## 3. Scoping & Multi-Tenancy Architecture
- **Bank Isolation**: Bank IDs follow the convention `precedent_{org_id}` to prevent cross-organization memory bleeding.
- **Client Tagging**: Client-specific exceptions are tagged with `client:{client_id}` and `scope:client`. Global searches filter out private client scopes unless explicitly targeted for that client.
- **Fallback & Emulation**: If an external Hindsight daemon is not reachable at the configured `HINDSIGHT_API_URL`, the PRECEDENT Hindsight service falls back gracefully to a fully schema-compliant local SQLite-backed Hindsight store that executes identical Retain/Recall/Reflect contracts without failing requests.

