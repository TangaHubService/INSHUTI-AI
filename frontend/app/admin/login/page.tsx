"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Logo } from "@/components/Logo";
import { useToast } from "@/lib/useToast";
import { login as loginAdmin } from "@/lib/adminApiClient";
import { loginUser, dashboardPathForRole } from "@/lib/userApiClient";
import type { Language } from "@/lib/apiClient";
import { PasswordInput } from "@/components/PasswordInput";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useLanguage } from "@/lib/LanguageContext";
import { isValidEmail } from "@/lib/validation";
import { VALIDATION } from "@/lib/validationMessages";
import Link from "next/link";

const MSG: Record<Language, {
  heroTitle: string;
  heroSubtitle: string;
  welcome: string;
  title: string;
  subtitle: string;
  email: string;
  password: string;
  login: string;
  logging: string;
  newHere: string;
  create: string;
  fill: string;
  forgot: string;
  invalid: string;
}> = {
  EN: {
    heroTitle: "Care, answered.",
    heroSubtitle: "Log in to pick up your conversations, appointments, and support — right where you left off.",
    welcome: "Welcome back",
    title: "Log in",
    subtitle: "Enter your credentials to access your Inshuti account.",
    email: "Email",
    password: "Password",
    login: "Log in",
    logging: "Logging in…",
    newHere: "New here?",
    create: "Create an account",
    fill: "Please fill in all fields.",
    forgot: "Forgot password?",
    invalid: "Invalid email or password",
  },
  RW: {
    heroTitle: "Ubufasha buhari.",
    heroSubtitle: "Injira kugira ngo ukomeze ibiganiro byawe, gahunda, n'ubufasha — aho wasize.",
    welcome: "Murakaza neza",
    title: "Injira",
    subtitle: "Injiza amakuru yawe kugira ngo ubone konti yawe ya Inshuti.",
    email: "Imeri",
    password: "Ijambobanga",
    login: "Injira",
    logging: "Irinjira…",
    newHere: "Nshya?",
    create: "Fungura konti",
    fill: "Nyabona uzuzisha imirima yose.",
    forgot: "Wibagiwe ijambobanga?",
    invalid: "Imeri cyangwa ijambobanga sibyo",
  },
  FR: {
    heroTitle: "Le soin, à portée de main.",
    heroSubtitle: "Connectez-vous pour reprendre vos conversations, rendez-vous et suivi — là où vous vous étiez arrêté(e).",
    welcome: "Bon retour",
    title: "Connexion",
    subtitle: "Entrez vos identifiants pour accéder à votre compte Inshuti.",
    email: "Email",
    password: "Mot de passe",
    login: "Se connecter",
    logging: "Connexion…",
    newHere: "Nouveau ici?",
    create: "Créer un compte",
    fill: "Veuillez remplir tous les champs.",
    forgot: "Mot de passe oublié ?",
    invalid: "Email ou mot de passe invalide",
  },
  SW: {
    heroTitle: "Huduma, ipo.",
    heroSubtitle: "Ingia ili kuendelea na mazungumzo, miadi, na msaada wako — pale ulipoishia.",
    welcome: "Karibu tena",
    title: "Ingia",
    subtitle: "Weka taarifa zako ili kufikia akaunti yako ya Inshuti.",
    email: "Barua pepe",
    password: "Neno la siri",
    login: "Ingia",
    logging: "Inaingia…",
    newHere: "Mgeni hapa?",
    create: "Fungua akaunti",
    fill: "Tafadhali jaza sehemu zote.",
    forgot: "Umesahau neno la siri?",
    invalid: "Barua pepe au neno la siri sio sahihi",
  },
};

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { language, setLanguage } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [sending, setSending] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const m = MSG[language];
  const v = VALIDATION[language];

  function validate(): boolean {
    const next: typeof errors = {};
    if (!email.trim()) next.email = v.required;
    else if (!isValidEmail(email)) next.email = v.invalidEmail;
    if (!password) next.password = v.required;
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) {
      toast(m.fill, "error");
      return;
    }
    setSending(true);
    try {
      try {
        await loginAdmin(email.trim(), password);
        toast(m.welcome, "success");
        router.push("/admin/dashboard");
        return;
      } catch {
      }
      const loggedInUser = await loginUser(email.trim(), password);
      toast(m.welcome, "success");
      router.push(dashboardPathForRole(loggedInUser.role));
    } catch {
      toast(m.invalid, "error");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="grid min-h-screen grid-cols-1 md:grid-cols-2">
      <div className="relative hidden flex-col justify-center overflow-hidden bg-[var(--admin-bg)] p-[70px] md:flex">
        <svg
          className="absolute -right-[60px] -top-10 w-[340px] opacity-[0.18]"
          viewBox="0 0 64 64"
        >
          <use href="#mark-knot" />
        </svg>
        <Logo size={40} className="mb-[26px]" />
        <h2 className="max-w-[360px] font-display text-[30px] leading-[1.2] text-white">
          {m.heroTitle}
        </h2>
        <p className="mt-[14px] max-w-[340px] text-[14.5px] leading-[1.6] text-[#9FC3BD]">
          {m.heroSubtitle}
        </p>
      </div>
      <div className="flex items-center justify-center bg-paper p-10">
        <div className="w-full max-w-[380px]">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-display text-[26px] text-teal-900">{m.title}</h2>
            <LanguageSwitcher value={language} onChange={setLanguage} />
          </div>
          <p className="mb-7 text-sm text-ink-soft">
            {m.subtitle}
          </p>
          <form onSubmit={(e) => void handleSubmit(e)} className="flex flex-col gap-4">
            <div>
              <label className="mb-1.5 block text-[13px] font-semibold text-ink-soft">{m.email}</label>
              <input
                className={`w-full rounded-[var(--radius-sm)] border bg-paper-2 px-[14px] py-3 text-sm transition-all duration-150 placeholder:text-[#9CA8A4] focus:outline-none focus:ring-2 focus:ring-offset-0 ${
                  errors.email ? "border-danger focus:ring-danger/20" : "border-line focus:border-teal-600 focus:ring-teal-100"
                }`}
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <p className="mt-1 min-h-[14px] text-[12.5px] font-semibold text-danger">{errors.email}</p>
            </div>
            <div>
              <label className="mb-1.5 block text-[13px] font-semibold text-ink-soft">{m.password}</label>
              <PasswordInput
                className={`w-full rounded-[var(--radius-sm)] border bg-paper-2 px-[14px] py-3 text-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-0 placeholder:text-[#9CA8A4] ${
                  errors.password ? "border-danger focus:ring-danger/20" : "border-line focus:border-teal-600 focus:ring-teal-100"
                }`}
                placeholder="••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <p className="mt-1 min-h-[14px] text-[12.5px] font-semibold text-danger">{errors.password}</p>
            </div>
            <div className="text-right">
              <Link href="/forgot-password" className="text-xs font-semibold text-teal-700 transition hover:text-teal-900">
                {m.forgot}
              </Link>
            </div>
            <button
              type="submit"
              disabled={sending}
              className="w-full rounded-full bg-coral px-[26px] py-[13px] text-[15px] font-semibold text-white shadow-btn transition-all duration-150 hover:-translate-y-px hover:bg-coral-dark hover:shadow-lg disabled:opacity-50 disabled:hover:translate-y-0"
            >
              {sending ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" opacity="0.2" />
                    <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                  </svg>
                  {m.logging}
                </span>
              ) : m.login}
            </button>
            <p className="text-center text-xs text-ink-soft">
              {m.newHere}{" "}
              <Link href="/register" className="font-bold text-teal-700 transition hover:text-teal-900">{m.create}</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
