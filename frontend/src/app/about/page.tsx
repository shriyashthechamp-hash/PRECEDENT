"use client";

import Link from "next/link";
import { PublicNavbar } from "@/components/public/PublicNavbar";
import { PublicFooter } from "@/components/public/PublicFooter";
import { WaveAnimation } from "@/components/ui/wave-animation";
import {
  ArrowRight,
  BrainCircuit,
  Database,
  Cpu,
  ShieldCheck,
  UserCheck,
  AlertOctagon,
  Scale,
  Sparkles,
  GitBranch,
  Layers,
  Award
} from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#08090D] text-[#F5F5F7] selection:bg-aurora-violet/30 selection:text-white">
      <PublicNavbar />

      <main className="pt-32 pb-24 relative overflow-hidden">
        {/* Subtle Wave Canvas Ambient Backdrop */}
        <WaveAnimation className="absolute top-0 left-0 right-0 h-[480px] z-0" opacity={0.2} />

        {/* Subtle Atmospheric Gradient */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-r from-aurora-violet/10 via-transparent to-aurora-teal/10 blur-[140px] pointer-events-none rounded-full" />

        <div className="max-w-4xl mx-auto px-6 sm:px-8 space-y-20 relative z-10">
          {/* Header */}
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-[#111319] text-xs font-mono text-aurora-teal">
              <span>PRODUCT PHILOSOPHY & ARCHITECTURE</span>
            </div>
            <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-[#F5F5F7] leading-[1.08]">
              Organizations generate knowledge every day.{" "}
              <span className="text-[#9295A1]">Very few know how to retain it.</span>
            </h1>
            <p className="text-base sm:text-lg text-[#9295A1] font-normal leading-relaxed pt-2">
              The institutional memory crisis in enterprise bidding, and why compounding experience is the only durable moat in the age of generative AI.
            </p>
          </div>

          {/* Section 2: The Problem */}
          <section className="space-y-6 pt-8 border-t border-white/[0.08]">
            <span className="text-xs font-mono tracking-widest text-red-400 uppercase">
              01 — The Institutional Memory Crisis
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              The high cost of organizational amnesia
            </h2>
            <div className="space-y-4 text-sm sm:text-base text-[#9295A1] leading-relaxed">
              <p>
                In any enterprise responding to Requests for Proposals (RFPs), the most valuable asset isn't the document templates or marketing boilerplates. It is the human discernment applied during the final 48 hours of review:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-3">
                <div className="p-4 rounded-lg bg-[#111319] border border-white/[0.06] space-y-2">
                  <div className="text-white font-semibold text-xs flex items-center gap-2">
                    <AlertOctagon className="w-4 h-4 text-red-400" />
                    <span>What Gets Lost</span>
                  </div>
                  <ul className="text-xs text-[#9295A1] space-y-1">
                    <li>• Why an engineer revised an SLA from 99.99% to 99.9%</li>
                    <li>• Custom concessions granted to specific clients</li>
                    <li>• Hard-learned compliance clauses from lost bids</li>
                    <li>• Architecture trade-offs debated across email threads</li>
                  </ul>
                </div>

                <div className="p-4 rounded-lg bg-[#111319] border border-white/[0.06] space-y-2">
                  <div className="text-white font-semibold text-xs flex items-center gap-2">
                    <Scale className="w-4 h-4 text-amber-400" />
                    <span>The Consequence</span>
                  </div>
                  <ul className="text-xs text-[#9295A1] space-y-1">
                    <li>• Next quarter's proposal repeats the identical mistake</li>
                    <li>• Bids contradict active customer contracts</li>
                    <li>• Reviewer fatigue escalates as the same edits recur</li>
                    <li>• Win rate stagnates despite higher headcount</li>
                  </ul>
                </div>
              </div>
              <p>
                Generic AI proposal generators amplify this problem: they generate plausible-sounding text faster, but because they possess zero memory of your organization's real history, they hallucinate unsupported capabilities and trigger compliance violations.
              </p>
            </div>
          </section>

          {/* Section 3: The Philosophy */}
          <section className="space-y-6 pt-8 border-t border-white/[0.08]">
            <span className="text-xs font-mono tracking-widest text-aurora-teal uppercase">
              02 — The PRECEDENT Philosophy
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Documents are inputs. Experiences and outcomes are intelligence.
            </h2>
            <div className="space-y-4 text-sm sm:text-base text-[#9295A1] leading-relaxed">
              <p>
                Retrieval-Augmented Generation (RAG) and semantic document search treat files as static strings of text. If you search a knowledge base of past proposals, you find whatever was written down—including previous errors, outdated specs, and unvetted drafts.
              </p>
              <p className="p-4 rounded-lg bg-[#111319] border-l-2 border-aurora-violet text-white text-sm sm:text-base italic">
                "An organization does not become smarter by accumulating more documents. It becomes smarter by retaining the reasons why human experts corrected them."
              </p>
              <p>
                PRECEDENT fundamentally separates raw input text from verified institutional memory. Every retained memory in PRECEDENT carries provenance: the exact reviewer who approved it, the rationale they documented, the client context, and the bid outcome.
              </p>
            </div>
          </section>

          {/* Section 4: The Intelligence Loop */}
          <section className="space-y-6 pt-8 border-t border-white/[0.08]">
            <span className="text-xs font-mono tracking-widest text-aurora-violet uppercase">
              03 — The Cognitive Architecture
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Biomimetic Retain, Recall, and Reflect
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
              <div className="p-4 rounded-lg bg-[#111319] border border-white/[0.08] space-y-2">
                <span className="text-aurora-violet font-bold text-xs">STAGE 01: RETAIN</span>
                <p className="text-[#9295A1] font-sans">
                  Captures approved human decisions, context tags, and explicit rationale into durable memory banks.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-[#111319] border border-white/[0.08] space-y-2">
                <span className="text-aurora-teal font-bold text-xs">STAGE 02: RECALL</span>
                <p className="text-[#9295A1] font-sans">
                  Surfaces matching historical experiences into active prompt context across separate proposals.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-[#111319] border border-white/[0.08] space-y-2">
                <span className="text-purple-400 font-bold text-xs">STAGE 03: REFLECT</span>
                <p className="text-[#9295A1] font-sans">
                  Synthesizes cross-proposal patterns and bid outcomes to generate macro policy insights.
                </p>
              </div>
            </div>
          </section>

          {/* Section 5: Human Judgment */}
          <section className="space-y-6 pt-8 border-t border-white/[0.08]">
            <span className="text-xs font-mono tracking-widest text-emerald-400 uppercase">
              04 — Human Judgment as Ground Truth
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              AI proposes. Domain leaders govern.
            </h2>
            <div className="space-y-4 text-sm sm:text-base text-[#9295A1] leading-relaxed">
              <p>
                In PRECEDENT, unverified AI outputs are never permitted to write themselves into organizational truth.
              </p>
              <p>
                Only when a human expert—such as a Principal Solutions Architect or Legal Director—reviews a draft, makes a correction, and explicitly approves the rationale does it enter the institutional memory bank.
              </p>
              <div className="p-4 rounded-lg bg-[#0D0F15] border border-emerald-500/20 text-xs text-neutral-300 space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-bold font-mono">
                  <ShieldCheck className="w-4 h-4" />
                  <span>The Contradiction Gate</span>
                </div>
                <p>
                  If an AI proposal draft ever generates a claim that directly collides with an approved historical precedent (such as offering 99.99% SLA when company policy mandates 99.9%), PRECEDENT’s contradiction sentinel trips a hard block, physically preventing bid submission until resolved.
                </p>
              </div>
            </div>
          </section>

          {/* Section 6: Real System Architecture */}
          <section className="space-y-6 pt-8 border-t border-white/[0.08]">
            <span className="text-xs font-mono tracking-widest text-neutral-400 uppercase">
              05 — Verified Technical Stack
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Real engineering. Zero synthetic claims.
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-lg bg-[#111319] border border-white/[0.08] space-y-2">
                <div className="flex items-center gap-2 text-white font-semibold">
                  <Cpu className="w-4 h-4 text-aurora-violet" />
                  <span>High-Speed Inference</span>
                </div>
                <p className="text-[#9295A1]">
                  Powered by Groq LPUs running <code className="text-white font-mono">openai/gpt-oss-120b</code> with resilient fallback to 20B parameters for ultra-low latency token generation.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-[#111319] border border-white/[0.08] space-y-2">
                <div className="flex items-center gap-2 text-white font-semibold">
                  <BrainCircuit className="w-4 h-4 text-aurora-teal" />
                  <span>Biomimetic Memory Engine</span>
                </div>
                <p className="text-[#9295A1]">
                  Dual-path architecture: connects to external Hindsight daemon on port 8888, with automatic, honest fallback to SQLite persistent memory banks when standalone.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-[#111319] border border-white/[0.08] space-y-2">
                <div className="flex items-center gap-2 text-white font-semibold">
                  <Database className="w-4 h-4 text-blue-400" />
                  <span>Relational Persistence</span>
                </div>
                <p className="text-[#9295A1]">
                  SQLAlchemy 2.0+ with connection pooling, compatible with SQLite (local development) and Render Managed PostgreSQL (cloud production).
                </p>
              </div>

              <div className="p-4 rounded-lg bg-[#111319] border border-white/[0.08] space-y-2">
                <div className="flex items-center gap-2 text-white font-semibold">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  <span>Frontend Architecture</span>
                </div>
                <p className="text-[#9295A1]">
                  Next.js 15 App Router, React 19, Tailwind CSS, Lucide icons, and unified Vercel Services routing.
                </p>
              </div>
            </div>
          </section>

          {/* Section 7: Final CTA */}
          <section className="pt-12 border-t border-white/[0.08] text-center space-y-6">
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Make institutional knowledge an advantage.
            </h2>
            <p className="text-sm text-[#9295A1] max-w-md mx-auto">
              Experience the difference between a generic document search and an organizational memory flywheel.
            </p>
            <div className="pt-2">
              <Link
                href="/app"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-[#F5F5F7] hover:bg-white text-[#08090D] font-bold text-xs uppercase tracking-wider transition shadow-lg shadow-white/5 hover:scale-[1.01]"
              >
                <span>Explore PRECEDENT</span>
                <ArrowRight className="w-4 h-4 text-[#08090D]" />
              </Link>
            </div>
          </section>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
