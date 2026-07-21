"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { useToast } from "@/lib/useToast";
import { ConfirmModal } from "@/components/Modal";
import { NotificationBell } from "@/components/NotificationBell";
import type { Language } from "@/lib/apiClient";
import {
  cancelAppointment,
  getCurrentUser,
  getMyAppointments,
  getProfessionalCalendar,
  getProfessionals,
  recordAppointmentOutcome,
  requestAppointment,
  rescheduleAppointment,
  respondToAppointment,
  type Appointment,
  type Professional,
  type ProfessionalAppointment,
  type ProfessionalType,
  type UserProfile,
} from "@/lib/userApiClient";

const PROFESSIONAL_TYPE_LABEL: Record<ProfessionalType, string> = {
  CHW: "Community Health Worker",
  NURSE: "Nurse",
  MIDWIFE: "Midwife",
  PSYCHOLOGIST: "Psychologist",
  DOCTOR: "Doctor",
};

const STATUS_STYLE: Record<string, string> = {
  REQUESTED: "bg-gold-100 text-[#8A5E1E]",
  CONFIRMED: "bg-teal-100 text-teal-700",
  RESCHEDULED: "bg-gold-100 text-[#8A5E1E]",
  CANCELLED: "bg-coral-100 text-coral-dark",
  COMPLETED: "bg-teal-100 text-teal-700",
};

function formatDateTime(iso: string): { day: string; month: string; time: string } {
  const date = new Date(iso);
  return {
    day: date.toLocaleDateString(undefined, { day: "2-digit" }),
    month: date.toLocaleDateString(undefined, { month: "short" }),
    time: date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  };
}

function toLocalInputValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default function AppointmentsPage() {
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
            <svg className="inline-flex" width="34" height="34" viewBox="0 0 64 64">
              <use href="#mark-knot" />
            </svg>
            <span className="font-display text-[22px] font-bold text-teal-900">Inshuti</span>
          </div>
          <nav className="flex items-center gap-8 text-[14.5px] font-semibold text-ink-soft">
            <Link href="/" className="hover:text-teal-700">Home</Link>
            <Link href="/chat" className="hover:text-teal-700">Chat</Link>
            <Link href="/my-space" className="hover:text-teal-700">My Space</Link>
            <span className="text-teal-700">Appointments</span>
            <Link href="/notifications" className="hover:text-teal-700">Notifications</Link>
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
            Appointments
          </span>
          <h1 className="mt-3 font-display text-[34px] text-teal-900">
            {user?.role === "HEALTHCARE_PROFESSIONAL" ? "Your appointment queue" : "Book time with a professional"}
          </h1>
          <p className="mt-[10px] max-w-[520px] text-[14.5px] leading-[1.6] text-ink-soft">
            {user?.role === "HEALTHCARE_PROFESSIONAL"
              ? "Review requests, confirm times, and record outcomes for the people you support."
              : "Request a time with a Community Health Worker, nurse, midwife, psychologist, or doctor — and manage what you already have coming up."}
          </p>
        </section>

        {user === undefined && <p className="pb-16 text-sm text-ink-soft">Loading…</p>}

        {user === null && (
          <div className="mb-16 rounded-md border border-[rgba(22,48,44,0.05)] bg-white p-8 text-center shadow-card">
            <p className="text-[14.5px] text-ink-soft">
              Log in to request, view, or manage your appointments.
            </p>
            <Link
              href="/login"
              className="mt-4 inline-flex items-center justify-center gap-2 rounded-full bg-coral px-5 py-[11px] text-[14px] font-semibold text-white shadow-[0_8px_20px_rgba(232,115,92,0.35)] transition hover:-translate-y-px hover:bg-coral-dark"
            >
              Log in
            </Link>
          </div>
        )}

        {user && user.role === "HEALTHCARE_PROFESSIONAL" && <ProfessionalView />}
        {user && user.role !== "HEALTHCARE_PROFESSIONAL" && <UserView toast={toast} />}

        <footer className="border-t border-line py-9">
          <div className="flex flex-wrap items-center justify-between gap-[14px]">
            <div className="flex items-center gap-2.5">
              <svg width="24" height="24" viewBox="0 0 64 64">
                <use href="#mark-knot" />
              </svg>
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

function UserView({ toast }: { toast: (message: string, type?: "success" | "error" | "info") => void }) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [professionalType, setProfessionalType] = useState<ProfessionalType>("NURSE");
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [professionalId, setProfessionalId] = useState("");
  const [requestedTime, setRequestedTime] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [rescheduling, setRescheduling] = useState<string | null>(null);
  const [rescheduleTime, setRescheduleTime] = useState("");
  const [cancelTarget, setCancelTarget] = useState<string | null>(null);

  async function loadAppointments() {
    setLoading(true);
    try {
      setAppointments(await getMyAppointments());
    } catch {
      toast("Couldn't load your appointments right now.", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadAppointments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    void getProfessionals(professionalType).then((data) => {
      setProfessionals(data.professionals);
      setProfessionalId(data.professionals[0]?.id ?? "");
    });
  }, [professionalType]);

  async function handleRequest(e: React.FormEvent) {
    e.preventDefault();
    if (!professionalId || !requestedTime) {
      toast("Please choose a professional and a time.", "error");
      return;
    }
    setSubmitting(true);
    try {
      await requestAppointment({ professionalId, requestedTime: new Date(requestedTime).toISOString(), notes: notes.trim() || undefined });
      toast("Appointment requested", "success");
      setNotes("");
      setRequestedTime("");
      await loadAppointments();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to request appointment", "error");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleReschedule(id: string) {
    if (!rescheduleTime) return;
    try {
      await rescheduleAppointment(id, new Date(rescheduleTime).toISOString());
      toast("Appointment rescheduled", "success");
      setRescheduling(null);
      setRescheduleTime("");
      await loadAppointments();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to reschedule appointment", "error");
    }
  }

  async function handleCancel(id: string) {
    setCancelTarget(null);
    try {
      await cancelAppointment(id);
      toast("Appointment cancelled", "success");
      await loadAppointments();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to cancel appointment", "error");
    }
  }

  const minDateTime = toLocalInputValue(new Date(Date.now() + 60 * 60 * 1000));

  return (
    <section className="pb-16 pt-5">
      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[1.2fr_1fr]">
        <div className="rounded-md border border-[rgba(22,48,44,0.05)] bg-white py-1.5 shadow-card">
          <div className="flex items-center justify-between px-5 pb-1.5 pt-[14px]">
            <h3 className="text-base text-teal-900">Upcoming</h3>
          </div>

          {!loading && appointments.length === 0 && (
            <p className="px-5 pb-5 pt-2 text-[13.5px] text-ink-soft">
              No appointments yet. Request one on the right.
            </p>
          )}

          {appointments.map((appt) => {
            const { day, month, time } = formatDateTime(appt.requestedTime);
            const canManage = appt.status !== "CANCELLED" && appt.status !== "COMPLETED";
            return (
              <div key={appt.id} className="border-b border-line px-[18px] py-4 last:border-b-0">
                <div className="flex items-center gap-[14px]">
                  <div className="flex h-[46px] w-[46px] flex-shrink-0 flex-col items-center justify-center rounded-2xl bg-teal-100 text-teal-700">
                    <span className="text-[15px] font-bold leading-none">{day}</span>
                    <span className="text-[10px] font-semibold uppercase leading-none">{month}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold text-ink">
                      {PROFESSIONAL_TYPE_LABEL[appt.professional.professionalType]} · {appt.professional.name}
                    </div>
                    <div className="mt-[3px] text-xs text-ink-soft">{time}{appt.notes ? ` · ${appt.notes}` : ""}</div>
                    {appt.outcome && <div className="mt-1 text-xs italic text-ink-soft">Outcome: {appt.outcome}</div>}
                  </div>
                  <span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-bold ${STATUS_STYLE[appt.status] ?? "bg-teal-100 text-teal-700"}`}>
                    {appt.status}
                  </span>
                </div>
                {canManage && (
                  <div className="mt-3 flex flex-wrap items-center gap-2 pl-[60px]">
                    {rescheduling === appt.id ? (
                      <>
                        <input
                          type="datetime-local"
                          className="rounded-[10px] border border-line bg-paper-2 px-2.5 py-1.5 text-xs"
                          min={minDateTime}
                          value={rescheduleTime}
                          onChange={(e) => setRescheduleTime(e.target.value)}
                        />
                        <button onClick={() => void handleReschedule(appt.id)} className="rounded-full bg-teal-700 px-3 py-1.5 text-[12px] font-semibold text-white">
                          Save
                        </button>
                        <button onClick={() => setRescheduling(null)} className="rounded-full border border-line px-3 py-1.5 text-[12px] font-semibold text-ink-soft">
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            setRescheduling(appt.id);
                            setRescheduleTime("");
                          }}
                          className="rounded-full border border-line px-3 py-1.5 text-[12px] font-semibold text-ink-soft hover:bg-paper-2"
                        >
                          Reschedule
                        </button>
                        <button
                          onClick={() => setCancelTarget(appt.id)}
                          className="rounded-full border border-coral-dark px-3 py-1.5 text-[12px] font-semibold text-coral-dark hover:bg-coral-100"
                        >
                          Cancel
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div>
          <div className="px-1 pb-2 font-mono text-[11px] uppercase tracking-[0.08em] text-ink-soft">
            Request a new time
          </div>
          <form onSubmit={(e) => void handleRequest(e)} className="rounded-md border border-[rgba(22,48,44,0.05)] bg-white p-5 shadow-card">
            <label className="mb-1 block text-[12.5px] font-bold text-ink-soft">Professional type</label>
            <select
              className="mb-3.5 w-full rounded-[10px] border border-line bg-paper-2 px-3.5 py-3 text-sm"
              value={professionalType}
              onChange={(e) => setProfessionalType(e.target.value as ProfessionalType)}
            >
              {(Object.keys(PROFESSIONAL_TYPE_LABEL) as ProfessionalType[]).map((t) => (
                <option key={t} value={t}>{PROFESSIONAL_TYPE_LABEL[t]}</option>
              ))}
            </select>

            <label className="mb-1 block text-[12.5px] font-bold text-ink-soft">Professional</label>
            <select
              className="mb-3.5 w-full rounded-[10px] border border-line bg-paper-2 px-3.5 py-3 text-sm"
              value={professionalId}
              onChange={(e) => setProfessionalId(e.target.value)}
            >
              {professionals.length === 0 && <option value="">No one available yet</option>}
              {professionals.map((p) => (
                <option key={p.id} value={p.id}>{p.name}{p.specialization ? ` · ${p.specialization}` : ""}</option>
              ))}
            </select>

            <label className="mb-1 block text-[12.5px] font-bold text-ink-soft">Preferred time</label>
            <input
              type="datetime-local"
              className="mb-3.5 w-full rounded-[10px] border border-line bg-paper-2 px-3.5 py-3 text-sm"
              min={minDateTime}
              value={requestedTime}
              onChange={(e) => setRequestedTime(e.target.value)}
              required
            />

            <label className="mb-1 block text-[12.5px] font-bold text-ink-soft">Reason for visit (optional)</label>
            <textarea
              className="mb-4 w-full rounded-[10px] border border-line bg-paper-2 px-3.5 py-3 text-sm"
              rows={3}
              placeholder="e.g. Family planning follow-up"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />

            <button
              type="submit"
              disabled={submitting || !professionalId}
              className="w-full rounded-full bg-coral px-[26px] py-[13px] text-[15px] font-semibold text-white shadow-[0_8px_20px_rgba(232,115,92,0.35)] transition hover:-translate-y-px hover:bg-coral-dark disabled:opacity-50"
            >
              {submitting ? "Requesting…" : "Request appointment"}
            </button>
          </form>
        </div>
      </div>

      <ConfirmModal
        open={cancelTarget !== null}
        title="Cancel appointment"
        message="Are you sure you want to cancel this appointment?"
        confirmLabel="Cancel appointment"
        cancelLabel="Keep it"
        variant="danger"
        onConfirm={() => cancelTarget && void handleCancel(cancelTarget)}
        onCancel={() => setCancelTarget(null)}
      />
    </section>
  );
}

function ProfessionalView() {
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<ProfessionalAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [outcomeDraft, setOutcomeDraft] = useState<Record<string, string>>({});

  async function load() {
    setLoading(true);
    try {
      setAppointments(await getProfessionalCalendar());
    } catch {
      toast("Couldn't load your calendar right now.", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleRespond(id: string, accept: boolean) {
    try {
      await respondToAppointment(id, accept);
      toast(accept ? "Appointment confirmed" : "Appointment declined", "success");
      await load();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to respond", "error");
    }
  }

  async function handleOutcome(id: string) {
    const outcome = outcomeDraft[id]?.trim();
    if (!outcome) return;
    try {
      await recordAppointmentOutcome(id, outcome);
      toast("Outcome recorded", "success");
      setOutcomeDraft((prev) => ({ ...prev, [id]: "" }));
      await load();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to record outcome", "error");
    }
  }

  return (
    <section className="pb-16 pt-5">
      <div className="rounded-md border border-[rgba(22,48,44,0.05)] bg-white py-1.5 shadow-card">
        <div className="flex items-center justify-between px-5 pb-1.5 pt-[14px]">
          <h3 className="text-base text-teal-900">Calendar</h3>
        </div>

        {!loading && appointments.length === 0 && (
          <p className="px-5 pb-5 pt-2 text-[13.5px] text-ink-soft">No appointments assigned yet.</p>
        )}

        {appointments.map((appt) => {
          const { day, month, time } = formatDateTime(appt.requestedTime);
          return (
            <div key={appt.id} className="border-b border-line px-[18px] py-4 last:border-b-0">
              <div className="flex items-center gap-[14px]">
                <div className="flex h-[46px] w-[46px] flex-shrink-0 flex-col items-center justify-center rounded-2xl bg-teal-100 text-teal-700">
                  <span className="text-[15px] font-bold leading-none">{day}</span>
                  <span className="text-[10px] font-semibold uppercase leading-none">{month}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-ink">{appt.user.name}</div>
                  <div className="mt-[3px] text-xs text-ink-soft">{time}{appt.notes ? ` · ${appt.notes}` : ""}</div>
                  {appt.outcome && <div className="mt-1 text-xs italic text-ink-soft">Outcome: {appt.outcome}</div>}
                </div>
                <span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-bold ${STATUS_STYLE[appt.status] ?? "bg-teal-100 text-teal-700"}`}>
                  {appt.status}
                </span>
              </div>

              {(appt.status === "REQUESTED" || appt.status === "RESCHEDULED") && (
                <div className="mt-3 flex gap-2 pl-[60px]">
                  <button onClick={() => void handleRespond(appt.id, true)} className="rounded-full bg-teal-700 px-3 py-1.5 text-[12px] font-semibold text-white">
                    Accept
                  </button>
                  <button onClick={() => void handleRespond(appt.id, false)} className="rounded-full border border-coral-dark px-3 py-1.5 text-[12px] font-semibold text-coral-dark">
                    Decline
                  </button>
                </div>
              )}

              {appt.status === "CONFIRMED" && (
                <div className="mt-3 flex flex-wrap items-center gap-2 pl-[60px]">
                  <input
                    className="min-w-[220px] flex-1 rounded-[10px] border border-line bg-paper-2 px-3 py-1.5 text-xs"
                    placeholder="Record the outcome of this visit…"
                    value={outcomeDraft[appt.id] ?? ""}
                    onChange={(e) => setOutcomeDraft((prev) => ({ ...prev, [appt.id]: e.target.value }))}
                  />
                  <button onClick={() => void handleOutcome(appt.id)} className="rounded-full bg-teal-700 px-3 py-1.5 text-[12px] font-semibold text-white">
                    Mark completed
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
