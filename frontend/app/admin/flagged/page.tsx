"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { AdminShell } from "@/components/AdminShell";
import {
  getFlaggedItems,
  type FlagReason,
  type FlagStatus,
  type FlaggedItemSummary,
} from "@/lib/adminApiClient";
import { useRequireAdmin } from "@/lib/useAdminAuth";

const REASON_LABEL: Record<FlagReason, string> = {
  CRISIS_LANGUAGE: "Crisis language detected",
  LOW_CONFIDENCE: "Low-confidence answer",
  USER_REPORTED: "User reported response",
};

const STATUS_STYLE: Record<FlagStatus, string> = {
  FLAGGED: "text-coral-dark before:bg-coral",
  PENDING: "text-[#8A5E1E] before:bg-gold",
  RESOLVED: "text-[#1E7A5A] before:bg-[#2E9E76]",
};

export default function FlaggedContentPage() {
  const { admin, loading: authLoading } = useRequireAdmin("MODERATOR");
  const [items, setItems] = useState<FlaggedItemSummary[]>([]);
  const [reasonFilter, setReasonFilter] = useState<FlagReason | "">("");
  const [statusFilter, setStatusFilter] = useState<FlagStatus | "">("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!admin) return;
    setLoading(true);
    getFlaggedItems({
      reason: reasonFilter || undefined,
      status: statusFilter || undefined,
    })
      .then(setItems)
      .finally(() => setLoading(false));
  }, [admin, reasonFilter, statusFilter]);

  if (authLoading || !admin) return null;

  return (
    <AdminShell active="/admin/flagged" admin={admin}>
      <div className="mb-[22px]">
        <h1 className="font-display text-[26px] text-teal-900">Flagged Content</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Messages flagged for crisis language, low confidence, or a user report.
        </p>
      </div>

      <div className="mb-4 flex gap-2.5">
        <select
          className="rounded-[10px] border border-line bg-white px-3.5 py-2 text-[13px]"
          value={reasonFilter}
          onChange={(e) => setReasonFilter(e.target.value as FlagReason | "")}
        >
          <option value="">All reasons</option>
          <option value="CRISIS_LANGUAGE">Crisis language</option>
          <option value="LOW_CONFIDENCE">Low confidence</option>
          <option value="USER_REPORTED">User reported</option>
        </select>
        <select
          className="rounded-[10px] border border-line bg-white px-3.5 py-2 text-[13px]"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as FlagStatus | "")}
        >
          <option value="">All statuses</option>
          <option value="FLAGGED">Flagged</option>
          <option value="PENDING">Pending</option>
          <option value="RESOLVED">Resolved</option>
        </select>
      </div>

      <div className="overflow-x-auto rounded-md border border-[rgba(22,48,44,0.05)] bg-white shadow-card">
        <table className="w-full border-collapse text-[13.5px]">
          <thead>
            <tr>
              {["Snippet", "Topic", "Reason", "Date", "Status"].map((h) => (
                <th
                  key={h}
                  className="border-b border-line px-3.5 pb-2.5 text-left font-mono text-[11px] font-medium uppercase tracking-[0.06em] text-ink-soft"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {!loading && items.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3.5 py-6 text-center text-ink-soft">
                  Nothing flagged right now.
                </td>
              </tr>
            )}
            {items.map((item) => (
              <tr key={item.id} className="border-b border-line last:border-b-0 hover:bg-paper-2">
                <td className="p-3.5">
                  <Link href={`/admin/flagged/${item.id}`} className="font-semibold text-ink hover:text-teal-700">
                    &quot;…{item.messagePreview}…&quot;
                  </Link>
                </td>
                <td className="p-3.5">{item.topic?.nameEn ?? "General"}</td>
                <td className="p-3.5">{REASON_LABEL[item.reason]}</td>
                <td className="p-3.5">{new Date(item.createdAt).toLocaleDateString()}</td>
                <td className="p-3.5">
                  <span
                    className={`inline-flex items-center gap-1.5 font-semibold before:h-2 before:w-2 before:rounded-full before:content-[''] ${STATUS_STYLE[item.status]}`}
                  >
                    {item.status.charAt(0) + item.status.slice(1).toLowerCase()}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
