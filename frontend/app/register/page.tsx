"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useToast } from "@/lib/useToast";
import { registerUser, type UserRole, type ProfessionalType, type GovLevel } from "@/lib/userApiClient";
import type { Language } from "@/lib/apiClient";
import { PasswordInput } from "@/components/PasswordInput";

const ROLES: { value: UserRole; label: Record<Language, string>; desc: Record<Language, string>; icon: string; color: string }[] = [
  { value: "TEENAGER", label: { EN: "Teenager / User", RW: "Ingimbi / Ukoresha", FR: "Adolescent / Utilisateur", SW: "Kijana / Mtumiaji" }, desc: { EN: "Ages 10\u201319", RW: "Imyaka 10\u201319", FR: "\u00c2ges 10\u201319", SW: "Umri 10\u201319" }, icon: "i-user-check", color: "text-teal-700" },
  { value: "PARENT_GUARDIAN", label: { EN: "Parent / Guardian", RW: "Umubyeyi / Umurezi", FR: "Parent / Tuteur", SW: "Mzazi / Mlezi" }, desc: { EN: "", RW: "", FR: "", SW: "" }, icon: "i-heart", color: "text-[#8A5E1E]" },
  { value: "HEALTHCARE_PROFESSIONAL", label: { EN: "Healthcare Professional", RW: "Umukozi w'Ubuzima", FR: "Professionnel de Sant\u00e9", SW: "Mtaalamu wa Afya" }, desc: { EN: "Requires approval", RW: "Bisaba kwemererwa", FR: "N\u00e9cessite approbation", SW: "Inahitaji idhini" }, icon: "i-stethoscope", color: "text-teal-700" },
  { value: "GOVERNMENT_USER", label: { EN: "Government User", RW: "Umukozi wa Leta", FR: "Utilisateur Gouvernemental", SW: "Mtumiaji wa Serikali" }, desc: { EN: "Requires approval", RW: "Bisaba kwemererwa", FR: "N\u00e9cessite approbation", SW: "Inahitaji idhini" }, icon: "i-building", color: "text-coral-dark" },
];

const PROFESSIONAL_TYPES: ProfessionalType[] = ["CHW", "NURSE", "MIDWIFE", "PSYCHOLOGIST", "DOCTOR"];
const GOV_LEVELS: GovLevel[] = ["NATIONAL", "PROVINCIAL", "DISTRICT", "SECTOR", "CELL"];

const LANGUAGES: Language[] = ["EN", "RW", "FR", "SW"];

