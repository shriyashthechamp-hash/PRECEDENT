"use client";

import { Check, X, ArrowRight } from "lucide-react";
import Link from "next/link";

export function BrandStatement() {
  return (
    <section className="py-24 border-b border-white/[0.08] relative overflow-hidden bg-[#0D0F15]/40">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Swiss Editorial Title */}
          <div className="lg:col-span-5 space-y-4">
            <span className="text-xs font-mono tracking-widest text-aurora-teal uppercase">
              The Institutional Memory Imperative
            </span>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#F5F5F7] leading-[1.12]">
              Every bid builds a better next bid.
            </h2>
            <div className="h-1 w-16 bg-gradient-to-r from-aurora-violet to-aurora-teal rounded-full mt-4" />
          </div>

          {/* Right Column: The Core Thesis & Contrast */}
          <div className="lg:col-span-7 space-y-6 text-[#9295A1] text-base sm:text-lg leading-relaxed">
            <p className="text-[#F5F5F7] font-medium text-lg sm:text-xl leading-relaxed">
              Conventional proposal workflows suffer from institutional amnesia. Every quarter, domain experts review and correct draft proposals, resolving nuances about pricing, architecture, and compliance.
            </p>

            <p>
              Once a proposal is submitted, that hard-won human judgment vanishes into static PDFs and email threads. When the next RFP arrives months later, teams start from zero—or worse, repeat past hallucinations and contradict past commitments.
            </p>

            <p>
              <strong className="text-white">PRECEDENT permanently solves this.</strong> By pairing high-speed AI inference with a durable biomimetic memory engine, PRECEDENT captures the rationale behind every human revision, defends against historical contradictions, and grounds future bids in authentic institutional precedent.
            </p>

            {/* Side-by-Side Comparison Matrix */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 text-xs">
              <div className="p-4 rounded-lg bg-[#111319] border border-red-500/20 space-y-2">
                <div className="flex items-center gap-2 text-red-400 font-semibold uppercase tracking-wider text-[11px] font-mono">
                  <X className="w-4 h-4" />
                  <span>Traditional Proposals</span>
                </div>
                <ul className="space-y-1.5 text-neutral-400">
                  <li>• Static text copy-pasted across Word docs</li>
                  <li>• Reviewer corrections discarded after submission</li>
                  <li>• Zero contradiction defense before release</li>
                  <li>• Blind hallucination risks on enterprise claims</li>
                </ul>
              </div>

              <div className="p-4 rounded-lg bg-[#111319] border border-aurora-violet/30 space-y-2 shadow-lg shadow-aurora-violet/5">
                <div className="flex items-center gap-2 text-aurora-teal font-semibold uppercase tracking-wider text-[11px] font-mono">
                  <Check className="w-4 h-4 text-aurora-teal" />
                  <span>PRECEDENT Platform</span>
                </div>
                <ul className="space-y-1.5 text-neutral-200">
                  <li>• Verified human review retained with rationale</li>
                  <li>• Real-time semantic precedent retrieval</li>
                  <li>• Hard contradiction submission gate</li>
                  <li>• Empirical A/B measurement of edit reduction</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
