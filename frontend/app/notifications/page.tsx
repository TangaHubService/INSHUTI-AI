"use client";

import { useRouter } from "next/navigation";
import { Fragment, useEffect, useState } from "react";

import { useToast } from "@/lib/useToast";
import { AppShell } from "@/components/AppShell";
import { useLanguage } from "@/lib/LanguageContext";
import { useRequireUser } from "@/lib/useUserAuth";
import { FullPageLoading } from "@/components/Spinner";
import type { Language } from "@/lib/apiClient";
import {
  getNotificationPrefs,
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  updateNotificationPrefs,
  type AppNotification,
  type NotificationChannel,
  type NotificationPrefs,
  type NotificationType,
  getPushConfig,
  savePushSubscription,
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
    loading: "Loading\u2026",
    preferences: "Preferences",
    savePreferences: "Save preferences",
    saving: "Saving\u2026",
    smsNote: "SMS delivery isn't connected to a carrier yet \u2014 turning it on won't send a text until that's set up.",
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
    loading: "Turimo gutegura\u2026",
    preferences: "Uburyo wifuza",
    savePreferences: "Bika uburyo wifuza",
    saving: "Turimo kubika\u2026",
    smsNote: "Kohereza ubutumwa bugufi ntibirakorwa n'uwatanga serivisi \u2014 kubyemeza ntibizohereza ubutumwa kugeza bishyizweho.",
    recent: "Ibiheruka",
    markAllRead: "Byose byasomwe",
    noNotifications: "Nta mamenyesha arahari.",
    saved: "Uburyo bwabitswe",
    saveFailed: "Kubika uburyo byanze",
  },
  FR: {
    eyebrow: "Notifications",
    title: "Restez inform\u00e9\u00b7e",
    subtitle: "Choisissez comment \u00eatre inform\u00e9\u00b7e des rendez-vous, consultations et mises \u00e0 jour de compte.",
    loginGate: "Connectez-vous pour g\u00e9rer vos notifications.",
    logIn: "Connexion",
    loading: "Chargement\u2026",
    preferences: "Pr\u00e9f\u00e9rences",
    savePreferences: "Enregistrer les pr\u00e9f\u00e9rences",
    saving: "Enregistrement\u2026",
    smsNote: "L'envoi de SMS n'est pas encore connect\u00e9 \u00e0 un op\u00e9rateur \u2014 l'activer n'enverra pas de message tant que ce n'est pas configur\u00e9.",
    recent: "R\u00e9cent",
    markAllRead: "Tout marquer comme lu",
    noNotifications: "Aucune notification pour le moment.",
    saved: "Pr\u00e9f\u00e9rences enregistr\u00e9es",
    saveFailed: "\u00c9chec de l'enregistrement des pr\u00e9f\u00e9rences",
  },
  SW: {
    eyebrow: "Arifa",
    title: "Baki na taarifa",
    subtitle: "Chagua jinsi unavyotaka kufahamishwa kuhusu miadi, mashauriano, na masasisho ya akaunti.",
    loginGate: "Ingia ili kudhibiti arifa zako.",
    logIn: "Ingia",
    loading: "Inapakia\u2026",
    preferences: "Mapendeleo",
    savePreferences: "Hifadhi mapendeleo",
    saving: "Inahifadhi\u2026",
    smsNote: "Utumaji wa SMS bado haujaunganishwa na mtoa huduma \u2014 kuwasha hakutatuma ujumbe hadi hilo liwe tayari.",
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
  const { user, loading: authLoading } = useRequireUser();
  const t = COPY[language];
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [prefs, setPrefs] = useState<NotificationPrefs | null>(null);
  const [saving, setSaving] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [filter, setFilter] = useState<"ALL" | "APPOINTMENTS" | "CONSULTATIONS" | "SYSTEM">("ALL");

  function applicationServerKey(value: string): ArrayBuffer {
    const padded = `${value}${"=".repeat((4 - value.length % 4) % 4)}`.replace(/-/g, "+").replace(/_/g, "/");
    const bytes = Uint8Array.from(atob(padded), (char) => char.charCodeAt(0));
    return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
  }

  async function enablePush() {
    try {
      const config = await getPushConfig();
      if (!config.enabled || !config.publicKey) throw new Error("Push delivery has not been configured by an administrator.");
      const permission = await Notification.requestPermission();
      if (permission !== "granted") throw new Error("Notification permission was not granted.");
      const registration = await navigator.serviceWorker.ready;
      const existing = await registration.pushManager.getSubscription();
      const subscription = existing ?? await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: applicationServerKey(config.publicKey) });
      await savePushSubscription(subscription);
      setPushEnabled(true);
      toast("Push notifications enabled", "success");
    } catch (error) {
      toast(error instanceof Error ? error.message : "Could not enable push notifications", "error");
    }
  }

  async function loadAll() {
    const [list, prefsData] = await Promise.all([getNotifications(), getNotificationPrefs()]);
    setNotifications(list.notifications);
    setPrefs(prefsData.prefs);
  }

  useEffect(() => {
    if (user) void loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

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

  if (authLoading || !user) return <FullPageLoading />;

  const filtered = notifications.filter((notification) => {
    if (filter === "ALL") return true;
    if (filter === "APPOINTMENTS") return notification.type === "APPOINTMENT_REMINDER";
    if (filter === "CONSULTATIONS") return notification.type === "CONSULTATION_UPDATE" || notification.type === "REFERRAL";
    return notification.type === "REGISTRATION_CONFIRMATION" || notification.type === "PASSWORD_RESET";
  });
  const groups = filtered.reduce<Record<string, AppNotification[]>>((result, notification) => {
    const created = new Date(notification.createdAt);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
    const key = created >= today ? "Today" : created >= yesterday ? "Yesterday" : "Earlier";
    (result[key] ??= []).push(notification);
    return result;
  }, {});
  const iconFor = (type: NotificationType) => type === "APPOINTMENT_REMINDER" ? "i-calendar" : type === "CONSULTATION_UPDATE" || type === "REFERRAL" ? "i-stethoscope" : type === "PASSWORD_RESET" ? "i-lock" : "i-info";
  const colorFor = (type: NotificationType) => type === "APPOINTMENT_REMINDER" ? "#239B6B" : type === "CONSULTATION_UPDATE" || type === "REFERRAL" ? "#8956E8" : type === "PASSWORD_RESET" ? "#F0A01E" : "#3C8ED8";

  return (
    <AppShell active="/notifications" session={{ kind: "user", user }}>
      <div className="mx-auto max-w-[1120px] pb-14">
        <section className="flex items-start justify-between gap-4"><div><h1 className="font-display text-[34px] text-teal-900">{t.eyebrow}</h1><p className="mt-1 text-sm text-ink-soft">{t.subtitle}</p></div>{notifications.some((n) => !n.read) && <button onClick={() => void handleMarkAll()} className="mt-2 flex items-center gap-2 text-[11px] font-semibold text-success"><span>✓</span>{t.markAllRead}</button>}</section>
        <div className="mt-6 flex gap-2 overflow-x-auto pb-1">{(["ALL", "APPOINTMENTS", "CONSULTATIONS", "SYSTEM"] as const).map((value) => <button key={value} onClick={() => setFilter(value)} className={`rounded-xl border px-4 py-2 text-[11px] font-semibold ${filter === value ? "border-teal-700 bg-teal-700 text-white" : "border-line bg-white text-ink-soft"}`}>{value.charAt(0) + value.slice(1).toLowerCase()}</button>)}</div>

        <section className="grid items-start gap-5 pt-5 xl:grid-cols-[1fr_340px]">
            <div className="space-y-5">
              {filtered.length === 0 && <div className="rounded-2xl border border-line bg-white px-5 py-12 text-center text-sm text-ink-soft">{t.noNotifications}</div>}
              {Object.entries(groups).map(([group, items]) => <div key={group}><h2 className="mb-2 px-1 text-[12px] font-bold text-teal-900">{group}</h2><div className="overflow-hidden rounded-2xl border border-line bg-white shadow-sm">{items.map((n) => { const color = colorFor(n.type); return <button key={n.id} onClick={() => void handleNotificationClick(n)} className={`flex w-full items-center gap-4 border-b border-line px-5 py-4 text-left last:border-0 hover:bg-paper-2 ${n.read ? "" : "bg-[#FBFEFD]"}`}><span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full" style={{ color, background: `${color}14` }}>{!n.read && <i className="absolute -left-4 h-2 w-2 rounded-full bg-success" />}<svg width="21" height="21"><use href={`#${iconFor(n.type)}`} /></svg></span><span className="min-w-0 flex-1"><strong className="block text-[12px] text-ink">{n.title}</strong><span className="mt-1 block text-[11px] leading-5 text-ink-soft">{n.body}</span><span className="mt-1 block text-[9.5px] text-ink-soft">{relativeTime(n.createdAt, language)}</span></span>{NOTIFICATION_LINK[n.type] && <span className="text-xl text-ink-soft">›</span>}</button>; })}</div></div>)}
            </div>

            <aside className="rounded-2xl border border-line bg-white p-5 shadow-sm xl:sticky xl:top-5">
              <h3 className="mb-4 text-base text-teal-900">{t.preferences}</h3>
              {prefs && (
                <>
                  <div className="grid grid-cols-[1.4fr_repeat(3,0.7fr)] items-center gap-y-3 text-[11px]">
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
                              className="h-4 w-4 rounded accent-teal-700 transition"
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
                    className="mt-5 w-full rounded-xl bg-teal-700 px-5 py-3 text-[12px] font-semibold text-white transition hover:bg-teal-900 disabled:opacity-50"
                  >
                    {saving ? t.saving : t.savePreferences}
                  </button>
                  <p className="mt-3 text-[12px] leading-[1.5] text-ink-soft">
                    {t.smsNote}
                  </p>
                  <button type="button" onClick={() => void enablePush()} disabled={pushEnabled} className="mt-3 w-full rounded-xl border border-teal-700 px-4 py-2.5 text-[11px] font-semibold text-teal-700 disabled:opacity-60">
                    {pushEnabled ? "Push notifications enabled" : "Enable browser push notifications"}
                  </button>
                </>
              )}
            </aside>
          </section>
      </div>
    </AppShell>
  );
}
