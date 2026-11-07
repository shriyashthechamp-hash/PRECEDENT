# PRECEDENT Architecture Document

## Overview
PRECEDENT is an AI-native institutional intelligence platform for complex proposals and enterprise RFPs.
Unlike traditional proposal libraries that only store answers, PRECEDENT captures **why** answers were revised, which claims were verified, what evaluators rewarded, when commitments expired, and how institutional experience compounds over time.

```
                          ┌─────────────────────────────────────┐
                          │     PRECEDENT Next.js Frontend      │
                          │   Linear/Palantir Dark SaaS Shell   │
                          └──────────────────┬──────────────────┘
                                             │ HTTP REST / JSON
                                             ▼
                          ┌─────────────────────────────────────┐
                          │     FastAPI Backend Gateway         │
                          │   Auth, Routing, Audit Middleware   │
                          └──────┬──────────┬──────────┬────────┘
                                 │          │          │
         ┌───────────────────────┘          │          └───────────────────────┐
         ▼                                  ▼                                  ▼
┌─────────────────┐             ┌─────────────────────┐             ┌──────────────────┐
│  RFP Ingestion  │             │   Proposal Engine   │             │  Claim & Conflict│
│  & Extraction   │             │   (Groq LLM + Core) │             │  Ledger Engine   │
└────────┬────────┘             └──────────┬──────────┘             └────────┬─────────┘
         │                                 │                                 │
         │                      ┌──────────┴──────────┐                      │
         │                      ▼                     ▼                      │
         │              ┌───────────────┐     ┌───────────────┐              │
         │              │ Hindsight Mem │     │ Deterministic │              │
         │              │ Bank (Retain, │     │ Fact Engine   │              │
         │              │ Recall,Reflect)     │ & Rule Ledger │              │
         │              └───────┬───────┘     └───────┬───────┘              │
         │                      │                     │                      │
         ▼                      ▼                     ▼                      ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                    Relational Database (SQLAlchemy / SQLite)                 │
│  - Proposals, Questions, Review Events, Claims, Clients, Sectors, Outcomes  │
└──────────────────────────────────────────────────────────────────────────────┘
```

## Core Modules
1. **RFP Workspace & Ingestion**: Parses enterprise PDFs/DOCXs, extracts requirements, tags domains (Security, SLA, Pricing, Architecture), and generates structured line-item question entities.
2. **AI Proposal Engine (Groq Integration)**: Generates structured, evidence-grounded proposals with confidence scores, cited precedents, and missing requirement alerts.
3. **Review & Learning Engine**: Captures human-in-the-loop edits, explicit rationales, category tags, and provenance before approving memories.
4. **Hindsight Memory Engine**: Interacts with Hindsight REST API (`retain`, `recall`, `reflect`) across discrete organizational banks with client/sector scoping and temporal validation.
5. **Contradiction Intelligence & Claim Ledger**: Tracks claim subjects, predicates, values, validity windows, and triggers automated conflict warnings when new claims contradict approved historical commitments.
6. **Outcome Intelligence**: Binds RFP win/loss outcomes and evaluator remarks back into the reflection cycle.
7. **Memory ON vs Memory OFF A/B Laboratory**: Directly demonstrates edit-reduction, token variance, and precedent accuracy side-by-side with identical prompts.

## Security & Data Isolation
- **Client & Organization Boundaries**: Hindsight memory banks and database records are explicitly filtered by `org_id` and `client_id`. Client-specific concessions never leak into cross-client proposals.
- **Human Approval Gate**: AI generation alone cannot create permanent organizational claims. Only explicit human reviewer approval can promote a statement into the verified Claim Ledger and Hindsight Memory.

