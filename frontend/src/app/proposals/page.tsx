"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { api } from "@/lib/api";
import Link from "next/link";
import {
  FileText,
  UploadCloud,
  CheckCircle2,
  Clock,
  ArrowRight,
  Filter,
  Plus,
  ShieldAlert
} from "lucide-react";

export default function ProposalsPage() {
  const [proposals, setProposals] = useState<any[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await api.getProposals();
        setProposals(data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = proposals.filter((p) => {
    if (filterStatus === "ALL") return true;
    return p.status === filterStatus;
  });

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <Header
        title="Proposals & RFPs"
        subtitle="Manage and inspect organizational RFP workspaces and question inventories."
        action={
          <Link
            href="/proposals/upload"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-md transition"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Ingest RFP Document</span>
          </Link>
        }
      />

      <div className="p-8 space-y-6 max-w-7xl mx-auto w-full">
        {/* Filter Controls */}
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div className="flex items-center gap-2">
            {["ALL", "DRAFT", "IN_REVIEW", "SUBMITTED"].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1 text-xs rounded-md transition ${
                  filterStatus === st
                    ? "bg-surface-elevated text-white font-medium border border-border"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                {st.replace("_", " ")}
              </button>
            ))}
          </div>
          <span className="text-xs text-neutral-500 font-mono">
            {filtered.length} proposal{filtered.length === 1 ? "" : "s"} found
          </span>
        </div>

        {/* Proposals Table */}
        <div className="rounded-lg border border-border bg-surface overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-elevated text-neutral-400 font-mono text-[11px] uppercase tracking-wider border-b border-border">
              <tr>
                <th className="py-3 px-4">RFP Reference & Title</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Questions</th>
                <th className="py-3 px-4">Deadline</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((prop) => (
                <tr key={prop.id} className="hover:bg-surface-hover/50 transition">
                  <td className="py-4 px-4">
                    <div className="font-mono text-[10px] text-blue-400">{prop.rfp_reference || prop.id}</div>
                    <div className="font-medium text-white text-sm mt-0.5">{prop.title}</div>
                    {prop.source_file && (
                      <div className="text-[11px] text-neutral-500 mt-0.5">Source: {prop.source_file}</div>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        prop.status === "SUBMITTED"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                          : prop.status === "IN_REVIEW"
                          ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                          : "bg-blue-500/10 text-blue-400 border border-blue-500/30"
                      }`}
                    >
                      {prop.status}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="font-mono text-neutral-300 font-semibold">{prop.total_questions}</span>
                    <span className="text-neutral-500 ml-1">items</span>
                  </td>
                  <td className="py-4 px-4 text-neutral-300 font-mono text-[11px]">
                    {prop.deadline || "Open"}
                  </td>
                  <td className="py-4 px-4 text-right">
                    <Link
                      href={`/proposals/${prop.id}`}
                      className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium text-white bg-surface-elevated hover:bg-neutral-700 border border-border rounded transition"
                    >
                      <span>Open Workspace</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