const MSG: Record<Language, {
  title: string; heading: string; subtitle: string; name: string; email: string;
  langPref: string; password: string; passwordPlaceholder: string; profType: string;
  specialization: string; specPlaceholder: string; govLevel: string; region: string;
  regionPlaceholder: string; create: string; creating: string; haveAccount: string;
  login: string; fill: string;
}> = {
  EN: {
    title: "Create an account", heading: "Join Inshuti", subtitle: "Choose the option that describes you. You can still use Chat anonymously without registering.",
    name: "Full name", email: "Email", langPref: "Preferred language", password: "Password", passwordPlaceholder: "Min 8 characters",
    profType: "Professional type", specialization: "Specialization", specPlaceholder: "e.g. Pediatrics",
    govLevel: "Government level", region: "Region / District", regionPlaceholder: "District name",
    create: "Create account", creating: "Creating account\u2026", haveAccount: "Already have an account?", login: "Log in", fill: "Please fill in all required fields.",
  },
  RW: {
    title: "Fungura konti", heading: "Injira muri Inshuti", subtitle: "Hitamo amahitamo agusobanura. Ukomeza gukoresha Chat utiyanditse nta kibazo.",
    name: "Izina ryuzuye", email: "Imeri", langPref: "Ururima ukunda", password: "Ijambobanga", passwordPlaceholder: "Byibura inyuguti 8",
    profType: "Ubwoko bw'umwuga", specialization: "Ubuhanga budasanzwe", specPlaceholder: "Urugero: Pediatrics",
    govLevel: "Urwego rwa Leta", region: "Akarere / Uturere", regionPlaceholder: "Izina ry'akarere",
    create: "Fungura konti", creating: "Ifungura\u2026", haveAccount: "Ufite konti?", login: "Injira", fill: "Nyabona uzuzisha imirima yose.",
  },
  FR: {
    title: "Cr\u00e9er un compte", heading: "Rejoindre Inshuti", subtitle: "Choisissez l'option qui vous d\u00e9crit. Vous pouvez toujours utiliser le Chat anonymement sans vous inscrire.",
    name: "Nom complet", email: "Email", langPref: "Langue pr\u00e9f\u00e9r\u00e9e", password: "Mot de passe", passwordPlaceholder: "Min 8 caract\u00e8res",
    profType: "Type professionnel", specialization: "Sp\u00e9cialisation", specPlaceholder: "Ex : P\u00e9diatrie",
    govLevel: "Niveau gouvernemental", region: "R\u00e9gion / District", regionPlaceholder: "Nom du district",
    create: "Cr\u00e9er un compte", creating: "Cr\u00e9ation\u2026", haveAccount: "D\u00e9j\u00e0 un compte ?", login: "Se connecter", fill: "Veuillez remplir tous les champs obligatoires.",
  },
  SW: {
    title: "Fungua akaunti", heading: "Jiunge na Inshuti", subtitle: "Chagua chaguo linalokuelezea. Bado unaweza kutumia Gumzo bila kujisajili.",
    name: "Jina kamili", email: "Barua pepe", langPref: "Lugha unayopendelea", password: "Neno la siri", passwordPlaceholder: "Angalau herufi 8",
    profType: "Aina ya taaluma", specialization: "Utaalamu", specPlaceholder: "Mfano: Pediatrics",
    govLevel: "Kiwango cha serikali", region: "Mkoa / Wilaya", regionPlaceholder: "Jina la wilaya",
    create: "Fungua akaunti", creating: "Inafungua\u2026", haveAccount: "Tayari una akaunti?", login: "Ingia", fill: "Tafadhali jaza sehemu zote zinazohitajika.",
  },
};

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [language, setLanguage] = useState<Language>("EN");
  const [role, setRole] = useState<UserRole>("TEENAGER");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [preferredLanguage, setPreferredLanguage] = useState("EN");
  const [professionalType, setProfessionalType] = useState<ProfessionalType>("CHW");
  const [specialization, setSpecialization] = useState("");
  const [govLevel, setGovLevel] = useState<GovLevel>("DISTRICT");
  const [regionName, setRegionName] = useState("");
  const [sending, setSending] = useState(false);
  const m = MSG[language];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) {
      toast(m.fill, "error");
      return;
    }
    setSending(true);
    try {
      await registerUser({
        email: email.trim(),
        password,
        name: name.trim(),
        role,
        preferredLanguage,
        ...(role === "HEALTHCARE_PROFESSIONAL" ? { professionalType, specialization: specialization.trim() || undefined } : {}),
        ...(role === "GOVERNMENT_USER" ? { govLevel, regionName: regionName.trim() } : {}),
      });
      toast("Account created! Welcome to Inshuti.", "success");
      router.push("/chat");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Registration failed", "error");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="bg-paper">
      <div className="mx-auto max-w-[560px] px-8 py-16">
        <div className="mb-6 text-center">
          <div className="mb-4 flex items-center justify-center gap-1">
            {LANGUAGES.map((lang) => (
              <span
                key={lang}
                className={`cursor-pointer rounded-full px-2.5 py-1.5 text-[12.5px] font-bold ${
                  language === lang ? "bg-teal-700 text-white" : "bg-teal-100 text-teal-700"
                }`}
                onClick={() => setLanguage(lang)}
              >
                {lang}
              </span>
            ))}
          </div>
          <span className="block font-mono text-[12.5px] font-medium uppercase tracking-[0.12em] text-coral-dark">
            {m.title}
          </span>
          <h2 className="mt-3 font-display text-4xl text-teal-900">{m.heading}</h2>
          <p className="mt-3 text-[15.5px] text-ink-soft">{m.subtitle}</p>
        </div>

        <div className="mb-[22px] grid grid-cols-1 gap-3 sm:grid-cols-2">
          {ROLES.map((r) => (
            <div
              key={r.value}
              className={`flex cursor-pointer items-center gap-3 rounded-xl border-[1.5px] p-4 ${
                role === r.value ? "border-teal-700 bg-teal-100" : "border-line"
              }`}
              onClick={() => setRole(r.value)}
            >
              <div className={`flex h-[34px] w-[34px] flex-shrink-0 items-center justify-center rounded-[10px] bg-white ${r.color}`}>
                <svg width="18" height="18"><use href={`#${r.icon}`} /></svg>
              </div>
              <div>
                <div className="text-[13.5px] font-bold text-ink">{r.label[language]}</div>
                {r.desc[language] && <div className="text-[11.5px] text-ink-soft">{r.desc[language]}</div>}
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={(e) => void handleSubmit(e)} className="rounded-md border border-[rgba(22,48,44,0.05)] bg-white p-[26px] shadow-card">
          <label className="mb-1 block text-[12.5px] font-bold text-ink-soft">{m.name}</label>
          <input className="mb-3.5 w-full rounded-[10px] border border-line bg-paper-2 px-3.5 py-3 text-sm" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} required />

          <label className="mb-1 block text-[12.5px] font-bold text-ink-soft">{m.email}</label>
          <input className="mb-3.5 w-full rounded-[10px] border border-line bg-paper-2 px-3.5 py-3 text-sm" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />

          <label className="mb-1 block text-[12.5px] font-bold text-ink-soft">{m.langPref}</label>
          <div className="mb-3.5 flex w-fit rounded-full bg-teal-100 p-[3px] text-[12.5px] font-bold">
            {LANGUAGES.map((l) => (
              <span
                key={l}
                className={`cursor-pointer rounded-full px-2.5 py-1.5 ${preferredLanguage === l ? "bg-teal-700 text-white" : "text-teal-700"}`}
                onClick={() => setPreferredLanguage(l)}
              >{l}</span>
            ))}
          </div>

          <label className="mb-1 block text-[12.5px] font-bold text-ink-soft">{m.password}</label>
          <PasswordInput className="mb-5 w-full rounded-[10px] border border-line bg-paper-2 px-3.5 py-3 text-sm" placeholder={m.passwordPlaceholder} value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />

          {role === "HEALTHCARE_PROFESSIONAL" && (
            <>
              <label className="mb-1 block text-[12.5px] font-bold text-ink-soft">{m.profType}</label>
              <select className="mb-3.5 w-full rounded-[10px] border border-line bg-paper-2 px-3.5 py-3 text-sm" value={professionalType} onChange={(e) => setProfessionalType(e.target.value as ProfessionalType)}>
                {PROFESSIONAL_TYPES.map((pt) => <option key={pt} value={pt}>{pt}</option>)}
              </select>
              <label className="mb-1 block text-[12.5px] font-bold text-ink-soft">{m.specialization}</label>
              <input className="mb-5 w-full rounded-[10px] border border-line bg-paper-2 px-3.5 py-3 text-sm" placeholder={m.specPlaceholder} value={specialization} onChange={(e) => setSpecialization(e.target.value)} />
            </>
          )}

          {role === "GOVERNMENT_USER" && (
            <>
              <label className="mb-1 block text-[12.5px] font-bold text-ink-soft">{m.govLevel}</label>
              <select className="mb-3.5 w-full rounded-[10px] border border-line bg-paper-2 px-3.5 py-3 text-sm" value={govLevel} onChange={(e) => setGovLevel(e.target.value as GovLevel)}>
                {GOV_LEVELS.map((gl) => <option key={gl} value={gl}>{gl}</option>)}
              </select>
              <label className="mb-1 block text-[12.5px] font-bold text-ink-soft">{m.region}</label>
              <input className="mb-5 w-full rounded-[10px] border border-line bg-paper-2 px-3.5 py-3 text-sm" placeholder={m.regionPlaceholder} value={regionName} onChange={(e) => setRegionName(e.target.value)} />
            </>
          )}

          <button
            type="submit"
            disabled={sending}
            className="w-full rounded-full bg-coral px-[26px] py-[13px] text-[15px] font-semibold text-white shadow-[0_8px_20px_rgba(232,115,92,0.35)] transition hover:-translate-y-px hover:bg-coral-dark disabled:opacity-50"
          >
            {sending ? m.creating : m.create}
          </button>
          <p className="mt-3.5 text-center text-xs text-ink-soft">
            {m.haveAccount}{" "}
            <Link href="/login" className="font-bold text-teal-700">{m.login}</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
