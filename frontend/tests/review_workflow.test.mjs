import test, { describe, it } from "node:test";
import assert from "node:assert/strict";

describe("Frontend Review Center & State Transition Suite", () => {
  // Preset logic matching frontend/src/app/review/page.tsx
  function getQuickPreset(type) {
    if (type === "support") {
      return {
        correctedAnswer:
          "Our enterprise support is available 24/5 (Mon-Fri 00:00-23:59 UTC). Emergency escalation for critical P1 incidents is available 24/7 with a guaranteed 15-minute response SLA.",
        correctionReason:
          "Original statement overstated standard coverage. Clarified 24/5 baseline vs 24/7 P1 escalation.",
        categoryTag: "support_coverage"
      };
    } else if (type === "retention") {
      return {
        correctedAnswer:
          "All customer production records and associated backups are completely purged within 30 days post-termination using certified cryptographic erasure in compliance with HIPAA and SOC2 Type II trust principles.",
        correctionReason:
          "Replaced 90-day draft with approved 30-day post-termination certified cryptographic destruction policy.",
        categoryTag: "data_retention"
      };
    }
    throw new Error(`Unknown preset: ${type}`);
  }

  function simulateResponseStateTransition(initialResponse, action, payload = {}) {
    if (action === "GENERATE_AI") {
      return {
        id: "rsp_001",
        status: "DRAFT",
        version: 1,
        proposed_answer: payload.text || "AI generated baseline answer",
        verification_required: true,
        recalled_precedents: payload.memories || []
      };
    } else if (action === "ACCEPT") {
      assert.strictEqual(initialResponse.status, "DRAFT");
      return {
        ...initialResponse,
        status: "ACCEPTED",
        verification_required: false
      };
    } else if (action === "CORRECT") {
      assert.ok(payload.corrected_answer, "Corrected answer is required");
      assert.ok(payload.correction_reason, "Correction reason must be documented");
      return {
        ...initialResponse,
        proposed_answer: payload.corrected_answer,
        status: "EDITED",
        version: initialResponse.version + 1,
        verification_required: false,
        review_event: {
          original_answer: initialResponse.proposed_answer,
          corrected_answer: payload.corrected_answer,
          correction_reason: payload.correction_reason,
          category_tag: payload.category_tag || "support_coverage",
          reviewer_name: payload.reviewer_name || "Lead Reviewer",
          status: "APPROVED",
          is_retained_in_hindsight: Boolean(payload.retain_in_hindsight)
        }
      };
    }
    throw new Error(`Unknown action: ${action}`);
  }

  it("should initialize AI responses in DRAFT state with verification required", () => {
    const aiResp = simulateResponseStateTransition(null, "GENERATE_AI", {
      text: "We provide 24/7 support across all tiers."
    });
    assert.strictEqual(aiResp.status, "DRAFT");
    assert.strictEqual(aiResp.verification_required, true);
    assert.strictEqual(aiResp.version, 1);
  });

  it("should transition DRAFT to ACCEPTED and clear verification_required", () => {
    const draft = simulateResponseStateTransition(null, "GENERATE_AI", { text: "Standard compliant response" });
    const accepted = simulateResponseStateTransition(draft, "ACCEPT");
    assert.strictEqual(accepted.status, "ACCEPTED");
    assert.strictEqual(accepted.verification_required, false);
    assert.strictEqual(accepted.version, 1);
  });

  it("should transition DRAFT to EDITED, bump version, and attach review provenance", () => {
    const draft = simulateResponseStateTransition(null, "GENERATE_AI", { text: "Draft with unverified claims" });
    const corrected = simulateResponseStateTransition(draft, "CORRECT", {
      corrected_answer: "Verified enterprise SLA commitments.",
      correction_reason: "Corrected SLA figures per current corporate master service agreement.",
      category_tag: "sla_compliance",
      reviewer_name: "Sarah Jenkins (VP Customer Ops)",
      retain_in_hindsight: true
    });

    assert.strictEqual(corrected.status, "EDITED");
    assert.strictEqual(corrected.version, 2);
    assert.strictEqual(corrected.verification_required, false);
    assert.strictEqual(corrected.proposed_answer, "Verified enterprise SLA commitments.");

    // Validate immutable review provenance event
    assert.ok(corrected.review_event);
    assert.strictEqual(corrected.review_event.status, "APPROVED");
    assert.strictEqual(corrected.review_event.is_retained_in_hindsight, true);
    assert.strictEqual(corrected.review_event.reviewer_name, "Sarah Jenkins (VP Customer Ops)");
    assert.strictEqual(corrected.review_event.category_tag, "sla_compliance");
  });

  it("should enforce mandatory correction reason (reject empty rationale)", () => {
    const draft = simulateResponseStateTransition(null, "GENERATE_AI", { text: "Draft" });
    assert.throws(
      () => simulateResponseStateTransition(draft, "CORRECT", {
        corrected_answer: "New answer",
        correction_reason: "" // Empty reason
      }),
      /Correction reason must be documented/
    );
  });

  it("should load accurate preset for support coverage", () => {
    const preset = getQuickPreset("support");
    assert.strictEqual(preset.categoryTag, "support_coverage");
    assert.match(preset.correctedAnswer, /24\/5/);
    assert.match(preset.correctedAnswer, /24\/7/);
    assert.match(preset.correctedAnswer, /P1/);
    assert.match(preset.correctionReason, /overstated standard coverage/i);
  });

  it("should load accurate preset for data retention", () => {
    const preset = getQuickPreset("retention");
    assert.strictEqual(preset.categoryTag, "data_retention");
    assert.match(preset.correctedAnswer, /30 days/);
    assert.match(preset.correctedAnswer, /cryptographic erasure/);
    assert.match(preset.correctionReason, /Replaced 90-day draft/);
  });
});
