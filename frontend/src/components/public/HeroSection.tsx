"use client";

import Link from "next/link";
import { ArrowRight, Sparkles, BrainCircuit, ShieldCheck, CheckCircle2, AlertTriangle, Layers, Database } from "lucide-react";
import { WaveAnimation } from "@/components/ui/wave-animation";

export function HeroSection() {
  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
      {/* Animated Wave Background */}
      <WaveAnimation className="absolute inset-0 z-0" opacity={0.35} />

      {/* Subtle Aurora Lighting Backdrops */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] pointer-events-none opacity-60">
        <div className="absolute inset-0 bg-gradient-to-tr from-aurora-violet/15 via-transparent to-aurora-teal/10 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-8 relative z-10">
        {/* Top Eyebrow Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-[#111319]/80 backdrop-blur-sm mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-aurora-teal" />
          <span className="text-[11px] font-mono tracking-widest uppercase text-[#9295A1]">
            Institutional Intelligence Platform
          </span>
          <span className="text-white/20">|</span>
          <span className="text-[11px] font-mono text-aurora-violet">v2.0 Hardened</span>
        </div>

        {/* Oversized Swiss Editorial Headline */}
        <div className="max-w-4xl space-y-4">
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-[#F5F5F7] leading-[1.06]">
            Your organization’s memory.{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F5F5F7] via-white to-[#9295A1]">
              Your next unfair advantage.
            </span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-[#9295A1] max-w-2xl font-normal leading-relaxed pt-2">
            Every proposal contains decisions, experience, corrections, and outcomes worth remembering.
            PRECEDENT turns that institutional knowledge into continuous intelligence that makes every next bid stronger.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-4 pt-8">
          <Link
            href="/app"
            className="inline-flex items-center gap-2.5 px-6 py-3 rounded-md bg-[#F5F5F7] hover:bg-white text-[#08090D] font-semibold text-sm tracking-wide transition shadow-lg shadow-white/5 hover:scale-[1.01]"
          >
            <span>Explore PRECEDENT</span>
            <ArrowRight className="w-4 h-4 text-[#08090D]" />
          </Link>

          <Link
            href="#how-it-works"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-md bg-[#111319] hover:bg-[#181D26] border border-white/10 hover:border-white/20 text-sm font-medium text-[#F5F5F7] transition"
          >
            <span>Discover how it works</span>
          </Link>

          <div className="hidden lg:flex items-center gap-2 ml-4 text-xs font-mono text-[#9295A1]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Dual-Path Hindsight Engine Active</span>
          </div>
        </div>

        {/* Custom Art-Directed PRECEDENT Visual: Connected Institutional Precedents */}
        <div className="mt-14 relative">
          {/* Main Visual Board */}
          <div className="relative rounded-xl border border-white/10 bg-[#0D0F15]/90 backdrop-blur-xl p-6 sm:p-8 overflow-hidden shadow-2xl shadow-black/80">
            {/* Fine Grid Background */}
            <div className="absolute inset-0 bg-hairline-grid opacity-60 pointer-events-none" />

            {/* Top Toolbar Simulation */}
            <div className="flex items-center justify-between pb-6 border-b border-white/[0.08] relative z-10 text-xs font-mono">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/60" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
                <span className="text-[#9295A1] pl-2">precedent.institutional-memory.graph</span>
              </div>
              <div className="flex items-center gap-4 text-[#9295A1]">
                <span className="text-aurora-teal flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-aurora-teal" />
                  REAL-TIME GROUNDING
                </span>
                <span className="hidden sm:inline">PRECEDENT_BANK_ID: precedent-institutional-memory</span>
              </div>
            </div>

            {/* Nodes & Signal Stream */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 relative z-10">
              {/* Node 1: Incoming RFP Requirements */}
              <div className="p-4 rounded-lg bg-[#111319]/90 border border-white/[0.08] space-y-3 relative overflow-hidden group hover:border-aurora-violet/30 transition">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-aurora-teal px-1.5 py-0.5 rounded bg-aurora-teal/10 border border-aurora-teal/20">
                    INPUT: RFP SPECIFICATION
                  </span>
                  <span className="text-[#9295A1] text-[10px] font-mono">Doc ID #RFP_2026_094</span>
                </div>
                <h4 className="text-xs font-semibold text-white">Line Requirement 4.2 — Support Escalation</h4>
                <p className="text-[11px] text-[#9295A1] leading-relaxed">
                  "Bidder must guarantee 24/7 dedicated tier-3 technical response across all standard non-critical operations."
                </p>
                <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[10px] text-[#9295A1]">
                  <span>Extracted via Parser</span>
                  <span className="text-amber-400 font-mono">Risk Flag: HIGH</span>
                </div>
              </div>

              {/* Node 2: Historical Precedent Recalled */}
              <div className="p-4 rounded-lg bg-[#111319]/90 border border-aurora-violet/30 space-y-3 relative overflow-hidden shadow-lg shadow-aurora-violet/5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-aurora-violet px-1.5 py-0.5 rounded bg-aurora-violet/10 border border-aurora-violet/20 flex items-center gap-1">
                    <BrainCircuit className="w-3 h-3" />
                    RECALLED PRECEDENT
                  </span>
                  <span className="text-aurora-teal text-[10px] font-mono">Confidence: 96.8%</span>
                </div>
                <h4 className="text-xs font-semibold text-white">Reviewer Correction #REV_108 — Sarah Jenkins</h4>
                <p className="text-[11px] text-neutral-200 leading-relaxed italic bg-white/[0.02] p-2 rounded border border-white/5">
                  "We cannot commit to blanket 24/7 tier-3 without custom retainer. Contractually enforce 24/5 core business hours with 24/7 dedicated escalation for P1 critical outages only."
                </p>
                <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[10px] text-[#9295A1]">
                  <span>Retained in Hindsight Bank</span>
                  <span className="text-purple-300 font-mono">Precedent Provenance ✓</span>
                </div>
              </div>

              {/* Node 3: Grounded Bid Response & Contradiction Defense */}
              <div className="p-4 rounded-lg bg-[#111319]/90 border border-emerald-500/30 space-y-3 relative overflow-hidden">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-emerald-400 px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    CONTRADICTION DEFENDED
                  </span>
                  <span className="text-emerald-400 text-[10px] font-mono">GATE: CLEAR</span>
                </div>
                <h4 className="text-xs font-semibold text-white">Synthesized Grounded Proposal Answer</h4>
                <p className="text-[11px] text-[#F5F5F7] leading-relaxed">
                  "Our delivery framework commits to dedicated 24/5 tier-3 engineering with 24/7 high-priority P1 critical incident coverage, fully aligned with standard operational commitments."
                </p>
                <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[10px] text-[#9295A1]">
                  <span className="text-emerald-400 font-mono">Zero Collisions</span>
                  <span className="text-[#9295A1]">Approved for Submission</span>
                </div>
              </div>
            </div>

            {/* Connecting Visual Rail Beneath Cards */}
            <div className="mt-6 pt-4 border-t border-white/[0.08] flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-[#9295A1]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-aurora-violet" />
                <span>Continuous Memory Vector: Document → Decision → Experience → Grounding</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-white">
                  Groq 120B Inference
                </span>
                <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-white">
                  Hindsight Biomimetic Storage
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Institutional Proof Tape */}
        <div className="mt-12 py-4 border-y border-white/[0.08] overflow-hidden whitespace-nowrap relative select-none">
          <div className="flex items-center gap-10 text-[11px] font-mono tracking-widest uppercase text-[#9295A1]/80 animate-pulse">
            <span>Enterprise RFPs Analyzed</span>
            <span className="text-aurora-teal">•</span>
            <span>Human Reasoning Retained</span>
            <span className="text-aurora-violet">•</span>
            <span>Historical Contradictions Defended</span>
            <span className="text-aurora-teal">•</span>
            <span>Client Concessions Quarantined</span>
            <span className="text-aurora-violet">•</span>
            <span>Empirical Reviewer Reduction Measured</span>
            <span className="text-aurora-teal">•</span>
            <span>Every Bid Builds A Better Next Bid</span>
          </div>
        </div>
      </div>
    </section>
  );
}
