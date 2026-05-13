"use client";

import { CheckCircle2, AlertCircle } from "lucide-react";

const UPTIME_SERVICES = [
  { name: "Main Website", status: "up", uptime: "99.98%", latency: "42ms" },
  { name: "API Server", status: "up", uptime: "99.91%", latency: "88ms" },
  { name: "Database", status: "degraded", uptime: "98.20%", latency: "210ms" },
  { name: "CDN", status: "up", uptime: "100%", latency: "12ms" },
];

function StatusDot({ status }: { status: string }) {
  if (status === "up") return <span className="w-2 h-2 rounded-full bg-[oklch(0.55_0.2_170)] inline-block" />;
  if (status === "degraded") return <span className="w-2 h-2 rounded-full bg-yellow-400 inline-block animate-pulse" />;
  return <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />;
}

export default function SiteUptimePage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold text-white tracking-tight">Site Uptime</h1>
        <p className="text-sm text-white/40 mt-1">Real-time health of all services.</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 text-xs font-mono px-3 py-1.5 rounded-full border border-[oklch(0.55_0.2_170)/0.3] bg-[oklch(0.55_0.2_170)/0.08] text-[oklch(0.75_0.2_170)]">
          <CheckCircle2 className="w-3.5 h-3.5" /> 3 Operational
        </div>
        <div className="flex items-center gap-2 text-xs font-mono px-3 py-1.5 rounded-full border border-yellow-400/30 bg-yellow-400/10 text-yellow-400">
          <AlertCircle className="w-3.5 h-3.5" /> 1 Degraded
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/[0.03] overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10">
          <h2 className="text-sm font-medium text-white">Services</h2>
        </div>
        <div className="divide-y divide-white/5">
          {UPTIME_SERVICES.map((s) => (
            <div key={s.name} className="px-6 py-5 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
              <div className="flex items-center gap-3">
                <StatusDot status={s.status} />
                <div>
                  <p className="text-sm text-white font-medium">{s.name}</p>
                  <p className="text-xs text-white/40 capitalize mt-0.5">{s.status}</p>
                </div>
              </div>
              <div className="flex items-center gap-6 text-right">
                <div>
                  <p className="text-xs text-white/40 font-mono">UPTIME</p>
                  <p className="text-sm text-white font-medium">{s.uptime}</p>
                </div>
                <div>
                  <p className="text-xs text-white/40 font-mono">LATENCY</p>
                  <p className="text-sm text-white font-medium">{s.latency}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6">
        <h2 className="text-sm font-medium text-white mb-5">Last 30 days</h2>
        <div className="flex flex-col gap-4">
          {UPTIME_SERVICES.map((s) => (
            <div key={s.name}>
              <div className="flex justify-between mb-1.5">
                <span className="text-xs text-white/60">{s.name}</span>
                <span className="text-xs font-mono text-white/60">{s.uptime}</span>
              </div>
              <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: s.uptime,
                    background: s.status === "up" ? "oklch(0.55 0.2 170)" : s.status === "degraded" ? "oklch(0.85 0.18 85)" : "oklch(0.55 0.22 25)",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}