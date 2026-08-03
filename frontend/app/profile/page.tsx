"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { useToast } from "@/lib/useToast";
import { AppShell } from "@/components/AppShell";
import { useLanguage } from "@/lib/LanguageContext";
import { useRequireUser } from "@/lib/useUserAuth";
import { FullPageLoading } from "@/components/Spinner";
import type { Language } from "@/lib/apiClient";
import { deactivateMyAccount, updateProfile } from "@/lib/userApiClient";
import { useRouter } from "next/navigation";
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

const LOCATION_LABEL: Record<Language, { province: string; district: string; sector: string; cell: string; note: string }> = {
  EN: { province: "Province", district: "District", sector: "Sector", cell: "Cell", note: "Optional. Used only for anonymous regional statistics and finding nearby care." },
  RW: { province: "Intara", district: "Akarere", sector: "Umurenge", cell: "Akagari", note: "Si ngombwa. Bikoreshwa gusa mu mibare rusange no kubona ubuvuzi hafi." },
  FR: { province: "Province", district: "District", sector: "Secteur", cell: "Cellule", note: "Facultatif. Utilisé uniquement pour les statistiques régionales agrégées et les soins à proximité." },
  SW: { province: "Mkoa", district: "Wilaya", sector: "Sekta", cell: "Kijiji", note: "Si lazima. Hutumiwa tu kwa takwimu za jumla na kupata huduma zilizo karibu." },
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
  deactivate: string;
  deactivatePrompt: string;
  deactivateConfirm: string;
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
    deactivate: "Deactivate and anonymize my account",
    deactivatePrompt: "Enter your password to continue",
    deactivateConfirm: "Deactivate this account? You will be signed out.",
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
    deactivate: "Funga kandi uhindure konti yanjye itazwi",
    deactivatePrompt: "Andika ijambo ry'ibanga kugira ngo ukomeze",
    deactivateConfirm: "Urashaka gufunga iyi konti? Urahita usohoka.",
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
    deactivate: "Désactiver et anonymiser mon compte",
    deactivatePrompt: "Saisissez votre mot de passe pour continuer",
    deactivateConfirm: "Désactiver ce compte ? Vous serez déconnecté·e.",
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
    deactivate: "Zima na uondoe utambulisho wa akaunti yangu",
    deactivatePrompt: "Weka nenosiri lako ili kuendelea",
    deactivateConfirm: "Zima akaunti hii? Utaondolewa kwenye mfumo.",
  },
};

export default function ProfilePage() {
  const router = useRouter();
  const { toast } = useToast();
  const { language, setLanguage } = useLanguage();
  const { user, loading: authLoading } = useRequireUser();
  const t = COPY[language];
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [preferredLanguage, setPreferredLanguage] = useState<Language>("EN");
  const [saving, setSaving] = useState(false);
  const [anonymousMode, setAnonymousMode] = useState(true);
  const [location, setLocation] = useState({ province: "", district: "", sector: "", cell: "" });
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});
  const v = VALIDATION[language];

  useEffect(() => {
    setAnonymousMode(localStorage.getItem(ANONYMOUS_MODE_KEY) !== "false");
  }, []);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setPhone(user.phone ?? "");
      setPreferredLanguage((user.preferredLanguage as Language) ?? "EN");
      setLocation({ province: user.province ?? "", district: user.district ?? "", sector: user.sector ?? "", cell: user.cell ?? "" });
    }
  }, [user]);

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
      await updateProfile({ name: name.trim(), phone: phone.trim() || undefined, preferredLanguage, ...Object.fromEntries(Object.entries(location).map(([key, value]) => [key, value.trim() || null])) });
      setLanguage(preferredLanguage);
      toast(t.saved, "success");
    } catch (err) {
      toast(err instanceof Error ? err.message : t.saveFailed, "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeactivate() {
    if (!window.confirm(t.deactivateConfirm)) return;
    const password = window.prompt(t.deactivatePrompt);
    if (!password) return;
    try {
      await deactivateMyAccount(password);
      router.replace("/");
    } catch (error) {
      toast(error instanceof Error ? error.message : t.saveFailed, "error");
    }
  }

  if (authLoading || !user) return <FullPageLoading />;

  return (
    <AppShell active="/profile" session={{ kind: "user", user }}>
      <div className="mx-auto max-w-[1160px]">
        <section className="pb-3">
          <span className="block font-mono text-[12.5px] font-medium uppercase tracking-[0.12em] text-coral-dark">
            {t.eyebrow}
          </span>
          <h1 className="mt-3 font-display text-[34px] text-teal-900">{t.title}</h1>
        </section>

        <section className="grid grid-cols-1 gap-4 pb-16 lg:grid-cols-[1.2fr_1fr]">
            <form onSubmit={(e) => void handleSave(e)} className="card p-6">
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

              <p className="mb-3 text-xs text-ink-soft">{LOCATION_LABEL[language].note}</p>
              <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {(Object.keys(location) as Array<keyof typeof location>).map((field) => (
                  <label key={field} className="text-[12.5px] font-bold text-ink-soft">
                    {LOCATION_LABEL[language][field]}
                    <input value={location[field]} onChange={(event) => setLocation((current) => ({ ...current, [field]: event.target.value }))} className="mt-1 w-full rounded-[10px] border border-line bg-paper-2 px-3.5 py-3 text-sm font-normal" />
                  </label>
                ))}
              </div>

              <button
                type="submit"
                disabled={saving}
                className="rounded-full bg-coral px-[26px] py-[13px] text-[15px] font-semibold text-white shadow-btn transition hover:-translate-y-px hover:bg-coral-dark disabled:opacity-50"
              >
                {saving ? t.saving : t.saveChanges}
              </button>
            </form>

            <div className="flex flex-col gap-4">
              {user.role === "TEENAGER" && (
                <div className="card p-6">
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
              <div className="card p-6">
                <h3 className="mb-2 text-base text-teal-900">{t.notifications}</h3>
                <p className="mb-4 text-[13px] leading-[1.6] text-ink-soft">
                  {t.notificationsDesc}
                </p>
                <Link href="/notifications" className="text-[13px] font-semibold text-teal-700">
                  {t.notificationPreferences}
                </Link>
              </div>
              <div className="card border border-red-200 p-6">
                <button type="button" onClick={() => void handleDeactivate()} className="text-[13px] font-semibold text-red-700">
                  {t.deactivate}
                </button>
              </div>
            </div>
          </section>
      </div>
    </AppShell>
  );
}
