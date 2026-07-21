"use client";

import Link from "next/link";
import { Logo } from "@/components/Logo";
import { useEffect, useState } from "react";

import { useToast } from "@/lib/useToast";
import { NotificationBell } from "@/components/NotificationBell";
import type { Language } from "@/lib/apiClient";
import {
  getCurrentUser,
  getMyConsultations,
  getProfessionalConsultations,
  type Consultation,
  type ProfessionalConsultation,
  type UserProfile,
} from "@/lib/userApiClient";

const STATUS_STYLE: Record<string, string> = {
  PENDING: "bg-gold-100 text-[#8A5E1E]",
  ASSIGNED: "bg-teal-100 text-teal-700",
  IN_PROGRESS: "bg-teal-100 text-teal-700",
  RESOLVED: "bg-teal-100 text-teal-700",
  ESCALATED: "bg-coral-100 text-coral-dark",
};

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString([], { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

export default function ConsultationsPage() {
  const { toast } = useToast();
  const [language, setLanguage] = useState<Language>("EN");
  const [user, setUser] = useState<UserProfile | null | undefined>(undefined);

  useEffect(() => {
    void getCurrentUser().then(setUser);
  }, []);

  return (
    <div className="bg-paper">
      <div className="mx-auto max-w-[1160px] px-8">
        <header className="flex items-center justify-between border-b border-line py-[22px]">
          <div className="flex items-center gap-2.5">
            <Logo size={34} />
            <span className="font-display text-[22px] font-bold text-teal-900">Inshuti</span>
          </div>
          <nav className="flex items-center gap-8 text-[14.5px] font-semibold text-ink-soft">
            <Link href="/" className="hover:text-teal-700">Home</Link>
            <Link href="/chat" className="hover:text-teal-700">Chat</Link>
            <Link href="/my-space" className="hover:text-teal-700">My Space</Link>
            <Link href="/appointments" className="hover:text-teal-700">Appointments</Link>
            <span className="text-teal-700">Consultations</span>
            <Link href="/notifications" className="hover:text-teal-700">Notifications</Link>
            <Link href="/profile" className="hover:text-teal-700">Profile</Link>
          </nav>
          <div className="flex items-center gap-3">
            <div className="flex rounded-full bg-teal-100 p-[3px] text-[12.5px] font-bold">
              {(["EN", "RW", "FR", "SW"] as const).map((lang) => (
                <span
                  key={lang}
                  className={`cursor-pointer rounded-full px-2.5 py-1.5 ${language === lang ? "bg-teal-700 text-white" : "text-teal-700"}`}
                  onClick={() => setLanguage(lang)}
                >
                  {lang}
                </span>
              ))}
            </div>
            {user && <NotificationBell />}
            {user === null && (
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-coral px-4 py-[9px] text-[13px] font-semibold text-white shadow-[0_8px_20px_rgba(232,115,92,0.35)] transition hover:-translate-y-px hover:bg-coral-dark"
              >
                Log in
              </Link>
            )}
          </div>
        </header>

        <section className="pb-3 pt-12">
          <span className="block font-mono text-[12.5px] font-medium uppercase tracking-[0.12em] text-coral-dark">
            Consultations
          </span>
          <h1 className="mt-3 font-display text-[34px] text-teal-900">
            {user?.role === "HEALTHCARE_PROFESSIONAL" ? "Your consultation queue" : "Your consultations"}
          </h1>
          <p className="mt-[10px] max-w-[520px] text-[14.5px] leading-[1.6] text-ink-soft">
            {user?.role === "HEALTHCARE_PROFESSIONAL"
              ? "People who requested a human follow-up from chat, waiting for your response."
              : "Secure, private conversations with a health worker you've been connected with."}
          </p>
        </section>

        {user === undefined && <p className="pb-16 text-sm text-ink-soft">Loading…</p>}

        {user === null && (
          <div className="mb-16 rounded-md border border-[rgba(22,48,44,0.05)] bg-white p-8 text-center shadow-card">
            <p className="text-[14.5px] text-ink-soft">Log in to view your consultations.</p>
            <Link
              href="/login"
              className="mt-4 inline-flex items-center justify-center gap-2 rounded-full bg-coral px-5 py-[11px] text-[14px] font-semibold text-white shadow-[0_8px_20px_rgba(232,115,92,0.35)] transition hover:-translate-y-px hover:bg-coral-dark"
            >
              Log in
            </Link>
          </div>
        )}

        {user && user.role === "HEALTHCARE_PROFESSIONAL" && <ProfessionalQueue toast={toast} />}
        {user && user.role !== "HEALTHCARE_PROFESSIONAL" && <MyConsultations toast={toast} />}

        <footer className="border-t border-line py-9">
          <div className="flex flex-wrap items-center justify-between gap-[14px]">
            <div className="flex items-center gap-2.5">
              <Logo size={24} />
              <span className="font-display text-[17px] font-bold text-teal-900">Inshuti</span>
            </div>
            <div className="flex gap-[22px] text-[13.5px] font-semibold text-ink-soft">
              <a href="#" className="hover:text-teal-700">Privacy</a>
              <a href="#" className="hover:text-teal-700">Terms</a>
              <Link href="/admin/login" className="hover:text-teal-700">Admin</Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

function MyConsultations({ toast }: { toast: (message: string, type?: "success" | "error" | "info") => void }) {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyConsultations()
      .then(setConsultations)
      .catch(() => toast("Couldn't load your consultations right now.", "error"))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className="pb-16 pt-5">
      <div className="rounded-md border border-[rgba(22,48,44,0.05)] bg-white py-1.5 shadow-card">
        {!loading && consultations.length === 0 && (
          <p className="px-5 pb-5 pt-4 text-[13.5px] text-ink-soft">
            No consultations yet. Ask &ldquo;Talk to a health worker&rdquo; from the chat when it&apos;s offered.
          </p>
        )}
        {consultations.map((c) => (
          <Link
            key={c.id}
            href={`/consultations/${c.id}`}
            className="flex items-center gap-[14px] border-b border-line px-[18px] py-4 last:border-b-0 hover:bg-paper-2"
          >
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold text-ink">
                {c.assignedTo ? "Connected with a professional" : "Waiting to be assigned"}
              </div>
              <div className="mt-[3px] text-xs text-ink-soft">{formatDateTime(c.createdAt)}</div>
            </div>
            <span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-bold ${STATUS_STYLE[c.status] ?? "bg-teal-100 text-teal-700"}`}>
              {c.status}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function ProfessionalQueue({ toast }: { toast: (message: string, type?: "success" | "error" | "info") => void }) {
  const [consultations, setConsultations] = useState<ProfessionalConsultation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProfessionalConsultations()
      .then(setConsultations)
      .catch(() => toast("Couldn't load your queue right now.", "error"))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className="pb-16 pt-5">
      <div className="rounded-md border border-[rgba(22,48,44,0.05)] bg-white py-1.5 shadow-card">
        {!loading && consultations.length === 0 && (
          <p className="px-5 pb-5 pt-4 text-[13.5px] text-ink-soft">No consultations assigned yet.</p>
        )}
        {consultations.map((c) => (
          <Link
            key={c.id}
            href={`/consultations/${c.id}`}
            className="flex items-center gap-[14px] border-b border-line px-[18px] py-4 last:border-b-0 hover:bg-paper-2"
          >
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold text-ink">{c.patientName}</div>
              <div className="mt-[3px] text-xs text-ink-soft">{formatDateTime(c.createdAt)} · Language: {c.language}</div>
            </div>
            <span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-bold ${STATUS_STYLE[c.status] ?? "bg-teal-100 text-teal-700"}`}>
              {c.status}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
