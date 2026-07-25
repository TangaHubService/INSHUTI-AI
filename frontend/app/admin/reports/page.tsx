"use client";

import { AppShell } from "@/components/AppShell";
import { useRequireAdmin } from "@/lib/useAdminAuth";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

const REPORTS = [
  {
    title: "Conversations",
    description: "All chat conversations with message counts and flag status. Includes session IDs and languages.",
    endpoint: "/api/reports/conversations",
    filename: "conversations.csv",
    icon: "i-chat",
  },
  {
    title: "Flagged Items",
    description: "All flagged messages with reason, status, resolution details, and message previews.",
    endpoint: "/api/reports/flagged",
    filename: "flagged-items.csv",
    icon: "i-flag",
  },
  {
    title: "Appointments",
    description: "All appointments with patient names, professional names, status, and outcomes.",
    endpoint: "/api/reports/appointments",
    filename: "appointments.csv",
    icon: "i-calendar",
  },
];

function downloadReport(endpoint: string, filename: string) {
  const a = document.createElement("a");
  a.href = `${API_URL}${endpoint}`;
  a.download = filename;
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
        Download CSV exports of platform data. These reports include all records without filtering — use with caution on large datasets.
      </p>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {REPORTS.map((report) => (
          <div key={report.endpoint} className="flex flex-col rounded-md border border-[rgba(22,48,44,0.05)] bg-white p-[26px] shadow-card">
            <div className="mb-4 flex h-[46px] w-[46px] items-center justify-center rounded-[14px] bg-teal-100 text-teal-700">
              <svg width="22" height="22"><use href={`#${report.icon}`} /></svg>
            </div>
            <h3 className="mb-2 text-lg font-bold text-teal-900">{report.title}</h3>
            <p className="mb-5 flex-1 text-[13.5px] leading-[1.5] text-ink-soft">{report.description}</p>
            <button
              onClick={() => downloadReport(report.endpoint, report.filename)}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-coral px-5 py-[11px] text-[14px] font-semibold text-white transition hover:bg-coral-dark"
            >
              <svg width="16" height="16"><use href="#i-download" /></svg>
              Download CSV
            </button>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
