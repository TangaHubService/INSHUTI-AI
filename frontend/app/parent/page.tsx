"use client";

import Link from "next/link";
import { Logo } from "@/components/Logo";
import { useEffect, useState } from "react";

import { NotificationBell } from "@/components/NotificationBell";
import type { Language } from "@/lib/apiClient";
import {
  getCurrentUser,
  getMyAppointments,
  getNotifications,
  type AppNotification,
  type Appointment,
  type UserProfile,
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
  const [language, setLanguage] = useState<Language>("EN");
  const [user, setUser] = useState<UserProfile | null | undefined>(undefined);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void getCurrentUser().then(setUser);
  }, []);

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

  const upcoming = appointments.filter((a) => a.status === "CONFIRMED" || a.status === "REQUESTED" || a.status === "RESCHEDULED").slice(0, 4);

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
            <Link href="/chat" className="hover:text-teal-700">Chat</Link>
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
            Parent & Guardian Portal
          </span>
          <h1 className="mt-3 font-display text-[34px] text-teal-900">
            {user ? `Welcome, ${user.name.split(" ")[0]}` : "Welcome"}
          </h1>
          <p className="mt-[10px] max-w-[560px] text-[14.5px] leading-[1.6] text-ink-soft">
            Resources, appointments, and updates in one place.
          </p>
        </section>

        {user === undefined || loading ? (
          <p className="pb-16 text-sm text-ink-soft">Loading…</p>
        ) : (
          <section className="grid grid-cols-1 gap-4 pb-16 lg:grid-cols-[1.2fr_1fr]">
            <div>
              <div className="mb-4 rounded-md border border-[rgba(22,48,44,0.05)] bg-white py-1.5 shadow-card">
                <div className="flex items-center justify-between px-5 pb-1.5 pt-[14px]">
                  <h3 className="text-base text-teal-900">Upcoming appointments</h3>
                  <Link href="/appointments" className="text-[12.5px] font-semibold text-teal-700">Manage →</Link>
                </div>
                {upcoming.length === 0 && (
                  <p className="px-5 pb-5 pt-2 text-[13.5px] text-ink-soft">Nothing scheduled. You can request one from Appointments.</p>
                )}
                {upcoming.map((appt) => (
                  <div key={appt.id} className="flex items-center justify-between border-b border-line px-5 py-3 last:border-b-0">
                    <div>
                      <div className="text-sm font-semibold text-ink">{appt.professional.name}</div>
                      <div className="text-xs text-ink-soft">{formatDateTime(appt.requestedTime)}</div>
                    </div>
                    <span className="rounded-full bg-teal-100 px-2.5 py-1 text-[11px] font-bold text-teal-700">{appt.status}</span>
                  </div>
                ))}
              </div>

              <div className="rounded-md border border-[rgba(22,48,44,0.05)] bg-white p-[22px] shadow-card">
                <h3 className="mb-4 text-base text-teal-900">Educational resources</h3>
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
                      <span className="text-[12.5px] font-semibold text-ink">{topic.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-md border border-[rgba(22,48,44,0.05)] bg-white py-1.5 shadow-card">
              <div className="px-5 pb-1.5 pt-[14px] text-base text-teal-900">Recent notifications</div>
              {notifications.length === 0 && (
                <p className="px-5 pb-5 pt-2 text-[13.5px] text-ink-soft">Nothing new.</p>
              )}
              {notifications.slice(0, 6).map((n) => (
                <div key={n.id} className="border-b border-line px-5 py-3 last:border-b-0">
                  <div className="text-sm font-semibold text-ink">{n.title}</div>
                  <div className="mt-1 text-xs text-ink-soft">{n.body}</div>
                </div>
              ))}
              <div className="px-5 py-3">
                <Link href="/notifications" className="text-[12.5px] font-semibold text-teal-700">View all →</Link>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
