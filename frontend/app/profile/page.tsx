"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { useToast } from "@/lib/useToast";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { useLanguage } from "@/lib/LanguageContext";
import { NAV } from "@/lib/i18nCommon";
import type { Language } from "@/lib/apiClient";
import { getCurrentUser, updateProfile, type UserProfile } from "@/lib/userApiClient";
import { isValidPhone } from "@/lib/validation";
import { VALIDATION } from "@/lib/validationMessages";

const ANONYMOUS_MODE_KEY = "inshuti_anonymous_mode";

const ROLE_LABEL: Record<Language, Record<string, string>> = {
  EN: {
    TEENAGER: "Teenager / User",
    PARENT_GUARDIAN: "Parent / Guardian",
    HEALTHCARE_PROFESSIONAL: "Healthcare Professional",
    GOVERNMENT_USER: "Government User",
  },
  RW: {
    TEENAGER: "Ingimbi / Ukoresha",
    PARENT_GUARDIAN: "Umubyeyi / Umurezi",
    HEALTHCARE_PROFESSIONAL: "Umukozi w'Ubuzima",
    GOVERNMENT_USER: "Umukozi wa Leta",
  },
  FR: {
    TEENAGER: "Adolescent / Utilisateur",
    PARENT_GUARDIAN: "Parent / Tuteur",
    HEALTHCARE_PROFESSIONAL: "Professionnel de Santé",
    GOVERNMENT_USER: "Utilisateur Gouvernemental",
  },
  SW: {
    TEENAGER: "Kijana / Mtumiaji",
    PARENT_GUARDIAN: "Mzazi / Mlezi",
    HEALTHCARE_PROFESSIONAL: "Mtaalamu wa Afya",
    GOVERNMENT_USER: "Mtumiaji wa Serikali",
  },
};

const LANGUAGE_OPTION_LABEL: Record<Language, string> = {
  EN: "English",
  RW: "Kinyarwanda",
  FR: "Français",
  SW: "Kiswahili",
};

