"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  CheckCircle2,
  AlertTriangle,
  BrainCircuit,
  Scale,
  Award,
  BarChart3,
  Building2,
  Settings,
  Sparkles,
  Layers,
  UploadCloud
} from "lucide-react";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";

const NAV_ITEMS = [
  { label: "Overview", href: "/app", icon: LayoutDashboard },
  { label: "Proposals & RFPs", href: "/proposals", icon: FileText },
  { label: "Review Center", href: "/review", icon: CheckCircle2 },
  { label: "Contradiction Center", href: "/contradictions", icon: AlertTriangle, hasAlert: true },
  { label: "Memory A/B Lab", href: "/lab", icon: Sparkles, highlight: true },
  { label: "Institutional Memory", href: "/memory", icon: BrainCircuit },
  { label: "Claim Ledger", href: "/claims", icon: Scale },
  { label: "Bid Outcomes", href: "/outcomes", icon: Award },
  { label: "Clients & Sectors", href: "/clients", icon: Building2 },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "Settings & Health", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [openAlertsCount, setOpenAlertsCount] = useState<number>(1);
  const [healthStatus, setHealthStatus] = useState<string>("connected");

  useEffect(() => {
    async function loadStats() {
      try {
        const cfl = await api.getContradictions("OPEN");
        if (Array.isArray(cfl)) setOpenAlertsCount(cfl.length);
        const health = await api.getHealth();
        if (health) setHealthStatus(health.hindsight_memory?.status || "connected");
      } catch (err) {
        // quiet fallback
      }
    }
    loadStats();
    const interval = setInterval(loadStats, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <aside className="w-64 bg-surface border-r border-border flex flex-col h-screen sticky top-0 shrink-0 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-border flex items-center justify-between">
        <Link href="/app" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-bold text-white shadow-sm shadow-blue-500/20">
            P
          </div>
          <div>
            <div className="font-semibold text-sm tracking-wider text-white">PRECEDENT</div>
            <div className="text-[10px] uppercase tracking-wider text-neutral-400">Institutional Intelligence</div>
          </div>
        </Link>
        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface-elevated text-neutral-400 border border-border">
          v1.0
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="px-3 pb-2 text-[10px] font-mono uppercase tracking-wider text-neutral-500">
          Core Platform
        </div>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                isActive
                  ? "bg-brand-600 text-white shadow-sm shadow-brand-500/10"
                  : item.highlight
                  ? "text-blue-400 hover:bg-surface-hover hover:text-white"
                  : "text-neutral-300 hover:bg-surface-hover hover:text-white"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : item.highlight ? "text-blue-400" : "text-neutral-400"}`} />
                <span>{item.label}</span>
              </div>
              {item.hasAlert && openAlertsCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-conflict text-white animate-pulse">
                  {openAlertsCount}
                </span>
              )}
              {item.highlight && !isActive && (
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono">
                  A/B
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Quick Ingest Button & Public Site Link */}
      <div className="p-3 border-t border-border space-y-2">
        <Link
          href="/proposals/upload"
          className="flex items-center justify-center gap-2 w-full py-2 px-3 text-xs font-medium text-white bg-surface-elevated hover:bg-surface-hover border border-border rounded-md transition"
        >
          <UploadCloud className="w-3.5 h-3.5 text-blue-400" />
          <span>Ingest New RFP</span>
        </Link>
        <Link
          href="/"
          className="flex items-center justify-between w-full py-1.5 px-3 text-[11px] text-neutral-400 hover:text-white hover:bg-surface-elevated/50 rounded transition"
        >
          <span>← Brand & Overview</span>
          <span className="text-[10px] font-mono text-purple-400">Public</span>
        </Link>
      </div>

      {/* Status Footer */}
      <div className="p-3 border-t border-border bg-background/50 flex items-center justify-between text-[11px] text-neutral-400">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span className="font-mono text-[10px]">Hindsight: {healthStatus.includes("connected") ? "ACTIVE" : "OFFLINE"}</span>
        </div>
        <span className="text-[10px] text-neutral-500 font-mono">Vanguard Logic</span>
      </div>
    </aside>
  );
}

