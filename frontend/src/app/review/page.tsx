"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { api } from "@/lib/api";
import {
  CheckCircle2,
  Edit3,
  BrainCircuit,
  AlertCircle,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Layers
} from "lucide-react";

export default function ReviewCenterPage() {
  const [proposals, setProposals] = useState<any[]>([]);
  const [selectedProposalId, setSelectedProposalId] = useState<string>("");
  const [selectedProposal, setSelectedProposal] = useState<any>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<any>(null);

  // Review Form States
  const [correctedAnswer, setCorrectedAnswer] = useState("");
  const [correctionReason, setCorrectionReason] = useState("");
  const [categoryTag, setCategoryTag] = useState("support_coverage");
  const [reviewerName, setReviewerName] = useState("Sarah Jenkins (VP Customer Ops)");
  const [submitting, setSubmitting] = useState(false);
  const [successEvent, setSuccessEvent] = useState<any>(null);

  useEffect(() => {
    async function load() {
      try {
        const props = await api.getProposals();
        setProposals(props || []);
        if (props?.length > 0) {
          setSelectedProposalId(props[0].id);
          const detail = await api.getProposalDetail(props[0].id);
          setSelectedProposal(detail);
          if (detail?.questions?.length > 0) {
            setSelectedQuestion(detail.questions[0]);
            const resp = detail.questions[0].responses?.[0];
            if (resp) {
              setCorrectedAnswer(resp.proposed_answer);
            }
          }
        }
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, []);

  const handleSelectProposal = async (id: string) => {
    setSelectedProposalId(id);
    setSuccessEvent(null);
    try {
      const detail = await api.getProposalDetail(id);
      setSelectedProposal(detail);
      if (detail?.questions?.length > 0) {
        setSelectedQuestion(detail.questions[0]);
        const resp = detail.questions[0].responses?.[0];
        setCorrectedAnswer(resp ? resp.proposed_answer : "");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSelectQuestion = (q: any) => {
    setSelectedQuestion(q);
    setSuccessEvent(null);
    const resp = q.responses?.[q.responses.length - 1];
    setCorrectedAnswer(resp ? resp.proposed_answer : "");
    setCorrectionReason("");
  };

  const handleQuickPreset = (type: "support" | "retention") => {
    if (type === "support") {
      setCorrectedAnswer(
        "Our enterprise support is available 24/5 (Mon-Fri 00:00-23:59 UTC). Emergency escalation for critical P1 incidents is available 24/7 with a guaranteed 15-minute response SLA."
      );
      setCorrectionReason("Original statement overstated standard coverage. Clarified 24/5 baseline vs 24/7 P1 escalation.");
      setCategoryTag("support_coverage");
    } else {
      setCorrectedAnswer(
        "All customer production records and associated backups are completely purged within 30 days post-termination using certified cryptographic erasure in compliance with HIPAA and SOC2 Type II trust principles."
      );
      setCorrectionReason("Replaced 90-day draft with approved 30-day post-termination certified cryptographic destruction policy.");
      setCategoryTag("data_retention");
    }
  };

  const handleSubmitCorrection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuestion) return;
    const resp = selectedQuestion.responses?.[selectedQuestion.responses.length - 1];
    if (!resp) {
      alert("No response available to review. Generate a response first.");
      return;
    }
    if (!correctionReason.trim()) {
      alert("Reviewer Correction Reason is mandatory to create verified institutional learning.");
      return;
    }

    setSubmitting(true);
    setSuccessEvent(null);
    try {
      const res = await api.submitReviewCorrection({
        response_id: resp.id,
        question_id: selectedQuestion.id,
        proposal_id: selectedProposalId,
        original_answer: resp.proposed_answer,
        corrected_answer: correctedAnswer,
        correction_reason: correctionReason,
        category_tag: categoryTag,
        reviewer_name: reviewerName,
        retain_in_hindsight: true
      });
      setSuccessEvent(res);

      // Refresh data
      const updated = await api.getProposalDetail(selectedProposalId);
      setSelectedProposal(updated);
      const updatedQ = updated.questions.find((q: any) => q.id === selectedQuestion.id);
      setSelectedQuestion(updatedQ);
    } catch (err: any) {
      alert(`Correction failed: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const currentResponse = selectedQuestion?.responses?.[selectedQuestion.responses.length - 1];

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <Header
        title="Review & Learning Engine"
        subtitle="Human-in-the-loop verification: capture edit rationales and retain approved claims in Hindsight."
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Left Column: Proposals & Questions */}
        <div className="w-80 border-r border-border bg-surface flex flex-col shrink-0">
          <div className="p-4 border-b border-border space-y-2">
            <label className="text-[10px] font-mono uppercase text-neutral-500">Select Proposal Workspace</label>
            <select
              value={selectedProposalId}
              onChange={(e) => handleSelectProposal(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-surface-elevated border border-border rounded text-white focus:outline-none"
            >
              {proposals.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-border/60">
            {selectedProposal?.questions?.map((q: any) => {
              const isSelected = selectedQuestion?.id === q.id;
              const hasResponse = q.responses?.length > 0;
              const hasReviewEvent = q.responses?.[0]?.review_events?.length > 0;

              return (
                <button
                  key={q.id}
                  onClick={() => handleSelectQuestion(q)}
                  className={`w-full p-4 text-left transition flex items-start justify-between gap-2 ${
                    isSelected ? "bg-surface-elevated text-white border-l-2 border-l-purple-500" : "hover:bg-surface-hover/50 text-neutral-300"
                  }`}
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-1.5 text-[10px] font-mono">
                      <span className="text-purple-400">Req #{q.question_index}</span>
                      <span className="text-neutral-500">·</span>
                      <span className="text-neutral-400 truncate">{q.category}</span>
                    </div>
                    <div className="text-xs font-medium line-clamp-2">{q.question_text}</div>
                  </div>
                  {hasReviewEvent && (
                    <span className="shrink-0 text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      RETAINED
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Review Workspace */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          {selectedQuestion ? (
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Question Context */}
              <div className="p-4 rounded-lg bg-surface border border-border">
                <div className="text-[10px] font-mono text-purple-400 mb-1">
                  REQUIREMENT #{selectedQuestion.question_index} · {selectedQuestion.category}
                </div>
                <h2 className="text-sm font-semibold text-white">{selectedQuestion.question_text}</h2>
              </div>

              {/* Success Retained Banner */}
              {successEvent && (
                <div className="p-4 rounded-lg bg-purple-950/30 border border-purple-500/40 text-xs text-purple-200 space-y-2 animate-fadeIn">
                  <div className="flex items-center gap-2 font-semibold text-purple-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Review Approved & Institutional Memory Retained in Hindsight!</span>
                  </div>
                  <div className="font-mono text-[11px] text-neutral-300 bg-surface/80 p-2.5 rounded border border-purple-900/40 space-y-1">
                    <div>Memory ID: {successEvent.hindsight_memory_id || "mem_retained_001"}</div>
                    <div>Topic: {successEvent.category_tag}</div>
                    <div>Approved By: {successEvent.reviewer_name}</div>
                    <div>Rationale Captured: "{successEvent.correction_reason}"</div>
                  </div>
                </div>
              )}

              {/* Side-by-Side: Original Draft vs Reviewer Editor */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Original AI Draft */}
                <div className="p-4 rounded-lg bg-surface border border-border space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono text-neutral-400 pb-2 border-b border-border">
                    <span>ORIGINAL AI DRAFT</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-elevated text-neutral-400">
                      Mode: {currentResponse?.generation_mode || "MEMORY_OFF"}
                    </span>
                  </div>
                  <div className="text-xs text-neutral-300 leading-relaxed min-h-[140px] whitespace-pre-line p-3 rounded bg-surface-elevated/40 border border-border">
                    {currentResponse?.proposed_answer || "No response generated yet."}
                  </div>
                </div>

                {/* Reviewer Corrected Answer */}
                <div className="p-4 rounded-lg bg-surface border border-purple-500/30 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono text-purple-300 pb-2 border-b border-border">
                    <span className="flex items-center gap-1.5">
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>APPROVED HUMAN TEXT</span>
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleQuickPreset("support")}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-surface-elevated text-purple-400 hover:text-white"
                      >
                        Preset: Support
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickPreset("retention")}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-surface-elevated text-purple-400 hover:text-white"
                      >
                        Preset: Retention
                      </button>
                    </div>
                  </div>
                  <textarea
                    rows={6}
                    value={correctedAnswer}
                    onChange={(e) => setCorrectedAnswer(e.target.value)}
                    className="w-full text-xs text-white bg-surface-elevated p-3 rounded border border-border focus:outline-none focus:border-purple-500 font-sans leading-relaxed"
                    placeholder="Enter approved verified answer text..."
                  />
                </div>
              </div>

              {/* Rationale & Categorization Form */}
              <form onSubmit={handleSubmitCorrection} className="p-6 rounded-lg bg-surface border border-border space-y-4">
                <div className="space-y-1">
                  <h3 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
                    Structured Institutional Learning Event
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Explain why this answer was changed. This explicit rationale is indexed by Hindsight to prevent future proposal iterations from repeating the mistake.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-neutral-300 flex items-center justify-between">
                    <span>Correction Reason & Rationale (Mandatory)</span>
                    <span className="text-[10px] text-purple-400 font-mono">Indexed into Hindsight</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={correctionReason}
                    onChange={(e) => setCorrectionReason(e.target.value)}
                    placeholder="e.g. Original statement overstated standard coverage. Clarified 24/5 baseline vs 24/7 emergency escalation."
                    className="w-full px-3 py-2 text-xs bg-surface-elevated border border-border rounded text-white focus:outline-none focus:border-purple-500 font-sans"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-neutral-300">Category Tag</label>
                    <select
                      value={categoryTag}
                      onChange={(e) => setCategoryTag(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-surface-elevated border border-border rounded text-white focus:outline-none"
                    >
                      <option value="support_coverage">Support Coverage & Hours</option>
                      <option value="data_retention">Data Retention & Purge Timeline</option>
                      <option value="uptime_sla">Uptime SLA & Penalties</option>
                      <option value="data_encryption">Encryption Standards</option>
                      <option value="disaster_recovery">Disaster Recovery (RTO/RPO)</option>
                      <option value="compliance_attestation">Compliance & Audit</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-neutral-300">Approving Reviewer</label>
                    <input
                      type="text"
                      value={reviewerName}
                      onChange={(e) => setReviewerName(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-surface-elevated border border-border rounded text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-border flex items-center justify-between">
                  <div className="text-xs text-neutral-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Retains to Hindsight memory bank & updates Claim Ledger</span>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting || !correctedAnswer || !currentResponse}
                    className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-500 disabled:opacity-50 rounded transition shadow-sm shadow-purple-500/20"
                  >
                    {submitting ? (
                      <span>Retaining to Hindsight...</span>
                    ) : (
                      <>
                        <BrainCircuit className="w-4 h-4" />
                        <span>Approve & Retain in Hindsight</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="text-center text-xs text-neutral-500 py-12">Select a requirement to review.</div>
          )}
        </div>
      </div>
    </div>
  );
}
