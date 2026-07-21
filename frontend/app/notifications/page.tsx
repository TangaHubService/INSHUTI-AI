"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Fragment, useEffect, useState } from "react";

import { useToast } from "@/lib/useToast";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { useLanguage } from "@/lib/LanguageContext";
import { NAV } from "@/lib/i18nCommon";
import type { Language } from "@/lib/apiClient";
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

const TYPE_LABEL: Record<Language, Record<NotificationType, string>> = {
  EN: {
    REGISTRATION_CONFIRMATION: "Registration confirmation",
    APPOINTMENT_REMINDER: "Appointment reminders",
    CONSULTATION_UPDATE: "Consultation updates",
    REFERRAL: "Referral notifications",
    PASSWORD_RESET: "Password reset",
  },
  RW: {
    REGISTRATION_CONFIRMATION: "Iyemeza ryo kwiyandikisha",
    APPOINTMENT_REMINDER: "Kwibutsa gahunda",
    CONSULTATION_UPDATE: "Amakuru y'ubujyanama",
    REFERRAL: "Amamenyesha yo kohererezwa",
    PASSWORD_RESET: "Guhindura ijambobanga",
  },
  FR: {
    REGISTRATION_CONFIRMATION: "Confirmation d'inscription",
    APPOINTMENT_REMINDER: "Rappels de rendez-vous",
    CONSULTATION_UPDATE: "Mises à jour des consultations",
    REFERRAL: "Notifications de référence",
    PASSWORD_RESET: "Réinitialisation du mot de passe",
  },
  SW: {
    REGISTRATION_CONFIRMATION: "Uthibitisho wa usajili",
    APPOINTMENT_REMINDER: "Vikumbusho vya miadi",
    CONSULTATION_UPDATE: "Taarifa za mashauriano",
    REFERRAL: "Arifa za rufaa",
    PASSWORD_RESET: "Kuweka upya nywila",
  },
};

const CHANNEL_LABEL: Record<Language, Record<NotificationChannel, string>> = {
  EN: { IN_APP: "In-app", EMAIL: "Email", SMS: "SMS" },
  RW: { IN_APP: "Muri porogaramu", EMAIL: "Imeri", SMS: "SMS" },
  FR: { IN_APP: "Dans l'appli", EMAIL: "Email", SMS: "SMS" },
  SW: { IN_APP: "Ndani ya programu", EMAIL: "Barua pepe", SMS: "SMS" },
};

// Where clicking a notification should take the user, keyed by its type.
// PASSWORD_RESET is left out: its action is the reset link inside the body
// text itself, not a page in the app.
const NOTIFICATION_LINK: Partial<Record<NotificationType, string>> = {
  APPOINTMENT_REMINDER: "/appointments",
  CONSULTATION_UPDATE: "/consultations",
  REFERRAL: "/consultations",
  REGISTRATION_CONFIRMATION: "/profile",
};

