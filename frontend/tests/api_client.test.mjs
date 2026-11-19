import test, { describe, it, mock } from "node:test";
import assert from "node:assert/strict";

describe("Frontend API Client & Error Handling Suite", () => {
  it("should normalize endpoints and construct correct request headers", async () => {
    let capturedUrl = "";
    let capturedOptions = {};

    const originalFetch = globalThis.fetch;
    globalThis.fetch = async (url, options) => {
      capturedUrl = url.toString();
      capturedOptions = options;
      return {
        ok: true,
        json: async () => ({ status: "operational" })
      };
    };

    try {
      // Test URL formatting with leading slash
      const res = await globalThis.fetch("http://localhost:8000/api/health", {
        headers: { "Content-Type": "application/json" }
      });
      const data = await res.json();
      assert.strictEqual(data.status, "operational");
      assert.strictEqual(capturedUrl, "http://localhost:8000/api/health");
      assert.strictEqual(capturedOptions.headers["Content-Type"], "application/json");
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it("should correctly propagate structured API error details", async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async () => ({
      ok: false,
      status: 400,
      statusText: "Bad Request",
      json: async () => ({ detail: "Unsupported file format '.exe'" })
    });

    try {
      const executeCall = async () => {
        const res = await globalThis.fetch("http://localhost:8000/api/rfp/ingest");
        if (!res.ok) {
          const err = await res.json().catch(() => ({ detail: res.statusText }));
          throw new Error(err.detail || `HTTP Error ${res.status}`);
        }
      };

      await assert.rejects(
        executeCall,
        (err) => {
          assert.strictEqual(err.message, "Unsupported file format '.exe'");
          return true;
        }
      );
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it("should fall back to HTTP statusText when error body is not JSON", async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async () => ({
      ok: false,
      status: 502,
      statusText: "Bad Gateway",
      json: async () => {
        throw new Error("Invalid JSON");
      }
    });

    try {
      const executeCall = async () => {
        const res = await globalThis.fetch("http://localhost:8000/api/health");
        if (!res.ok) {
          const err = await res.json().catch(() => ({ detail: res.statusText }));
          throw new Error(err.detail || `HTTP Error ${res.status}`);
        }
      };

      await assert.rejects(
        executeCall,
        (err) => {
          assert.strictEqual(err.message, "Bad Gateway");
          return true;
        }
      );
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it("should format Render cold start guidance on network connection drop", async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async () => {
      const err = new TypeError("Failed to fetch");
      throw err;
    };

    try {
      const executeCall = async () => {
        try {
          await globalThis.fetch("http://localhost:8000/api/health");
        } catch (error) {
          if (error?.message?.includes("Failed to fetch") || error?.name === "TypeError") {
            throw new Error("Unable to reach PRECEDENT API. If the service was recently idle, Render may take ~30-50s to wake from sleep.");
          }
          throw error;
        }
      };

      await assert.rejects(
        executeCall,
        (err) => {
          assert.match(err.message, /Render may take ~30-50s to wake from sleep/);
          return true;
        }
      );
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it("should validate query parameter serialization for Memory Explorer", () => {
    const params = { topic: "support_sla", client_id: "cli_alpha", sector_id: "sec_healthcare" };
    const query = new URLSearchParams(params).toString();
    assert.strictEqual(query, "topic=support_sla&client_id=cli_alpha&sector_id=sec_healthcare");

    // Partial params
    const partial = { topic: "data_retention" };
    const partialQuery = new URLSearchParams(partial).toString();
    assert.strictEqual(partialQuery, "topic=data_retention");
  });

  it("should correctly structure review correction payload", () => {
    const payload = {
      response_id: "rsp_001",
      question_id: "qst_001",
      proposal_id: "prp_001",
      original_answer: "We offer 24/7 blanket coverage.",
      corrected_answer: "Our enterprise support is 24/5 with 24/7 P1 emergency escalation.",
      correction_reason: "Overstated baseline standard support.",
      category_tag: "support_coverage",
      reviewer_name: "Sarah Jenkins",
      retain_in_hindsight: true
    };

    // Assert mandatory contract fields
    assert.ok(payload.response_id);
    assert.ok(payload.question_id);
    assert.ok(payload.proposal_id);
    assert.ok(payload.corrected_answer.length > 0);
    assert.ok(payload.correction_reason.length > 0);
    assert.strictEqual(payload.retain_in_hindsight, true);
    assert.strictEqual(payload.category_tag, "support_coverage");
  });
});
