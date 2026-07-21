"use client";

import Link from "next/link";
import { Logo } from "@/components/Logo";
import { useEffect, useState } from "react";

import { NotificationBell } from "@/components/NotificationBell";
import type { Language } from "@/lib/apiClient";
import {
  getCurrentUser,
  getProfessionalCalendar,
  getProfessionalConsultations,
  type ProfessionalAppointment,
  type ProfessionalConsultation,
  type UserProfile,
} from "@/lib/userApiClient";

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString([], { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

export default function ProfessionalPortalPage() {
  const [language, setLanguage] = useState<Language>("EN");
  const [user, setUser] = useState<UserProfile | null | undefined>(undefined);
  const [consultations, setConsultations] = useState<ProfessionalConsultation[]>([]);
  const [appointments, setAppointments] = useState<ProfessionalAppointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void getCurrentUser().then(setUser);
  }, []);

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

  const pendingCount = consultations.filter((c) => c.status === "PENDING" || c.status === "ASSIGNED").length;
  const resolvedCount = consultations.filter((c) => c.status === "RESOLVED").length;
  const upcomingAppointments = appointments
    .filter((a) => a.status === "CONFIRMED" || a.status === "REQUESTED" || a.status === "RESCHEDULED")
    .slice(0, 5);
  const completedAppointments = appointments.filter((a) => a.status === "COMPLETED").length;

  return (
    <div className="bg-paper">
      <div className="mx-auto max-w-[1160px] px-8">
        <header className="flex items-center justify-between border-b border-line py-[22px]">
          <div className="flex items-center gap-2.5">
            <Logo size={34} />
            <span className="font-display text-[22px] font-bold text-teal-900">Inshuti</span>
          </div>
          <nav className="flex items-center gap-8 text-[14.5px] font-semibold text-ink-soft">
            <span className="text-teal-700">Dashboard</span>
            <Link href="/consultations" className="hover:text-teal-700">Consultations</Link>
            <Link href="/appointments" className="hover:text-teal-700">Appointments</Link>
            <Link href="/notifications" className="hover:text-teal-700">Notifications</Link>
            <Link href="/profile" className="hover:text-teal-700">Profile</Link>
          </nav>
          <div className="flex items-center gap-3">
            <div className="flex rounded-full bg-teal-100 p-[3px] text-[12.5px] font-bold">
              {(["EN", "RW", "FR", "SW"] as const).map((lang) => (
                <span
                  key={lang}
                  className={`cursor-pointer rounded-full px-2.5 py-1.5 ${language === lang ? "bg-teal-700 text-white" : "text-teal-700"}`}
                  onClick={() => setLanguage(lang)}
                >
                  {lang}
                </span>
              ))}
            </div>
            {user && <NotificationBell />}
          </div>
        </header>

        <section className="pb-3 pt-12">
          <span className="block font-mono text-[12.5px] font-medium uppercase tracking-[0.12em] text-coral-dark">
            Healthcare Professional Portal
          </span>
          <h1 className="mt-3 font-display text-[34px] text-teal-900">
            {user ? `Welcome, ${user.name.split(" ")[0]}` : "Welcome"}
          </h1>
          {user?.healthcareProfessional?.approvalStatus !== "APPROVED" && user?.role === "HEALTHCARE_PROFESSIONAL" && (
            <p className="mt-3 max-w-[560px] rounded-md border border-gold bg-gold-100 px-4 py-3 text-[13.5px] text-[#8A5E1E]">
              Your professional account is still <strong>{user?.healthcareProfessional?.approvalStatus ?? "pending"}</strong> review by an
              administrator. You won&apos;t receive consultations or appointments until it&apos;s approved.
            </p>
          )}
        </section>

        {user === undefined || loading ? (
          <p className="pb-16 text-sm text-ink-soft">Loading…</p>
        ) : (
          <section className="grid grid-cols-1 gap-4 pb-16 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-md border border-[rgba(22,48,44,0.05)] bg-white p-5 shadow-card">
              <div className="text-[12.5px] font-semibold text-ink-soft">Waiting on you</div>
              <div className="mt-2 font-display text-[30px] text-teal-900">{pendingCount}</div>
              <Link href="/consultations" className="mt-2 inline-block text-[12.5px] font-semibold text-teal-700">
                Open queue →
              </Link>
            </div>
            <div className="rounded-md border border-[rgba(22,48,44,0.05)] bg-white p-5 shadow-card">
              <div className="text-[12.5px] font-semibold text-ink-soft">Resolved consultations</div>
              <div className="mt-2 font-display text-[30px] text-teal-900">{resolvedCount}</div>
            </div>
            <div className="rounded-md border border-[rgba(22,48,44,0.05)] bg-white p-5 shadow-card">
              <div className="text-[12.5px] font-semibold text-ink-soft">Upcoming appointments</div>
              <div className="mt-2 font-display text-[30px] text-teal-900">{upcomingAppointments.length}</div>
              <Link href="/appointments" className="mt-2 inline-block text-[12.5px] font-semibold text-teal-700">
                Open calendar →
              </Link>
            </div>
            <div className="rounded-md border border-[rgba(22,48,44,0.05)] bg-white p-5 shadow-card">
              <div className="text-[12.5px] font-semibold text-ink-soft">Completed appointments</div>
              <div className="mt-2 font-display text-[30px] text-teal-900">{completedAppointments}</div>
            </div>

            <div className="sm:col-span-2 lg:col-span-4">
              <div className="rounded-md border border-[rgba(22,48,44,0.05)] bg-white py-1.5 shadow-card">
                <div className="px-5 pb-1.5 pt-[14px] text-base text-teal-900">Next up</div>
                {upcomingAppointments.length === 0 && (
                  <p className="px-5 pb-5 pt-2 text-[13.5px] text-ink-soft">Nothing scheduled yet.</p>
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
    </div>
  );
}
