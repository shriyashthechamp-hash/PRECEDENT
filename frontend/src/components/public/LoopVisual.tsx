"use client";

import { FileText, UserCheck, BrainCircuit, Sparkles, TrendingUp, ArrowRight } from "lucide-react";

export function LoopVisual() {
  const steps = [
    {
      num: "01",
      icon: FileText,
      tag: "INGEST",
      title: "RFP Ingestion",
      desc: "Raw customer RFP documents are ingested. Line-item requirements are parsed into structured workspace entities.",
      meta: "pypdf / python-docx parser"
    },
    {
      num: "02",
      icon: UserCheck,
      tag: "REVIEW",
      title: "Human Decision",
      desc: "Domain leads revise generated answers. Sarah Jenkins or legal architects state the exact reason for every modification.",
      meta: "Review provenance captured"
    },
    {
      num: "03",
      icon: BrainCircuit,
      tag: "RETAIN",
      title: "Retained Experience",
      desc: "Approved correction and rationale are permanently preserved with client quarantine boundaries in Hindsight memory banks.",
      meta: "Durable institutional memory"
    },
    {
      num: "04",
      icon: Sparkles,
      tag: "RECALL",
      title: "Future Recall",
      desc: "When a new RFP is submitted months later, relevant historical precedents are recalled into Groq 120B inference prompts.",
      meta: "Real-time context grounding"
    },
    {
      num: "05",
      icon: TrendingUp,
      tag: "OUTCOME",
      title: "Better Proposal",
      desc: "Drafts adhere to organizational precedents from day one. Contradictions are defended and reviewer edits drop measurably.",
      meta: "Compounding institutional win rate"
    }
  ];

  return (
    <section id="loop" className="py-24 border-b border-white/[0.08] relative overflow-hidden">
      {/* Background Accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] bg-aurora-violet/5 blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 sm:px-8 relative z-10">
        <div className="space-y-4 max-w-3xl mb-16">
          <span className="text-xs font-mono tracking-widest text-aurora-violet uppercase">
            Continuous Learning Architecture
          </span>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#F5F5F7] leading-tight">
            Not a static chatbot. A continuous memory loop.
          </h2>
          <p className="text-sm sm:text-base text-[#9295A1] leading-relaxed">
            Generic AI generates generic text. PRECEDENT operates as an institutional flywheel where every reviewer correction trains the organization's collective intelligence.
          </p>
        </div>

        {/* 5-Step Horizontal Timeline on Desktop, Vertical on Mobile */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="p-5 rounded-lg bg-[#111319] border border-white/[0.08] hover:border-aurora-violet/40 transition-all duration-300 relative group flex flex-col justify-between"
              >
                {/* Step Header */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-white/40 group-hover:text-aurora-teal transition">
                      {step.num}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.04] text-aurora-violet border border-white/5">
                      {step.tag}
                    </span>
                  </div>

                  <div className="w-9 h-9 rounded-md bg-[#0D0F15] border border-white/10 flex items-center justify-center text-white group-hover:border-aurora-violet/50 group-hover:text-aurora-teal transition">
                    <Icon className="w-4 h-4" />
                  </div>

                  <h3 className="text-sm font-semibold text-white tracking-wide">{step.title}</h3>
                  <p className="text-xs text-[#9295A1] leading-relaxed">{step.desc}</p>
                </div>

                {/* Step Subtext */}
                <div className="mt-5 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[10px] font-mono text-[#9295A1]">
                  <span>{step.meta}</span>
                  {idx < steps.length - 1 && (
                    <ArrowRight className="w-3 h-3 text-white/20 hidden md:block" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Operational Reality Note */}
        <div className="mt-8 p-4 rounded-lg bg-[#0D0F15] border border-white/[0.06] flex flex-wrap items-center justify-between gap-4 text-xs text-[#9295A1] font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-aurora-teal" />
            <span>Loop Status: Synchronous SQLite & Asynchronous Remote Daemon Compliant</span>
          </div>
          <span>Retain → Recall → Reflect Verified in test_learning_demonstration.py</span>
        </div>
      </div>
    </section>
  );
}
