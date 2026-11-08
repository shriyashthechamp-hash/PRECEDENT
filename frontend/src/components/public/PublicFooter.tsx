"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export function PublicFooter() {
  return (
    <footer className="border-t border-white/[0.08] bg-[#08090D] py-14 text-xs text-[#9295A1]">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded border border-white/20 bg-[#111319] flex items-center justify-center font-bold text-white text-xs">
                P
              </div>
              <span className="font-bold text-sm tracking-[0.2em] text-[#F5F5F7] uppercase">
                PRECEDENT
              </span>
            </div>
            <p className="text-xs text-[#9295A1] max-w-sm leading-relaxed">
              AI-Native Institutional Proposal & RFP Intelligence. Captures reviewer corrections, detects pre-submission contradictions, and grounds enterprise bids in permanent organizational memory.
            </p>
            <p className="text-[11px] font-mono text-aurora-teal pt-1">
              Every bid builds a better next bid.
            </p>
          </div>

          {/* Navigation Links */}
          <div className="space-y-3">
            <div className="font-mono text-[11px] uppercase tracking-wider text-white">
              Platform
            </div>
            <ul className="space-y-2">
              <li>
                <Link href="/app" className="hover:text-white transition">
                  Command Center
                </Link>
              </li>
              <li>
                <Link href="#loop" className="hover:text-white transition">
                  Intelligence Flywheel
                </Link>
              </li>
              <li>
                <Link href="#platform" className="hover:text-white transition">
                  Capabilities Bento
                </Link>
              </li>
              <li>
                <Link href="#metrics" className="hover:text-white transition">
                  DotTiles Telemetry
                </Link>
              </li>
              <li>
                <Link href="#how-it-works" className="hover:text-white transition">
                  Retain, Recall, Reflect
                </Link>
              </li>
            </ul>
          </div>

          {/* Product & Story */}
          <div className="space-y-3">
            <div className="font-mono text-[11px] uppercase tracking-wider text-white">
              Architecture & Repository
            </div>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="hover:text-white transition">
                  About PRECEDENT
                </Link>
              </li>
              <li>
                <Link href="/lab" className="hover:text-white transition">
                  A/B Memory Lab
                </Link>
              </li>
              <li>
                <Link href="/review" className="hover:text-white transition">
                  Review Center
                </Link>
              </li>
              <li>
                <Link
                  href="https://github.com/shriyashthechamp-hash/PRECEDENT"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition flex items-center gap-1 text-aurora-violet"
                >
                  <span>GitHub Repository</span>
                  <ArrowUpRight className="w-3 h-3" />
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-mono text-[#9295A1]/70">
          <div>
            © {new Date().getFullYear()} PRECEDENT. Category-Defining Institutional Intelligence.
          </div>
          <div className="flex items-center gap-4">
            <span>FastAPI + Uvicorn</span>
            <span>•</span>
            <span>Next.js 15 + React 19</span>
            <span>•</span>
            <span>Groq LPUs + Hindsight</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
