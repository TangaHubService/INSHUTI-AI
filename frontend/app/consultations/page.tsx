"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { useToast } from "@/lib/useToast";
import { AppShell } from "@/components/AppShell";
import type { Language } from "@/lib/apiClient";
import { useLanguage } from "@/lib/LanguageContext";
import { useRequireUser } from "@/lib/useUserAuth";
import {
  getMyConsultations,
  getProfessionalConsultations,
  type Consultation,
  type ProfessionalConsultation,
} from "@/lib/userApiClient";

const STATUS_STYLE: Record<string, string> = {
  PENDING: "bg-gold-100 text-[#8A5E1E]",
  ASSIGNED: "bg-teal-100 text-teal-700",
  IN_PROGRESS: "bg-teal-100 text-teal-700",
  RESOLVED: "bg-teal-100 text-teal-700",
  ESCALATED: "bg-coral-100 text-coral-dark",
};

const STATUS_LABEL: Record<Language, Record<string, string>> = {
  EN: { PENDING: "Pending", ASSIGNED: "Assigned", IN_PROGRESS: "In progress", RESOLVED: "Resolved", ESCALATED: "Escalated" },
  RW: { PENDING: "Bitegereje", ASSIGNED: "Byahawe umukozi", IN_PROGRESS: "Birakomeza", RESOLVED: "Byakemuwe", ESCALATED: "Byoherejwe hejuru" },
  FR: { PENDING: "En attente", ASSIGNED: "Attribué", IN_PROGRESS: "En cours", RESOLVED: "Résolu", ESCALATED: "Escaladé" },
  SW: { PENDING: "Inasubiri", ASSIGNED: "Imepangiwa", IN_PROGRESS: "Inaendelea", RESOLVED: "Imetatuliwa", ESCALATED: "Imepandishwa" },
};

type Copy = {
  eyebrow: string;
  titlePro: string;
  titleUser: string;
  subtitlePro: string;
  subtitleUser: string;
  loginGate: string;
  noConsultations: string;
  noneAssigned: string;
  connected: string;
  waiting: string;
  languageLabel: string;
  errLoadConsultations: string;
  errLoadQueue: string;
};

