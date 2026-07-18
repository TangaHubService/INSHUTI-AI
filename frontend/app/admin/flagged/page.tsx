"use client";

import { useCallback, useEffect, useState } from "react";

import { AdminShell } from "@/components/AdminShell";
import { Drawer } from "@/components/Drawer";
import { useRequireAdmin } from "@/lib/useAdminAuth";
import { useToast } from "@/lib/useToast";
import {
  getFlaggedItem,
  getFlaggedItems,
  updateFlaggedItem,
  type FlagReason,
  type FlagStatus,
  type FlaggedItemDetail,
  type FlaggedItemSummary,
} from "@/lib/adminApiClient";

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
  const { toast } = useToast();
  const [items, setItems] = useState<FlaggedItemSummary[]>([]);
  const [reasonFilter, setReasonFilter] = useState<FlagReason | "">("");
  const [statusFilter, setStatusFilter] = useState<FlagStatus | "">("");
  const [loading, setLoading] = useState(true);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [detail, setDetail] = useState<FlaggedItemDetail | null>(null);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!admin) return;
    setLoading(true);
    getFlaggedItems({ reason: reasonFilter || undefined, status: statusFilter || undefined })
      .then(setItems)
      .finally(() => setLoading(false));
  }, [admin, reasonFilter, statusFilter]);

  const openDetail = useCallback(async (id: string) => {
    setDrawerOpen(true);
    setDrawerLoading(true);
    try {
      const d = await getFlaggedItem(id);
      setDetail(d);
      setNotes(d.item.reviewerNotes ?? "");
    } catch {
      toast("Failed to load flagged item", "error");
    } finally {
      setDrawerLoading(false);
    }
  }, [toast]);

  function closeDrawer() {
    setDrawerOpen(false);
    setDetail(null);
  }

  async function handleSaveNotes() {
    if (!detail) return;
    setSaving(true);
    try {
      await updateFlaggedItem(detail.item.id, { reviewerNotes: notes });
      const refreshed = await getFlaggedItem(detail.item.id);
      setDetail(refreshed);
      toast("Notes saved", "success");
    } catch {
      toast("Failed to save notes", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleResolve() {
    if (!detail) return;
    setSaving(true);
    try {
      await updateFlaggedItem(detail.item.id, { reviewerNotes: notes, status: "RESOLVED" });
      const refreshed = await getFlaggedItem(detail.item.id);
      setDetail(refreshed);
      toast("Item resolved", "success");
      getFlaggedItems({ reason: reasonFilter || undefined, status: statusFilter || undefined }).then(setItems);
    } catch {
      toast("Failed to resolve", "error");
    } finally {
      setSaving(false);
    }
  }

  if (authLoading || !admin) return null;

  return (
    <AdminShell active="/admin/flagged" admin={admin}>
      <div className="mb-[22px]">
        <h1 className="font-display text-[26px] text-teal-900">Flagged Content</h1>
        <p className="mt-1 text-sm text-ink-soft">Messages flagged for crisis language, low confidence, or a user report.</p>
      </div>

      <div className="mb-4 flex gap-2.5">
        <select className="rounded-[10px] border border-line bg-white px-3.5 py-2 text-[13px]" value={reasonFilter} onChange={(e) => setReasonFilter(e.target.value as FlagReason | "")}>
          <option value="">All reasons</option>
          <option value="CRISIS_LANGUAGE">Crisis language</option>
          <option value="LOW_CONFIDENCE">Low confidence</option>
          <option value="USER_REPORTED">User reported</option>
        </select>
        <select className="rounded-[10px] border border-line bg-white px-3.5 py-2 text-[13px]" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as FlagStatus | "")}>
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
                <th key={h} className="border-b border-line px-3.5 pb-2.5 text-left font-mono text-[11px] font-medium uppercase tracking-[0.06em] text-ink-soft">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {!loading && items.length === 0 && (
              <tr><td colSpan={5} className="px-3.5 py-6 text-center text-ink-soft">Nothing flagged right now.</td></tr>
            )}
            {items.map((item) => (
              <tr key={item.id} className="cursor-pointer border-b border-line last:border-b-0 hover:bg-paper-2" onClick={() => void openDetail(item.id)}>
                <td className="p-3.5 font-semibold text-ink">&#34;…{item.messagePreview}…&#34;</td>
                <td className="p-3.5">{item.topic?.nameEn ?? "General"}</td>
                <td className="p-3.5">{REASON_LABEL[item.reason]}</td>
                <td className="p-3.5">{new Date(item.createdAt).toLocaleDateString()}</td>
                <td className="p-3.5">
                  <span className={`inline-flex items-center gap-1.5 font-semibold before:h-2 before:w-2 before:rounded-full before:content-[''] ${STATUS_STYLE[item.status]}`}>
                    {item.status.charAt(0) + item.status.slice(1).toLowerCase()}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Drawer open={drawerOpen} onClose={closeDrawer} title="Flagged Item Detail">
        {drawerLoading && <p className="text-sm text-ink-soft">Loading…</p>}
        {!drawerLoading && detail && (
          <div className="flex flex-col gap-4">
            <div>
              <h3 className="text-base text-teal-900">{REASON_LABEL[detail.item.reason]}</h3>
              <p className="text-[12.5px] text-ink-soft">Conversation: {detail.conversation.language} · Flagged {new Date(detail.item.createdAt).toLocaleString()}</p>
            </div>

            <div className="max-h-[400px] overflow-y-auto rounded-[14px] bg-paper-2 p-[18px]">
              {detail.transcript.map((message) => (
                <div key={message.id} className={`mb-3 flex max-w-[85%] ${message.role === "USER" ? "ml-auto flex-row-reverse" : ""}`}>
                  <div className={`rounded-2xl px-4 py-3 text-[13.5px] leading-[1.5] ${message.role === "USER" ? "rounded-br-[4px] bg-teal-700 text-white" : "rounded-bl-[4px] border border-line bg-white"} ${message.id === detail.item.flaggedMessageId ? "ring-2 ring-coral" : ""}`}>
                    {message.content}
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-xl border border-[rgba(22,48,44,0.05)] bg-white p-4 shadow-card">
              <div className="mb-2 text-[12.5px] font-bold text-ink-soft">Status</div>
              <p className="mb-4 text-sm font-semibold">{detail.item.status.charAt(0) + detail.item.status.slice(1).toLowerCase()}</p>
              {detail.item.resolvedBy && (
                <p className="mb-4 text-[12.5px] text-ink-soft">Resolved by {detail.item.resolvedBy}{detail.item.resolvedAt && ` on ${new Date(detail.item.resolvedAt).toLocaleDateString()}`}</p>
              )}

              <label className="mb-1.5 block text-[12.5px] font-bold text-ink-soft">Reviewer notes</label>
              <textarea className="mb-3 w-full resize-y rounded-[10px] border border-line bg-paper-2 px-3.5 py-2.5 text-sm" rows={5} value={notes} onChange={(e) => setNotes(e.target.value)} />
              <div className="flex flex-col gap-2">
                <button onClick={() => void handleSaveNotes()} disabled={saving} className="rounded-full border-[1.5px] border-teal-700 px-4 py-[9px] text-[13px] font-semibold text-teal-700 disabled:opacity-50">
                  {saving ? "Saving…" : "Save notes"}
                </button>
                {detail.item.status !== "RESOLVED" && (
                  <button onClick={() => void handleResolve()} disabled={saving} className="rounded-full bg-coral px-4 py-[9px] text-[13px] font-semibold text-white shadow-[0_8px_20px_rgba(232,115,92,0.35)] disabled:opacity-50">
                    Mark as resolved
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </AdminShell>
  );
}