const COPY: Record<Language, {
  eyebrow: string;
  title: string;
  loading: string;
  loginGate: string;
  logIn: string;
  name: string;
  phone: string;
  preferredLanguage: string;
  saveChanges: string;
  saving: string;
  saved: string;
  saveFailed: string;
  anonymousMode: string;
  anonymousModeDesc: string;
  anonymousOn: string;
  anonymousOff: string;
  notifications: string;
  notificationsDesc: string;
  notificationPreferences: string;
}> = {
  EN: {
    eyebrow: "Profile",
    title: "Your account",
    loading: "Loading…",
    loginGate: "Log in to view your profile.",
    logIn: "Log in",
    name: "Name",
    phone: "Phone (optional)",
    preferredLanguage: "Preferred language",
    saveChanges: "Save changes",
    saving: "Saving…",
    saved: "Profile updated",
    saveFailed: "Failed to update profile",
    anonymousMode: "Anonymous mode",
    anonymousModeDesc:
      "When on, your chats aren't linked to this account and you won't be offered human follow-up — the same private, anonymous flow as chatting without an account.",
    anonymousOn: "On",
    anonymousOff: "Off",
    notifications: "Notifications",
    notificationsDesc: "Manage which channels you're notified on.",
    notificationPreferences: "Notification preferences →",
  },
  RW: {
    eyebrow: "Umwirondoro",
    title: "Konti yawe",
    loading: "Turimo gutegura…",
    loginGate: "Injira kugira ngo urebe umwirondoro wawe.",
    logIn: "Injira",
    name: "Amazina",
    phone: "Telefoni (si ngombwa)",
    preferredLanguage: "Ururimi wifuza",
    saveChanges: "Bika impinduka",
    saving: "Turimo kubika…",
    saved: "Umwirondoro wavuguruwe",
    saveFailed: "Kuvugurura umwirondoro byanze",
    anonymousMode: "Uburyo butazwi",
    anonymousModeDesc:
      "Iyo buri ku gikorwa, ibiganiro byawe ntibihuzwa na konti yawe kandi ntuzahabwa ubufasha bukurikirana n'umuntu — nk'uko biba iyo uganira udafite konti.",
    anonymousOn: "Birakora",
    anonymousOff: "Ntibikora",
    notifications: "Amamenyesha",
    notificationsDesc: "Cunga inzira wifuza kumenyeshwaho.",
    notificationPreferences: "Uburyo bw'amamenyesha →",
  },
  FR: {
    eyebrow: "Profil",
    title: "Votre compte",
    loading: "Chargement…",
    loginGate: "Connectez-vous pour voir votre profil.",
    logIn: "Connexion",
    name: "Nom",
    phone: "Téléphone (facultatif)",
    preferredLanguage: "Langue préférée",
    saveChanges: "Enregistrer les modifications",
    saving: "Enregistrement…",
    saved: "Profil mis à jour",
    saveFailed: "Échec de la mise à jour du profil",
    anonymousMode: "Mode anonyme",
    anonymousModeDesc:
      "Lorsqu'il est activé, vos discussions ne sont pas liées à ce compte et aucun suivi humain ne vous sera proposé — le même parcours privé et anonyme que sans compte.",
    anonymousOn: "Activé",
    anonymousOff: "Désactivé",
    notifications: "Notifications",
    notificationsDesc: "Gérez les canaux sur lesquels vous êtes notifié·e.",
    notificationPreferences: "Préférences de notification →",
  },
  SW: {
    eyebrow: "Wasifu",
    title: "Akaunti yako",
    loading: "Inapakia…",
    loginGate: "Ingia ili kuona wasifu wako.",
    logIn: "Ingia",
    name: "Jina",
    phone: "Simu (si lazima)",
    preferredLanguage: "Lugha unayopendelea",
    saveChanges: "Hifadhi mabadiliko",
    saving: "Inahifadhi…",
    saved: "Wasifu umesasishwa",
    saveFailed: "Imeshindwa kusasisha wasifu",
    anonymousMode: "Hali ya kutokujulikana",
    anonymousModeDesc:
      "Ikiwa imewashwa, mazungumzo yako hayataunganishwa na akaunti hii na hutapewa ufuatiliaji wa kibinadamu — mtiririko sawa wa faragha kama kuongea bila akaunti.",
    anonymousOn: "Imewashwa",
    anonymousOff: "Imezimwa",
    notifications: "Arifa",
    notificationsDesc: "Dhibiti njia unazopenda kufahamishwa.",
    notificationPreferences: "Mapendeleo ya arifa →",
  },
};

