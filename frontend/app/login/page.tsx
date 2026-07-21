"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useToast } from "@/lib/useToast";
import { loginUser } from "@/lib/userApiClient";
import type { Language } from "@/lib/apiClient";

const LANGUAGES: Language[] = ["EN", "RW", "FR", "SW"];

const MSG: Record<Language, { back: string; welcome: string; title: string; email: string; password: string; login: string; logging: string; newHere: string; create: string; fill: string }> = {
  EN: { back: "Welcome back", title: "Log in", email: "Email", password: "Password", login: "Log in", logging: "Logging in\u2026", newHere: "New here?", create: "Create an account", fill: "Please fill in all fields.", welcome: "Welcome back" },
  RW: { back: "Murakaza neza", title: "Injira", email: "Imeri", password: "Ijambobanga", login: "Injira", logging: "Irinjira\u2026", newHere: "Nshya?", create: "Fungura konti", fill: "Nyabona uzuzisha imirima yose.", welcome: "Murakaza neza" },
  FR: { back: "Bon retour", title: "Connexion", email: "Email", password: "Mot de passe", login: "Se connecter", logging: "Connexion\u2026", newHere: "Nouveau ici?", create: "Cr\u00e9er un compte", fill: "Veuillez remplir tous les champs.", welcome: "Bon retour" },
  SW: { back: "Karibu tena", title: "Ingia", email: "Barua pepe", password: "Neno la siri", login: "Ingia", logging: "Inaingia\u2026", newHere: "Mgeni hapa?", create: "Fungua akaunti", fill: "Tafadhali jaza sehemu zote.", welcome: "Karibu tena" },
};

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [language, setLanguage] = useState<Language>("EN");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [sending, setSending] = useState(false);
  const m = MSG[language];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password) {
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
            {m.back}
          </span>
          <h2 className="mt-3 font-display text-4xl text-teal-900">{m.title}</h2>
        </div>

        <form onSubmit={(e) => void handleSubmit(e)} className="rounded-md border border-[rgba(22,48,44,0.05)] bg-white p-[26px] shadow-card">
          <label className="mb-1 block text-[12.5px] font-bold text-ink-soft">{m.email}</label>
          <input className="mb-3.5 w-full rounded-[10px] border border-line bg-paper-2 px-3.5 py-3 text-sm" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />

          <label className="mb-1 block text-[12.5px] font-bold text-ink-soft">{m.password}</label>
          <input className="mb-2 w-full rounded-[10px] border border-line bg-paper-2 px-3.5 py-3 text-sm" type="password" placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <div className="mb-5 text-right">
            <Link href="/forgot-password" className="text-xs font-semibold text-teal-700">
              Forgot password?
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
            <Link href="/register" className="font-bold text-teal-700">{m.create}</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
