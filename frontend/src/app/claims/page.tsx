"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { api } from "@/lib/api";
import {
  Scale,
  Plus,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Filter
} from "lucide-react";

export default function ClaimLedgerPage() {
  const [claims, setClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [subject, setSubject] = useState("");
  const [predicate, setPredicate] = useState("");
  const [value, setValue] = useState("");
  const [scope, setScope] = useState("global");
  const [approvedBy, setApprovedBy] = useState("Principal Solutions Architect");

  const loadClaims = async () => {
    try {
      const data = await api.getClaims();
      setClaims(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClaims();
  }, []);

  const handleCreateClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !predicate || !value) return;
    try {
      await api.createClaim({
        subject,
        predicate,
        value,
        scope,
        approved_by: approvedBy
      });
      setShowAddModal(false);
      setSubject("");
      setPredicate("");
      setValue("");
      await loadClaims();
    } catch (err: any) {
      alert(`Failed to add claim: ${err.message}`);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <Header
        title="Institutional Claim Ledger"
        subtitle="Immutable single-source-of-truth for verified corporate commitments and technical specifications."
        action={
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-md transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Verified Claim</span>
          </button>
        }
      />

      <div className="p-8 space-y-6 max-w-6xl mx-auto w-full">
        {/* Banner */}
        <div className="p-4 rounded-lg bg-surface border border-border flex items-center justify-between text-xs text-neutral-300">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-blue-400" />
            <span>
              Deterministic conflict detection validates all proposals against this ledger to prevent overpromising.
            </span>
          </div>
          <span className="font-mono text-neutral-400 font-semibold">{claims.length} Active Verified Claims</span>
        </div>

        {/* Modal for adding new claim */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 animate-fadeIn">
            <div className="bg-surface border border-border rounded-lg max-w-md w-full p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">Add Verified Claim to Ledger</h3>
                <button onClick={() => setShowAddModal(false)} className="text-neutral-500 hover:text-white">
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateClaim} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs text-neutral-300">Subject (Category)</label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. data_encryption"
                    className="w-full px-3 py-1.5 text-xs bg-surface-elevated border border-border rounded text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-neutral-300">Predicate (Attribute)</label>
                  <input
                    type="text"
                    required
                    value={predicate}
                    onChange={(e) => setPredicate(e.target.value)}
                    placeholder="e.g. at_rest_standard"
                    className="w-full px-3 py-1.5 text-xs bg-surface-elevated border border-border rounded text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-neutral-300">Approved Value / Standard</label>
                  <textarea
                    rows={3}
                    required
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="e.g. AES-256-GCM at rest, TLS 1.3 in transit with forward secrecy"
                    className="w-full px-3 py-1.5 text-xs bg-surface-elevated border border-border rounded text-white focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs text-neutral-300">Scope</label>
                    <select
                      value={scope}
                      onChange={(e) => setScope(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-surface-elevated border border-border rounded text-white focus:outline-none"
                    >
                      <option value="global">Global (All Bids)</option>
                      <option value="sector">Sector Specific</option>
                      <option value="client">Client Specific</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-neutral-300">Approved By</label>
                    <input
                      type="text"
                      value={approvedBy}
                      onChange={(e) => setApprovedBy(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-surface-elevated border border-border rounded text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-3 py-1.5 text-xs text-neutral-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded transition"
                  >
                    Add to Ledger
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Claims Table */}
        <div className="rounded-lg border border-border bg-surface overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-elevated text-neutral-400 font-mono text-[11px] uppercase tracking-wider border-b border-border">
              <tr>
                <th className="py-3 px-4">Claim ID & Subject</th>
                <th className="py-3 px-4">Predicate</th>
                <th className="py-3 px-4">Approved Standard Value</th>
                <th className="py-3 px-4">Scope</th>
                <th className="py-3 px-4">Approver</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {claims.map((c) => (
                <tr key={c.id} className="hover:bg-surface-hover/50 transition">
                  <td className="py-3.5 px-4">
                    <div className="font-mono text-[10px] text-blue-400">{c.id}</div>
                    <div className="font-semibold text-white mt-0.5">{c.subject}</div>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-neutral-300">{c.predicate}</td>
                  <td className="py-3.5 px-4 text-neutral-200 leading-relaxed font-sans max-w-md">
                    {c.value}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-surface-elevated text-neutral-300 border border-border">
                      {c.scope}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-neutral-400 text-[11px]">{c.approved_by}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

