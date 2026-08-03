"use client";

import { AppShell } from "@/components/AppShell";
import { useRequireAdmin } from "@/lib/useAdminAuth";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

const REPORTS = [
  {
    title: "Conversations",
    description: "All chat conversations with message counts and flag status. Includes session IDs and languages.",
    endpoint: "/api/reports/conversations",
    icon: "i-chat",
  },
  {
    title: "Flagged Items",
    description: "All flagged messages with reason, status, resolution details, and message previews.",
    endpoint: "/api/reports/flagged",
    icon: "i-flag",
  },
  {
    title: "Appointments",
    description: "All appointments with patient names, professional names, status, and outcomes.",
    endpoint: "/api/reports/appointments",
    icon: "i-calendar",
  },
];

function downloadReport(endpoint: string, format: "csv" | "xlsx" | "pdf") {
  const a = document.createElement("a");
  a.href = `${API_URL}${endpoint}?format=${format}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export default function AdminReportsPage() {
  const { admin, loading } = useRequireAdmin();

  if (loading || !admin) return null;

  return (
    <AppShell active="/admin/reports" session={{ kind: "admin", admin }}>
      <h1 className="mb-6 font-display text-[28px] text-teal-900">Reports</h1>
      <p className="mb-8 max-w-[600px] text-[14.5px] leading-[1.6] text-ink-soft">
        Download platform reports as CSV, Excel, or PDF. Reports may contain sensitive records and must be handled securely.
      </p>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {REPORTS.map((report) => (
          <div key={report.endpoint} className="card flex flex-col p-[26px]">
            <div className="mb-4 flex h-[46px] w-[46px] items-center justify-center rounded-[var(--radius-md)] bg-teal-100 text-teal-700">
              <svg width="22" height="22"><use href={`#${report.icon}`} /></svg>
            </div>
            <h3 className="mb-2 text-lg font-bold text-teal-900">{report.title}</h3>
            <p className="mb-5 flex-1 text-[13.5px] leading-[1.5] text-ink-soft">{report.description}</p>
            <div className="grid grid-cols-3 gap-2">
              {(["csv", "xlsx", "pdf"] as const).map((format) => (
                <button key={format} onClick={() => downloadReport(report.endpoint, format)} className="rounded-full bg-coral px-3 py-2 text-xs font-semibold uppercase text-white hover:bg-coral-dark">
                  {format}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
