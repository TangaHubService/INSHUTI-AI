"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { forgotPassword } from "@/lib/userApiClient";
import { isValidEmail } from "@/lib/validation";
import { VALIDATION } from "@/lib/validationMessages";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Logo } from "@/components/Logo";
import { SiteFooter } from "@/components/SiteFooter";
import { useLanguage } from "@/lib/LanguageContext";
import type { Language } from "@/lib/apiClient";

const MSG: Record<Language, {
  eyebrow: string; title: string; email: string; send: string; sending: string;
  sent: string; backToLogin: string; backButton: string;
}> = {
  EN: {
    eyebrow: "Reset your password", title: "Forgot password", email: "Email",
    send: "Send reset link", sending: "Sending…",
    sent: "If an account exists for that email, we've sent a link to reset your password. It expires in 1 hour.",
    backToLogin: "Back to log in", backButton: "Back",
  },
  RW: {
    eyebrow: "Hindura ijambobanga", title: "Wibagiwe ijambobanga", email: "Imeri",
    send: "Ohereza ihuza ryo guhindura", sending: "Turimo kohereza…",
    sent: "Niba hari konti ifite iyo imeri, twohereje ihuza ryo guhindura ijambobanga. Rirangira mu isaha 1.",
    backToLogin: "Garuka ku kwinjira", backButton: "Subira inyuma",
  },
  FR: {
    eyebrow: "Réinitialisez votre mot de passe", title: "Mot de passe oublié", email: "Email",
    send: "Envoyer le lien de réinitialisation", sending: "Envoi…",
    sent: "Si un compte existe pour cet email, nous avons envoyé un lien pour réinitialiser votre mot de passe. Il expire dans 1 heure.",
    backToLogin: "Retour à la connexion", backButton: "Retour",
  },
  SW: {
    eyebrow: "Weka upya nywila yako", title: "Umesahau nywila", email: "Barua pepe",
    send: "Tuma kiungo cha kuweka upya", sending: "Inatuma…",
    sent: "Ikiwa akaunti ipo kwa barua pepe hiyo, tumetuma kiungo cha kuweka upya nywila yako. Kinaisha muda baada ya saa 1.",
    backToLogin: "Rudi kuingia", backButton: "Rudi nyuma",
  },
};

const INPUT_BASE =
  "w-full rounded-[10px] border bg-paper-2 px-3.5 py-3 text-sm transition focus:outline-none focus:ring-2 focus:ring-teal-100";

export default function ForgotPasswordPage() {
  const router = useRouter();
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
            {m.eyebrow}
          </span>
          <h2 className="mt-3 font-display text-4xl text-teal-900">{m.title}</h2>
        </div>

        <div className="rounded-md border border-[rgba(22,48,44,0.05)] bg-white p-[26px] shadow-card">
          {sent ? (
            <p className="text-sm leading-[1.6] text-ink-soft">{m.sent}</p>
          ) : (
            <form onSubmit={(e) => void handleSubmit(e)}>
              <label className="mb-1 block text-[12.5px] font-bold text-ink-soft">{m.email}</label>
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
          <p className="mt-3.5 text-center text-xs text-ink-soft">
            <Link href="/login" className="font-bold text-teal-700 hover:text-teal-900">{m.backToLogin}</Link>
          </p>
        </div>
        <SiteFooter />
      </div>
    </div>
  );
}
