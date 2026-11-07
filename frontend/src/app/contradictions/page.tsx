"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { api } from "@/lib/api";
import Link from "next/link";
import {
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  Scale,
  ArrowRight,
  Clock,
  History,
  Check,
  XCircle,
  Sparkles
} from "lucide-react";

export default function ContradictionCenterPage() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [filter, setFilter] = useState<string>("ALL");
  const [loading, setLoading] = useState(true);
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  const loadAlerts = async () => {
    try {
      const data = await api.getContradictions();
      setAlerts(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  const handleResolve = async (alertId: string, resolutionType: "ENFORCE_OLD" | "OVERRIDE_NEW" | "DISMISS") => {
    setResolvingId(alertId);
    try {
      await api.resolveContradiction(
        alertId,
        resolutionType,
        `Resolved via Contradiction Center: ${resolutionType}`
      );
      await loadAlerts();
    } catch (err: any) {
      alert(`Resolution failed: ${err.message}`);
    } finally {
      setResolvingId(null);
    }
  };

  const filtered = alerts.filter((a) => {
    if (filter === "ALL") return true;
    if (filter === "OPEN") return a.status === "OPEN";
    return a.status !== "OPEN";
  });

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <Header
        title="Contradiction Intelligence Center"
        subtitle="Protecting your organization from conflicting commitments and unverified claims."
      />

      <div className="p-8 space-y-6 max-w-6xl mx-auto w-full">
        {/* Banner */}
        <div className="p-5 rounded-lg border border-conflict/40 bg-gradient-to-r from-conflict-subtle to-surface flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-conflict uppercase tracking-wider">
                SIGNATURE DEFENSE LAYER
              </span>
              <span className="text-xs text-neutral-400">Deterministic & Semantic Claim Auditing</span>
            </div>
            <p className="text-xs text-neutral-300">
              When a newly generated response conflicts with a verified historical commitment, PRECEDENT blocks unapproved submission, explains the exact provenance, and requires human resolution.
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 font-mono text-xs text-neutral-400 bg-surface px-3 py-1.5 rounded border border-border">
            <Scale className="w-4 h-4 text-conflict" />
            <span>Active Ledger Rules: 14</span>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            {["ALL", "OPEN", "RESOLVED"].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-3 py-1 text-xs rounded-md transition ${
                  filter === tab
                    ? "bg-surface-elevated text-white font-medium border border-border"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <span className="text-xs text-neutral-500 font-mono">
            {filtered.length} alert{filtered.length === 1 ? "" : "s"} listed
          </span>
        </div>

        {/* Contradiction Cards */}
        <div className="space-y-4">
          {filtered.length === 0 ? (
            <div className="p-12 text-center rounded-lg bg-surface border border-border text-neutral-400 text-xs">
              No contradiction alerts found in this view.
            </div>
          ) : (
            filtered.map((alert) => {
              const isOpen = alert.status === "OPEN";

              return (
                <div
                  key={alert.id}
                  className={`p-6 rounded-lg bg-surface border transition space-y-4 ${
                    isOpen ? "border-conflict/40 shadow-sm shadow-conflict/10" : "border-border opacity-80"
                  }`}
                >
                  {/* Top Bar: Alert Meta */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="w-2 h-2 rounded-full bg-conflict" />
                      <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                        Conflict Alert #{alert.id}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-conflict/20 text-conflict border border-conflict/30">
                        {alert.severity} SEVERITY
                      </span>
                      <span className="text-[10px] font-mono text-neutral-400">
                        Scope: {alert.scope}
                      </span>
                    </div>

                    <div>
                      {isOpen ? (
                        <span className="text-xs font-mono text-conflict font-semibold px-2.5 py-0.5 rounded bg-conflict/10 border border-conflict/30">
                          ACTION REQUIRED
                        </span>
                      ) : (
                        <span className="text-xs font-mono text-emerald-400 font-semibold px-2.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{alert.status}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Conflict Explanation */}
                  <div className="p-3.5 rounded bg-conflict-subtle border border-conflict/30 text-xs text-neutral-200 leading-relaxed">
                    <strong className="text-conflict block font-mono text-[11px] uppercase mb-0.5">
                      Contradiction Breakdown:
                    </strong>
                    {alert.conflict_explanation}
                  </div>

                  {/* Side-by-Side Diff: New Claim vs Approved Historical Precedent */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* New Generated Statement */}
                    <div className="p-4 rounded bg-surface-elevated border border-border space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400 pb-1.5 border-b border-border">
                        <span className="text-conflict font-semibold">NEW UNVERIFIED DRAFT</span>
                        <span>Proposal #{alert.proposal_id}</span>
                      </div>
                      <div className="text-xs text-neutral-300 leading-relaxed font-sans">
                        "{alert.new_claim_text}"
                      </div>
                    </div>

                    {/* Approved Precedent */}
                    <div className="p-4 rounded bg-surface-elevated border border-emerald-500/30 space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-mono text-emerald-400 pb-1.5 border-b border-emerald-900/40">
                        <span className="font-semibold">APPROVED HISTORICAL PRECEDENT</span>
                        <span>Claim #{alert.conflicting_claim_id}</span>
                      </div>
                      <div className="text-xs text-neutral-200 leading-relaxed font-sans">
                        "{alert.conflicting_claim_text}"
                      </div>
                    </div>
                  </div>

                  {/* Recommended Action & Resolution Actions */}
                  {isOpen ? (
                    <div className="pt-3 border-t border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="text-xs text-neutral-400">
                        <strong className="text-neutral-300">Recommended:</strong> {alert.recommended_action}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleResolve(alert.id, "ENFORCE_OLD")}
                          disabled={resolvingId === alert.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded transition shadow-sm"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Enforce Approved Precedent</span>
                        </button>

                        <button
                          onClick={() => handleResolve(alert.id, "OVERRIDE_NEW")}
                          disabled={resolvingId === alert.id}
                          className="px-3 py-1.5 text-xs font-medium text-neutral-300 hover:text-white bg-surface-elevated hover:bg-neutral-700 border border-border rounded transition"
                        >
                          Override & Promote New Standard
                        </button>

                        <button
                          onClick={() => handleResolve(alert.id, "DISMISS")}
                          disabled={resolvingId === alert.id}
                          className="px-2.5 py-1.5 text-xs text-neutral-500 hover:text-neutral-300 transition"
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="pt-2 border-t border-border flex items-center justify-between text-xs text-neutral-500 font-mono">
                      <span>Resolved by: {alert.resolved_by || "Lead Architect"}</span>
                      <span>Date: {alert.resolved_at || alert.created_at}</span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

