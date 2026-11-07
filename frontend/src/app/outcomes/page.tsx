"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { api } from "@/lib/api";
import {
  Award,
  CheckCircle2,
  XCircle,
  TrendingUp,
  BrainCircuit,
  Plus,
  ArrowRight,
  MessageSquare
} from "lucide-react";

export default function BidOutcomesPage() {
  const [outcomes, setOutcomes] = useState<any[]>([]);
  const [proposals, setProposals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form
  const [proposalId, setProposalId] = useState("");
  const [outcome, setOutcome] = useState("WON");
  const [contractValue, setContractValue] = useState("$500,000 ARR");
  const [feedback, setFeedback] = useState("");
  const [primaryReason, setPrimaryReason] = useState("Technical Capability");

  const loadData = async () => {
    try {
      const [outs, props] = await Promise.all([api.getOutcomes(), api.getProposals()]);
      setOutcomes(outs || []);
      setProposals(props || []);
      if (props?.length > 0) setProposalId(props[0].id);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRecordOutcome = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proposalId) return;
    try {
      await api.recordOutcome({
        proposal_id: proposalId,
        outcome,
        contract_value: contractValue,
        evaluator_feedback: feedback,
        primary_reason: primaryReason
      });
      setShowModal(false);
      setFeedback("");
      await loadData();
    } catch (err: any) {
      alert(`Failed to record outcome: ${err.message}`);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <Header
        title="Bid Outcome Intelligence"
        subtitle="Capturing verified win/loss feedback and evaluator remarks into Hindsight reflection."
        action={
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-md transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Record Bid Outcome</span>
          </button>
        }
      />

      <div className="p-8 space-y-6 max-w-6xl mx-auto w-full">
        {/* Banner */}
        <div className="p-4 rounded-lg bg-surface border border-border flex items-center justify-between text-xs text-neutral-300">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-purple-400" />
            <span>
              Every confirmed bid outcome is retained in Hindsight to guide future proposal pricing and architecture.
            </span>
          </div>
          <span className="font-mono text-neutral-400">{outcomes.length} Historical Outcomes</span>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 animate-fadeIn">
            <div className="bg-surface border border-border rounded-lg max-w-md w-full p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">Record Proposal Outcome</h3>
                <button onClick={() => setShowModal(false)} className="text-neutral-500 hover:text-white">
                  ✕
                </button>
              </div>

              <form onSubmit={handleRecordOutcome} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs text-neutral-300">Proposal</label>
                  <select
                    value={proposalId}
                    onChange={(e) => setProposalId(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-surface-elevated border border-border rounded text-white focus:outline-none"
                  >
                    {proposals.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs text-neutral-300">Outcome</label>
                    <select
                      value={outcome}
                      onChange={(e) => setOutcome(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-surface-elevated border border-border rounded text-white focus:outline-none"
                    >
                      <option value="WON">WON</option>
                      <option value="LOST">LOST</option>
                      <option value="WITHDRAWN">WITHDRAWN</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-neutral-300">Contract Value (ARR)</label>
                    <input
                      type="text"
                      value={contractValue}
                      onChange={(e) => setContractValue(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-surface-elevated border border-border rounded text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-neutral-300">Primary Determining Factor</label>
                  <select
                    value={primaryReason}
                    onChange={(e) => setPrimaryReason(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-surface-elevated border border-border rounded text-white focus:outline-none"
                  >
                    <option value="Technical Capability">Technical Capability</option>
                    <option value="Pricing">Pricing & Terms</option>
                    <option value="Compliance">Compliance & Security</option>
                    <option value="Implementation">Implementation Timeline</option>
                    <option value="Product Fit">Product Fit</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-neutral-300">Evaluator Feedback Remarks</label>
                  <textarea
                    rows={3}
                    required
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Enter verbatim or synthesized debrief remarks from the evaluation committee..."
                    className="w-full px-3 py-1.5 text-xs bg-surface-elevated border border-border rounded text-white focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-3 py-1.5 text-xs text-neutral-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded transition"
                  >
                    Record & Retain
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Outcomes List */}
        <div className="space-y-4">
          {outcomes.map((out) => {
            const isWon = out.outcome === "WON";
            return (
              <div
                key={out.id}
                className={`p-6 rounded-lg bg-surface border transition space-y-3 ${
                  isWon ? "border-emerald-500/30" : "border-border"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded ${
                        isWon
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                          : "bg-neutral-800 text-neutral-400 border border-neutral-700"
                      }`}
                    >
                      {out.outcome}
                    </span>
                    <span className="text-sm font-semibold text-white font-mono">{out.contract_value}</span>
                    <span className="text-xs text-neutral-400 font-mono">Proposal #{out.proposal_id}</span>
                  </div>
                  <span className="text-xs font-mono text-purple-400 px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20">
                    Factor: {out.primary_reason}
                  </span>
                </div>

                {out.evaluator_feedback && (
                  <div className="text-xs text-neutral-200 leading-relaxed bg-surface-elevated p-3.5 rounded border border-border space-y-1">
                    <div className="text-[10px] font-mono uppercase text-neutral-400">Evaluator Debrief Remarks:</div>
                    <p>"{out.evaluator_feedback}"</p>
                  </div>
                )}

                <div className="flex items-center justify-between text-[11px] text-neutral-500 pt-2 border-t border-border/60">
                  <span>Recorded By: {out.recorded_by}</span>
                  <div className="flex items-center gap-1.5 text-purple-400">
                    <BrainCircuit className="w-3.5 h-3.5" />
                    <span>Retained to Hindsight Experience Bank</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
