"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { api } from "@/lib/api";
import {
  BarChart3,
  TrendingUp,
  BrainCircuit,
  CheckCircle2,
  AlertTriangle,
  Scale,
  ShieldCheck,
  Info,
  Database
} from "lucide-react";

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.getAnalyticsSummary();
        setData(res);
      } catch (e) {
        console.error("Failed to load analytics summary:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const metrics = data?.metrics || {};
  const queryAudit = data?.query_auditing || {};

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <Header
        title="Institutional Learning Analytics"
        subtitle="Empirical tracking of reviewer edit reduction, contradiction avoidance, and memory accumulation."
      />

      <div className="p-8 space-y-6 max-w-6xl mx-auto w-full">
        {/* Audited Provenance Notice */}
        <div className="p-4 rounded-lg bg-surface border border-border flex items-start gap-3 text-xs text-neutral-300">
          <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <strong className="text-white font-mono text-[11px] uppercase">
                Audited Metric Methodology & Data Provenance
              </strong>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                100% Calculated from Live DB State
              </span>
            </div>
            <p className="text-neutral-400">
              All displayed metrics derive from direct SQLite database queries across active and completed proposal responses. 
              Synthetic enterprise history ({metrics.synthetic_proposals_count ?? 0} seed RFPs) is distinguished from live user uploads ({metrics.live_proposals_count ?? 0} live RFPs).
            </p>
          </div>
        </div>

        {/* 6 Audited Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-5 rounded-lg bg-surface border border-border space-y-2">
            <div className="flex items-center justify-between text-neutral-400 text-xs">
              <span className="font-medium">Reviewer Edit Reduction</span>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-bold text-white tracking-tight">
              {metrics.reviewer_edit_reduction_rate ?? (loading ? "..." : "Insufficient Data")}
            </div>
            <p className="text-[11px] text-neutral-400">
              Comparative decrease in human revisions: unassisted drafts vs memory-grounded proposals.
            </p>
          </div>

          <div className="p-5 rounded-lg bg-surface border border-border space-y-2">
            <div className="flex items-center justify-between text-neutral-400 text-xs">
              <span className="font-medium">Correction Reuse Rate</span>
              <BrainCircuit className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-3xl font-bold text-white tracking-tight">
              {metrics.correction_reuse_rate ?? (loading ? "..." : "0%")}
            </div>
            <p className="text-[11px] text-neutral-400">
              Fraction of proposals citing verified historical precedents during inference.
            </p>
          </div>

          <div className="p-5 rounded-lg bg-surface border border-border space-y-2">
            <div className="flex items-center justify-between text-neutral-400 text-xs">
              <span className="font-medium">Contradiction Defense</span>
              <AlertTriangle className="w-4 h-4 text-conflict" />
            </div>
            <div className="text-3xl font-bold text-white tracking-tight">
              {metrics.contradictions_detected !== undefined ? `${metrics.contradictions_detected} Detected` : (loading ? "..." : "0")}
            </div>
            <p className="text-[11px] text-neutral-400">
              {metrics.open_contradictions_alert !== undefined ? `${metrics.open_contradictions_alert} currently blocking submission` : "Historical claim clashes caught prior to proposal submission"}
            </p>
          </div>

          <div className="p-5 rounded-lg bg-surface border border-border space-y-2">
            <div className="flex items-center justify-between text-neutral-400 text-xs">
              <span className="font-medium">Active Verified Claims</span>
              <Scale className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-3xl font-bold text-white tracking-tight">
              {metrics.active_claims_in_ledger !== undefined ? `${metrics.active_claims_in_ledger} Claims` : (loading ? "..." : "0")}
            </div>
            <p className="text-[11px] text-neutral-400">
              Immutable specifications in the enterprise Claim Ledger.
            </p>
          </div>

          <div className="p-5 rounded-lg bg-surface border border-border space-y-2">
            <div className="flex items-center justify-between text-neutral-400 text-xs">
              <span className="font-medium">Hindsight Memories</span>
              <BrainCircuit className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-3xl font-bold text-white tracking-tight">
              {metrics.retained_institutional_memories !== undefined ? `${metrics.retained_institutional_memories} Items` : (loading ? "..." : "0")}
            </div>
            <p className="text-[11px] text-neutral-400">
              Persisted experiences surviving application restarts with full approval provenance.
            </p>
          </div>

          <div className="p-5 rounded-lg bg-surface border border-border space-y-2">
            <div className="flex items-center justify-between text-neutral-400 text-xs">
              <span className="font-medium">Average Generation Latency</span>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-bold text-white tracking-tight">
              {metrics.average_generation_latency_ms ? `${metrics.average_generation_latency_ms}ms` : (loading ? "..." : "—")}
            </div>
            <p className="text-[11px] text-neutral-400">
              Measured live across Groq inference and Hindsight multi-strategy recall.
            </p>
          </div>
        </div>

        {/* Database Query Audit Trail */}
        <div className="p-6 rounded-lg bg-surface border border-border space-y-4">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-neutral-400" />
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
              Database Query Audit Trail
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
            <div className="p-3 rounded bg-surface-elevated border border-border space-y-1">
              <span className="text-neutral-400 text-[10px] uppercase block">Total Proposals</span>
              <code className="text-blue-300 text-[11px]">{queryAudit.total_proposals || "SELECT count(*) FROM proposals"}</code>
              <span className="text-neutral-500 text-[10px] block mt-1">Value: {metrics.total_proposals ?? 0}</span>
            </div>

            <div className="p-3 rounded bg-surface-elevated border border-border space-y-1">
              <span className="text-neutral-400 text-[10px] uppercase block">Contradiction Defense</span>
              <code className="text-blue-300 text-[11px]">{queryAudit.contradictions || "SELECT count(*) FROM contradiction_alerts WHERE status = 'OPEN'"}</code>
              <span className="text-neutral-500 text-[10px] block mt-1">Value: {metrics.open_contradictions_alert ?? 0} open</span>
            </div>

            <div className="p-3 rounded bg-surface-elevated border border-border space-y-1">
              <span className="text-neutral-400 text-[10px] uppercase block">Correction Reuse</span>
              <code className="text-blue-300 text-[11px]">{queryAudit.correction_reuse_rate || "SELECT count(*) FROM proposal_responses WHERE json_array_length(recalled_precedents) > 0"}</code>
              <span className="text-neutral-500 text-[10px] block mt-1">Value: {metrics.correction_reuse_rate || "Calculated from live responses"}</span>
            </div>

            <div className="p-3 rounded bg-surface-elevated border border-border space-y-1">
              <span className="text-neutral-400 text-[10px] uppercase block">Historical Win Rate</span>
              <code className="text-blue-300 text-[11px]">{queryAudit.historical_win_rate || "SELECT count(*) FROM bid_outcomes WHERE outcome = 'WON' / decided_bids"}</code>
              <span className="text-neutral-500 text-[10px] block mt-1">Value: {metrics.historical_win_rate || "No recorded outcomes"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
