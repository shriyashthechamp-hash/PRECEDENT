# PRECEDENT Test Suite & Verification Matrix

## Automated Test Scenarios

### 1. Document Ingestion & Parsing
- `test_pdf_parsing_valid`: Extracts sections, questions, and page coordinates from PDF files.
- `test_docx_parsing_valid`: Extracts tables and bulleted questionnaires from DOCX files.
- `test_empty_corrupt_files`: Rejects zero-byte and malformed payloads with 400 Bad Request and clean validation errors.

### 2. Proposal Engine (Groq LLM & Pydantic Validation)
- `test_structured_proposal_generation`: Confirms all generated answers strictly adhere to Pydantic schema with confidence, sources, and missing requirements.
- `test_deterministic_fallback`: Verifies graceful operation when external Groq network is unreachable or keys are unconfigured.

### 3. Review & Memory Engine (Hindsight)
- `test_retain_approved_memory`: Confirms that only human-approved edits trigger Hindsight `retain`.
- `test_unapproved_rejection`: Unapproved or draft AI answers are never retained into permanent organizational memory.
- `test_recall_memory_relevance`: Confirms prioritized recall of domain-specific precedents given an RFP question prompt.
- `test_reflect_synthesis`: Confirms higher-order reflection synthesis over multiple stored memories.

### 4. Contradiction Engine & Claim Ledger
- `test_deterministic_conflict_detection`: Flags exact predicate clashes (e.g. 24/7 vs 24/5 support; 30-day vs 90-day retention).
- `test_client_scope_isolation`: Asserts client A's custom concession is never flagged as a global organization contradiction for client B.

### 5. Memory ON vs OFF A/B Laboratory
- `test_memory_ab_comparison`: Computes live diff metrics (edit distance, token variance, memory utilization, latency).
