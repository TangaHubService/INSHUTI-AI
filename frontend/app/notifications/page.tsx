"use client";

import Link from "next/link";
import { Fragment, useEffect, useState } from "react";

import { useToast } from "@/lib/useToast";
import {
  getCurrentUser,
  getNotificationPrefs,
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  updateNotificationPrefs,
  type AppNotification,
  type NotificationChannel,
  type NotificationPrefs,
  type NotificationType,
  type UserProfile,
} from "@/lib/userApiClient";

const TYPE_LABEL: Record<NotificationType, string> = {
  REGISTRATION_CONFIRMATION: "Registration confirmation",
  APPOINTMENT_REMINDER: "Appointment reminders",
  CONSULTATION_UPDATE: "Consultation updates",
  REFERRAL: "Referral notifications",
  PASSWORD_RESET: "Password reset",
};

const CHANNEL_LABEL: Record<NotificationChannel, string> = {
  IN_APP: "In-app",
  EMAIL: "Email",
  SMS: "SMS",
};

function relativeTime(iso: string): string {
  const date = new Date(iso);
  const diffMs = Date.now() - date.getTime();
  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));
  if (diffDays <= 0) return `Today, ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return `${Math.floor(diffDays / 7)} week(s) ago`;
}

export default function NotificationsPage() {
  const { toast } = useToast();
  const [user, setUser] = useState<UserProfile | null | undefined>(undefined);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [prefs, setPrefs] = useState<NotificationPrefs | null>(null);
  const [saving, setSaving] = useState(false);

  async function loadAll() {
    const [list, prefsData] = await Promise.all([getNotifications(), getNotificationPrefs()]);
    setNotifications(list.notifications);
    setPrefs(prefsData.prefs);
  }

  useEffect(() => {
    void getCurrentUser().then((u) => {
      setUser(u);
      if (u) void loadAll();
    });
  }, []);

  function toggle(type: NotificationType, channel: NotificationChannel) {
    if (!prefs) return;
    setPrefs({ ...prefs, [type]: { ...prefs[type], [channel]: !prefs[type][channel] } });
  }

  async function handleSave() {
    if (!prefs) return;
    setSaving(true);
    try {
      const updated = await updateNotificationPrefs(prefs);
      setPrefs(updated);
      toast("Preferences saved", "success");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to save preferences", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleMarkAll() {
    await markAllNotificationsRead();
    await loadAll();
  }

  async function handleMarkOne(id: string) {
    await markNotificationRead(id);
    await loadAll();
  }

  return (
    <div className="bg-paper">
      <div className="mx-auto max-w-[1160px] px-8">
        <header className="flex items-center justify-between border-b border-line py-[22px]">
          <div className="flex items-center gap-2.5">
            <svg className="inline-flex" width="34" height="34" viewBox="0 0 64 64">
              <use href="#mark-knot" />
            </svg>
            <span className="font-display text-[22px] font-bold text-teal-900">Inshuti</span>
          </div>
          <nav className="flex items-center gap-8 text-[14.5px] font-semibold text-ink-soft">
            <Link href="/" className="hover:text-teal-700">Home</Link>
            <Link href="/chat" className="hover:text-teal-700">Chat</Link>
            <Link href="/my-space" className="hover:text-teal-700">My Space</Link>
            <Link href="/appointments" className="hover:text-teal-700">Appointments</Link>
            <Link href="/consultations" className="hover:text-teal-700">Consultations</Link>
            <Link href="/profile" className="hover:text-teal-700">Profile</Link>
          </nav>
        </header>

        <section className="pb-3 pt-12">
          <span className="block font-mono text-[12.5px] font-medium uppercase tracking-[0.12em] text-coral-dark">
            Notifications
          </span>
          <h1 className="mt-3 font-display text-[34px] text-teal-900">Stay in the loop</h1>
          <p className="mt-[10px] max-w-[520px] text-[14.5px] leading-[1.6] text-ink-soft">
            Choose how you&apos;d like to hear about appointments, consultations, and account updates.
          </p>
        </section>

        {user === undefined && <p className="pb-16 text-sm text-ink-soft">Loading…</p>}

        {user === null && (
          <div className="mb-16 rounded-md border border-[rgba(22,48,44,0.05)] bg-white p-8 text-center shadow-card">
            <p className="text-[14.5px] text-ink-soft">Log in to manage your notifications.</p>
            <Link
              href="/login"
              className="mt-4 inline-flex items-center justify-center gap-2 rounded-full bg-coral px-5 py-[11px] text-[14px] font-semibold text-white shadow-[0_8px_20px_rgba(232,115,92,0.35)] transition hover:-translate-y-px hover:bg-coral-dark"
            >
              Log in
            </Link>
          </div>
        )}

        {user && (
          <section className="grid grid-cols-1 items-start gap-4 pb-16 pt-5 lg:grid-cols-[1fr_1.1fr]">
            <div className="rounded-md border border-[rgba(22,48,44,0.05)] bg-white p-5 shadow-card">
              <h3 className="mb-4 text-base text-teal-900">Preferences</h3>
              {prefs && (
                <>
                  <div className="grid grid-cols-[1.4fr_repeat(3,0.7fr)] items-center gap-y-3 text-[13px]">
                    <span />
                    {(["IN_APP", "EMAIL", "SMS"] as NotificationChannel[]).map((channel) => (
                      <span key={channel} className="text-center font-bold text-ink-soft">{CHANNEL_LABEL[channel]}</span>
                    ))}
                    {(Object.keys(TYPE_LABEL) as NotificationType[]).map((type) => (
                      <Fragment key={type}>
                        <span className="font-semibold text-ink">{TYPE_LABEL[type]}</span>
                        {(["IN_APP", "EMAIL", "SMS"] as NotificationChannel[]).map((channel) => (
                          <span key={`${type}-${channel}`} className="flex justify-center">
                            <input
                              type="checkbox"
                              className="h-4 w-4 accent-teal-700"
                              checked={prefs[type][channel]}
                              onChange={() => toggle(type, channel)}
                            />
                          </span>
                        ))}
                      </Fragment>
                    ))}
                  </div>
                  <button
                    onClick={() => void handleSave()}
                    disabled={saving}
                    className="mt-5 w-full rounded-full bg-coral px-[26px] py-[13px] text-[15px] font-semibold text-white shadow-[0_8px_20px_rgba(232,115,92,0.35)] transition hover:-translate-y-px hover:bg-coral-dark disabled:opacity-50"
                  >
                    {saving ? "Saving…" : "Save preferences"}
                  </button>
                  <p className="mt-3 text-[12px] leading-[1.5] text-ink-soft">
                    SMS delivery isn&apos;t connected to a carrier yet — turning it on won&apos;t send a text until that&apos;s set up.
                  </p>
                </>
              )}
            </div>

            <div className="rounded-md border border-[rgba(22,48,44,0.05)] bg-white py-1.5 shadow-card">
              <div className="flex items-center justify-between px-5 pb-1.5 pt-[14px]">
                <h3 className="text-base text-teal-900">Recent</h3>
                {notifications.some((n) => !n.read) && (
                  <button onClick={() => void handleMarkAll()} className="text-[13px] font-semibold text-ink-soft hover:text-teal-700">
                    Mark all read
                  </button>
                )}
              </div>

              {notifications.length === 0 && (
                <p className="px-5 pb-5 pt-2 text-[13.5px] text-ink-soft">No notifications yet.</p>
              )}

              {notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => !n.read && void handleMarkOne(n.id)}
                  className={`block w-full border-b border-line px-5 py-4 text-left last:border-b-0 ${n.read ? "" : "bg-teal-100/30"}`}
                >
                  <div className="text-sm font-semibold text-ink">{n.title}</div>
                  <div className="mt-1 text-[13px] text-ink-soft">{n.body}</div>
                  <div className="mt-1.5 text-[11px] text-ink-soft">{relativeTime(n.createdAt)}</div>
                </button>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
