"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { useToast } from "@/lib/useToast";
import { AppShell } from "@/components/AppShell";
import { useLanguage } from "@/lib/LanguageContext";
import { useRequireUser } from "@/lib/useUserAuth";
import { FullPageLoading } from "@/components/Spinner";
import type { Language } from "@/lib/apiClient";
import { deactivateMyAccount, logoutUser, updateProfile } from "@/lib/userApiClient";
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

  async function handleLogout() {
    await logoutUser();
    router.replace("/login");
  }

  if (authLoading || !user) return <FullPageLoading />;

  return (
    <AppShell active="/profile" session={{ kind: "user", user }}>
      <div className="mx-auto max-w-[1120px] pb-14">
        <section><h1 className="font-display text-[34px] text-teal-900">{t.eyebrow}</h1><p className="mt-1 text-sm text-ink-soft">Manage your account and preferences.</p></section>

        <section className="mt-5 flex flex-col items-center gap-5 rounded-2xl border border-line bg-white p-5 shadow-sm sm:flex-row">
          <div className="relative flex h-28 w-28 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal-100 to-[#D8EEE9] text-3xl font-bold text-teal-700">{user.name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase()}<span className="absolute bottom-1 right-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-teal-900 text-white"><svg width="14" height="14"><use href="#i-edit" /></svg></span></div>
          <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h2 className="text-xl font-bold">{user.name}</h2><span className="rounded-full bg-teal-100 px-3 py-1 text-[10px] font-bold text-success">{ROLE_LABEL[language][user.role] ?? user.role}</span></div><p className="mt-1 text-[11px] uppercase text-ink-soft">{user.role.replaceAll("_", " ")}</p><div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-[11px] text-ink-soft"><span>✉ {user.email}</span>{user.phone && <span>☎ {user.phone}</span>}{(user.district || user.province) && <span>⌖ {[user.district, user.province].filter(Boolean).join(", ")}</span>}</div></div>
        </section>

        <div className="mt-4 flex gap-6 overflow-x-auto border-b border-line px-2"><span className="border-b-2 border-teal-700 px-1 py-3 text-xs font-semibold text-teal-900">Account</span><Link href="/notifications" className="border-b-2 border-transparent px-1 py-3 text-xs text-ink-soft">Preferences</Link><span className="border-b-2 border-transparent px-1 py-3 text-xs text-ink-soft">Privacy & safety</span></div>

        <section className="mt-4 space-y-4">
            <form onSubmit={(e) => void handleSave(e)} className="rounded-2xl border border-line bg-white p-5 shadow-sm">
              <div className="mb-5 flex items-center justify-between"><div><h3 className="text-sm font-bold text-teal-900">Personal information</h3><p className="mt-1 text-[10px] text-ink-soft">Update the details stored on your Inshuti account.</p></div><button type="submit" disabled={saving} className="rounded-lg border border-line px-4 py-2 text-[11px] font-semibold text-teal-700">{saving ? t.saving : t.saveChanges}</button></div>
              <div className="grid gap-4 lg:grid-cols-3">
              <div>

              <label className="mb-1 block text-[12.5px] font-bold text-ink-soft">{t.name}</label>
              <input
                className={`w-full rounded-[10px] border bg-paper-2 px-3.5 py-3 text-sm transition focus:outline-none focus:ring-2 ${errors.name ? "border-danger focus:ring-danger/20" : "border-line focus:border-teal-600 focus:ring-teal-100"}`}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <p className="mb-2.5 mt-1 min-h-[14px] text-xs font-semibold text-danger">{errors.name}</p>
              </div><div>

              <label className="mb-1 block text-[12.5px] font-bold text-ink-soft">{t.phone}</label>
              <input
                className={`w-full rounded-[10px] border bg-paper-2 px-3.5 py-3 text-sm transition focus:outline-none focus:ring-2 ${errors.phone ? "border-danger focus:ring-danger/20" : "border-line focus:border-teal-600 focus:ring-teal-100"}`}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <p className="mb-2.5 mt-1 min-h-[14px] text-xs font-semibold text-danger">{errors.phone}</p>
              </div><div>

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
              </div></div>

              <div className="my-4 border-t border-line" /><p className="mb-3 text-xs text-ink-soft">{LOCATION_LABEL[language].note}</p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {(Object.keys(location) as Array<keyof typeof location>).map((field) => (
                  <label key={field} className="text-[12.5px] font-bold text-ink-soft">
                    {LOCATION_LABEL[language][field]}
                    <input value={location[field]} onChange={(event) => setLocation((current) => ({ ...current, [field]: event.target.value }))} className="mt-1 w-full rounded-[10px] border border-line bg-paper-2 px-3.5 py-3 text-sm font-normal" />
                  </label>
                ))}
              </div>
            </form>

            <div className="grid gap-4 lg:grid-cols-2">
              {user.role === "TEENAGER" && (
                <div className="rounded-2xl border border-line bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between"><h3 className="text-sm font-bold text-teal-900">Privacy & safety</h3><button type="button" onClick={toggleAnonymousMode} className={`rounded-full px-3 py-1.5 text-[10px] font-semibold ${anonymousMode ? "bg-teal-100 text-teal-700" : "bg-gold-100 text-[#8A5E1E]"}`}>{anonymousMode ? t.anonymousOn : t.anonymousOff}</button></div>
                  <h4 className="mt-4 text-xs font-semibold">{t.anonymousMode}</h4><p className="mt-2 text-[11px] leading-5 text-ink-soft">
                    {t.anonymousModeDesc}
                  </p>
                </div>
              )}
              <div className="rounded-2xl border border-line bg-white p-5 shadow-sm">
                <h3 className="text-sm font-bold text-teal-900">{t.notifications}</h3>
                <p className="mt-3 text-[11px] leading-5 text-ink-soft">
                  {t.notificationsDesc}
                </p>
                <Link href="/notifications" className="mt-4 inline-block text-[11px] font-semibold text-teal-700">
                  {t.notificationPreferences}
                </Link>
              </div>
            </div>
            <div className="rounded-2xl border border-line bg-white p-5 shadow-sm"><h3 className="text-sm font-bold text-teal-900">Account & security</h3><div className="mt-4 divide-y divide-line text-[11px]"><div className="flex items-center gap-3 py-3"><svg width="16" height="16" className="text-ink-soft"><use href="#i-lock" /></svg><span className="text-ink-soft">Anonymous session</span><span className="ml-auto max-w-[55%] truncate font-mono text-[10px]">{user.id}</span></div><div className="flex items-center gap-3 py-3"><svg width="16" height="16" className="text-ink-soft"><use href="#i-shield" /></svg><span className="text-ink-soft">Security</span><span className="ml-auto text-right">Your conversations are private and secure</span></div><div className="flex items-center gap-3 py-3"><svg width="16" height="16" className="text-ink-soft"><use href="#i-globe" /></svg><span className="text-ink-soft">Preferred language</span><span className="ml-auto">{LANGUAGE_OPTION_LABEL[preferredLanguage]}</span></div></div><button type="button" onClick={() => void handleDeactivate()} className="mt-4 text-[10px] font-semibold text-red-700">{t.deactivate}</button></div>
            <button type="button" onClick={() => void handleLogout()} className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-200 bg-[#FFF8F7] px-5 py-4 text-[11px] font-semibold text-red-600"><svg width="16" height="16"><use href="#i-logout" /></svg>Log out</button>
          </section>
      </div>
    </AppShell>
  );
}
