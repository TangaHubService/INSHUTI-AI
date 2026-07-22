"use client";

import { useEffect, useState } from "react";

import { getDashboard, type DashboardStats } from "@/lib/adminApiClient";
import { AppShell } from "@/components/AppShell";
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

  const langSplit = stats?.languageSplit ?? {} as Record<string, number>;
  const totalLanguage = (langSplit.EN ?? 0) + (langSplit.RW ?? 0) + (langSplit.FR ?? 0) + (langSplit.SW ?? 0);
  const enPct = totalLanguage > 0 ? Math.round(((langSplit.EN ?? 0) / totalLanguage) * 100) : 0;
  const rwPct = totalLanguage > 0 ? Math.round(((langSplit.RW ?? 0) / totalLanguage) * 100) : 0;
  const frPct = totalLanguage > 0 ? Math.round(((langSplit.FR ?? 0) / totalLanguage) * 100) : 0;
  const swPct = totalLanguage > 0 ? 100 - enPct - rwPct - frPct : 0;
  const maxTopicCount = stats ? Math.max(1, ...stats.topicEngagement.map((t) => t.count)) : 1;

  return (
    <AppShell active="/admin/dashboard" session={{ kind: "admin", admin }}>
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
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-[13px] font-semibold text-ink-soft">
                  <span className="h-2.5 w-2.5 rounded-[3px] bg-teal-700" />
                  English — {enPct}%
                </div>
                <div className="flex items-center gap-2 text-[13px] font-semibold text-ink-soft">
                  <span className="h-2.5 w-2.5 rounded-[3px] bg-gold" />
                  Kinyarwanda — {rwPct}%
                </div>
                <div className="flex items-center gap-2 text-[13px] font-semibold text-ink-soft">
                  <span className="h-2.5 w-2.5 rounded-[3px] bg-coral" />
                  French — {frPct}%
                </div>
                <div className="flex items-center gap-2 text-[13px] font-semibold text-ink-soft">
                  <span className="h-2.5 w-2.5 rounded-[3px] bg-[#EFE9DB]" />
                  Kiswahili — {swPct}%
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </AppShell>
  );
}
