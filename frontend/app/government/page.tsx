"use client";

import { useEffect, useState } from "react";

import { AppShell } from "@/components/AppShell";
import { PageLoading, FullPageLoading } from "@/components/Spinner";
import { StatCard } from "@/components/ui/StatCard";
import { Panel } from "@/components/layout/Panel";
import { BarChart } from "@/components/charts/BarChart";
import { useRequireUser } from "@/lib/useUserAuth";
import { getGovernmentStats, type GovernmentStats } from "@/lib/userApiClient";
import { useLanguage } from "@/lib/LanguageContext";
import { PORTAL_COPY } from "@/lib/portalCopy";

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
              <StatCard icon="i-chat" value={stats.totalConversations} label={t.totalConversations} />
              <StatCard icon="i-arrow" value={stats.referralCount} label={t.referred} />
              <StatCard icon="i-check" value={stats.consultationsByStatus.RESOLVED ?? 0} label={t.consultationsResolved} />
              <StatCard icon="i-calendar" value={stats.appointmentsByStatus.COMPLETED ?? 0} label={t.appointmentsCompleted} />
            </div>

            <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr]">
              <Panel title={t.topicEngagement} bodyClassName="px-5 pb-5">
                {stats.topicEngagement.length === 0 && <p className="text-sm text-ink-soft">{t.noTopic}</p>}
                <BarChart
                  data={stats.topicEngagement.map((entry) => ({
                    label: language === "RW" ? entry.topic.nameRw : language === "FR" ? entry.topic.nameFr : language === "SW" ? entry.topic.nameSw : entry.topic.nameEn,
                    value: entry.count,
                  }))}
                />
              </Panel>
              <Panel title={t.languageSplit} bodyClassName="px-5 pb-5">
                <div className="flex flex-col gap-2">
                  {Object.entries(langSplit).map(([lang, count]) => (
                    <div key={lang} className="flex items-center justify-between text-[13px] font-semibold text-ink-soft">
                      <span>{lang}</span>
                      <span>{totalLanguage > 0 ? Math.round((count / totalLanguage) * 100) : 0}%</span>
                    </div>
                  ))}
                </div>
              </Panel>
            </div>

            <Panel title={t.facilitiesDistrict} subtitle="Facility totals follow the selected government scope where facility location data is available." bodyClassName="px-5 pb-5">
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
            </Panel>
          </section>
        )}
      </div>
    </AppShell>
  );
}
