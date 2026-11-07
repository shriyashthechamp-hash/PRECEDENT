# PRECEDENT — Live Technical Demonstration Script (Phase 2 Audited)

## Core Value Proposition
> **"Every bid builds a better next bid. Traditional proposal tools store answers. PRECEDENT remembers *why* answers were corrected, blocks conflicting commitments before submission, and makes organizational intelligence compound."**

---

## 9-Step Institutional Learning Demonstration Walkthrough (2-3 Minutes)

This demonstration walks through the exact 9-step institutional learning cycle verified by the test suite:

### Step 1: Institutional Command Center & Audited Metrics (0:00 - 0:25)
- **Navigate to**: `http://localhost:3000/` (Overview Dashboard).
- **Inspect**:
  - **Reviewer Edit Reduction**: Live calculated from `MEMORY_ON` vs `MEMORY_OFF` acceptance rates.
  - **Contradiction Defense**: Shows active blocking conflicts.
  - **Hindsight Memories**: Durable persisted experiences in SQLite `MemoryBankRecord`.
  - **Audited Provenance Disclosure**: Confirms all metrics derive from direct database queries, clearly distinguishing synthetic seed data from live proposals.
- **Narrative**:
  > *"Notice that none of these dashboard numbers are hardcoded marketing assertions. They derive from live database records, showing our active proposals, unresolved contradictions, and accumulated memory bank."*

---

### Step 2: Proposal A Review — Detecting Seeded Demo Error (0:25 - 0:50)
- **Navigate to**: `http://localhost:3000/proposals/prop_mercy_01` (or click Mercy Health proposal).
- **Select Requirement**: *Operations & SLA Support*.
- **Review Baseline Draft**: Notice the unassisted draft claims:
  > *"We provide comprehensive 24/7 customer support for all enterprise users across all tiers."*
- **Click**: `Review & Correct` (navigating to `/review`).
- **Narrative**:
  > *"A standard generative model makes blanket overcommitments to win deals. Here it asserted 24/7 support for all tiers. Let's observe how human review corrects this."*

---

### Step 3: Human Reviewer Correction & Rationale (0:50 - 1:15)
- **In Review Center**:
  - Corrected text: *"Our standard enterprise support SLA provides 24/5 coverage (Monday 00:00 UTC through Friday 23:59 UTC). For critical Priority 1 (P1) incidents, our Emergency Response Team operates 24/7 with guaranteed response under 15 minutes."*
  - Reviewer: **Sarah Jenkins (VP of Customer Operations)**.
  - Rationale: *"Standard customer operations policy: 24/5 core, with 24/7 escalation strictly restricted to P1 outages to protect engineering on-call sustainability."*
- **Click**: `Approve & Retain in Memory`.
- **System Action**: 
  - Retains memory with full provenance (`source_proposal_id`, `approved_by`, `rationale`, `scope: global`).
  - Persists durable `MemoryBankRecord` in SQLite surviving server restarts.
- **Narrative**:
  > *"When Sarah Jenkins approves this edit, PRECEDENT doesn't just save the text snippet. It retains why the change was made and who approved it."*

---

### Step 4: Proposal B — Instant Hindsight Recall in a Different RFP (1:15 - 1:40)
- **Navigate to**: `http://localhost:3000/proposals/prop_vertex_01` (Vertex Therapeutics RFP — a completely different organization).
- **Select Requirement**: *Support Operating Hours & Tiered Response Times*.
- **Set Generation Mode**: `Memory ON (Hindsight)`.
- **Click**: `Generate Proposal Response`.
- **Observation**:
  - The model immediately performs a multi-strategy recall on the Hindsight bank.
  - Recalls Sarah Jenkins' approved 24/5 + 24/7 P1 escalation precedent from Proposal A.
  - Generated response incorporates the exact verified policy and cites the originating precedent.
  - Displays statistical likelihood note: *(statistical likelihood, not factual certainty)*.
- **Narrative**:
  > *"Proposal B is for an entirely different customer. But because PRECEDENT possesses organizational memory, it automatically recalls Sarah's precedent. The new bid inherits the corrected standard with zero reviewer edits."*

---

### Step 5: Contradiction Defense & Submission Blocking Gate (1:40 - 2:05)
- **In Vertex Therapeutics Proposal Workspace**:
  - Click `Submit Proposal` in the top right header.
  - **Result**: **SUBMISSION BLOCKED!**
  - Banner alerts: *"Submission Blocked: 1 unresolved HIGH-severity contradiction detected. PRECEDENT policy strictly prohibits submitting proposals with open HIGH-severity claim contradictions."*
- **Inspect**: Requirement #1 on Data Retention asserts 90 days, contradicting approved Claim `#clm_data_retention` (30 days certified cryptographic wipe).
- **Navigate to**: `http://localhost:3000/contradictions`.
- **Action**: Inspect side-by-side diff. Click `Enforce Approved Precedent`.
- **Inspect Audit Trail**: Switch to the **Audit Trail** tab to view the permanent immutable record: who resolved it, timestamp, action (`ENFORCE_OLD`), and justification.
- **Return to Proposal Workspace**: Click `Submit Proposal` again — now succeeds with `SUBMITTED` status!
- **Narrative**:
  > *"Traditional proposal software allows reps to accidentally submit conflicting commitments. PRECEDENT enforces a hard cryptographic gate. Submission is physically blocked until contradictions are resolved."*

---

### Step 6: Memory ON vs Memory OFF A/B Laboratory (2:05 - 2:30)
- **Navigate to**: `http://localhost:3000/lab`.
- **Select Question**: *Disaster Recovery & Tier-1 RTO/RPO*.
- **Click**: `Execute Live A/B Experiment`.
- **Examine Empirical Deltas**:
  - **Reviewer Chars Saved**: Measured character diff between variants.
  - **Recall Latency**: Measured live (e.g. 12ms).
  - **Empirical Finding Banner**: Discloses exact finding (e.g., `CONTRADICTION_PREVENTED` or `NEUTRAL` when no prior precedent exists).
- **Narrative**:
  > *"In our A/B Lab, we run the identical question with the identical Groq model and prompt. The only difference is institutional memory. We don't fabricate percentage improvements—we show the measured character delta and latency."*

---

### Step 7: Automated One-Click Learning Cycle Verification
- **API Test Command**:
  ```bash
  curl -X POST http://localhost:8000/api/demo/run-learning-cycle | jq
  ```
  Returns the complete 9-step audited timeline with JSON proof of `institutional_learning_verified: true`.
- **Automated Verification Test**:
  ```bash
  ./scripts/test.sh
  ```
  14/14 tests pass in ~1.3 seconds.
