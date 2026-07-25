"use client";

import { useState } from "react";

import { PageLayout } from "@/components/layout/PageLayout";
import { useLanguage } from "@/lib/LanguageContext";
import { NAV } from "@/lib/i18nCommon";
import { sendContactInquiry } from "@/lib/apiClient";
import type { Language } from "@/lib/apiClient";

type Copy = {
  eyebrow: string; title: string; lead: string;
  contactTitle: string; contactBody: string; email: string;
  formTitle: string; nameLabel: string; emailLabel: string;
  messageLabel: string; send: string; sending: string; sent: string;
};

const COPY: Record<Language, Copy> = {
  EN: {
    eyebrow: "Contact", title: "Get in Touch",
    lead: "We'd love to hear from you. Whether you have feedback, questions, or need support — reach out and we'll get back to you as soon as possible.",
    contactTitle: "Other ways to reach us",
    contactBody: "For urgent health concerns, please contact a local health facility or emergency services directly. Inshuti is not a crisis support hotline.",
    email: "hello@inshuti.rw",
    formTitle: "Send us a message",
    nameLabel: "Your name", emailLabel: "Your email", messageLabel: "Your message",
    send: "Send message", sending: "Sending…", sent: "Thank you! Your message has been sent. We'll get back to you soon.",
  },
  RW: {
    eyebrow: "Duhamagare", title: "Twandikire",
    lead: "Twishimira kumva ibyo utekereza. Niba ufite ibitekerezo, ibibazo, cyangwa ukeneye ubufasha — wandike twese tuzagusubiza vuba bishoboka.",
    contactTitle: "Ubundiburyo bwo kuduhagara",
    contactBody: "Kubera impungenge z'ubuzima zihutirwa, nyamuneka hamagara ivuriro riri hafi cyangwa serivisi z'ubutabazi. Inshuti ntabwo ari umurongo w'ubufasha mu kaga.",
    email: "hello@inshuti.rw",
    formTitle: "Tubereke ubutumwa",
    nameLabel: "Izina ryawe", emailLabel: "Imeri yawe", messageLabel: "Ubutumwa bwawe",
    send: "Ohereza ubutumwa", sending: "Biri koherezwa…", sent: "Murakoze! Ubutumwa bwawe bwoherejwe. Tuzagusubiza vuba.",
  },
  FR: {
    eyebrow: "Contact", title: "Prenez Contact",
    lead: "Nous aimerions avoir de vos nouvelles. Que vous ayez des commentaires, des questions ou besoin d'aide — contactez-nous et nous vous répondrons dès que possible.",
    contactTitle: "Autres moyens de nous joindre",
    contactBody: "Pour les problèmes de santé urgents, veuillez contacter directement un établissement de santé local ou les services d'urgence.",
    email: "hello@inshuti.rw",
    formTitle: "Envoyez-nous un message",
    nameLabel: "Votre nom", emailLabel: "Votre email", messageLabel: "Votre message",
    send: "Envoyer", sending: "Envoi…", sent: "Merci ! Votre message a été envoyé. Nous vous répondrons bientôt.",
  },
  SW: {
    eyebrow: "Wasiliana", title: "Wasiliana Nasi",
    lead: "Tungependa kusikia kutoka kwako. Ikiwa una maoni, maswali, au unahitaji msaada — wasiliana nasi na tutakujibu haraka iwezekanavyo.",
    contactTitle: "Njia nyingine za kuwasiliana",
    contactBody: "Kwa wasiwasi wa haraka wa afya, tafadhali wasiliana na kituo cha afya cha karibu au huduma za dharura moja kwa moja.",
    email: "hello@inshuti.rw",
    formTitle: "Tutumie ujumbe",
    nameLabel: "Jina lako", emailLabel: "Barua pepe yako", messageLabel: "Ujumbe wako",
    send: "Tuma ujumbe", sending: "Inatuma…", sent: "Asante! Ujumbe wako umetumwa. Tutakujibu hivi karibuni.",
  },
};

export default function ContactPage() {
  const { language } = useLanguage();
  const nav = NAV[language];
  const t = COPY[language];
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;
    setSending(true);
    setError(null);
    try {
      await sendContactInquiry({ name: name.trim(), email: email.trim(), message: message.trim() });
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <PageLayout
      activeHref="/contact"
      navItems={[
        { href: "/chat", label: nav.chat },
        { href: "/about", label: "About" },
        { href: "/services", label: "Services" },
        { href: "/library", label: "Library" },
        { href: "/faq", label: "FAQ" },
      ]}
    >
      <section className="animate-slide-up py-[76px]">
        <span className="block font-mono text-[12.5px] font-medium uppercase tracking-[0.12em] text-coral-dark">{t.eyebrow}</span>
        <h1 className="mt-3 font-display text-[52px] leading-[1.06] text-teal-900">{t.title}</h1>
        <p className="mt-5 max-w-[560px] text-[17.5px] leading-[1.6] text-ink-soft">{t.lead}</p>
      </section>

      <section className="grid grid-cols-1 gap-8 pb-16 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <div className="rounded-md border border-[rgba(22,48,44,0.05)] bg-white p-[26px] shadow-card">
            <h2 className="mb-6 font-display text-2xl text-teal-900">{t.formTitle}</h2>
            {sent ? (
              <div className="rounded-xl bg-teal-100 p-5 text-center text-[15px] font-semibold text-teal-700">{t.sent}</div>
            ) : (
              <form onSubmit={(e) => void handleSubmit(e)} className="flex flex-col gap-4">
                <label className="text-[12.5px] font-bold text-ink-soft">{t.nameLabel}</label>
                <input className="w-full rounded-[10px] border border-line bg-paper-2 px-3.5 py-3 text-sm transition-colors duration-150 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-100" value={name} onChange={(e) => setName(e.target.value)} required />
                <label className="text-[12.5px] font-bold text-ink-soft">{t.emailLabel}</label>
                <input className="w-full rounded-[10px] border border-line bg-paper-2 px-3.5 py-3 text-sm transition-colors duration-150 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-100" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                <label className="text-[12.5px] font-bold text-ink-soft">{t.messageLabel}</label>
                <textarea className="w-full resize-y rounded-[10px] border border-line bg-paper-2 px-3.5 py-3 text-sm transition-colors duration-150 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-100" rows={5} value={message} onChange={(e) => setMessage(e.target.value)} required />
                {error && <div className="rounded-xl bg-red-100 p-3 text-[13px] text-red-700">{error}</div>}
                <button type="submit" disabled={sending} className="w-full rounded-full bg-coral px-[26px] py-[13px] text-[15px] font-semibold text-white shadow-[0_8px_20px_rgba(232,115,92,0.35)] transition-all duration-150 hover:-translate-y-px hover:bg-coral-dark disabled:opacity-50">
                  {sending ? t.sending : t.send}
                </button>
              </form>
            )}
          </div>
        </div>
        <div>
          <div className="rounded-md border border-[rgba(22,48,44,0.05)] bg-white p-[26px] shadow-card">
            <h2 className="mb-4 font-display text-xl text-teal-900">{t.contactTitle}</h2>
            <p className="mb-4 text-[14px] leading-[1.6] text-ink-soft">{t.contactBody}</p>
            <a href={`mailto:${t.email}`} className="inline-flex items-center gap-2 rounded-full bg-teal-100 px-5 py-3 text-[14px] font-semibold text-teal-700 transition-all duration-150 hover:bg-teal-200">
              <svg width="16" height="16"><use href="#i-send" /></svg>
              {t.email}
            </a>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
