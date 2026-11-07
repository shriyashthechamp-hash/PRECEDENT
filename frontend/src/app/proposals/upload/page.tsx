"use client";

import { useState } from "react";
import { Header } from "@/components/Header";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import {
  UploadCloud,
  FileCheck,
  AlertCircle,
  FileText,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2
} from "lucide-react";

export default function RfpUploadPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [reference, setReference] = useState("");
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a PDF or DOCX file to upload.");
      return;
    }
    setError("");
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      if (title) formData.append("title", title);
      if (reference) formData.append("rfp_reference", reference);

      const res = await api.ingestRfp(formData);
      setResult(res);
    } catch (err: any) {
      setError(err.message || "Failed to ingest RFP document.");
    } finally {
      setUploading(false);
    }
  };

  // 1-Click Synthetic Sample Ingestion
  const handleLoadSample = async (sampleType: "healthcare" | "fintech") => {
    setUploading(true);
    setError("");

    let sampleContent = "";
    let sampleFilename = "";
    let sampleTitle = "";

    if (sampleType === "healthcare") {
      sampleTitle = "BioHealth Alliance — Clinical Workflow RFP";
      sampleFilename = "BioHealth_RFP_2026.txt";
      sampleContent = `
Section 1: General Corporate
1. Describe your company's operational history and executive leadership.
2. Detail your standard customer support hours, response SLA matrices, and escalation protocols for hospital clinical teams.
Section 2: Security & Privacy
3. State your customer data retention period post-termination and the verified timeline for certified destruction of all PHI.
4. Detail your disaster recovery capabilities, including target RTO and RPO metrics for Tier-1 healthcare services.
5. Provide your SOC2 Type II and HIPAA security attestations.
      `.trim();
    } else {
      sampleTitle = "Citadel FinTech — Algorithmic Ingestion Tender";
      sampleFilename = "Citadel_Tender_2026.txt";
      sampleContent = `
Section 1: Technical Architecture
1. Detail your multi-region cloud deployment architecture and data residency guarantees.
2. What are your guaranteed uptime SLAs and monthly penalty credit structures?
Section 2: Support & Operations
3. Detail your enterprise tier support hours and escalation pathways for financial trading systems.
4. Describe your encryption standards for data at rest and data in transit.
      `.trim();
    }

    const blob = new Blob([sampleContent], { type: "text/plain" });
    const sampleFile = new File([blob], sampleFilename, { type: "text/plain" });

    try {
      const formData = new FormData();
      formData.append("file", sampleFile);
      formData.append("title", sampleTitle);
      formData.append("rfp_reference", sampleFilename);

      const res = await api.ingestRfp(formData);
      setResult(res);
    } catch (err: any) {
      setError(err.message || "Failed to ingest sample RFP.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <Header
        title="RFP Intelligence & Ingestion"
        subtitle="Extract line-item questions, classify domains, and structure new proposal workspaces."
      />

      <div className="p-8 space-y-6 max-w-4xl mx-auto w-full">
        {result ? (
          /* Success Screen after Ingestion */
          <div className="p-6 rounded-lg bg-surface border border-emerald-500/30 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-white">RFP Successfully Ingested</h2>
                <p className="text-xs text-neutral-400">
                  Extracted <strong className="text-emerald-400">{result.total_questions}</strong> line-item requirements into a structured workspace.
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-border">
              <div className="text-xs font-mono text-neutral-400 uppercase tracking-wider">
                Extracted Question Sample:
              </div>
              {result.sample_questions?.map((q: any, i: number) => (
                <div key={i} className="p-3 rounded bg-surface-elevated border border-border text-xs space-y-1">
                  <div className="flex items-center justify-between text-neutral-400 font-mono text-[10px]">
                    <span className="text-blue-400">Requirement #{q.question_index}</span>
                    <span className="px-1.5 py-0.5 rounded bg-surface text-neutral-300 border border-border">
                      {q.category}
                    </span>
                  </div>
                  <p className="text-neutral-200">{q.question_text}</p>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
              <button
                onClick={() => setResult(null)}
                className="px-4 py-2 text-xs text-neutral-400 hover:text-white bg-surface-elevated border border-border rounded"
              >
                Ingest Another Document
              </button>
              <button
                onClick={() => router.push(`/proposals/${result.proposal_id}`)}
                className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 rounded transition"
              >
                <span>Open RFP Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* Ingestion Form */
          <div className="space-y-6">
            <form onSubmit={handleUpload} className="p-6 rounded-lg bg-surface border border-border space-y-6">
              <div className="space-y-1">
                <h2 className="text-sm font-semibold text-white">Upload RFP Document</h2>
                <p className="text-xs text-neutral-400">
                  Supports enterprise tenders in PDF, DOCX, or text format up to 25MB.
                </p>
              </div>

              {error && (
                <div className="p-3 rounded bg-conflict-subtle border border-conflict/40 text-xs text-conflict flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Drag & Drop Area */}
              <div className="border-2 border-dashed border-border hover:border-blue-500/50 rounded-lg p-8 text-center transition bg-surface-elevated/40">
                <input
                  type="file"
                  id="rfp-file-input"
                  accept=".pdf,.docx,.doc,.txt"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
                <label htmlFor="rfp-file-input" className="cursor-pointer space-y-2 block">
                  <UploadCloud className="w-8 h-8 text-blue-400 mx-auto" />
                  <div className="text-sm font-medium text-white">
                    {file ? file.name : "Click to browse or drop RFP document here"}
                  </div>
                  <div className="text-xs text-neutral-500">
                    PDF, DOCX, or TXT (Strict parsing preserves page references)
                  </div>
                </label>
              </div>

              {/* Metadata Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-neutral-300">Proposal Title (Optional)</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. HealthCare Cloud Platform RFP"
                    className="w-full px-3 py-2 text-xs bg-surface-elevated border border-border rounded text-white focus:outline-none focus:border-blue-500 font-sans"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-neutral-300">RFP Reference Number (Optional)</label>
                  <input
                    type="text"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    placeholder="e.g. RFP-2026-MED-04"
                    className="w-full px-3 py-2 text-xs bg-surface-elevated border border-border rounded text-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={uploading || !file}
                className="w-full py-2.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded transition flex items-center justify-center gap-2"
              >
                {uploading ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    <span>Parsing Sections & Structuring Requirements...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Ingest Document & Build Workspace</span>
                  </>
                )}
              </button>
            </form>

            {/* Pre-Loaded Quick Demos */}
            <div className="p-5 rounded-lg bg-surface border border-border space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white">Pre-Loaded Synthetic Test Cases</span>
                <span className="text-[10px] text-neutral-500 font-mono">1-Click Live Ingestion</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleLoadSample("healthcare")}
                  disabled={uploading}
                  className="p-3 text-left rounded bg-surface-elevated hover:bg-surface-hover border border-border transition space-y-1"
                >
                  <div className="flex items-center justify-between text-xs font-medium text-blue-400">
                    <span>BioHealth Alliance RFP</span>
                    <span className="text-[10px] font-mono text-neutral-400">5 Reqs</span>
                  </div>
                  <p className="text-[11px] text-neutral-400">
                    Tests HIPAA data retention, clinical support hours, and RTO/RPO requirements.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => handleLoadSample("fintech")}
                  disabled={uploading}
                  className="p-3 text-left rounded bg-surface-elevated hover:bg-surface-hover border border-border transition space-y-1"
                >
                  <div className="flex items-center justify-between text-xs font-medium text-purple-400">
                    <span>Citadel FinTech Tender</span>
                    <span className="text-[10px] font-mono text-neutral-400">4 Reqs</span>
                  </div>
                  <p className="text-[11px] text-neutral-400">
                    Tests multi-region data residency, uptime penalty clauses, and support SLAs.
                  </p>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
