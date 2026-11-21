# PRECEDENT — Demo Guide

This guide walks through the workflows that are actually implemented in this repository. Follow it
in order for a complete end-to-end demonstration, or jump to a specific section.

> **Synthetic demo data is required.** PRECEDENT auto-seeds a fictional dataset on first startup (a
> made-up vendor, "Vanguard Logic Systems", its sectors, clients, claim ledger, historical proposals,
> and a deliberately contradictory in-review proposal). Without it, several steps below have nothing
> to act on. Do not clear the database before demoing unless you re-seed with
> `POST /api/seed?force=true`.

---

## 0. Before you start

1. Start the backend and frontend ([`DEVELOPMENT.md`](DEVELOPMENT.md)).
2. Confirm the backend is healthy:

   ```bash
   curl http://localhost:8000/api/health
   ```

   `status` should be `operational`. `hindsight_memory.status` is expected to read `FALLBACK` if you
   have no external Hindsight daemon — that is normal and fully functional.
3. Open the app shell at **`http://localhost:3000/app`**. The public landing page is at
   **`http://localhost:3000/`**.

The seeded demo works with or without a Groq key. With a key, generation is live; without one, the
deterministic engine produces the drafts. The narrative is identical either way.

---

## 1. Open PRECEDENT

- **Public site:** `http://localhost:3000/` — the product story. `/about` has more detail.
- **Application:** `http://localhost:3000/app` — the operational dashboard with live metrics.
- **What to point out:** the dashboard KPIs are computed from the database and labelled with their
  provenance. The Overview and Analytics pages distinguish synthetic seed records from live records.

## 2. Ingest an RFP

1. Go to **Proposals & RFPs → Ingest New RFP** (`/proposals/upload`).
2. Upload a document, or paste sample content. Two sample RFPs ship in the repo:
   - `docs/sample_rfps/Mercy_Health_Clinical_RFP.txt`
   - `docs/sample_rfps/Citadel_FinTech_Tender.txt`
3. Optionally set a title, RFP reference, client, and sector.
4. Click **Ingest Document & Build Workspace**.

Accepted formats: `PDF`, `DOCX`, `DOC`, `TXT`. Maximum size 25 MB. Empty files and unsupported
extensions are rejected with a clear error.

## 3. Ingest and structure questions

After ingestion you land in the proposal workspace (`/proposals/[id]`). Point out that the RFP has
been broken into discrete requirements in the left panel, each with:

- a section and category,
- a mandatory flag,
- an evaluation criterion,
- a page reference back to the source document.

## 4. Generate responses

1. In the workspace, select a requirement.
2. Choose the generation engine:
   - **Memory ON (Hindsight)** — recalls approved precedents before generating.
   - **Memory OFF (Baseline)** — generates without institutional memory.
3. Click **Generate Proposal Response** (or **Regenerate Answer**).

The generated answer appears with its confidence score (labelled *statistical likelihood, not
factual certainty*), supporting sources, and any recalled institutional precedents. If it conflicts
with an approved commitment, a contradiction banner appears immediately.

## 5. Review generated responses

1. Open **Review Center** (`/review`).
2. Select a proposal workspace and a requirement from the left panel.
3. The right panel shows the **ORIGINAL AI DRAFT** beside the **APPROVED HUMAN TEXT** editor.

## 6. Correct an answer

1. Edit the text in the **APPROVED HUMAN TEXT** area, or use a quick preset
   (**Preset: Support** or **Preset: Retention**).
2. Click **Approve & Retain in Hindsight**.

## 7. Provide a correction reason

The **Correction Reason & Rationale** field is **mandatory**. The UI and API both reject an empty
rationale. Enter a reason such as:

> "Original statement overstated standard coverage. Clarified 24/5 baseline vs 24/7 P1 escalation."

Choose a category tag and the approving reviewer, then submit.

## 8. Observe approved information being retained

