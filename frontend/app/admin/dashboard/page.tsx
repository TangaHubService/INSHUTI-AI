"use client";

import { useEffect, useState } from "react";

import { getDashboard, type DashboardStats } from "@/lib/adminApiClient";
import { AdminShell } from "@/components/AdminShell";
import { useRequireAdmin } from "@/lib/useAdminAuth";

const TOPIC_BAR_COLORS = ["bg-coral", "bg-teal-600", "bg-gold", "bg-teal-700", "bg-coral-dark", "bg-teal-100"];

export default function AdminDashboardPage() {
  const { admin, loading: authLoading } = useRequireAdmin();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!admin) return;
    getDashboard()
      .then(setStats)
      .finally(() => setLoading(false));
  }, [admin]);

  if (authLoading || !admin) return null;

  const totalLanguage = stats ? stats.languageSplit.EN + stats.languageSplit.RW : 0;
  const rwPct = totalLanguage > 0 && stats ? Math.round((stats.languageSplit.RW / totalLanguage) * 100) : 0;
  const enPct = 100 - rwPct;
  const maxTopicCount = stats ? Math.max(1, ...stats.topicEngagement.map((t) => t.count)) : 1;

  return (
    <AdminShell active="/admin/dashboard" admin={admin}>
      <div className="mb-[22px] flex items-center justify-between">
        <div>
          <h1 className="font-display text-[26px] text-teal-900">Good morning, {admin.name.split(" ")[0]}</h1>
          <p className="mt-1 text-sm text-ink-soft">Here&apos;s how Inshuti is doing today.</p>
        </div>
      </div>

      {loading && <p className="text-sm text-ink-soft">Loading…</p>}

      {!loading && stats && (
        <>
          <div className="mb-[22px] grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-md border border-[rgba(22,48,44,0.05)] bg-white p-5 shadow-card">
              <div className="flex items-center justify-between text-[12.5px] font-semibold text-ink-soft">
                Total conversations
                <svg width="15" height="15" className="text-ink-soft">
                  <use href="#i-chat" />
                </svg>
              </div>
              <div className="mt-2 font-display text-[30px] text-teal-900">{stats.totalConversations}</div>
            </div>
            <div className="rounded-md border border-[rgba(22,48,44,0.05)] bg-white p-5 shadow-card">
              <div className="flex items-center justify-between text-[12.5px] font-semibold text-ink-soft">
                Anonymous sessions
                <svg width="15" height="15" className="text-ink-soft">
                  <use href="#i-users" />
                </svg>
              </div>
              <div className="mt-2 font-display text-[30px] text-teal-900">{stats.totalSessions}</div>
            </div>
            <div className="rounded-md border border-[rgba(22,48,44,0.05)] bg-white p-5 shadow-card">
              <div className="flex items-center justify-between text-[12.5px] font-semibold text-ink-soft">
                Most asked topic
                <svg width="15" height="15" className="text-ink-soft">
                  <use href="#i-droplet" />
                </svg>
              </div>
              <div className="mt-2 font-display text-xl text-teal-900">
                {stats.mostAskedTopic?.nameEn ?? "—"}
              </div>
            </div>
            <div className="rounded-md border border-[rgba(22,48,44,0.05)] bg-white p-5 shadow-card">
              <div className="flex items-center justify-between text-[12.5px] font-semibold text-ink-soft">
                Flagged for review
                <svg width="15" height="15" className="text-ink-soft">
                  <use href="#i-flag" />
                </svg>
              </div>
              <div className="mt-2 font-display text-[30px] text-teal-900">{stats.flaggedCount}</div>
            </div>
          </div>

          <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr]">
            <div className="rounded-md border border-[rgba(22,48,44,0.05)] bg-white p-[22px] shadow-card">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-base text-teal-900">Topic engagement</h3>
              </div>
              {stats.topicEngagement.length === 0 && (
                <p className="text-sm text-ink-soft">No topic activity yet.</p>
              )}
              <div className="flex h-40 items-end gap-3.5 pt-2.5">
                {stats.topicEngagement.map((entry, i) => (
                  <div key={entry.topic.id} className="flex flex-1 flex-col items-center gap-2">
                    <div className="flex h-full w-full items-end">
                      <div
                        className={`w-full rounded-t-lg ${TOPIC_BAR_COLORS[i % TOPIC_BAR_COLORS.length]}`}
                        style={{ height: `${(entry.count / maxTopicCount) * 100}%` }}
                      />
                    </div>
                    <div className="text-center text-[11px] font-semibold text-ink-soft">{entry.topic.nameEn}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-md border border-[rgba(22,48,44,0.05)] bg-white p-[22px] shadow-card">
              <h3 className="mb-4 text-base text-teal-900">Language split</h3>
              <div className="flex items-center gap-5">
                <svg width="120" height="120" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#EFE9DB" strokeWidth="4" />
                  <circle
                    cx="18"
                    cy="18"
                    r="15.9"
                    fill="none"
                    stroke="var(--teal-700)"
                    strokeWidth="4"
                    strokeDasharray={`${rwPct} ${enPct}`}
                    strokeDashoffset="25"
                    transform="rotate(-90 18 18)"
                  />
                </svg>
                <div>
                  <div className="mt-2 flex items-center gap-2 text-[13px] font-semibold text-ink-soft">
                    <span className="h-2.5 w-2.5 rounded-[3px] bg-teal-700" />
                    Kinyarwanda — {rwPct}%
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-[13px] font-semibold text-ink-soft">
                    <span className="h-2.5 w-2.5 rounded-[3px] bg-[#EFE9DB]" />
                    English — {enPct}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </AdminShell>
  );
}
