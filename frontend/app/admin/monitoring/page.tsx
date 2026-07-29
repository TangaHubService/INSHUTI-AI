"use client";

import { useEffect, useState } from "react";

import { AppShell } from "@/components/AppShell";
import { useRequireAdmin } from "@/lib/useAdminAuth";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

interface HealthData {
  status: string;
  uptime: number;
  uptimeHuman: string;
  timestamp: string;
  database: string;
  requestsTotal: number;
  errorsTotal: number;
  memory: { heapUsed: number; heapTotal: number; rss: number };
  nodeVersion: string;
  platform: string;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function StatusCard({ label, value, status }: { label: string; value: string; status: "ok" | "degraded" | "error" }) {
  const dotColor = status === "ok" ? "bg-green-500" : status === "degraded" ? "bg-yellow-500" : "bg-red-500";
  return (
    <div className="card p-[22px]">
      <div className="mb-2 flex items-center gap-2">
        <span className={`h-2.5 w-2.5 rounded-full ${dotColor}`} />
        <span className="text-[12.5px] font-bold uppercase tracking-[0.06em] text-ink-soft">{label}</span>
      </div>
      <div className="text-[20px] font-bold text-teal-900">{value}</div>
    </div>
  );
}

export default function AdminMonitoringPage() {
  const { admin, loading: authLoading } = useRequireAdmin();
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(`${API_URL}/api/monitoring/health`, { credentials: "include" });
        if (!res.ok) throw new Error("Failed to load health data");
        const data = await res.json();
        if (!cancelled) setHealth(data);
      } catch {
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    const interval = setInterval(load, 30_000);
    return () => { cancelled = true; clearInterval(interval); };
  }, []);

  if (authLoading || !admin) return null;

  return (
    <AppShell active="/admin/monitoring" session={{ kind: "admin", admin }}>
      <h1 className="mb-6 font-display text-[28px] text-teal-900">Monitoring</h1>
      <p className="mb-8 max-w-[600px] text-[14.5px] leading-[1.6] text-ink-soft">
        System health and performance metrics. Auto-refreshes every 30 seconds.
      </p>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-[var(--radius-md)] bg-teal-100">
              <svg className="animate-spin h-6 w-6 text-teal-700" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" opacity="0.2" />
                <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-ink-soft">Loading metrics\u2026</span>
          </div>
        </div>
      ) : !health ? (
        <div className="rounded-[var(--radius-md)] bg-coral-100 p-8 text-center text-[15px] font-semibold text-coral-dark">
          Failed to load monitoring data. Check that the server is running.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <StatusCard label="Server Status" value={health.status === "ok" ? "Healthy" : "Degraded"} status={health.status === "ok" ? "ok" : "degraded"} />
          <StatusCard label="Database" value={health.database === "ok" ? "Connected" : "Error"} status={health.database === "ok" ? "ok" : "error"} />
          <StatusCard label="Uptime" value={health.uptimeHuman} status="ok" />
          <StatusCard label="Total Requests" value={health.requestsTotal.toLocaleString()} status="ok" />
          <StatusCard label="Total Errors" value={health.errorsTotal.toLocaleString()} status={health.errorsTotal > 0 ? "degraded" : "ok"} />
          <StatusCard label="Error Rate" value={health.requestsTotal > 0 ? `${((health.errorsTotal / health.requestsTotal) * 100).toFixed(2)}%` : "0%"} status={health.errorsTotal > 0 ? "degraded" : "ok"} />
          <StatusCard label="Heap Used" value={formatBytes(health.memory.heapUsed)} status="ok" />
          <StatusCard label="Heap Total" value={formatBytes(health.memory.heapTotal)} status="ok" />
          <StatusCard label="RSS" value={formatBytes(health.memory.rss)} status="ok" />
          <StatusCard label="Node.js" value={health.nodeVersion} status="ok" />
          <StatusCard label="Platform" value={health.platform} status="ok" />
          <StatusCard label="Last Check" value={new Date(health.timestamp).toLocaleTimeString()} status="ok" />
        </div>
      )}
    </AppShell>
  );
}
