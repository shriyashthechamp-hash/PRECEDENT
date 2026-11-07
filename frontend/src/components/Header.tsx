"use client";

import { useState } from "react";
import { Sparkles, RefreshCw, Upload, ShieldCheck, Database } from "lucide-react";
import { api } from "@/lib/api";
import Link from "next/link";

interface HeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function Header({ title, subtitle, action }: HeaderProps) {
  const [seeding, setSeeding] = useState(false);
  const [seededMsg, setSeededMsg] = useState("");

  const handleResetSeed = async () => {
    setSeeding(true);
    setSeededMsg("");
    try {
      await api.seedDatabase(true);
      setSeededMsg("Synthetic environment reset!");
      setTimeout(() => {
        setSeededMsg("");
        window.location.reload();
      }, 800);
    } catch (e) {
      setSeededMsg("Reset failed");
    } finally {
      setSeeding(false);
    }
  };

  return (
    <header className="h-16 border-b border-border bg-surface/80 backdrop-blur px-8 flex items-center justify-between shrink-0">
      <div>
        <h1 className="text-base font-semibold text-white tracking-tight">{title}</h1>
        {subtitle && <p className="text-xs text-neutral-400">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3">
        {/* Synthetic Demo Badge */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-elevated border border-border text-[11px] text-neutral-300">
          <Database className="w-3 h-3 text-blue-400" />
          <span>Vanguard Logic Demo Corp</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        </div>

        {/* Action button if provided */}
        {action}

        {/* Reset / Reseed Demo Data */}
        <button
          onClick={handleResetSeed}
          disabled={seeding}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-neutral-400 hover:text-white bg-surface-elevated hover:bg-surface-hover border border-border rounded transition"
          title="Reset synthetic historical dataset"
        >
          <RefreshCw className={`w-3 h-3 ${seeding ? "animate-spin text-blue-400" : ""}`} />
          <span>{seeding ? "Resetting..." : seededMsg || "Reset Seed"}</span>
        </button>

        <Link
          href="/lab"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-md transition shadow-sm shadow-blue-500/20"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Memory A/B Lab</span>
        </Link>
      </div>
    </header>
  );
}
