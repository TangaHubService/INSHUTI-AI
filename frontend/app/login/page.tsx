"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useToast } from "@/lib/useToast";
import { loginUser } from "@/lib/userApiClient";
import type { Language } from "@/lib/apiClient";
import { PasswordInput } from "@/components/PasswordInput";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Logo } from "@/components/Logo";
import { SiteFooter } from "@/components/SiteFooter";
import { useLanguage } from "@/lib/LanguageContext";
import { isValidEmail } from "@/lib/validation";
import { VALIDATION } from "@/lib/validationMessages";

const MSG: Record<Language, { back: string; backButton: string; welcome: string; title: string; email: string; password: string; login: string; logging: string; newHere: string; create: string; fill: string; forgot: string }> = {
  EN: { back: "Welcome back", backButton: "Back", title: "Log in", email: "Email", password: "Password", login: "Log in", logging: "Logging in\u2026", newHere: "New here?", create: "Create an account", fill: "Please fill in all fields.", welcome: "Welcome back", forgot: "Forgot password?" },
  RW: { back: "Murakaza neza", backButton: "Subira inyuma", title: "Injira", email: "Imeri", password: "Ijambobanga", login: "Injira", logging: "Irinjira\u2026", newHere: "Nshya?", create: "Fungura konti", fill: "Nyabona uzuzisha imirima yose.", welcome: "Murakaza neza", forgot: "Wibagiwe ijambobanga?" },
  FR: { back: "Bon retour", backButton: "Retour", title: "Connexion", email: "Email", password: "Mot de passe", login: "Se connecter", logging: "Connexion\u2026", newHere: "Nouveau ici?", create: "Cr\u00e9er un compte", fill: "Veuillez remplir tous les champs.", welcome: "Bon retour", forgot: "Mot de passe oubli\u00e9 ?" },
  SW: { back: "Karibu tena", backButton: "Rudi nyuma", title: "Ingia", email: "Barua pepe", password: "Neno la siri", login: "Ingia", logging: "Inaingia\u2026", newHere: "Mgeni hapa?", create: "Fungua akaunti", fill: "Tafadhali jaza sehemu zote.", welcome: "Karibu tena", forgot: "Umesahau neno la siri?" },
};

const INPUT_BASE =
  "w-full rounded-[10px] border bg-paper-2 px-3.5 py-3 text-sm transition focus:outline-none focus:ring-2 focus:ring-teal-100";

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
      const loggedInUser = await loginUser(email.trim(), password);
      toast(m.welcome, "success");
      const destination =
        loggedInUser.role === "HEALTHCARE_PROFESSIONAL"
          ? "/professional"
          : loggedInUser.role === "GOVERNMENT_USER"
            ? "/government"
            : loggedInUser.role === "PARENT_GUARDIAN"
              ? "/parent"
              : "/chat";
      router.push(destination);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Login failed", "error");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="bg-paper">
      <div className="mx-auto max-w-[400px] px-8 py-16">
        <button
          type="button"
          onClick={() => router.back()}
          className="mb-6 inline-flex items-center gap-1.5 text-[13px] font-semibold text-ink-soft transition hover:text-teal-700"
        >
          <svg width="16" height="16"><use href="#i-back" /></svg>
          {m.backButton}
        </button>
        <div className="mb-6 text-center">
          <Link href="/" className="mb-5 inline-flex items-center justify-center gap-2">
            <Logo size={34} />
            <span className="font-display text-xl font-bold text-teal-900">Inshuti</span>
          </Link>
          <div className="mb-4 flex items-center justify-center">
            <LanguageSwitcher value={language} onChange={setLanguage} />
          </div>
          <span className="block font-mono text-[12.5px] font-medium uppercase tracking-[0.12em] text-coral-dark">
            {m.back}
          </span>
          <h2 className="mt-3 font-display text-4xl text-teal-900">{m.title}</h2>
        </div>

        <form onSubmit={(e) => void handleSubmit(e)} className="rounded-md border border-[rgba(22,48,44,0.05)] bg-white p-[26px] shadow-card">
          <label className="mb-1 block text-[12.5px] font-bold text-ink-soft">{m.email}</label>
          <input
            className={`${INPUT_BASE} ${errors.email ? "border-danger focus:ring-danger/20" : "border-line focus:border-teal-600"}`}
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <p className="mb-3.5 mt-1 min-h-[14px] text-xs font-semibold text-danger">{errors.email}</p>

          <label className="mb-1 block text-[12.5px] font-bold text-ink-soft">{m.password}</label>
          <PasswordInput
            className={`${INPUT_BASE} ${errors.password ? "border-danger focus:ring-danger/20" : "border-line focus:border-teal-600"}`}
            placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <p className="mb-2 mt-1 min-h-[14px] text-xs font-semibold text-danger">{errors.password}</p>
          <div className="mb-5 text-right">
            <Link href="/forgot-password" className="text-xs font-semibold text-teal-700 hover:text-teal-900">
              {m.forgot}
            </Link>
          </div>

          <button
            type="submit"
            disabled={sending}
            className="w-full rounded-full bg-coral px-[26px] py-[13px] text-[15px] font-semibold text-white shadow-[0_8px_20px_rgba(232,115,92,0.35)] transition hover:-translate-y-px hover:bg-coral-dark disabled:opacity-50"
          >
            {sending ? m.logging : m.login}
          </button>
          <p className="mt-3.5 text-center text-xs text-ink-soft">
            {m.newHere}{" "}
            <Link href="/register" className="font-bold text-teal-700 hover:text-teal-900">{m.create}</Link>
          </p>
        </form>
        <SiteFooter />
      </div>
    </div>
  );
}
