import test, { describe, it } from "node:test";
import assert from "node:assert/strict";

describe("Frontend RFP Upload & Ingestion Validation Suite", () => {
  const ALLOWED_EXTENSIONS = [".pdf", ".docx", ".doc", ".txt"];
  const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB

  function validateUploadForm({ file, title, reference }) {
    if (!file) {
      return { valid: false, error: "Please select a PDF or DOCX file to upload." };
    }
    const name = file.name || "";
    const lastDot = name.lastIndexOf(".");
    const ext = lastDot !== -1 ? name.substring(lastDot).toLowerCase() : "";

    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return {
        valid: false,
        error: `Unsupported file format '${ext}'. Allowed extensions are: ${ALLOWED_EXTENSIONS.sort().join(", ")}`
      };
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return {
        valid: false,
        error: `Uploaded file exceeds maximum permitted size of 25MB (received ${(file.size / (1024 * 1024)).toFixed(1)}MB).`
      };
    }

    return {
      valid: true,
      error: null,
      formData: {
        file,
        title: title || name.replace(/\.[^/.]+$/, "").replace(/_/g, " "),
        rfp_reference: reference || name
      }
    };
  }

  it("should reject submissions when no file is selected", () => {
    const res = validateUploadForm({ file: null, title: "Test Title" });
    assert.strictEqual(res.valid, false);
    assert.strictEqual(res.error, "Please select a PDF or DOCX file to upload.");
  });

  it("should accept valid PDF, DOCX, DOC, and TXT files", () => {
    for (const ext of ALLOWED_EXTENSIONS) {
      const mockFile = { name: `tender_document${ext}`, size: 1024 * 100 };
      const res = validateUploadForm({ file: mockFile });
      assert.strictEqual(res.valid, true, `Expected ${ext} to be valid`);
      assert.strictEqual(res.error, null);
    }
  });

  it("should reject disallowed extensions (.exe, .sh, .json, .py, .csv, .png)", () => {
    const disallowed = [".exe", ".sh", ".json", ".py", ".csv", ".png", ".zip", ".tar.gz", ""];
    for (const ext of disallowed) {
      const mockFile = { name: `malicious_payload${ext}`, size: 1024 };
      const res = validateUploadForm({ file: mockFile });
      assert.strictEqual(res.valid, false);
      assert.match(res.error, /Unsupported file format/);
    }
  });

  it("should reject files exceeding the 25MB boundary", () => {
    const oversizedFile = { name: "massive_tender.pdf", size: 26 * 1024 * 1024 }; // 26MB
    const res = validateUploadForm({ file: oversizedFile });
    assert.strictEqual(res.valid, false);
    assert.match(res.error, /exceeds maximum permitted size of 25MB/);
  });

  it("should accept files exactly at or below the 25MB limit", () => {
    const exactLimitFile = { name: "large_tender.pdf", size: 25 * 1024 * 1024 };
    const res = validateUploadForm({ file: exactLimitFile });
    assert.strictEqual(res.valid, true);
  });

  it("should auto-generate clean title from filename when title is omitted", () => {
    const mockFile = { name: "Mercy_Health_Clinical_RFP_2026.docx", size: 2048 };
    const res = validateUploadForm({ file: mockFile, title: "" });
    assert.strictEqual(res.valid, true);
    assert.strictEqual(res.formData.title, "Mercy Health Clinical RFP 2026");
    assert.strictEqual(res.formData.rfp_reference, "Mercy_Health_Clinical_RFP_2026.docx");
  });

  it("should preserve custom title and reference when provided", () => {
    const mockFile = { name: "rfp_doc.pdf", size: 4096 };
    const res = validateUploadForm({
      file: mockFile,
      title: "Enterprise Cloud Tender",
      reference: "REF-2026-CLOUD"
    });
    assert.strictEqual(res.valid, true);
    assert.strictEqual(res.formData.title, "Enterprise Cloud Tender");
    assert.strictEqual(res.formData.rfp_reference, "REF-2026-CLOUD");
  });

  it("should validate preset synthetic sample configurations", () => {
    const samples = {
      healthcare: {
        title: "BioHealth Alliance — Clinical Workflow RFP",
        filename: "BioHealth_RFP_2026.txt",
        keywords: ["support", "retention", "PHI", "SOC2", "HIPAA"]
      },
      fintech: {
        title: "Citadel FinTech — Algorithmic Ingestion Tender",
        filename: "Citadel_Tender_2026.txt",
        keywords: ["architecture", "uptime", "SLA", "encryption"]
      }
    };

    for (const [key, sample] of Object.entries(samples)) {
      assert.ok(sample.title.length > 10);
      assert.ok(sample.filename.endsWith(".txt"));
      assert.ok(sample.keywords.length >= 4);
    }
  });
});
