"use client";

import { FileSpreadsheet, Brain, Sparkles, ShieldAlert, Users, Award, ArrowUpRight, Scale, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export function BentoGrid() {
  return (
    <section id="platform" className="py-24 border-b border-white/[0.08] relative overflow-hidden bg-[#08090D]">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="space-y-4 max-w-3xl mb-14">
          <span className="text-xs font-mono tracking-widest text-aurora-teal uppercase">
            Platform Capabilities
          </span>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#F5F5F7] leading-tight">
            Engineered for high-stakes enterprise bids.
          </h2>
          <p className="text-sm sm:text-base text-[#9295A1] leading-relaxed">
            Every capability is designed to capture, verify, and enforce institutional knowledge where standard AI falls short.
          </p>
        </div>

        {/* Asymmetrical Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {/* Bento Item 1: Wide Card (2 cols) — Institutional Memory */}
          <div className="md:col-span-2 lg:col-span-2 p-6 rounded-xl bg-[#111319] border border-white/[0.08] hover:border-aurora-violet/40 transition flex flex-col justify-between group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-aurora-violet/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="space-y-3 relative z-10">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider text-aurora-violet px-2 py-0.5 rounded bg-aurora-violet/10 border border-aurora-violet/20">
                  CORE ENGINE
                </span>
                <span className="text-xs text-[#9295A1] font-mono">Hindsight Daemon / SQLite</span>
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">
                Institutional Memory & Provenance
              </h3>
              <p className="text-xs sm:text-sm text-[#9295A1] leading-relaxed max-w-md">
                Unlike vector databases that merely index text embeddings, PRECEDENT captures structured organizational experiences: who made the decision, what was corrected, why it was changed, and what client boundaries apply.
              </p>
            </div>

            {/* Visual simulation inside card */}
            <div className="mt-6 p-3 rounded-lg bg-[#0D0F15] border border-white/[0.06] font-mono text-[11px] space-y-2 relative z-10">
              <div className="flex items-center justify-between text-neutral-400 text-[10px]">
                <span>MEMORY_RECORD #rec_hindsight_992</span>
                <span className="text-emerald-400">STATUS: RETAINED</span>
              </div>
              <div className="text-neutral-300">
                <span className="text-purple-400">REASON:</span> "Enterprise SLA requires 24/5 core plus 24/7 P1 escalation."
              </div>
              <div className="flex items-center gap-3 text-[10px] text-neutral-500 pt-1 border-t border-white/5">
                <span>Domain: sarah.jenkins@arch</span>
                <span>Scope: Global (Non-Quarantined)</span>
              </div>
            </div>
          </div>

          {/* Bento Item 2: Precedent Contextual Retrieval */}
          <div className="p-6 rounded-xl bg-[#111319] border border-white/[0.08] hover:border-aurora-teal/40 transition flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider text-aurora-teal px-2 py-0.5 rounded bg-aurora-teal/10 border border-aurora-teal/20">
                  RETRIEVAL
                </span>
                <Sparkles className="w-4 h-4 text-aurora-teal" />
              </div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Real-Time Precedent Recall
              </h3>
              <p className="text-xs text-[#9295A1] leading-relaxed">
                Automatically surfaces relevant historical decisions as new RFPs are drafted, citing verified past reviews directly in proposal prompt context.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs text-neutral-400 font-mono">
              <span>Avg Latency: ~18ms</span>
              <span className="text-aurora-teal">Recall Grounded</span>
            </div>
          </div>

          {/* Bento Item 3: Contradiction Intelligence Gate */}
          <div className="p-6 rounded-xl bg-[#111319] border border-conflict/30 hover:border-conflict transition flex flex-col justify-between group relative overflow-hidden">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider text-conflict px-2 py-0.5 rounded bg-conflict/10 border border-conflict/20">
                  HARD DEFENSE
                </span>
                <ShieldAlert className="w-4 h-4 text-conflict" />
              </div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Contradiction Defense Sentinel
              </h3>
              <p className="text-xs text-[#9295A1] leading-relaxed">
                Deterministic detection scans outgoing drafts against historical commitments. Conflicting claims physically block final submission until domain architects approve.
              </p>
            </div>

            <div className="mt-6 p-2 rounded bg-conflict-subtle border border-conflict/30 text-[10px] font-mono text-conflict flex items-center gap-1.5">
              <span>Submission Gate: HARD BLOCK ON HIGH CONFLICT</span>
            </div>
          </div>

          {/* Bento Item 4: Proposal Ingestion & Workspace */}
          <div className="p-6 rounded-xl bg-[#111319] border border-white/[0.08] hover:border-white/20 transition flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 px-2 py-0.5 rounded bg-white/[0.04] border border-white/5">
                  INGESTION
                </span>
                <FileSpreadsheet className="w-4 h-4 text-blue-400" />
              </div>
              <h3 className="text-base font-bold text-white tracking-tight">
                RFP Section Extraction
              </h3>
              <p className="text-xs text-[#9295A1] leading-relaxed">
                Parses 100+ page PDF and DOCX specifications into discrete requirements with deadline tracking and section mapping.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-white/[0.06] text-[10px] font-mono text-neutral-400">
              Native pypdf / python-docx pipeline
            </div>
          </div>

          {/* Bento Item 5: Wide Card (2 cols) — Memory ON vs OFF Lab */}
          <div className="md:col-span-2 lg:col-span-2 p-6 rounded-xl bg-[#111319] border border-white/[0.08] hover:border-aurora-violet/40 transition flex flex-col justify-between group relative overflow-hidden">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider text-purple-400 px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20">
                  EMPIRICAL LAB
                </span>
                <span className="text-xs text-neutral-400 font-mono">Statistical token confidence</span>
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">
                Memory ON vs OFF A/B Laboratory
              </h3>
              <p className="text-xs sm:text-sm text-[#9295A1] leading-relaxed max-w-lg">
                No marketing hand-waving. The platform runs side-by-side empirical evaluations using the identical base model, prompt parameters, and test questions, measuring exact character diff reductions and contradiction prevention.
              </p>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-2.5 rounded bg-[#0D0F15] border border-white/[0.06] space-y-1">
                <span className="text-[10px] text-neutral-500 uppercase">Variant A (Memory OFF)</span>
                <div className="text-amber-400 font-bold">Unassisted Baseline</div>
                <div className="text-[10px] text-neutral-400">Susceptible to past drift</div>
              </div>
              <div className="p-2.5 rounded bg-[#0D0F15] border border-aurora-violet/30 space-y-1">
                <span className="text-[10px] text-aurora-teal uppercase">Variant B (Memory ON)</span>
                <div className="text-white font-bold">Precedent Grounded</div>
                <div className="text-[10px] text-aurora-teal">Measurable character savings</div>
              </div>
            </div>
          </div>

          {/* Bento Item 6: Bid Outcome Intelligence & Reflect */}
          <div className="p-6 rounded-xl bg-[#111319] border border-white/[0.08] hover:border-white/20 transition flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 px-2 py-0.5 rounded bg-white/[0.04] border border-white/5">
                  ANALYTICS
                </span>
                <Award className="w-4 h-4 text-emerald-400" />
              </div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Outcome Intelligence
              </h3>
              <p className="text-xs text-[#9295A1] leading-relaxed">
                Connects win/loss bid outcomes back to individual memory banks. Generates macro reflection insights to refine enterprise policy over time.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-white/[0.06] text-[10px] font-mono text-emerald-400">
              Real recorded outcomes tracking
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
