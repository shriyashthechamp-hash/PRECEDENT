"use client";

import { Download, Search, Lightbulb, ArrowRight, ShieldCheck, Database, Cpu } from "lucide-react";

export function HowItWorks() {
  const stages = [
    {
      num: "01",
      name: "RETAIN",
      subtitle: "Capture Approved Decisions",
      tagline: "Every correction is recorded with the 'why'.",
      description:
        "When a proposal reviewer revises an AI draft, they provide the exact business rationale. PRECEDENT commits the original answer, corrected text, reasoning, category tag, and reviewer identity into the Hindsight memory bank.",
      details: [
        "Structured JSON schema with provenance",
        "Deterministic client-isolation boundary",
        "Synchronous fallback to persistent SQLite"
      ],
      color: "border-aurora-violet/40 text-aurora-violet bg-aurora-violet/10",
      icon: Download
    },
    {
      num: "02",
      name: "RECALL",
      subtitle: "Retrieve Contextual Precedents",
      tagline: "Experience injected at the point of draft generation.",
      description:
        "When drafting an answer for a completely different RFP, PRECEDENT queries the memory engine for semantically relevant historical decisions. Matching precedents are injected directly into the LLM prompt context.",
      details: [
        "Zero hallucination on past commitments",
        "Honors client-specific non-disclosure boundaries",
        "Sub-20ms semantic retrieval on local banks"
      ],
      color: "border-aurora-teal/40 text-aurora-teal bg-aurora-teal/10",
      icon: Search
    },
    {
      num: "03",
      name: "REFLECT",
      subtitle: "Synthesize Organizational Insights",
      tagline: "Macro policy synthesis from accumulated bid outcomes.",
      description:
        "As proposals are won or lost, PRECEDENT reflects across the accumulated memory corpus using Groq 120B inference to uncover systemic bidding patterns, policy gaps, and pricing recommendations for leadership.",
      details: [
        "Bid outcome win/loss attribution",
        "Cross-proposal pattern discovery",
        "Executive governance recommendations"
      ],
      color: "border-purple-400/40 text-purple-400 bg-purple-500/10",
      icon: Lightbulb
    }
  ];

  return (
    <section id="how-it-works" className="py-24 border-b border-white/[0.08] relative overflow-hidden bg-[#0D0F15]/60">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="space-y-4 max-w-3xl mb-16">
          <span className="text-xs font-mono tracking-widest text-aurora-teal uppercase">
            Biomimetic Memory Mechanics
          </span>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#F5F5F7] leading-tight">
            How PRECEDENT remembers: <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-[#F5F5F7] to-[#9295A1]">
              Retain. Recall. Reflect.
            </span>
          </h2>
          <p className="text-sm sm:text-base text-[#9295A1] leading-relaxed">
            Inspired by human cognitive memory, PRECEDENT models institutional knowledge as an active, compounding cycle rather than a passive folder of files.
          </p>
        </div>

        {/* 3-Column Visual Sequence */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {stages.map((stage) => {
            const Icon = stage.icon;
            return (
              <div
                key={stage.num}
                className="p-8 rounded-xl bg-[#111319] border border-white/[0.08] hover:border-white/20 transition-all duration-300 flex flex-col justify-between group relative"
              >
                <div className="space-y-6">
                  {/* Top Bar with Number and Operation Name */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-white/30 group-hover:text-white transition">
                      STAGE {stage.num}
                    </span>
                    <span className={`text-[11px] font-mono font-bold px-2.5 py-0.5 rounded border ${stage.color}`}>
                      {stage.name}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                      <Icon className="w-5 h-5 text-neutral-300 group-hover:text-white transition" />
                      <span>{stage.subtitle}</span>
                    </h3>
                    <p className="text-xs font-mono text-aurora-teal">{stage.tagline}</p>
                  </div>

                  <p className="text-xs sm:text-sm text-[#9295A1] leading-relaxed">
                    {stage.description}
                  </p>

                  {/* Bullet Points */}
                  <ul className="space-y-2 pt-2 border-t border-white/[0.06] text-xs text-neutral-300">
                    {stage.details.map((detail, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-aurora-violet font-bold text-[10px] mt-0.5">■</span>
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8 pt-4 border-t border-white/[0.06] text-[10px] font-mono text-[#9295A1] flex items-center justify-between">
                  <span>Audited via Hindsight Client</span>
                  <span className="text-white/40">Verified Contract ✓</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
