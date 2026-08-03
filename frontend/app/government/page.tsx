"use client";

import { useEffect, useState } from "react";

import { AppShell } from "@/components/AppShell";
import { PageLoading, FullPageLoading } from "@/components/Spinner";
import { useRequireUser } from "@/lib/useUserAuth";
import { getGovernmentStats, type GovernmentStats } from "@/lib/userApiClient";
import { useLanguage } from "@/lib/LanguageContext";
import { PORTAL_COPY } from "@/lib/portalCopy";

const TOPIC_BAR_COLORS = ["bg-coral", "bg-teal-600", "bg-gold", "bg-teal-700", "bg-coral-dark", "bg-teal-100"];

export default function GovernmentPortalPage() {
  const { language } = useLanguage();
  const t = PORTAL_COPY[language];
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

  if (authLoading || !user) return <FullPageLoading />;

  const langSplit = stats?.languageSplit ?? {};
  const totalLanguage = Object.values(langSplit).reduce((a, b) => a + b, 0);
  const maxTopicCount = stats ? Math.max(1, ...stats.topicEngagement.map((t) => t.count)) : 1;

  return (
    <AppShell active="/government" session={{ kind: "user", user }}>
      <div className="mx-auto max-w-[1160px]">
        <section className="pb-3">
          <span className="block font-mono text-[12.5px] font-medium uppercase tracking-[0.12em] text-coral-dark">
            {t.governmentPortal}
          </span>
          <h1 className="mt-3 font-display text-[34px] text-teal-900">{t.aggregateTitle}</h1>
          <p className="mt-[10px] max-w-[620px] text-[14.5px] leading-[1.6] text-ink-soft">
            {t.aggregateIntro}
            {stats?.scope.level && stats.scope.level !== "NATIONAL" && <> Scope: {stats.scope.level.toLowerCase()} — {stats.scope.regionName}.</>}
          </p>
        </section>

        {loading ? (
          <PageLoading />
        ) : !stats ? (
          <p className="pb-16 text-sm text-ink-soft">{t.governmentRequired}</p>
        ) : (
          <section className="pb-16">
            <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="card p-5">
                <div className="text-[12.5px] font-semibold text-ink-soft">{t.totalConversations}</div>
                <div className="mt-2 font-display text-[30px] text-teal-900">{stats.totalConversations}</div>
              </div>
              <div className="card p-5">
                <div className="text-[12.5px] font-semibold text-ink-soft">{t.referred}</div>
                <div className="mt-2 font-display text-[30px] text-teal-900">{stats.referralCount}</div>
              </div>
              <div className="card p-5">
                <div className="text-[12.5px] font-semibold text-ink-soft">{t.consultationsResolved}</div>
                <div className="mt-2 font-display text-[30px] text-teal-900">{stats.consultationsByStatus.RESOLVED ?? 0}</div>
              </div>
              <div className="card p-5">
                <div className="text-[12.5px] font-semibold text-ink-soft">{t.appointmentsCompleted}</div>
                <div className="mt-2 font-display text-[30px] text-teal-900">{stats.appointmentsByStatus.COMPLETED ?? 0}</div>
              </div>
            </div>

            <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr]">
              <div className="card p-5">
                <h3 className="mb-4 text-base text-teal-900">{t.topicEngagement}</h3>
                {stats.topicEngagement.length === 0 && <p className="text-sm text-ink-soft">{t.noTopic}</p>}
                <div className="flex h-40 items-end gap-3.5 pt-2.5">
                  {stats.topicEngagement.map((entry, i) => (
                    <div key={entry.topic.id} className="flex flex-1 flex-col items-center gap-2">
                      <div className="flex h-full w-full items-end">
                        <div
                          className={`w-full rounded-t-lg ${TOPIC_BAR_COLORS[i % TOPIC_BAR_COLORS.length]}`}
                          style={{ height: `${(entry.count / maxTopicCount) * 100}%` }}
                        />
                      </div>
                      <div className="text-center text-[11px] font-semibold text-ink-soft">{language === "RW" ? entry.topic.nameRw : language === "FR" ? entry.topic.nameFr : language === "SW" ? entry.topic.nameSw : entry.topic.nameEn}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="card p-5">
                <h3 className="mb-4 text-base text-teal-900">{t.languageSplit}</h3>
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

            <div className="card p-5">
              <h3 className="mb-1 text-base text-teal-900">{t.facilitiesDistrict}</h3>
              <p className="mb-4 text-[12.5px] text-ink-soft">Facility totals follow the selected government scope where facility location data is available.</p>
              <div className="grid grid-cols-2 gap-x-8 gap-y-2 sm:grid-cols-3">
                {Object.entries(stats.facilitiesByDistrict).map(([district, count]) => (
                  <div key={district} className="flex items-center justify-between text-[13px] font-semibold text-ink-soft">
                    <span>{district}</span>
                    <span className="text-ink">{count}</span>
                  </div>
                ))}
                {Object.keys(stats.facilitiesByDistrict).length === 0 && (
                  <p className="text-sm text-ink-soft">{t.noFacilities}</p>
                )}
              </div>
            </div>
          </section>
        )}
      </div>
    </AppShell>
  );
}
