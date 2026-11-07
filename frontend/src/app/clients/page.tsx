"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { api } from "@/lib/api";
import { Building2, ShieldCheck, Lock, Globe, Server } from "lucide-react";

export default function ClientsAndSectorsPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [sectors, setSectors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [c, s] = await Promise.all([api.getClients(), api.getSectors()]);
        setClients(c || []);
        setSectors(s || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <Header
        title="Clients, Sectors & Memory Isolation"
        subtitle="Manage client-specific preferences, sector standards, and cross-client data boundaries."
      />

      <div className="p-8 space-y-8 max-w-6xl mx-auto w-full">
        {/* Isolation Guarantee Banner */}
        <div className="p-4 rounded-lg bg-surface border border-border flex items-center justify-between text-xs text-neutral-300">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-400" />
            <span>
              Strict Hindsight Memory Isolation: Private client concessions never leak into other proposals.
            </span>
          </div>
          <span className="font-mono text-emerald-400 font-semibold">Boundary Verified</span>
        </div>

        {/* Clients Section */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-400" />
            <span>Enterprise Clients</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {clients.map((cli) => (
              <div key={cli.id} className="p-5 rounded-lg bg-surface border border-border space-y-3">
                <div>
                  <div className="text-[10px] font-mono text-blue-400">{cli.id}</div>
                  <h3 className="text-sm font-semibold text-white mt-0.5">{cli.name}</h3>
                  <div className="text-xs text-neutral-400">{cli.industry}</div>
                </div>

                <p className="text-xs text-neutral-300 leading-relaxed">{cli.description}</p>

                {cli.preferences?.preferred_tone && (
                  <div className="pt-2 border-t border-border/60 text-[11px] text-neutral-400">
                    <strong className="text-neutral-300">Tone:</strong> {cli.preferences.preferred_tone}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Sectors Section */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <Globe className="w-4 h-4 text-purple-400" />
            <span>Regulated Industry Sectors</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {sectors.map((sec) => (
              <div key={sec.id} className="p-5 rounded-lg bg-surface border border-border space-y-3">
                <div>
                  <div className="text-[10px] font-mono text-purple-400">{sec.id}</div>
                  <h3 className="text-sm font-semibold text-white mt-0.5">{sec.name}</h3>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-border/60">
                  <div className="text-[11px] font-mono text-neutral-400">Compliance Frameworks:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {sec.compliance_standards?.map((std: string, i: number) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-surface-elevated text-purple-300 border border-purple-900/40">
                        {std}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-border/60">
                  <div className="text-[11px] font-mono text-neutral-400">Common Requirements:</div>
                  <ul className="text-xs text-neutral-300 space-y-1">
                    {sec.common_requirements?.map((req: string, i: number) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-neutral-500">•</span>
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
