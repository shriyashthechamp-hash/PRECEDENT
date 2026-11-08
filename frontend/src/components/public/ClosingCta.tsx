"use client";

import Link from "next/link";
import { ArrowRight, Sparkles, ShieldCheck } from "lucide-react";

export function ClosingCta() {
  return (
    <section className="py-28 relative overflow-hidden bg-[#08090D]">
      {/* Background Aurora Lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-r from-aurora-violet/10 to-aurora-teal/10 blur-[140px] pointer-events-none rounded-full" />

      <div className="max-w-5xl mx-auto px-6 sm:px-8 text-center relative z-10 space-y-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-[#111319] text-xs font-mono text-[#9295A1]">
          <span className="w-1.5 h-1.5 rounded-full bg-aurora-teal animate-pulse" />
          <span>PRODUCTION-VALIDATED PLATFORM</span>
        </div>

        <div className="space-y-4">
          <h2 className="text-4xl sm:text-6xl font-bold tracking-tight text-[#F5F5F7] leading-tight">
            Stop starting from zero.
          </h2>
          <p className="text-base sm:text-xl text-[#9295A1] max-w-2xl mx-auto font-normal leading-relaxed">
            Give every new proposal the unfair advantage of everything your organization has already learned, corrected, and won.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Link
            href="/app"
            className="inline-flex items-center gap-2.5 px-8 py-4 rounded-md bg-[#F5F5F7] hover:bg-white text-[#08090D] font-bold text-sm tracking-wide transition shadow-xl shadow-white/5 hover:scale-[1.01]"
          >
            <span>Enter PRECEDENT</span>
            <ArrowRight className="w-4 h-4 text-[#08090D]" />
          </Link>

          <Link
            href="/about"
            className="inline-flex items-center gap-2 px-6 py-4 rounded-md bg-[#111319] hover:bg-[#181D26] border border-white/10 text-sm font-medium text-[#F5F5F7] transition"
          >
            <span>Read Product Philosophy</span>
          </Link>
        </div>

        <div className="pt-6 flex items-center justify-center gap-6 text-xs font-mono text-[#9295A1]">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-aurora-teal" />
            Zero Secret Leakage
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-aurora-violet" />
            Groq 120B Inference
          </span>
          <span>•</span>
          <span>Hindsight Biomimetic Engine</span>
        </div>
      </div>
    </section>
  );
}