const COPY: Record<Language, {
  eyebrow: string;
  title: string;
  subtitle: string;
  loginGate: string;
  logIn: string;
  loading: string;
  preferences: string;
  savePreferences: string;
  saving: string;
  smsNote: string;
  recent: string;
  markAllRead: string;
  noNotifications: string;
  saved: string;
  saveFailed: string;
}> = {
  EN: {
    eyebrow: "Notifications",
    title: "Stay in the loop",
    subtitle: "Choose how you'd like to hear about appointments, consultations, and account updates.",
    loginGate: "Log in to manage your notifications.",
    logIn: "Log in",
    loading: "Loading…",
    preferences: "Preferences",
    savePreferences: "Save preferences",
    saving: "Saving…",
    smsNote: "SMS delivery isn't connected to a carrier yet — turning it on won't send a text until that's set up.",
    recent: "Recent",
    markAllRead: "Mark all read",
    noNotifications: "No notifications yet.",
    saved: "Preferences saved",
    saveFailed: "Failed to save preferences",
  },
  RW: {
    eyebrow: "Amamenyesha",
    title: "Menya ibigenda biba",
    subtitle: "Hitamo uburyo ushaka kumenyeshwa ku gahunda, ubujyanama, n'amakuru ya konti yawe.",
    loginGate: "Injira kugira ngo ucunge amamenyesha yawe.",
    logIn: "Injira",
    loading: "Turimo gutegura…",
    preferences: "Uburyo wifuza",
    savePreferences: "Bika uburyo wifuza",
    saving: "Turimo kubika…",
    smsNote: "Kohereza ubutumwa bugufi ntibirakorwa n'uwatanga serivisi — kubyemeza ntibizohereza ubutumwa kugeza bishyizweho.",
    recent: "Ibiheruka",
    markAllRead: "Byose byasomwe",
    noNotifications: "Nta mamenyesha arahari.",
    saved: "Uburyo bwabitswe",
    saveFailed: "Kubika uburyo byanze",
  },
  FR: {
    eyebrow: "Notifications",
    title: "Restez informé·e",
    subtitle: "Choisissez comment être informé·e des rendez-vous, consultations et mises à jour de compte.",
    loginGate: "Connectez-vous pour gérer vos notifications.",
    logIn: "Connexion",
    loading: "Chargement…",
    preferences: "Préférences",
    savePreferences: "Enregistrer les préférences",
    saving: "Enregistrement…",
    smsNote: "L'envoi de SMS n'est pas encore connecté à un opérateur — l'activer n'enverra pas de message tant que ce n'est pas configuré.",
    recent: "Récent",
    markAllRead: "Tout marquer comme lu",
    noNotifications: "Aucune notification pour le moment.",
    saved: "Préférences enregistrées",
    saveFailed: "Échec de l'enregistrement des préférences",
  },
  SW: {
    eyebrow: "Arifa",
    title: "Baki na taarifa",
    subtitle: "Chagua jinsi unavyotaka kufahamishwa kuhusu miadi, mashauriano, na masasisho ya akaunti.",
    loginGate: "Ingia ili kudhibiti arifa zako.",
    logIn: "Ingia",
    loading: "Inapakia…",
    preferences: "Mapendeleo",
    savePreferences: "Hifadhi mapendeleo",
    saving: "Inahifadhi…",
    smsNote: "Utumaji wa SMS bado haujaunganishwa na mtoa huduma — kuwasha hakutatuma ujumbe hadi hilo liwe tayari.",
    recent: "Hivi karibuni",
    markAllRead: "Weka zote kama zimesomwa",
    noNotifications: "Hakuna arifa bado.",
    saved: "Mapendeleo yamehifadhiwa",
    saveFailed: "Imeshindwa kuhifadhi mapendeleo",
  },
};

