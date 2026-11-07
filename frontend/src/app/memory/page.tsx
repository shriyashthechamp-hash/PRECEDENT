"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { api } from "@/lib/api";
import {
  BrainCircuit,
  Search,
  Sparkles,
  ShieldCheck,
  History,
  Tag,
  BookOpen,
  Filter
} from "lucide-react";

export default function MemoryExplorerPage() {
  const [activeTab, setActiveTab] = useState<"FEED" | "REFLECT">("FEED");
  const [memories, setMemories] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // Reflect state
  const [reflectPrompt, setReflectPrompt] = useState(
    "What patterns and common reviewer corrections have occurred in healthcare and security proposals?"
  );
  const [reflectResult, setReflectResult] = useState<any>(null);
  const [reflecting, setReflecting] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await api.getMemories();
        setMemories(data?.review_provenance_memories || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleRunReflect = async () => {
    if (!reflectPrompt.trim()) return;
    setReflecting(true);
    setReflectResult(null);
    try {
      const res = await api.reflectMemories(reflectPrompt);
      setReflectResult(res);
    } catch (err: any) {
      alert(`Reflection failed: ${err.message}`);
    } finally {
      setReflecting(false);
    }
  };

  const filteredMemories = memories.filter((m) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      m.text?.toLowerCase().includes(q) ||
      m.category?.toLowerCase().includes(q) ||
      m.correction_reason?.toLowerCase().includes(q) ||
      m.proposal_title?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <Header
        title="Institutional Memory Explorer"
        subtitle="Hindsight biomimetic memory banks: retain, multi-strategy recall, and agentic reflection."
      />

      <div className="p-8 space-y-6 max-w-6xl mx-auto w-full">
        {/* Navigation Tabs */}
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("FEED")}
              className={`px-4 py-1.5 text-xs font-medium rounded-md transition flex items-center gap-1.5 ${
                activeTab === "FEED"
                  ? "bg-purple-600 text-white shadow-sm"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <BrainCircuit className="w-3.5 h-3.5" />
              <span>Memory Bank & Provenance Feed</span>
            </button>
            <button
              onClick={() => setActiveTab("REFLECT")}
              className={`px-4 py-1.5 text-xs font-medium rounded-md transition flex items-center gap-1.5 ${
                activeTab === "REFLECT"
                  ? "bg-purple-600 text-white shadow-sm"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Hindsight Reflect (Strategic Synthesis)</span>
            </button>
          </div>

          <span className="text-xs font-mono text-neutral-500">
            Bank: <span className="text-purple-400 font-semibold">precedent-institutional-memory</span>
          </span>
        </div>

        {activeTab === "FEED" ? (
          /* Memory Feed Tab */
          <div className="space-y-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search retained memories by keyword, topic (support_coverage, data_retention), or reviewer..."
                className="w-full pl-10 pr-4 py-2 text-xs bg-surface border border-border rounded-lg text-white focus:outline-none focus:border-purple-500 font-sans"
              />
            </div>

            {/* List of Memories */}
            <div className="space-y-3">
              {filteredMemories.length === 0 ? (
                <div className="p-12 text-center rounded-lg bg-surface border border-border text-neutral-400 text-xs">
                  No memories match your query.
                </div>
              ) : (
                filteredMemories.map((m) => (
                  <div
                    key={m.id}
                    className="p-5 rounded-lg bg-surface border border-border hover:border-purple-500/30 transition space-y-3"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-purple-400 px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20">
                          {m.category || "reviewer_correction"}
                        </span>
                        <span className="text-neutral-400 text-[11px] font-mono">
                          ID: {m.id}
                        </span>
                        <span className="text-neutral-500">·</span>
                        <span className="text-neutral-400 text-[11px]">
                          Scope: {m.scope}
                        </span>
                      </div>
                      <span className="text-neutral-500 font-mono text-[11px]">
                        Approved by: {m.reviewer}
                      </span>
                    </div>

                    <div className="text-xs text-neutral-200 leading-relaxed font-sans bg-surface-elevated/40 p-3 rounded border border-border">
                      {m.text}
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-border/60 text-[11px] text-neutral-400">
                      <div>
                        <strong className="text-purple-300">Originating Proposal:</strong> {m.proposal_title}
                      </div>
                      <div className="italic text-neutral-400">
                        "Rationale: {m.correction_reason}"
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          /* Reflect Synthesis Tab */
          <div className="space-y-6">
            <div className="p-6 rounded-lg bg-surface border border-border space-y-4">
              <div className="space-y-1">
                <h3 className="text-xs font-semibold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span>Agentic Reflection Engine</span>
                </h3>
                <p className="text-xs text-neutral-400">
                  While <code>recall</code> retrieves discrete memories, <code>reflect</code> uses an agentic reasoning loop to synthesize broader organizational trends, update mental models, and discover what evaluators reward.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-neutral-300">Reflection Query</label>
                <textarea
                  rows={3}
                  value={reflectPrompt}
                  onChange={(e) => setReflectPrompt(e.target.value)}
                  className="w-full p-3 text-xs bg-surface-elevated border border-border rounded text-white focus:outline-none focus:border-purple-500 font-sans"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] text-neutral-500 font-mono">
                  Grounded across all stored organizational memories
                </span>
                <button
                  onClick={handleRunReflect}
                  disabled={reflecting || !reflectPrompt.trim()}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-500 disabled:opacity-50 rounded transition shadow-sm"
                >
                  {reflecting ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      <span>Synthesizing Organizational Insights...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Execute Hindsight Reflection</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Reflection Result */}
            {reflectResult && (
              <div className="p-6 rounded-lg bg-surface border border-purple-500/40 space-y-5 animate-fadeIn">
                <div className="flex items-center justify-between pb-3 border-b border-border">
                  <span className="text-xs font-mono font-bold text-purple-300 uppercase tracking-wider">
                    SYNTHESIZED INSTITUTIONAL CONCLUSION
                  </span>
                  <span className="text-[11px] font-mono text-emerald-400">
                    Grounded Synthesis
                  </span>
                </div>

                <div className="text-xs text-neutral-200 leading-relaxed whitespace-pre-line p-4 rounded bg-surface-elevated/70 border border-purple-900/30">
                  {reflectResult.text}
                </div>

                {/* Mental Models derived */}
                {reflectResult.mental_models?.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <div className="text-xs font-mono text-purple-400 font-semibold">
                      Derived Mental Models & Organizational Directives:
                    </div>
                    <div className="space-y-1.5">
                      {reflectResult.mental_models.map((mm: string, i: number) => (
                        <div key={i} className="text-xs p-3 rounded bg-purple-950/20 border border-purple-900/30 text-purple-200">
                          • {mm}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
