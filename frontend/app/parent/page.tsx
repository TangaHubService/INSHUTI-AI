"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { AppShell } from "@/components/AppShell";
import { PageLoading, FullPageLoading } from "@/components/Spinner";
import { Panel } from "@/components/layout/Panel";
import { useRequireUser } from "@/lib/useUserAuth";
import { useLanguage } from "@/lib/LanguageContext";
import { HEALTH_TOPIC_NAMES, PORTAL_COPY } from "@/lib/portalCopy";
import {
  getMyAppointments,
  getNotifications,
  type AppNotification,
  type Appointment,
} from "@/lib/userApiClient";

const RESOURCE_TOPICS = [
  { icon: "i-droplet", bg: "bg-coral-100", fg: "text-coral-dark", name: "Menstrual Health" },
  { icon: "i-baby", bg: "bg-gold-100", fg: "text-[#8A5E1E]", name: "Pregnancy" },
  { icon: "i-heart", bg: "bg-teal-100", fg: "text-teal-700", name: "Relationships" },
  { icon: "i-pill", bg: "bg-coral-100", fg: "text-coral-dark", name: "Family Planning" },
  { icon: "i-shield", bg: "bg-teal-100", fg: "text-teal-700", name: "HIV & STIs" },
  { icon: "i-mind", bg: "bg-gold-100", fg: "text-[#8A5E1E]", name: "Mental Health" },
];

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString([], { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

export default function ParentPortalPage() {
  const { language } = useLanguage();
  const t = PORTAL_COPY[language];
  const { user, loading: authLoading } = useRequireUser();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    Promise.all([getMyAppointments(), getNotifications()])
      .then(([a, n]) => {
        setAppointments(a);
        setNotifications(n.notifications);
      })
      .finally(() => setLoading(false));
  }, [user]);

  if (authLoading || !user) return <FullPageLoading />;

  const upcoming = appointments.filter((a) => a.status === "CONFIRMED" || a.status === "REQUESTED" || a.status === "RESCHEDULED").slice(0, 4);

  return (
    <AppShell active="/parent" session={{ kind: "user", user }}>
      <div className="mx-auto max-w-[1160px]">
        <section className="pb-3">
          <span className="block font-mono text-[12.5px] font-medium uppercase tracking-[0.12em] text-coral-dark">
            {t.parentPortal}
          </span>
          <h1 className="mt-3 font-display text-[34px] text-teal-900">
            {t.welcome}, {user.name.split(" ")[0]}
          </h1>
          <p className="mt-[10px] max-w-[560px] text-[14.5px] leading-[1.6] text-ink-soft">
            {t.parentIntro}
          </p>
        </section>

        {loading ? (
          <PageLoading />
        ) : (
          <section className="grid grid-cols-1 gap-4 pb-16 lg:grid-cols-[1.2fr_1fr]">
            <div className="space-y-4">
              <Panel title={t.upcoming} action={<Link href="/appointments" className="text-[11px] font-semibold text-teal-700">{t.manage} →</Link>}>
                {upcoming.length === 0 ? (
                  <p className="px-5 pb-5 pt-2 text-[13.5px] text-ink-soft">{t.none}</p>
                ) : (
                  <div className="pb-1">
                    {upcoming.map((appt) => (
                      <div key={appt.id} className="flex items-center justify-between border-t border-line/70 px-5 py-3">
                        <div>
                          <div className="text-sm font-semibold text-ink">{appt.professional.name}</div>
                          <div className="text-xs text-ink-soft">{formatDateTime(appt.requestedTime)}</div>
                        </div>
                        <span className="rounded-full bg-teal-100 px-2.5 py-1 text-[11px] font-bold text-teal-700">{appt.status}</span>
                      </div>
                    ))}
                  </div>
                )}
              </Panel>

              <Panel title={t.resources} bodyClassName="px-5 pb-5">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {RESOURCE_TOPICS.map((topic) => (
                    <Link
                      key={topic.name}
                      href="/chat"
                      className="flex flex-col items-start gap-2 rounded-2xl border border-line px-3.5 py-3 hover:bg-paper-2"
                    >
                      <div className={`flex h-[26px] w-[26px] items-center justify-center rounded-lg ${topic.bg} ${topic.fg}`}>
                        <svg width="14" height="14"><use href={`#${topic.icon}`} /></svg>
                      </div>
                      <span className="text-[12.5px] font-semibold text-ink">{HEALTH_TOPIC_NAMES[language][RESOURCE_TOPICS.indexOf(topic)]}</span>
                    </Link>
                  ))}
                </div>
              </Panel>
            </div>

            <Panel title={t.recent} action={<Link href="/notifications" className="text-[11px] font-semibold text-teal-700">{t.viewAll} →</Link>}>
              {notifications.length === 0 ? (
                <p className="px-5 pb-5 pt-2 text-[13.5px] text-ink-soft">{t.none}</p>
              ) : (
                <div className="pb-1">
                  {notifications.slice(0, 6).map((n) => (
                    <div key={n.id} className="border-t border-line/70 px-5 py-3">
                      <div className="text-sm font-semibold text-ink">{n.title}</div>
                      <div className="mt-1 text-xs text-ink-soft">{n.body}</div>
                    </div>
                  ))}
                </div>
              )}
            </Panel>
          </section>
        )}
      </div>
    </AppShell>
  );
}
