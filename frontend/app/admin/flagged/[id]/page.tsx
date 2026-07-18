"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { AdminShell } from "@/components/AdminShell";
import { getFlaggedItem, updateFlaggedItem, type FlaggedItemDetail } from "@/lib/adminApiClient";
import { useRequireAdmin } from "@/lib/useAdminAuth";

const REASON_LABEL: Record<string, string> = {
  CRISIS_LANGUAGE: "Crisis language detected",
  LOW_CONFIDENCE: "Low-confidence answer",
  USER_REPORTED: "User reported response",
};

export default function FlaggedDetailPage() {
  const { admin, loading: authLoading } = useRequireAdmin("MODERATOR");
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [detail, setDetail] = useState<FlaggedItemDetail | null>(null);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!admin) return;
    getFlaggedItem(params.id).then((d) => {
      setDetail(d);
      setNotes(d.item.reviewerNotes ?? "");
      setLoading(false);
    });
  }, [admin, params.id]);

  async function handleResolve() {
    setSaving(true);
    try {
      await updateFlaggedItem(params.id, { reviewerNotes: notes, status: "RESOLVED" });
      const refreshed = await getFlaggedItem(params.id);
      setDetail(refreshed);
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveNotes() {
    setSaving(true);
    try {
      await updateFlaggedItem(params.id, { reviewerNotes: notes });
      const refreshed = await getFlaggedItem(params.id);
      setDetail(refreshed);
    } finally {
      setSaving(false);
    }
  }

  if (authLoading || !admin) return null;

  return (
    <AdminShell active="/admin/flagged" admin={admin}>
      <button onClick={() => router.push("/admin/flagged")} className="mb-4 text-sm font-semibold text-teal-700">
        ← Back to Flagged Content
      </button>

      {loading && <p className="text-sm text-ink-soft">Loading…</p>}

      {!loading && detail && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
          <div className="rounded-md border border-[rgba(22,48,44,0.05)] bg-white p-6 shadow-card">
            <h3 className="mb-1 text-base text-teal-900">{REASON_LABEL[detail.item.reason]}</h3>
            <p className="mb-4 text-[12.5px] text-ink-soft">
              Conversation language: {detail.conversation.language} · Flagged{" "}
              {new Date(detail.item.createdAt).toLocaleString()}
            </p>
            <div className="max-h-[400px] overflow-y-auto rounded-[14px] bg-paper-2 p-[18px]">
              {detail.transcript.map((message) => (
                <div
                  key={message.id}
                  className={`mb-3 flex max-w-[85%] ${message.role === "USER" ? "ml-auto flex-row-reverse" : ""}`}
                >
                  <div
                    className={`rounded-2xl px-4 py-3 text-[13.5px] leading-[1.5] ${
                      message.role === "USER"
                        ? "rounded-br-[4px] bg-teal-700 text-white"
                        : "rounded-bl-[4px] border border-line bg-white"
                    } ${message.id === detail.item.flaggedMessageId ? "ring-2 ring-coral" : ""}`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-md border border-[rgba(22,48,44,0.05)] bg-white p-5 shadow-card">
            <div className="mb-2 text-[12.5px] font-bold text-ink-soft">Status</div>
            <p className="mb-4 text-sm font-semibold text-teal-900">
              {detail.item.status.charAt(0) + detail.item.status.slice(1).toLowerCase()}
            </p>
            {detail.item.resolvedBy && (
              <p className="mb-4 text-[12.5px] text-ink-soft">
                Resolved by {detail.item.resolvedBy}
                {detail.item.resolvedAt && ` on ${new Date(detail.item.resolvedAt).toLocaleDateString()}`}
              </p>
            )}

            <label className="mb-1.5 block text-[12.5px] font-bold text-ink-soft">Reviewer notes</label>
            <textarea
              className="mb-3 w-full resize-y rounded-[10px] border border-line bg-paper-2 px-3.5 py-2.5 text-sm"
              rows={5}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            <div className="flex flex-col gap-2">
              <button
                onClick={() => void handleSaveNotes()}
                disabled={saving}
                className="rounded-full border-[1.5px] border-teal-700 px-4 py-[9px] text-[13px] font-semibold text-teal-700 disabled:opacity-50"
              >
                Save notes
              </button>
              {detail.item.status !== "RESOLVED" && (
                <button
                  onClick={() => void handleResolve()}
                  disabled={saving}
                  className="rounded-full bg-coral px-4 py-[9px] text-[13px] font-semibold text-white shadow-[0_8px_20px_rgba(232,115,92,0.35)] disabled:opacity-50"
                >
                  Mark as resolved
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
