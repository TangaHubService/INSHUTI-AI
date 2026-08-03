"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { AppShell } from "@/components/AppShell";
import { PageLoading, FullPageLoading } from "@/components/Spinner";
import { useRequireUser } from "@/lib/useUserAuth";
import { useLanguage } from "@/lib/LanguageContext";
import { PORTAL_COPY } from "@/lib/portalCopy";
import {
  getProfessionalCalendar,
  getProfessionalConsultations,
  type ProfessionalAppointment,
  type ProfessionalConsultation,
} from "@/lib/userApiClient";

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString([], { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

export default function ProfessionalPortalPage() {
  const { language } = useLanguage();
  const t = PORTAL_COPY[language];
  const { user, loading: authLoading } = useRequireUser();
  const [consultations, setConsultations] = useState<ProfessionalConsultation[]>([]);
  const [appointments, setAppointments] = useState<ProfessionalAppointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== "HEALTHCARE_PROFESSIONAL") {
      setLoading(false);
      return;
    }
    Promise.all([getProfessionalConsultations(), getProfessionalCalendar()])
      .then(([c, a]) => {
        setConsultations(c);
        setAppointments(a);
      })
      .finally(() => setLoading(false));
  }, [user]);

  if (authLoading || !user) return <FullPageLoading />;

  const pendingCount = consultations.filter((c) => c.status === "PENDING" || c.status === "ASSIGNED").length;
  const resolvedCount = consultations.filter((c) => c.status === "RESOLVED").length;
  const upcomingAppointments = appointments
    .filter((a) => a.status === "CONFIRMED" || a.status === "REQUESTED" || a.status === "RESCHEDULED")
    .slice(0, 5);
  const completedAppointments = appointments.filter((a) => a.status === "COMPLETED").length;

  return (
    <AppShell active="/professional" session={{ kind: "user", user }}>
      <div className="mx-auto max-w-[1160px]">
        <section className="pb-3">
          <span className="block font-mono text-[12.5px] font-medium uppercase tracking-[0.12em] text-coral-dark">
            {t.professionalPortal}
          </span>
          <h1 className="mt-3 font-display text-[34px] text-teal-900">
            {t.welcome}, {user.name.split(" ")[0]}
          </h1>
          {user.healthcareProfessional?.approvalStatus !== "APPROVED" && user.role === "HEALTHCARE_PROFESSIONAL" && (
            <p className="mt-3 max-w-[560px] rounded-md border border-gold bg-gold-100 px-4 py-3 text-[13.5px] text-[#8A5E1E]">
              {t.approval} <strong>({user?.healthcareProfessional?.approvalStatus ?? "pending"})</strong>
            </p>
          )}
        </section>

        {loading ? (
          <PageLoading />
        ) : (
          <section className="grid grid-cols-1 gap-4 pb-16 sm:grid-cols-2 lg:grid-cols-4">
            <div className="card p-5">
              <div className="text-[12.5px] font-semibold text-ink-soft">{t.waiting}</div>
              <div className="mt-2 font-display text-[30px] text-teal-900">{pendingCount}</div>
              <Link href="/consultations" className="mt-2 inline-block text-[12.5px] font-semibold text-teal-700">
                {t.open} →
              </Link>
            </div>
            <div className="card p-5">
              <div className="text-[12.5px] font-semibold text-ink-soft">{t.resolved}</div>
              <div className="mt-2 font-display text-[30px] text-teal-900">{resolvedCount}</div>
            </div>
            <div className="card p-5">
              <div className="text-[12.5px] font-semibold text-ink-soft">{t.upcoming}</div>
              <div className="mt-2 font-display text-[30px] text-teal-900">{upcomingAppointments.length}</div>
              <Link href="/appointments" className="mt-2 inline-block text-[12.5px] font-semibold text-teal-700">
                {t.open} →
              </Link>
            </div>
            <div className="card p-5">
              <div className="text-[12.5px] font-semibold text-ink-soft">{t.completed}</div>
              <div className="mt-2 font-display text-[30px] text-teal-900">{completedAppointments}</div>
            </div>

            <div className="sm:col-span-2 lg:col-span-4">
              <div className="card py-1.5">
                <div className="px-5 pb-1.5 pt-[14px] text-base text-teal-900">{t.next}</div>
                {upcomingAppointments.length === 0 && (
                  <p className="px-5 pb-5 pt-2 text-[13.5px] text-ink-soft">{t.none}</p>
                )}
                {upcomingAppointments.map((appt) => (
                  <div key={appt.id} className="flex items-center justify-between border-b border-line px-5 py-3 last:border-b-0">
                    <div>
                      <div className="text-sm font-semibold text-ink">{appt.user.name}</div>
                      <div className="text-xs text-ink-soft">{formatDateTime(appt.requestedTime)}</div>
                    </div>
                    <span className="rounded-full bg-teal-100 px-2.5 py-1 text-[11px] font-bold text-teal-700">{appt.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </AppShell>
  );
}
