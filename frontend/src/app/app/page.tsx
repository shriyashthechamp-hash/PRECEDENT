"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { api } from "@/lib/api";
import Link from "next/link";
import {
  FileText,
  AlertTriangle,
  BrainCircuit,
  TrendingUp,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Scale
} from "lucide-react";

export default function OverviewPage() {
  const [proposals, setProposals] = useState<any[]>([]);
  const [contradictions, setContradictions] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [memories, setMemories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [props, cfls, ana, mems] = await Promise.all([
          api.getProposals(),
          api.getContradictions("OPEN"),
          api.getAnalyticsSummary(),
          api.getMemories()
        ]);
        setProposals(props || []);
        setContradictions(cfls || []);
        setAnalytics(ana?.metrics || null);
        setMemories(mems?.review_provenance_memories || []);
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <Header
        title="Institutional Intelligence Command Center"
        subtitle="Live proposal memory, contradiction protection, and experience-based accuracy."
      />

      <div className="p-8 space-y-6 max-w-7xl mx-auto w-full">
        {/* Banner: Brand Positioning */}
        <div className="p-5 rounded-lg border border-blue-900/40 bg-gradient-to-r from-blue-950/30 via-surface to-surface-elevated flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                PRECEDENT INTELLIGENCE LOOP
              </span>
              <span className="text-xs text-neutral-400">Every bid builds a better next bid.</span>
            </div>
            <p className="text-sm text-neutral-200">
              Unlike traditional proposal tools that store static answers, PRECEDENT captures <strong className="text-white">why</strong> answers were revised, catches historical contradictions before submission, and grounds proposals in verified institutional memory.
            </p>
          </div>
          <Link
            href="/lab"
            className="hidden lg:flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-md transition shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Launch A/B Comparison</span>
          </Link>
        </div>

        {/* Top 4 KPI Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg bg-surface border border-border">
            <div className="flex items-center justify-between text-neutral-400 mb-2">
              <span className="text-xs font-medium">Reviewer Edit Reduction</span>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-white tracking-tight">
              {analytics?.reviewer_edit_reduction_rate ?? (loading ? "..." : "Insufficient Data")}
            </div>
            <p className="text-[11px] text-neutral-400 mt-1">
              Fewer corrections needed per proposal over time
            </p>
          </div>

          <div className="p-4 rounded-lg bg-surface border border-border">
            <div className="flex items-center justify-between text-neutral-400 mb-2">
              <span className="text-xs font-medium">Contradiction Defense</span>
              <AlertTriangle className="w-4 h-4 text-conflict" />
            </div>
            <div className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <span>{contradictions.length}</span>
              {contradictions.length > 0 ? (
                <span className="text-xs font-normal text-conflict px-2 py-0.5 rounded bg-conflict/10 border border-conflict/30">
                  Active Conflict
                </span>
              ) : (
                <span className="text-xs font-normal text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30">
                  Protected
                </span>
              )}
            </div>
            <p className="text-[11px] text-neutral-400 mt-1">
              {contradictions.length > 0 ? "Blocks submission until resolved" : "Zero active claim collisions"}
            </p>
          </div>

          <div className="p-4 rounded-lg bg-surface border border-border">
            <div className="flex items-center justify-between text-neutral-400 mb-2">
              <span className="text-xs font-medium">Hindsight Memories</span>
              <BrainCircuit className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl font-bold text-white tracking-tight">
              {analytics?.retained_institutional_memories !== undefined ? analytics.retained_institutional_memories : (loading ? "..." : memories.length)}
            </div>
            <p className="text-[11px] text-neutral-400 mt-1">
              Verified reviewer corrections retained & scoped
            </p>
          </div>

          <div className="p-4 rounded-lg bg-surface border border-border">
            <div className="flex items-center justify-between text-neutral-400 mb-2">
              <span className="text-xs font-medium">Historical Win Rate</span>
              <CheckCircle2 className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl font-bold text-white tracking-tight">
              {analytics?.historical_win_rate ?? (loading ? "..." : "No recorded outcomes")}
            </div>
            <p className="text-[11px] text-neutral-400 mt-1">
              {analytics?.won_bids_count !== undefined ? `${analytics.won_bids_count} won, ${analytics.lost_bids_count} lost recorded bids` : "Based on recorded bid outcomes"}
            </p>
          </div>
        </div>

        {/* Active Contradiction Alert Banner (if any) */}
        {contradictions.length > 0 && (
          <div className="p-4 rounded-lg border border-conflict/40 bg-conflict-subtle/50 flex items-start justify-between">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-conflict shrink-0 mt-0.5" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-conflict uppercase tracking-wider">
                    Critical Contradiction Detected
                  </span>
                  <span className="text-xs text-neutral-300 font-mono">
                    Claim #clm_data_retention vs Proposal Draft
                  </span>
                </div>
                <p className="text-xs text-neutral-200 mt-1">
                  {contradictions[0].conflict_explanation}
                </p>
              </div>
            </div>
            <Link
              href="/contradictions"
              className="px-3 py-1.5 text-xs font-medium text-white bg-conflict hover:bg-red-600 rounded transition shrink-0 ml-4 flex items-center gap-1.5"
            >
              <span>Resolve in Contradiction Center</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {/* Two Column Layout: Proposals & Memory Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Proposals in Progress */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-400" />
                <span>Active Proposals & RFPs</span>
              </h2>
              <Link href="/proposals" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
                <span>View all</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="space-y-3">
              {proposals.length === 0 ? (
                <div className="p-8 text-center rounded-lg bg-surface border border-border space-y-3">
                  <FileText className="w-8 h-8 text-neutral-500 mx-auto" />
                  <p className="text-sm font-medium text-neutral-300">No active proposals in workspace</p>
                  <p className="text-xs text-neutral-500">Upload your first enterprise RFP document to begin institutional reasoning.</p>
                  <Link href="/proposals/upload" className="inline-block px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 rounded transition">
                    Upload RFP Document
                  </Link>
                </div>
              ) : (
                proposals.map((prop) => (
                  <div
                    key={prop.id}
                    className="p-4 rounded-lg bg-surface border border-border hover:border-neutral-700 transition space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface-elevated text-neutral-400 border border-border">
                            {prop.rfp_reference || prop.id}
                          </span>
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                              prop.status === "SUBMITTED"
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                                : prop.status === "IN_REVIEW"
                                ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                                : "bg-blue-500/10 text-blue-400 border border-blue-500/30"
                            }`}
                          >
                            {prop.status}
                          </span>
                        </div>
                        <h3 className="text-sm font-semibold text-white mt-1.5">{prop.title}</h3>
                      </div>
                      <Link
                        href={`/proposals/${prop.id}`}
                        className="px-2.5 py-1 text-xs text-neutral-300 hover:text-white bg-surface-elevated hover:bg-surface-hover border border-border rounded transition"
                      >
                        Open Workspace
                      </Link>
                    </div>

                    <div className="flex items-center justify-between text-xs text-neutral-400 pt-2 border-t border-border/60">
                      <div className="flex items-center gap-4">
                        <span>Questions: {prop.total_questions}</span>
                        <span>Deadline: {prop.deadline || "Open"}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-blue-400">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Institutional Memory Active</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right Column: Institutional Memory Activity */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <BrainCircuit className="w-4 h-4 text-purple-400" />
                <span>Recent Institutional Memories</span>
              </h2>
              <Link href="/memory" className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1">
                <span>Explorer</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="p-4 rounded-lg bg-surface border border-border space-y-3">
              {memories.length === 0 ? (
                <div className="text-xs text-neutral-500 py-4 text-center">No memories retained yet.</div>
              ) : (
                memories.slice(0, 4).map((m, idx) => (
                  <div key={idx} className="pb-3 border-b border-border/60 last:border-0 last:pb-0 space-y-1.5">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-mono text-purple-400 px-1.5 py-0.5 rounded bg-purple-500/10 border border-purple-500/20">
                        {m.category || "reviewer_correction"}
                      </span>
                      <span className="text-neutral-500">{m.reviewer || "Domain Lead"}</span>
                    </div>
                    <p className="text-xs text-neutral-200 line-clamp-2">{m.text}</p>
                    <div className="text-[11px] text-neutral-400 italic">
                      Reason: "{m.correction_reason}"
                    </div>
                  </div>
                ))
              )}

              <Link
                href="/review"
                className="block text-center w-full py-2 text-xs font-medium text-purple-300 hover:text-white bg-surface-elevated hover:bg-surface-hover border border-border rounded transition mt-3"
              >
                Go to Review Center
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
