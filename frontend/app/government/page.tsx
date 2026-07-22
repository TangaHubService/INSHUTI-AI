"use client";

import { useEffect, useState } from "react";

import { AppShell } from "@/components/AppShell";
import { useRequireUser } from "@/lib/useUserAuth";
import { getGovernmentStats, type GovernmentStats } from "@/lib/userApiClient";

const TOPIC_BAR_COLORS = ["bg-coral", "bg-teal-600", "bg-gold", "bg-teal-700", "bg-coral-dark", "bg-teal-100"];

export default function GovernmentPortalPage() {
  const { user, loading: authLoading } = useRequireUser();
  const [stats, setStats] = useState<GovernmentStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== "GOVERNMENT_USER") {
      setLoading(false);
      return;
    }
    getGovernmentStats()
      .then(setStats)
      .finally(() => setLoading(false));
  }, [user]);

  if (authLoading || !user) return null;

  const langSplit = stats?.languageSplit ?? {};
  const totalLanguage = Object.values(langSplit).reduce((a, b) => a + b, 0);
  const maxTopicCount = stats ? Math.max(1, ...stats.topicEngagement.map((t) => t.count)) : 1;

  return (
    <AppShell active="/government" session={{ kind: "user", user }}>
      <div className="mx-auto max-w-[1160px]">
        <section className="pb-3">
          <span className="block font-mono text-[12.5px] font-medium uppercase tracking-[0.12em] text-coral-dark">
            Government Portal
          </span>
          <h1 className="mt-3 font-display text-[34px] text-teal-900">Aggregated platform statistics</h1>
          <p className="mt-[10px] max-w-[620px] text-[14.5px] leading-[1.6] text-ink-soft">
            These are nationwide totals only — no individual conversation, consultation, or user record is ever exposed here.
            {stats?.scope.level && stats.scope.level !== "NATIONAL" && (
              <> Per-region breakdowns for {stats.scope.level.toLowerCase()} level aren&apos;t available yet since conversations aren&apos;t tagged with a location.</>
            )}
          </p>
        </section>

        {loading ? (
          <p className="pb-16 text-sm text-ink-soft">Loading…</p>
        ) : !stats ? (
          <p className="pb-16 text-sm text-ink-soft">Government account required to view this dashboard.</p>
        ) : (
          <section className="pb-16">
            <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-md border border-[rgba(22,48,44,0.05)] bg-white p-5 shadow-card">
                <div className="text-[12.5px] font-semibold text-ink-soft">Total conversations</div>
                <div className="mt-2 font-display text-[30px] text-teal-900">{stats.totalConversations}</div>
              </div>
              <div className="rounded-md border border-[rgba(22,48,44,0.05)] bg-white p-5 shadow-card">
                <div className="text-[12.5px] font-semibold text-ink-soft">Referred to a professional</div>
                <div className="mt-2 font-display text-[30px] text-teal-900">{stats.referralCount}</div>
              </div>
              <div className="rounded-md border border-[rgba(22,48,44,0.05)] bg-white p-5 shadow-card">
                <div className="text-[12.5px] font-semibold text-ink-soft">Consultations resolved</div>
                <div className="mt-2 font-display text-[30px] text-teal-900">{stats.consultationsByStatus.RESOLVED ?? 0}</div>
              </div>
              <div className="rounded-md border border-[rgba(22,48,44,0.05)] bg-white p-5 shadow-card">
                <div className="text-[12.5px] font-semibold text-ink-soft">Appointments completed</div>
                <div className="mt-2 font-display text-[30px] text-teal-900">{stats.appointmentsByStatus.COMPLETED ?? 0}</div>
              </div>
            </div>

            <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr]">
              <div className="rounded-md border border-[rgba(22,48,44,0.05)] bg-white p-[22px] shadow-card">
                <h3 className="mb-4 text-base text-teal-900">Topic engagement</h3>
                {stats.topicEngagement.length === 0 && <p className="text-sm text-ink-soft">No topic activity yet.</p>}
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
                  {Object.entries(langSplit).map(([lang, count]) => (
                    <div key={lang} className="flex items-center justify-between text-[13px] font-semibold text-ink-soft">
                      <span>{lang}</span>
                      <span>{totalLanguage > 0 ? Math.round((count / totalLanguage) * 100) : 0}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-md border border-[rgba(22,48,44,0.05)] bg-white p-[22px] shadow-card">
              <h3 className="mb-1 text-base text-teal-900">Health facilities by district</h3>
              <p className="mb-4 text-[12.5px] text-ink-soft">The one figure below that&apos;s genuinely regional — facilities carry a real district field.</p>
              <div className="grid grid-cols-2 gap-x-8 gap-y-2 sm:grid-cols-3">
                {Object.entries(stats.facilitiesByDistrict).map(([district, count]) => (
                  <div key={district} className="flex items-center justify-between text-[13px] font-semibold text-ink-soft">
                    <span>{district}</span>
                    <span className="text-ink">{count}</span>
                  </div>
                ))}
                {Object.keys(stats.facilitiesByDistrict).length === 0 && (
                  <p className="text-sm text-ink-soft">No facilities recorded yet.</p>
                )}
              </div>
            </div>
          </section>
        )}
      </div>
    </AppShell>
  );
}