export default function ProfilePage() {
  const { toast } = useToast();
  const { language, setLanguage } = useLanguage();
  const nav = NAV[language];
  const t = COPY[language];
  const [user, setUser] = useState<UserProfile | null | undefined>(undefined);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [preferredLanguage, setPreferredLanguage] = useState<Language>("EN");
  const [saving, setSaving] = useState(false);
  const [anonymousMode, setAnonymousMode] = useState(true);
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});
  const v = VALIDATION[language];

  useEffect(() => {
    setAnonymousMode(localStorage.getItem(ANONYMOUS_MODE_KEY) !== "false");
    void getCurrentUser().then((u) => {
      setUser(u);
      if (u) {
        setName(u.name);
        setPhone(u.phone ?? "");
        setPreferredLanguage((u.preferredLanguage as Language) ?? "EN");
      }
    });
  }, []);

  function toggleAnonymousMode() {
    const next = !anonymousMode;
    setAnonymousMode(next);
    localStorage.setItem(ANONYMOUS_MODE_KEY, String(next));
  }

  function validate(): boolean {
    const next: typeof errors = {};
    if (!name.trim()) next.name = v.required;
    if (phone.trim() && !isValidPhone(phone)) next.phone = v.invalidPhone;
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) {
      toast(v.fixErrors, "error");
      return;
    }
    setSaving(true);
    try {
      await updateProfile({ name: name.trim(), phone: phone.trim() || undefined, preferredLanguage });
      setLanguage(preferredLanguage);
      toast(t.saved, "success");
    } catch (err) {
      toast(err instanceof Error ? err.message : t.saveFailed, "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bg-paper">
      <SiteHeader
        activeHref="/profile"
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
          <section className="grid grid-cols-1 gap-4 pb-16 lg:grid-cols-[1.2fr_1fr]">
            <form onSubmit={(e) => void handleSave(e)} className="rounded-md border border-[rgba(22,48,44,0.05)] bg-white p-6 shadow-card">
              <div className="mb-4 flex items-center gap-3">
                <span className="rounded-full bg-teal-100 px-3 py-1 text-[12px] font-bold text-teal-700">
                  {ROLE_LABEL[language][user.role] ?? user.role}
                </span>
                <span className="text-[13px] text-ink-soft">{user.email}</span>
              </div>

              <label className="mb-1 block text-[12.5px] font-bold text-ink-soft">{t.name}</label>
              <input
                className={`w-full rounded-[10px] border bg-paper-2 px-3.5 py-3 text-sm transition focus:outline-none focus:ring-2 ${errors.name ? "border-danger focus:ring-danger/20" : "border-line focus:border-teal-600 focus:ring-teal-100"}`}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <p className="mb-2.5 mt-1 min-h-[14px] text-xs font-semibold text-danger">{errors.name}</p>

              <label className="mb-1 block text-[12.5px] font-bold text-ink-soft">{t.phone}</label>
              <input
                className={`w-full rounded-[10px] border bg-paper-2 px-3.5 py-3 text-sm transition focus:outline-none focus:ring-2 ${errors.phone ? "border-danger focus:ring-danger/20" : "border-line focus:border-teal-600 focus:ring-teal-100"}`}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <p className="mb-2.5 mt-1 min-h-[14px] text-xs font-semibold text-danger">{errors.phone}</p>

              <label className="mb-1 block text-[12.5px] font-bold text-ink-soft">{t.preferredLanguage}</label>
              <select
                className="mb-4 w-full rounded-[10px] border border-line bg-paper-2 px-3.5 py-3 text-sm"
                value={preferredLanguage}
                onChange={(e) => setPreferredLanguage(e.target.value as Language)}
              >
                {(["EN", "RW", "FR", "SW"] as Language[]).map((lang) => (
                  <option key={lang} value={lang}>{LANGUAGE_OPTION_LABEL[lang]}</option>
                ))}
              </select>

              <button
                type="submit"
                disabled={saving}
                className="rounded-full bg-coral px-[26px] py-[13px] text-[15px] font-semibold text-white shadow-[0_8px_20px_rgba(232,115,92,0.35)] transition hover:-translate-y-px hover:bg-coral-dark disabled:opacity-50"
              >
                {saving ? t.saving : t.saveChanges}
              </button>
            </form>

            <div className="flex flex-col gap-4">
              {user.role === "TEENAGER" && (
                <div className="rounded-md border border-[rgba(22,48,44,0.05)] bg-white p-6 shadow-card">
                  <h3 className="mb-2 text-base text-teal-900">{t.anonymousMode}</h3>
                  <p className="mb-4 text-[13px] leading-[1.6] text-ink-soft">
                    {t.anonymousModeDesc}
                  </p>
                  <button
                    type="button"
                    onClick={toggleAnonymousMode}
                    className={`rounded-full px-4 py-2 text-[13px] font-semibold ${
                      anonymousMode ? "bg-teal-100 text-teal-700" : "bg-gold-100 text-[#8A5E1E]"
                    }`}
                  >
                    {t.anonymousMode}: {anonymousMode ? t.anonymousOn : t.anonymousOff}
                  </button>
                </div>
              )}
              <div className="rounded-md border border-[rgba(22,48,44,0.05)] bg-white p-6 shadow-card">
                <h3 className="mb-2 text-base text-teal-900">{t.notifications}</h3>
                <p className="mb-4 text-[13px] leading-[1.6] text-ink-soft">
                  {t.notificationsDesc}
                </p>
                <Link href="/notifications" className="text-[13px] font-semibold text-teal-700">
                  {t.notificationPreferences}
                </Link>
              </div>
            </div>
          </section>
        )}
        <SiteFooter />
      </div>
    </div>
  );
}
