"use client";

import Link from "next/link";
import { useState } from "react";

import { forgotPassword } from "@/lib/userApiClient";
import { isValidEmail } from "@/lib/validation";
import { VALIDATION } from "@/lib/validationMessages";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Logo } from "@/components/Logo";
import { useLanguage } from "@/lib/LanguageContext";
import type { Language } from "@/lib/apiClient";

const MSG: Record<Language, {
  heroTitle: string; heroSubtitle: string;
  title: string; email: string; send: string; sending: string;
  sent: string; backToLogin: string;
}> = {
  EN: {
    heroTitle: "Let's get you back in.",
    heroSubtitle: "We'll send a link to reset your password so you can pick up right where you left off.",
    title: "Forgot password", email: "Email",
    send: "Send reset link", sending: "Sending…",
    sent: "If an account exists for that email, we've sent a link to reset your password. It expires in 1 hour.",
    backToLogin: "Back to log in",
  },
  RW: {
    heroTitle: "Reka tugufashe kwinjira.",
    heroSubtitle: "Tuzakohereza ihuza ryo guhindura ijambobanga kugira ngo ukomeze aho wasize.",
    title: "Wibagiwe ijambobanga", email: "Imeri",
    send: "Ohereza ihuza ryo guhindura", sending: "Turimo kohereza…",
    sent: "Niba hari konti ifite iyo imeri, twohereje ihuza ryo guhindura ijambobanga. Rirangira mu isaha 1.",
    backToLogin: "Garuka ku kwinjira",
  },
  FR: {
    heroTitle: "Reconnectons-vous.",
    heroSubtitle: "Nous vous enverrons un lien pour réinitialiser votre mot de passe afin de reprendre là où vous vous étiez arrêté(e).",
    title: "Mot de passe oublié", email: "Email",
    send: "Envoyer le lien de réinitialisation", sending: "Envoi…",
    sent: "Si un compte existe pour cet email, nous avons envoyé un lien pour réinitialiser votre mot de passe. Il expire dans 1 heure.",
    backToLogin: "Retour à la connexion",
  },
  SW: {
    heroTitle: "Hebu turudishe uingie.",
    heroSubtitle: "Tutatuma kiungo cha kuweka upya nywila yako ili uendelee pale ulipoishia.",
    title: "Umesahau nywila", email: "Barua pepe",
    send: "Tuma kiungo cha kuweka upya", sending: "Inatuma…",
    sent: "Ikiwa akaunti ipo kwa barua pepe hiyo, tumetuma kiungo cha kuweka upya nywila yako. Kinaisha muda baada ya saa 1.",
    backToLogin: "Rudi kuingia",
  },
};

const INPUT_BASE =
  "w-full rounded-[10px] border bg-paper-2 px-3.5 py-3 text-sm transition focus:outline-none focus:ring-2 focus:ring-teal-100";

export default function ForgotPasswordPage() {
  const { language, setLanguage } = useLanguage();
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const m = MSG[language];
  const v = VALIDATION[language];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) {
      setError(v.required);
      return;
    }
    if (!isValidEmail(email)) {
      setError(v.invalidEmail);
      return;
    }
    setError("");
    setSending(true);
    try {
      await forgotPassword(email.trim());
      setSent(true);
    } catch {
      // Backend always returns 200 for this endpoint, but handle network errors gracefully.
      setSent(true);
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

          {sent ? (
            <p className="text-sm leading-[1.6] text-ink-soft">{m.sent}</p>
          ) : (
            <form onSubmit={(e) => void handleSubmit(e)}>
              <label className="mb-1.5 block text-[12.5px] font-bold text-ink-soft">{m.email}</label>
              <input
                className={`${INPUT_BASE} ${error ? "border-danger focus:ring-danger/20" : "border-line focus:border-teal-600"}`}
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
              />
              <p className="mb-3.5 mt-1 min-h-[14px] text-xs font-semibold text-danger">{error}</p>
              <button
                type="submit"
                disabled={sending}
                className="w-full rounded-full bg-coral px-[26px] py-[13px] text-[15px] font-semibold text-white shadow-[0_8px_20px_rgba(232,115,92,0.35)] transition hover:-translate-y-px hover:bg-coral-dark disabled:opacity-50"
              >
                {sending ? m.sending : m.send}
              </button>
            </form>
          )}
          <p className="mt-[18px] text-center text-xs text-ink-soft">
            <Link href="/admin/login" className="font-bold text-teal-700 hover:text-teal-900">{m.backToLogin}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