const COPY: Record<Language, Copy> = {
  EN: {
    eyebrow: "Consultations",
    titlePro: "Your consultation queue",
    titleUser: "Your consultations",
    subtitlePro: "People who requested a human follow-up from chat, waiting for your response.",
    subtitleUser: "Secure, private conversations with a health worker you've been connected with.",
    loginGate: "Log in to view your consultations.",
    noConsultations: "No consultations yet. Ask “Talk to a health worker” from the chat when it's offered.",
    noneAssigned: "No consultations assigned yet.",
    connected: "Connected with a professional",
    waiting: "Waiting to be assigned",
    languageLabel: "Language",
    errLoadConsultations: "Couldn't load your consultations right now.",
    errLoadQueue: "Couldn't load your queue right now.",
  },
  RW: {
    eyebrow: "Ubujyanama",
    titlePro: "Urutonde rw'ubujyanama",
    titleUser: "Ubujyanama bwawe",
    subtitlePro: "Abantu basabye gukurikiranwa n'umuntu nyuma yo kuganira, bategereje igisubizo cyawe.",
    subtitleUser: "Ibiganiro byizewe kandi byihariye n'umukozi w'ubuzima wahujwe na we.",
    loginGate: "Injira kugira ngo urebe ubujyanama bwawe.",
    noConsultations: "Nta bujyanama urafite. Saba “Vugana n'umukozi w'ubuzima” mu kiganiro igihe bitangwa.",
    noneAssigned: "Nta bujyanama urahabwa.",
    connected: "Wahujwe n'umukozi w'ubuzima",
    waiting: "Bitegereje guhabwa umukozi",
    languageLabel: "Ururimi",
    errLoadConsultations: "Ntibishoboka gushaka ubujyanama bwawe ubu.",
    errLoadQueue: "Ntibishoboka gushaka urutonde rwawe ubu.",
  },
  FR: {
    eyebrow: "Consultations",
    titlePro: "Votre file de consultations",
    titleUser: "Vos consultations",
    subtitlePro: "Personnes ayant demandé un suivi humain depuis le chat, en attente de votre réponse.",
    subtitleUser: "Conversations sécurisées et privées avec un agent de santé auquel vous avez été connecté(e).",
    loginGate: "Connectez-vous pour consulter vos consultations.",
    noConsultations: "Aucune consultation pour l'instant. Demandez « Parler à un agent de santé » depuis le chat lorsque cela est proposé.",
    noneAssigned: "Aucune consultation attribuée pour l'instant.",
    connected: "Connecté(e) à un professionnel",
    waiting: "En attente d'attribution",
    languageLabel: "Langue",
    errLoadConsultations: "Impossible de charger vos consultations pour le moment.",
    errLoadQueue: "Impossible de charger votre file pour le moment.",
  },
  SW: {
    eyebrow: "Mashauriano",
    titlePro: "Foleni yako ya mashauriano",
    titleUser: "Mashauriano yako",
    subtitlePro: "Watu walioomba mfuatiliaji wa binadamu kutoka kwenye mazungumzo, wanasubiri jibu lako.",
    subtitleUser: "Mazungumzo salama na ya faragha na mhudumu wa afya uliyounganishwa naye.",
    loginGate: "Ingia ili kuona mashauriano yako.",
    noConsultations: "Bado hakuna mashauriano. Omba “Ongea na mhudumu wa afya” kwenye mazungumzo inapotolewa.",
    noneAssigned: "Bado hakuna mashauriano yaliyopangiwa.",
    connected: "Umeunganishwa na mtaalamu",
    waiting: "Inasubiri kupangiwa",
    languageLabel: "Lugha",
    errLoadConsultations: "Imeshindwa kupakia mashauriano yako kwa sasa.",
    errLoadQueue: "Imeshindwa kupakia foleni yako kwa sasa.",
  },
};

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString([], { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

export default function ConsultationsPage() {
  const { toast } = useToast();
  const { language } = useLanguage();
  const { user, loading: authLoading } = useRequireUser();
  const t = COPY[language];

  if (authLoading || !user) return null;

  return (
    <AppShell active="/consultations" session={{ kind: "user", user }}>
      <div className="mx-auto max-w-[1160px]">
        <section className="pb-3">
          <span className="block font-mono text-[12.5px] font-medium uppercase tracking-[0.12em] text-coral-dark">
            {t.eyebrow}
          </span>
          <h1 className="mt-3 font-display text-[34px] text-teal-900">
            {user.role === "HEALTHCARE_PROFESSIONAL" ? t.titlePro : t.titleUser}
          </h1>
          <p className="mt-[10px] max-w-[520px] text-[14.5px] leading-[1.6] text-ink-soft">
            {user.role === "HEALTHCARE_PROFESSIONAL" ? t.subtitlePro : t.subtitleUser}
          </p>
        </section>

        {user.role === "HEALTHCARE_PROFESSIONAL" ? (
          <ProfessionalQueue toast={toast} language={language} />
        ) : (
          <MyConsultations toast={toast} language={language} />
        )}
      </div>
    </AppShell>
  );
}

function MyConsultations({ toast, language }: { toast: (message: string, type?: "success" | "error" | "info") => void; language: Language }) {
  const t = COPY[language];
  const statusLabel = STATUS_LABEL[language];
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyConsultations()
      .then(setConsultations)
      .catch(() => toast(t.errLoadConsultations, "error"))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className="pb-16 pt-5">
      <div className="rounded-md border border-[rgba(22,48,44,0.05)] bg-white py-1.5 shadow-card">
        {!loading && consultations.length === 0 && (
          <p className="px-5 pb-5 pt-4 text-[13.5px] text-ink-soft">{t.noConsultations}</p>
        )}
        {consultations.map((c) => (
          <Link
            key={c.id}
            href={`/consultations/${c.id}`}
            className="flex items-center gap-[14px] border-b border-line px-[18px] py-4 last:border-b-0 hover:bg-paper-2"
          >
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold text-ink">
                {c.assignedTo ? t.connected : t.waiting}
              </div>
              <div className="mt-[3px] text-xs text-ink-soft">{formatDateTime(c.createdAt)}</div>
            </div>
            <span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-bold ${STATUS_STYLE[c.status] ?? "bg-teal-100 text-teal-700"}`}>
              {statusLabel[c.status] ?? c.status}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function ProfessionalQueue({ toast, language }: { toast: (message: string, type?: "success" | "error" | "info") => void; language: Language }) {
  const t = COPY[language];
  const statusLabel = STATUS_LABEL[language];
  const [consultations, setConsultations] = useState<ProfessionalConsultation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProfessionalConsultations()
      .then(setConsultations)
      .catch(() => toast(t.errLoadQueue, "error"))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className="pb-16 pt-5">
      <div className="rounded-md border border-[rgba(22,48,44,0.05)] bg-white py-1.5 shadow-card">
        {!loading && consultations.length === 0 && (
          <p className="px-5 pb-5 pt-4 text-[13.5px] text-ink-soft">{t.noneAssigned}</p>
        )}
        {consultations.map((c) => (
          <Link
            key={c.id}
            href={`/consultations/${c.id}`}
            className="flex items-center gap-[14px] border-b border-line px-[18px] py-4 last:border-b-0 hover:bg-paper-2"
          >
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold text-ink">{c.patientName}</div>
              <div className="mt-[3px] text-xs text-ink-soft">{formatDateTime(c.createdAt)} · {t.languageLabel}: {c.language}</div>
            </div>
            <span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-bold ${STATUS_STYLE[c.status] ?? "bg-teal-100 text-teal-700"}`}>
              {statusLabel[c.status] ?? c.status}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
