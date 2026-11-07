"use client";

import { useEffect, useState, use } from "react";
import { Header } from "@/components/Header";
import { api } from "@/lib/api";
import Link from "next/link";
import {
  FileText,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Edit3,
  Clock,
  ArrowLeft,
  Layers,
  ChevronRight,
  BookOpen
} from "lucide-react";

export default function ProposalWorkspacePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const proposalId = resolvedParams.id;

  const [proposal, setProposal] = useState<any>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<any>(null);
  const [generating, setGenerating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [generationMode, setGenerationMode] = useState<"MEMORY_ON" | "MEMORY_OFF">("MEMORY_ON");
  const [loading, setLoading] = useState(true);
  const [alertNotice, setAlertNotice] = useState<any>(null);
  const [submitError, setSubmitError] = useState<any>(null);

  const handleSubmitProposal = async () => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await api.submitProposal(proposalId);
      const updated = await api.getProposalDetail(proposalId);
      setProposal(updated);
      alert("Proposal successfully submitted! All claims and commitments verified.");
    } catch (e: any) {
      setSubmitError(e.message || "Submission blocked: unresolved contradictions remain.");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    async function load() {
      try {
        const data = await api.getProposalDetail(proposalId);
        setProposal(data);
        if (data?.questions?.length > 0) {
          setSelectedQuestion(data.questions[0]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [proposalId]);

  const handleGenerate = async (mode: "MEMORY_ON" | "MEMORY_OFF") => {
    if (!selectedQuestion) return;
    setGenerating(true);
    setAlertNotice(null);
    try {
      const res = await api.generateResponse(proposalId, selectedQuestion.id, mode);
      // Reload proposal details to show newly generated response
      const updated = await api.getProposalDetail(proposalId);
      setProposal(updated);
      const updatedQ = updated.questions.find((q: any) => q.id === selectedQuestion.id);
      setSelectedQuestion(updatedQ);

      if (res.contradictions_detected > 0) {
        setAlertNotice({
          type: "CONTRADICTION",
          msg: `Contradiction detected: ${res.contradiction_alerts[0]?.conflict_explanation}`
        });
      }
    } catch (e: any) {
      alert(`Generation failed: ${e.message}`);
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center text-neutral-500 text-xs">
        Loading proposal workspace...
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-neutral-400 p-8 space-y-3">
        <p>Proposal workspace not found.</p>
        <Link href="/proposals" className="text-xs text-blue-400 hover:underline">
          Return to Proposals list
        </Link>
      </div>
    );
  }

  const latestResponse = selectedQuestion?.responses?.[selectedQuestion.responses.length - 1];

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <Header
        title={proposal.title}
        subtitle={`${proposal.rfp_reference || proposal.id} · ${proposal.client?.name || "Enterprise Client"} (${proposal.sector?.name || "Regulated"})`}
        action={
          <div className="flex items-center gap-2">
            <Link
              href="/proposals"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-neutral-400 hover:text-white bg-surface-elevated border border-border rounded transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>All Proposals</span>
            </Link>
            {proposal.status !== "SUBMITTED" ? (
              <button
                onClick={handleSubmitProposal}
                disabled={submitting}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 rounded transition shadow-sm"
              >
                {submitting ? (
                  <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                )}
                <span>Submit Proposal</span>
              </button>
            ) : (
              <span className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>SUBMITTED</span>
              </span>
            )}
          </div>
        }
      />

      {/* Main Workspace Split View */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Column: Question Navigator */}
        <div className="w-80 border-r border-border bg-surface flex flex-col shrink-0">
          <div className="p-4 border-b border-border flex items-center justify-between text-xs text-neutral-400 font-mono">
            <span>REQUIREMENTS ({proposal.questions?.length})</span>
            <span className="text-[10px] text-neutral-500">Page coordinates preserved</span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-border/60">
            {proposal.questions?.map((q: any) => {
              const hasResponse = q.responses?.length > 0;
              const isSelected = selectedQuestion?.id === q.id;
              const isApproved = q.responses?.some((r: any) => r.status === "ACCEPTED" || r.status === "EDITED");

              return (
                <button
                  key={q.id}
                  onClick={() => {
                    setSelectedQuestion(q);
                    setAlertNotice(null);
                  }}
                  className={`w-full p-4 text-left transition flex items-start justify-between gap-3 ${
                    isSelected
                      ? "bg-surface-elevated text-white border-l-2 border-l-blue-500"
                      : "hover:bg-surface-hover/50 text-neutral-300"
                  }`}
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-1.5 text-[10px] font-mono">
                      <span className="text-blue-400">Req #{q.question_index}</span>
                      <span className="text-neutral-500">·</span>
                      <span className="text-neutral-400 truncate">{q.category}</span>
                    </div>
                    <div className="text-xs font-medium line-clamp-2 leading-relaxed">
                      {q.question_text}
                    </div>
                  </div>

                  <div className="shrink-0 mt-1">
                    {isApproved ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    ) : hasResponse ? (
                      <span className="w-2 h-2 rounded-full bg-blue-400 block" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-neutral-600 block" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Question & Generated Answer Workspace */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          {selectedQuestion ? (
            <div className="space-y-6 max-w-4xl mx-auto">
              {/* Question Card */}
              <div className="p-6 rounded-lg bg-surface border border-border space-y-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      Section: {selectedQuestion.section}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-surface-elevated text-neutral-300 border border-border">
                      {selectedQuestion.category}
                    </span>
                    {selectedQuestion.is_mandatory && (
                      <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px]">
                        Mandatory
                      </span>
                    )}
                  </div>
                  <span className="text-neutral-500">Ref: Page {selectedQuestion.page_reference || 1}</span>
                </div>

                <h2 className="text-base font-semibold text-white leading-relaxed">
                  {selectedQuestion.question_text}
                </h2>

                {selectedQuestion.evaluation_criteria && (
                  <div className="text-xs text-neutral-400 pt-2 border-t border-border flex items-center gap-2">
                    <BookOpen className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                    <span>Evaluation Criteria: {selectedQuestion.evaluation_criteria}</span>
                  </div>
                )}
              </div>

              {/* Submission Blocked Alert Banner */}
              {submitError && (
                <div className="p-4 rounded-lg bg-conflict-subtle border border-conflict text-xs text-conflict flex items-start justify-between gap-3 animate-fadeIn">
                  <div className="flex items-start gap-2.5">
                    <AlertTriangle className="w-5 h-5 text-conflict shrink-0 mt-0.5" />
                    <div>
                      <strong className="block font-bold text-sm text-conflict">
                        Submission Blocked: Contradiction Gate Active
                      </strong>
                      <p className="text-neutral-200 mt-1">
                        {submitError}
                      </p>
                      <p className="text-[11px] text-neutral-400 mt-1">
                        PRECEDENT policy strictly prohibits submitting proposals with open HIGH-severity claim contradictions.
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/contradictions"
                    className="px-3 py-1.5 text-xs font-semibold text-white bg-conflict hover:bg-red-600 rounded transition shrink-0"
                  >
                    Resolve in Contradiction Center
                  </Link>
                </div>
              )}

              {/* Contradiction / Conflict Notice Banner */}
              {alertNotice && (
                <div className="p-4 rounded-lg bg-conflict-subtle border border-conflict/40 text-xs text-conflict flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{alertNotice.msg}</span>
                  </div>
                  <Link
                    href="/contradictions"
                    className="px-2.5 py-1 text-[11px] font-medium text-white bg-conflict rounded hover:bg-red-600 transition"
                  >
                    View Conflict
                  </Link>
                </div>
              )}

              {/* Generation Controls */}
              <div className="flex items-center justify-between p-4 rounded-lg bg-surface-elevated border border-border">
                <div className="flex items-center gap-3">
                  <div className="text-xs font-medium text-neutral-300">Generation Engine:</div>
                  <div className="flex rounded-md bg-surface p-0.5 border border-border">
                    <button
                      type="button"
                      onClick={() => setGenerationMode("MEMORY_ON")}
                      className={`px-3 py-1 text-xs rounded transition flex items-center gap-1.5 ${
                        generationMode === "MEMORY_ON"
                          ? "bg-blue-600 text-white font-medium shadow-sm"
                          : "text-neutral-400 hover:text-white"
                      }`}
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Memory ON (Hindsight)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setGenerationMode("MEMORY_OFF")}
                      className={`px-3 py-1 text-xs rounded transition flex items-center gap-1.5 ${
                        generationMode === "MEMORY_OFF"
                          ? "bg-neutral-700 text-white font-medium"
                          : "text-neutral-400 hover:text-white"
                      }`}
                    >
                      <span>Memory OFF (Baseline)</span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleGenerate(generationMode)}
                    disabled={generating}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded transition shadow-sm"
                  >
                    {generating ? (
                      <>
                        <span className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        <span>Inferring with {generationMode}...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{latestResponse ? "Regenerate Answer" : "Generate Proposal Response"}</span>
                      </>
                    )}
                  </button>

                  <Link
                    href={`/lab?q=${selectedQuestion.id}&p=${proposalId}`}
                    className="px-3 py-2 text-xs text-neutral-300 hover:text-white bg-surface hover:bg-surface-hover border border-border rounded transition"
                  >
                    Compare A/B
                  </Link>
                </div>
              </div>

              {/* Proposal Response Card */}
              {latestResponse ? (
                <div className="p-6 rounded-lg bg-surface border border-border space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-border">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold text-white">Generated Response</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-elevated text-neutral-400 border border-border">
                        Mode: {latestResponse.generation_mode}
                      </span>
                      <span className="text-[10px] font-mono text-neutral-500">
                        {latestResponse.generation_latency_ms}ms
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 text-xs font-mono" title="Model generation probability estimation. Not factual certainty; human review is required.">
                        <span className="text-neutral-400">Model Conf:</span>
                        <span className="text-emerald-400 font-bold">
                          {Math.round(latestResponse.confidence_score * 100)}%
                        </span>
                        <span className="text-[10px] text-neutral-500 font-normal border-b border-dotted border-neutral-600 cursor-help">
                          (statistical likelihood)
                        </span>
                      </div>
                      <Link
                        href={`/review?rsp=${latestResponse.id}`}
                        className="flex items-center gap-1 px-3 py-1 text-xs font-medium text-purple-300 hover:text-white bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 rounded transition"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Review & Correct</span>
                      </Link>
                    </div>
                  </div>

                  {/* Body Text */}
                  <div className="text-xs text-neutral-200 leading-relaxed whitespace-pre-line p-4 rounded bg-surface-elevated/60 border border-border">
                    {latestResponse.proposed_answer}
                  </div>

                  {/* Sources & Citations */}
                  {latestResponse.supporting_sources?.length > 0 && (
                    <div className="space-y-1.5 pt-2">
                      <div className="text-[11px] font-mono text-neutral-400">Supporting Evidence Sources:</div>
                      <div className="flex flex-wrap gap-2">
                        {latestResponse.supporting_sources.map((src: string, i: number) => (
                          <span
                            key={i}
                            className="text-[10px] px-2 py-0.5 rounded bg-surface-elevated text-neutral-300 border border-border"
                          >
                            {src}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recalled Precedents (if any) */}
                  {latestResponse.recalled_precedents?.length > 0 && (
                    <div className="space-y-1.5 pt-2">
                      <div className="text-[11px] font-mono text-purple-400 flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Recalled Institutional Precedents:</span>
                      </div>
                      <div className="space-y-1">
                        {latestResponse.recalled_precedents.map((prec: string, i: number) => (
                          <div
                            key={i}
                            className="text-[11px] p-2.5 rounded bg-purple-950/20 border border-purple-900/30 text-purple-200"
                          >
                            {prec}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-12 text-center rounded-lg bg-surface border border-dashed border-border space-y-3">
                  <Sparkles className="w-8 h-8 text-neutral-600 mx-auto" />
                  <div className="text-xs text-neutral-400">
                    No answer generated for Requirement #{selectedQuestion.question_index} yet.
                  </div>
                  <button
                    onClick={() => handleGenerate(generationMode)}
                    disabled={generating}
                    className="px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 rounded transition"
                  >
                    Generate Response with PRECEDENT
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-xs text-neutral-500 py-12">
              Select a requirement from the left panel.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

