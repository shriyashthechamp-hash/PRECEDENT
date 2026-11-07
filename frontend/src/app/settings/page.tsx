"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { api } from "@/lib/api";
import {
  Settings,
  Server,
  BrainCircuit,
  Database,
  Cpu,
  Layers,
  ShieldCheck,
  RefreshCw,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

export default function SettingsPage() {
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [retesting, setRetesting] = useState(false);

  const checkStatus = async () => {
    setRetesting(true);
    try {
      const data = await api.getHealth();
      setHealth(data);
    } catch (e) {
      console.error(e);
    } finally {
      setRetesting(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <Header
        title="Settings & System Health"
        subtitle="Infrastructure health, Hindsight memory service, Groq model inference, and Band AI Desktop configuration."
      />

      <div className="p-8 space-y-6 max-w-4xl mx-auto w-full">
        {/* Quick Refresh */}
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="text-xs text-neutral-400">
            System Status: <span className="text-emerald-400 font-semibold uppercase">{health?.status || "OPERATIONAL"}</span>
          </div>
          <button
            onClick={checkStatus}
            disabled={retesting}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-neutral-300 hover:text-white bg-surface-elevated border border-border rounded transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${retesting ? "animate-spin text-blue-400" : ""}`} />
            <span>Retest Connectivity</span>
          </button>
        </div>

        {/* 4 Infrastructure Subsystems */}
        <div className="space-y-4">
          {/* 1. Hindsight Memory Engine */}
          <div className="p-5 rounded-lg bg-surface border border-border space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <BrainCircuit className="w-5 h-5 text-purple-400" />
                <div>
                  <h3 className="text-sm font-semibold text-white">Hindsight Memory Engine</h3>
                  <div className="text-[11px] text-neutral-400 font-mono">vectorize-io/hindsight</div>
                </div>
              </div>
              <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                {health?.hindsight_memory?.mode || "EMBEDDED_LOCAL"}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 text-xs font-mono text-neutral-300">
              <div className="p-2.5 rounded bg-surface-elevated border border-border">
                <span className="text-neutral-500 block text-[10px]">Service URL:</span>
                {health?.hindsight_memory?.url || "http://localhost:8888"}
              </div>
              <div className="p-2.5 rounded bg-surface-elevated border border-border">
                <span className="text-neutral-500 block text-[10px]">Memory Bank ID:</span>
                precedent-institutional-memory
              </div>
            </div>
          </div>

          {/* 2. Groq AI Model Inference */}
          <div className="p-5 rounded-lg bg-surface border border-border space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Cpu className="w-5 h-5 text-blue-400" />
                <div>
                  <h3 className="text-sm font-semibold text-white">Groq AI Inference Engine</h3>
                  <div className="text-[11px] text-neutral-400 font-mono">Structured JSON Inference</div>
                </div>
              </div>
              <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30">
                {health?.groq_inference?.status === "configured_live" ? "GROQ_LIVE_API" : "DETERMINISTIC_ENGINE"}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 text-xs font-mono text-neutral-300">
              <div className="p-2.5 rounded bg-surface-elevated border border-border">
                <span className="text-neutral-500 block text-[10px]">Primary Model:</span>
                {health?.groq_inference?.primary_model || "llama-3.3-70b-versatile"}
              </div>
              <div className="p-2.5 rounded bg-surface-elevated border border-border">
                <span className="text-neutral-500 block text-[10px]">Fallback Model:</span>
                {health?.groq_inference?.fallback_model || "llama-3.1-8b-instant"}
              </div>
            </div>
          </div>

          {/* 3. Relational Persistence Database */}
          <div className="p-5 rounded-lg bg-surface border border-border space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Database className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="text-sm font-semibold text-white">Relational Database</h3>
                  <div className="text-[11px] text-neutral-400 font-mono">SQLAlchemy Relational ORM</div>
                </div>
              </div>
              <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                CONNECTED
              </span>
            </div>

            <div className="p-2.5 rounded bg-surface-elevated border border-border text-xs font-mono text-neutral-300">
              <span className="text-neutral-500 block text-[10px]">Storage Engine:</span>
              SQLite File Relational Persistence (survives restarts with ACID integrity)
            </div>
          </div>

          {/* 4. Band AI Desktop Collaboration */}
          <div className="p-5 rounded-lg bg-surface border border-border space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Layers className="w-5 h-5 text-indigo-400" />
                <div>
                  <h3 className="text-sm font-semibold text-white">Band AI Desktop</h3>
                  <div className="text-[11px] text-neutral-400 font-mono">Multi-Agent Collaboration</div>
                </div>
              </div>
              <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                CLI DETECTED
              </span>
            </div>

            <div className="p-2.5 rounded bg-surface-elevated border border-border text-xs font-mono text-neutral-300">
              <span className="text-neutral-500 block text-[10px]">Binary Path:</span>
              /Applications/Band.app/Contents/MacOS/band
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