After submitting, a success banner reports the retained memory id, topic, approver, and captured
rationale. Then open **Institutional Memory** (`/memory`) to see the retained precedent in the
provenance feed (source proposal, original draft, correction reason, reviewer). Recall and reflection
can be exercised here too.

## 9. Recall relevant information in a subsequent proposal

1. Open a **different** proposal, e.g. **Vertex Therapeutics** (`/proposals/prop_vertex_01`).
2. Select a support/SLA requirement.
3. Generate with **Memory ON (Hindsight)**.
4. The response recalls and cites the previously approved precedent and reuses the verified policy.

This same loop is automated end-to-end (see [step 13](#13-run-the-automated-learning-cycle)).

## 10. Explore contradictions

1. Open **Contradiction Center** (`/contradictions`).
2. The seeded Vertex Therapeutics proposal contains an open `HIGH`-severity contradiction: a draft
   claims 90-day data retention while the approved claim is a 30-day cryptographic wipe.
3. **Blocked submission:** open the Vertex workspace and click **Submit Proposal** — it is refused
   with a "Submission Blocked" banner (HTTP `400`).
4. Resolve the alert in the Contradiction Center — e.g. click **Enforce Approved Precedent**
   (`ENFORCE_OLD`).
5. Open the **Audit Trail** tab to see the immutable resolution record (who, when, action,
   justification).
6. Return to the workspace and **Submit Proposal** — it now succeeds.

Resolution options are `ENFORCE_OLD`, `OVERRIDE_NEW`, and `DISMISS`, each writing an audit log entry.

## 11. Explore Memory ON/OFF comparison

1. Open **Memory A/B Lab** (`/lab`).
2. Select a proposal and a requirement (you can also deep-link from the workspace's **Compare A/B**
   button).
3. Click **Execute Live A/B Experiment**.

The lab runs the same question under both conditions and shows *measured* deltas: recalled
precedent count, contradiction delta, consistency delta, text similarity ratio, reviewer characters
saved, and recall latency, plus a descriptive empirical finding. No percentage improvement is
invented. When no precedent matches, it honestly reports `NEUTRAL`.

## 12. View bid outcomes

Open **Bid Outcomes** (`/outcomes`). The seeded dataset includes a won bid and a lost bid with
evaluator feedback. Use **Record Proposal Outcome** to record or update an outcome (`WON`, `LOST`,
`WITHDRAWN`, `NO_DECISION`, `PENDING`) with a contract value, primary reason, and notes. When
evaluator feedback is provided, it is retained back into memory for future proposals.

## 13. Run the automated learning cycle

For a scripted proof of the full loop (no clicking required):

```bash
curl -X POST http://localhost:8000/api/demo/run-learning-cycle
```

This returns a timestamped timeline for the 9-step cycle: open Proposal A → present a seeded-error
draft → reviewer corrects with rationale → approve → **retain** in memory → open a different
Proposal B → **recall** → generate with memory ON → verify the approved precedent was respected and
the seeded error avoided. The response includes `institutional_learning_verified: true`.

---

## Suggested demo narrative (short)

1. **Problem:** proposal teams repeat rejected commitments and forget why answers were changed.
2. **Ingest** an RFP and show structured requirements.
3. **Generate** a draft and show it can overcommit (blanket 24/7 support).
4. **Review & correct** it with a rationale (24/5 + 24/7 P1 escalation) and retain it.
5. **Open a different proposal** and generate with memory ON — the precedent is recalled and reused.
6. **Show the contradiction gate** blocking submission until the conflict is resolved, plus the audit
   trail.
7. **Run the A/B lab** to show measured, non-fabricated impact.
8. **Record an outcome** to close the loop.

---

## Known demo caveats

- Memory status reads `FALLBACK` without an external Hindsight daemon; this is expected.
- Generation quality without a Groq key comes from the deterministic engine and is domain-limited.
- Contradiction detection is deterministic over a fixed rule set, not general semantic detection.
- See the README's [Known limitations](../README.md#known-limitations) for the full list.