function relativeTime(iso: string, language: Language): string {
  const date = new Date(iso);
  const diffMs = Date.now() - date.getTime();
  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));
  const TODAY: Record<Language, string> = { EN: "Today", RW: "Uyu munsi", FR: "Aujourd'hui", SW: "Leo" };
  const YESTERDAY: Record<Language, string> = { EN: "Yesterday", RW: "Ejo hashize", FR: "Hier", SW: "Jana" };
  const DAYS_AGO: Record<Language, (n: number) => string> = {
    EN: (n) => `${n} days ago`,
    RW: (n) => `Iminsi ${n} ishize`,
    FR: (n) => `Il y a ${n} jours`,
    SW: (n) => `Siku ${n} zilizopita`,
  };
  const WEEKS_AGO: Record<Language, (n: number) => string> = {
    EN: (n) => `${n} week(s) ago`,
    RW: (n) => `Ibyumweru ${n} bishize`,
    FR: (n) => `Il y a ${n} semaine(s)`,
    SW: (n) => `Wiki ${n} zilizopita`,
  };
  if (diffDays <= 0) return `${TODAY[language]}, ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  if (diffDays === 1) return YESTERDAY[language];
  if (diffDays < 7) return DAYS_AGO[language](diffDays);
  return WEEKS_AGO[language](Math.floor(diffDays / 7));
}

export default function NotificationsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { language } = useLanguage();
  const nav = NAV[language];
  const t = COPY[language];
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
      toast(t.saved, "success");
    } catch (err) {
      toast(err instanceof Error ? err.message : t.saveFailed, "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleMarkAll() {
    await markAllNotificationsRead();
    await loadAll();
  }

  async function handleNotificationClick(n: AppNotification) {
    if (!n.read) {
      await markNotificationRead(n.id);
      await loadAll();
    }
    const href = NOTIFICATION_LINK[n.type];
    if (href) router.push(href);
  }

  return (
    <div className="bg-paper">
      <SiteHeader
        activeHref="/notifications"
        navItems={[
          { href: "/chat", label: nav.chat },
          { href: "/my-space", label: nav.mySpace },
          { href: "/appointments", label: nav.appointments },
          { href: "/consultations", label: nav.consultations },
          { href: "/profile", label: nav.profile },
        ]}
      />
      <div className="mx-auto max-w-[1160px] px-5 sm:px-8">
        <section className="pb-3 pt-12">
          <span className="block font-mono text-[12.5px] font-medium uppercase tracking-[0.12em] text-coral-dark">
            {t.eyebrow}
          </span>
          <h1 className="mt-3 font-display text-[34px] text-teal-900">{t.title}</h1>
          <p className="mt-[10px] max-w-[520px] text-[14.5px] leading-[1.6] text-ink-soft">
            {t.subtitle}
          </p>
        </section>

        {user === undefined && <p className="pb-16 text-sm text-ink-soft">{t.loading}</p>}

        {user === null && (
          <div className="mb-16 rounded-md border border-[rgba(22,48,44,0.05)] bg-white p-8 text-center shadow-card">
            <p className="text-[14.5px] text-ink-soft">{t.loginGate}</p>
            <Link
              href="/login"
              className="mt-4 inline-flex items-center justify-center gap-2 rounded-full bg-coral px-5 py-[11px] text-[14px] font-semibold text-white shadow-[0_8px_20px_rgba(232,115,92,0.35)] transition hover:-translate-y-px hover:bg-coral-dark"
            >
              {t.logIn}
            </Link>
          </div>
        )}

        {user && (
          <section className="grid grid-cols-1 items-start gap-4 pb-16 pt-5 lg:grid-cols-[1fr_1.1fr]">
            <div className="rounded-md border border-[rgba(22,48,44,0.05)] bg-white p-5 shadow-card">
              <h3 className="mb-4 text-base text-teal-900">{t.preferences}</h3>
              {prefs && (
                <>
                  <div className="grid grid-cols-[1.4fr_repeat(3,0.7fr)] items-center gap-y-3 text-[13px]">
                    <span />
                    {(["IN_APP", "EMAIL", "SMS"] as NotificationChannel[]).map((channel) => (
                      <span key={channel} className="text-center font-bold text-ink-soft">{CHANNEL_LABEL[language][channel]}</span>
                    ))}
                    {(Object.keys(TYPE_LABEL.EN) as NotificationType[]).map((type) => (
                      <Fragment key={type}>
                        <span className="font-semibold text-ink">{TYPE_LABEL[language][type]}</span>
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
                    {saving ? t.saving : t.savePreferences}
                  </button>
                  <p className="mt-3 text-[12px] leading-[1.5] text-ink-soft">
                    {t.smsNote}
                  </p>
                </>
              )}
            </div>

            <div className="rounded-md border border-[rgba(22,48,44,0.05)] bg-white py-1.5 shadow-card">
              <div className="flex items-center justify-between px-5 pb-1.5 pt-[14px]">
                <h3 className="text-base text-teal-900">{t.recent}</h3>
                {notifications.some((n) => !n.read) && (
                  <button onClick={() => void handleMarkAll()} className="text-[13px] font-semibold text-ink-soft hover:text-teal-700">
                    {t.markAllRead}
                  </button>
                )}
              </div>

              {notifications.length === 0 && (
                <p className="px-5 pb-5 pt-2 text-[13.5px] text-ink-soft">{t.noNotifications}</p>
              )}

              {notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => void handleNotificationClick(n)}
                  className={`block w-full border-b border-line px-5 py-4 text-left last:border-b-0 ${n.read ? "" : "bg-teal-100/30"}`}
                >
                  <div className="text-sm font-semibold text-ink">{n.title}</div>
                  <div className="mt-1 text-[13px] text-ink-soft">{n.body}</div>
                  <div className="mt-1.5 text-[11px] text-ink-soft">{relativeTime(n.createdAt, language)}</div>
                </button>
              ))}
            </div>
          </section>
        )}
        <SiteFooter />
      </div>
    </div>
  );
}
