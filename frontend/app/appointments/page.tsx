"use client";

import { useEffect, useState } from "react";

import { useToast } from "@/lib/useToast";
import { ConfirmModal } from "@/components/Modal";
import { AppShell } from "@/components/AppShell";
import { PageLoading, FullPageLoading } from "@/components/Spinner";
import type { Language } from "@/lib/apiClient";
import { useLanguage } from "@/lib/LanguageContext";
import { useRequireUser } from "@/lib/useUserAuth";
import { VALIDATION } from "@/lib/validationMessages";
import {
  cancelAppointment,
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
} from "@/lib/userApiClient";

const PROFESSIONAL_TYPE_LABEL: Record<Language, Record<ProfessionalType, string>> = {
  EN: { CHW: "Community Health Worker", NURSE: "Nurse", MIDWIFE: "Midwife", PSYCHOLOGIST: "Psychologist", DOCTOR: "Doctor" },
  RW: { CHW: "Umujyanama w'Ubuzima", NURSE: "Umuforomo", MIDWIFE: "Umubyaza", PSYCHOLOGIST: "Umuganga w'Indwara zo mu Mutwe", DOCTOR: "Muganga" },
  FR: { CHW: "Agent de Santé Communautaire", NURSE: "Infirmier(ère)", MIDWIFE: "Sage-femme", PSYCHOLOGIST: "Psychologue", DOCTOR: "Médecin" },
  SW: { CHW: "Mfanyakazi wa Afya wa Jamii", NURSE: "Muuguzi", MIDWIFE: "Mkunga", PSYCHOLOGIST: "Mwanasaikolojia", DOCTOR: "Daktari" },
};

const STATUS_LABEL: Record<Language, Record<string, string>> = {
  EN: { REQUESTED: "Requested", CONFIRMED: "Confirmed", RESCHEDULED: "Rescheduled", CANCELLED: "Cancelled", COMPLETED: "Completed" },
  RW: { REQUESTED: "Yasabwe", CONFIRMED: "Yemejwe", RESCHEDULED: "Yasubitswe", CANCELLED: "Yahagaritswe", COMPLETED: "Yarangiye" },
  FR: { REQUESTED: "Demandé", CONFIRMED: "Confirmé", RESCHEDULED: "Reporté", CANCELLED: "Annulé", COMPLETED: "Terminé" },
  SW: { REQUESTED: "Imeombwa", CONFIRMED: "Imethibitishwa", RESCHEDULED: "Imepangwa Upya", CANCELLED: "Imeghairiwa", COMPLETED: "Imekamilika" },
};

const STATUS_STYLE: Record<string, string> = {
  REQUESTED: "bg-gold-100 text-[#8A5E1E]",
  CONFIRMED: "bg-teal-100 text-teal-700",
  RESCHEDULED: "bg-gold-100 text-[#8A5E1E]",
  CANCELLED: "bg-coral-100 text-coral-dark",
  COMPLETED: "bg-teal-100 text-teal-700",
};

type Copy = {
  eyebrow: string;
  titlePro: string;
  titleUser: string;
  subtitlePro: string;
  subtitleUser: string;
  loginGate: string;
  upcoming: string;
  noAppointments: string;
  outcomeLabel: string;
  save: string;
  cancel: string;
  reschedule: string;
  requestNewTime: string;
  professionalType: string;
  professional: string;
  noneAvailable: string;
  preferredTime: string;
  reasonOptional: string;
  reasonPlaceholder: string;
  requesting: string;
  requestAppointment: string;
  cancelModalTitle: string;
  cancelModalMessage: string;
  cancelModalConfirm: string;
  cancelModalKeep: string;
  calendar: string;
  noneAssigned: string;
  accept: string;
  decline: string;
  outcomePlaceholder: string;
  markCompleted: string;
  errLoadAppointments: string;
  errLoadCalendar: string;
  errChooseProAndTime: string;
  errFutureTime: string;
  successRequested: string;
  errRequestFailed: string;
  successRescheduled: string;
  errRescheduleFailed: string;
  successCancelled: string;
  errCancelFailed: string;
  successConfirmed: string;
  successDeclined: string;
  errRespondFailed: string;
  successOutcome: string;
  errOutcomeFailed: string;
};

const COPY: Record<Language, Copy> = {
  EN: {
    eyebrow: "Appointments",
    titlePro: "Your appointment queue",
    titleUser: "Book time with a professional",
    subtitlePro: "Review requests, confirm times, and record outcomes for the people you support.",
    subtitleUser: "Request a time with a Community Health Worker, nurse, midwife, psychologist, or doctor — and manage what you already have coming up.",
    loginGate: "Log in to request, view, or manage your appointments.",
    upcoming: "Upcoming",
    noAppointments: "No appointments yet. Request one on the right.",
    outcomeLabel: "Outcome",
    save: "Save",
    cancel: "Cancel",
    reschedule: "Reschedule",
    requestNewTime: "Request a new time",
    professionalType: "Professional type",
    professional: "Professional",
    noneAvailable: "No one available yet",
    preferredTime: "Preferred time",
    reasonOptional: "Reason for visit (optional)",
    reasonPlaceholder: "e.g. Family planning follow-up",
    requesting: "Requesting…",
    requestAppointment: "Request appointment",
    cancelModalTitle: "Cancel appointment",
    cancelModalMessage: "Are you sure you want to cancel this appointment?",
    cancelModalConfirm: "Cancel appointment",
    cancelModalKeep: "Keep it",
    calendar: "Calendar",
    noneAssigned: "No appointments assigned yet.",
    accept: "Accept",
    decline: "Decline",
    outcomePlaceholder: "Record the outcome of this visit…",
    markCompleted: "Mark completed",
    errLoadAppointments: "Couldn't load your appointments right now.",
    errLoadCalendar: "Couldn't load your calendar right now.",
    errChooseProAndTime: "Please choose a professional and a time.",
    errFutureTime: "Please choose a time in the future.",
    successRequested: "Appointment requested",
    errRequestFailed: "Failed to request appointment",
    successRescheduled: "Appointment rescheduled",
    errRescheduleFailed: "Failed to reschedule appointment",
    successCancelled: "Appointment cancelled",
    errCancelFailed: "Failed to cancel appointment",
    successConfirmed: "Appointment confirmed",
    successDeclined: "Appointment declined",
    errRespondFailed: "Failed to respond",
    successOutcome: "Outcome recorded",
    errOutcomeFailed: "Failed to record outcome",
  },
  RW: {
    eyebrow: "Gahunda",
    titlePro: "Urutonde rw'abagana",
    titleUser: "Fata umwanya n'umukozi w'ubuzima",
    subtitlePro: "Reba ibisabwa, wemeze amasaha, kandi wandike ibyavuye ku bantu ubafasha.",
    subtitleUser: "Saba umwanya n'umujyanama w'ubuzima, umuforomo, umubyaza, umuganga w'indwara zo mu mutwe, cyangwa muganga — kandi ucunge ibyo usanzwe ufite biteganyijwe.",
    loginGate: "Injira kugira ngo usabe, urebe, cyangwa ucunge gahunda zawe.",
    upcoming: "Biteganyijwe",
    noAppointments: "Nta gahunda urafite. Saba imwe iburyo.",
    outcomeLabel: "Ibisubizo",
    save: "Bika",
    cancel: "Hagarika",
    reschedule: "Subiramo",
    requestNewTime: "Saba undi mwanya",
    professionalType: "Ubwoko bw'umukozi",
    professional: "Umukozi w'ubuzima",
    noneAvailable: "Nta n'umwe uraboneka",
    preferredTime: "Igihe ushaka",
    reasonOptional: "Impamvu yo gusura (si ngombwa)",
    reasonPlaceholder: "urugero: Gukurikirana kuboneza urubyaro",
    requesting: "Birimo gusabwa…",
    requestAppointment: "Saba gahunda",
    cancelModalTitle: "Hagarika gahunda",
    cancelModalMessage: "Uzi neza ko ushaka guhagarika iyi gahunda?",
    cancelModalConfirm: "Hagarika gahunda",
    cancelModalKeep: "Yigumane",
    calendar: "Kalendari",
    noneAssigned: "Nta gahunda urahabwa.",
    accept: "Emera",
    decline: "Anga",
    outcomePlaceholder: "Andika ibyavuye muri iyi sura…",
    markCompleted: "Shyiraho ko yarangiye",
    errLoadAppointments: "Ntibishoboka gushaka gahunda zawe ubu.",
    errLoadCalendar: "Ntibishoboka gushaka kalendari yawe ubu.",
    errChooseProAndTime: "Nyamuneka hitamo umukozi w'ubuzima n'igihe.",
    errFutureTime: "Nyamuneka hitamo igihe kizaza.",
    successRequested: "Gahunda yasabwe",
    errRequestFailed: "Kusaba gahunda byanze",
    successRescheduled: "Gahunda yasubiwemo",
    errRescheduleFailed: "Gusubiramo gahunda byanze",
    successCancelled: "Gahunda yahagaritswe",
    errCancelFailed: "Guhagarika gahunda byanze",
    successConfirmed: "Gahunda yemejwe",
    successDeclined: "Gahunda yanzwe",
    errRespondFailed: "Gusubiza byanze",
    successOutcome: "Ibisubizo byanditswe",
    errOutcomeFailed: "Kwandika ibisubizo byanze",
  },
  FR: {
    eyebrow: "Rendez-vous",
    titlePro: "Votre file de rendez-vous",
    titleUser: "Prendre rendez-vous avec un professionnel",
    subtitlePro: "Consultez les demandes, confirmez les horaires, et enregistrez les résultats pour les personnes que vous suivez.",
    subtitleUser: "Demandez un rendez-vous avec un agent de santé communautaire, un(e) infirmier(ère), une sage-femme, un(e) psychologue ou un médecin — et gérez ceux déjà prévus.",
    loginGate: "Connectez-vous pour demander, consulter ou gérer vos rendez-vous.",
    upcoming: "À venir",
    noAppointments: "Aucun rendez-vous pour l'instant. Faites-en une demande à droite.",
    outcomeLabel: "Résultat",
    save: "Enregistrer",
    cancel: "Annuler",
    reschedule: "Reporter",
    requestNewTime: "Demander un nouveau créneau",
    professionalType: "Type de professionnel",
    professional: "Professionnel",
    noneAvailable: "Personne de disponible pour le moment",
    preferredTime: "Horaire souhaité",
    reasonOptional: "Motif de la visite (facultatif)",
    reasonPlaceholder: "ex. Suivi de planning familial",
    requesting: "Envoi en cours…",
    requestAppointment: "Demander un rendez-vous",
    cancelModalTitle: "Annuler le rendez-vous",
    cancelModalMessage: "Voulez-vous vraiment annuler ce rendez-vous ?",
    cancelModalConfirm: "Annuler le rendez-vous",
    cancelModalKeep: "Le conserver",
    calendar: "Calendrier",
    noneAssigned: "Aucun rendez-vous attribué pour l'instant.",
    accept: "Accepter",
    decline: "Refuser",
    outcomePlaceholder: "Enregistrer le résultat de cette visite…",
    markCompleted: "Marquer comme terminé",
    errLoadAppointments: "Impossible de charger vos rendez-vous pour le moment.",
    errLoadCalendar: "Impossible de charger votre calendrier pour le moment.",
    errChooseProAndTime: "Veuillez choisir un professionnel et un horaire.",
    errFutureTime: "Veuillez choisir une heure future.",
    successRequested: "Rendez-vous demandé",
    errRequestFailed: "Échec de la demande de rendez-vous",
    successRescheduled: "Rendez-vous reporté",
    errRescheduleFailed: "Échec du report du rendez-vous",
    successCancelled: "Rendez-vous annulé",
    errCancelFailed: "Échec de l'annulation du rendez-vous",
    successConfirmed: "Rendez-vous confirmé",
    successDeclined: "Rendez-vous refusé",
    errRespondFailed: "Échec de la réponse",
    successOutcome: "Résultat enregistré",
    errOutcomeFailed: "Échec de l'enregistrement du résultat",
  },
  SW: {
    eyebrow: "Miadi",
    titlePro: "Foleni yako ya miadi",
    titleUser: "Panga muda na mtaalamu",
    subtitlePro: "Pitia maombi, thibitisha nyakati, na rekodi matokeo kwa watu unaowasaidia.",
    subtitleUser: "Omba muda na Mfanyakazi wa Afya wa Jamii, muuguzi, mkunga, mwanasaikolojia, au daktari — na simamia miadi uliyo nayo tayari.",
    loginGate: "Ingia ili kuomba, kuona, au kusimamia miadi yako.",
    upcoming: "Zinazokuja",
    noAppointments: "Bado hakuna miadi. Omba moja upande wa kulia.",
    outcomeLabel: "Matokeo",
    save: "Hifadhi",
    cancel: "Ghairi",
    reschedule: "Panga upya",
    requestNewTime: "Omba muda mpya",
    professionalType: "Aina ya mtaalamu",
    professional: "Mtaalamu",
    noneAvailable: "Hakuna anayepatikana bado",
    preferredTime: "Muda unaopendelea",
    reasonOptional: "Sababu ya ziara (si lazima)",
    reasonPlaceholder: "mfano: Ufuatiliaji wa uzazi wa mpango",
    requesting: "Inaomba…",
    requestAppointment: "Omba miadi",
    cancelModalTitle: "Ghairi miadi",
    cancelModalMessage: "Una uhakika unataka kughairi miadi hii?",
    cancelModalConfirm: "Ghairi miadi",
    cancelModalKeep: "Iache",
    calendar: "Kalenda",
    noneAssigned: "Bado hakuna miadi iliyopangiwa.",
    accept: "Kubali",
    decline: "Kataa",
    outcomePlaceholder: "Rekodi matokeo ya ziara hii…",
    markCompleted: "Weka imekamilika",
    errLoadAppointments: "Imeshindwa kupakia miadi yako kwa sasa.",
    errLoadCalendar: "Imeshindwa kupakia kalenda yako kwa sasa.",
    errChooseProAndTime: "Tafadhali chagua mtaalamu na muda.",
    errFutureTime: "Tafadhali chagua muda ujao.",
    successRequested: "Miadi imeombwa",
    errRequestFailed: "Imeshindwa kuomba miadi",
    successRescheduled: "Miadi imepangwa upya",
    errRescheduleFailed: "Imeshindwa kupanga upya miadi",
    successCancelled: "Miadi imeghairiwa",
    errCancelFailed: "Imeshindwa kughairi miadi",
    successConfirmed: "Miadi imethibitishwa",
    successDeclined: "Miadi imekataliwa",
    errRespondFailed: "Imeshindwa kujibu",
    successOutcome: "Matokeo yamerekodiwa",
    errOutcomeFailed: "Imeshindwa kurekodi matokeo",
  },
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
  const { language } = useLanguage();
  const { user, loading: authLoading } = useRequireUser();
  const t = COPY[language];

  if (authLoading || !user) return <FullPageLoading />;

  return (
    <AppShell active="/appointments" session={{ kind: "user", user }}>
      <div className="mx-auto max-w-[1160px]">
        <section className="flex items-start justify-between gap-5 pb-3">
          <div><h1 className="font-display text-[34px] text-teal-900">{t.eyebrow}</h1>
          <p className="mt-1 max-w-[620px] text-[13px] leading-[1.6] text-ink-soft">
            {user.role === "HEALTHCARE_PROFESSIONAL" ? t.subtitlePro : "Book, manage, and track your appointments."}
          </p></div>
          {user.role !== "HEALTHCARE_PROFESSIONAL" && <a href="#book-appointment" className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-teal-700 px-5 py-3 text-[11px] font-semibold text-white shadow-sm hover:bg-teal-900"><span className="text-base">＋</span>{t.requestAppointment}</a>}
        </section>

        {user.role === "HEALTHCARE_PROFESSIONAL" ? (
          <ProfessionalView language={language} />
        ) : (
          <UserView toast={toast} language={language} />
        )}
      </div>
    </AppShell>
  );
}

function UserView({ toast, language }: { toast: (message: string, type?: "success" | "error" | "info") => void; language: Language }) {
  const t = COPY[language];
  const v = VALIDATION[language];
  const proTypeLabel = PROFESSIONAL_TYPE_LABEL[language];
  const statusLabel = STATUS_LABEL[language];
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [professionalType, setProfessionalType] = useState<ProfessionalType>("NURSE");
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [professionalId, setProfessionalId] = useState("");
  const [requestedTime, setRequestedTime] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ professionalId?: string; requestedTime?: string }>({});
  const [rescheduling, setRescheduling] = useState<string | null>(null);
  const [rescheduleTime, setRescheduleTime] = useState("");
  const [cancelTarget, setCancelTarget] = useState<string | null>(null);
  const [filter, setFilter] = useState<"UPCOMING" | "REQUESTED" | "COMPLETED" | "CANCELLED">("UPCOMING");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  async function loadAppointments() {
    setLoading(true);
    try {
      setAppointments(await getMyAppointments());
    } catch {
      toast(t.errLoadAppointments, "error");
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
    const next: typeof errors = {};
    if (!professionalId) next.professionalId = v.required;
    if (!requestedTime) next.requestedTime = v.required;
    else if (new Date(requestedTime).getTime() <= Date.now()) next.requestedTime = t.errFutureTime;
    setErrors(next);
    if (Object.keys(next).length > 0) {
      toast(next.professionalId ?? next.requestedTime ?? t.errChooseProAndTime, "error");
      return;
    }
    setSubmitting(true);
    try {
      await requestAppointment({ professionalId, requestedTime: new Date(requestedTime).toISOString(), notes: notes.trim() || undefined });
      toast(t.successRequested, "success");
      setNotes("");
      setRequestedTime("");
      await loadAppointments();
    } catch (err) {
      toast(err instanceof Error ? err.message : t.errRequestFailed, "error");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleReschedule(id: string) {
    if (!rescheduleTime || new Date(rescheduleTime).getTime() <= Date.now()) {
      toast(t.errFutureTime, "error");
      return;
    }
    try {
      await rescheduleAppointment(id, new Date(rescheduleTime).toISOString());
      toast(t.successRescheduled, "success");
      setRescheduling(null);
      setRescheduleTime("");
      await loadAppointments();
    } catch (err) {
      toast(err instanceof Error ? err.message : t.errRescheduleFailed, "error");
    }
  }

  async function handleCancel(id: string) {
    setCancelTarget(null);
    try {
      await cancelAppointment(id);
      toast(t.successCancelled, "success");
      await loadAppointments();
    } catch (err) {
      toast(err instanceof Error ? err.message : t.errCancelFailed, "error");
    }
  }

  const minDateTime = toLocalInputValue(new Date(Date.now() + 60 * 60 * 1000));
  const now = new Date();
  const upcoming = appointments.filter((appt) => !["CANCELLED", "COMPLETED"].includes(appt.status) && new Date(appt.requestedTime) >= now);
  const filtered = appointments.filter((appt) => {
    if (filter === "UPCOMING") return !["CANCELLED", "COMPLETED"].includes(appt.status) && new Date(appt.requestedTime) >= now;
    if (filter === "REQUESTED") return appt.status === "REQUESTED" || appt.status === "RESCHEDULED";
    return appt.status === filter;
  });
  const selected = appointments.find((appt) => appt.id === selectedId) ?? filtered[0] ?? null;
  const statCards = [
    { key: "UPCOMING" as const, label: t.upcoming, value: upcoming.length, icon: "i-calendar", color: "#8956E8", helper: upcoming[0] ? new Date(upcoming[0].requestedTime).toLocaleString() : t.noAppointments },
    { key: "COMPLETED" as const, label: statusLabel.COMPLETED, value: appointments.filter((a) => a.status === "COMPLETED").length, icon: "i-shield", color: "#219A6D", helper: "All time" },
    { key: "REQUESTED" as const, label: statusLabel.REQUESTED, value: appointments.filter((a) => a.status === "REQUESTED" || a.status === "RESCHEDULED").length, icon: "i-clock", color: "#F0A01E", helper: "Awaiting confirmation" },
    { key: "CANCELLED" as const, label: statusLabel.CANCELLED, value: appointments.filter((a) => a.status === "CANCELLED").length, icon: "i-close", color: "#EF5573", helper: "All time" },
  ];

  return (
    <section className="pb-16 pt-5">
      {loading ? <PageLoading /> : <>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((stat) => <button type="button" key={stat.key} onClick={() => setFilter(stat.key)} className={`flex items-center gap-4 rounded-2xl border bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 ${filter === stat.key ? "border-teal-600" : "border-line"}`}><span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full" style={{ background: `${stat.color}16`, color: stat.color }}><svg width="22" height="22"><use href={`#${stat.icon}`} /></svg></span><span className="min-w-0"><b className="block text-xl">{stat.value}</b><span className="block text-[11px] text-ink-soft">{stat.label}</span><span className="mt-1 block truncate text-[9px] font-semibold" style={{ color: stat.color }}>{stat.helper}</span></span></button>)}
      </div>

      <div className="mt-5 grid items-start gap-5 xl:grid-cols-[1fr_330px]">
        <div className="space-y-5">
        <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
          <div className="flex gap-5 overflow-x-auto border-b border-line px-5 pt-3">{statCards.map((stat) => <button key={stat.key} onClick={() => setFilter(stat.key)} className={`whitespace-nowrap border-b-2 px-1 py-3 text-xs font-semibold ${filter === stat.key ? "border-teal-700 text-teal-900" : "border-transparent text-ink-soft"}`}>{stat.label}</button>)}</div>
          {filtered.length === 0 && <div className="flex min-h-[350px] flex-col items-center justify-center px-6 py-12 text-center"><span className="flex h-20 w-20 items-center justify-center rounded-full bg-[#EEE8FF] text-[#8956E8]"><svg width="34" height="34"><use href="#i-calendar" /></svg></span><h3 className="mt-5 text-lg font-bold text-ink">{filter === "UPCOMING" ? "No upcoming appointments" : `No ${statCards.find((item) => item.key === filter)?.label.toLowerCase()} appointments`}</h3><p className="mt-2 max-w-[390px] text-xs leading-5 text-ink-soft">{filter === "UPCOMING" ? "When you book care, your appointment details and confirmation status will appear here. Choose a professional and a time that works for you." : "There are no appointments in this category yet. You can switch tabs or book a new appointment whenever you need support."}</p><div className="mt-5 flex flex-wrap justify-center gap-3"><a href="#book-appointment" className="rounded-xl bg-teal-700 px-5 py-2.5 text-[11px] font-semibold text-white">Book an appointment</a><a href="/facility-locator" className="rounded-xl border border-teal-700 px-5 py-2.5 text-[11px] font-semibold text-teal-700">Find nearby care</a></div><div className="mt-7 flex flex-wrap justify-center gap-5 text-[10px] text-ink-soft"><span>✓ Private and confidential</span><span>✓ Qualified professionals</span><span>✓ Flexible scheduling</span></div></div>}
          {filtered.map((appt) => {
            const { day, month, time } = formatDateTime(appt.requestedTime);
            const canManage = appt.status !== "CANCELLED" && appt.status !== "COMPLETED";
            return (
              <div key={appt.id} onClick={() => setSelectedId(appt.id)} className={`cursor-pointer border-b border-line px-5 py-5 last:border-b-0 hover:bg-paper-2 ${selected?.id === appt.id ? "bg-[#F8FCFB]" : ""}`}>
                <div className="flex items-center gap-4">
                  <div className="flex h-[68px] w-[54px] flex-shrink-0 flex-col items-center justify-center rounded-xl bg-[#EFF6F3] text-teal-900">
                    <span className="text-[10px] font-semibold uppercase">{month}</span><span className="text-[22px] font-bold leading-tight">{day}</span><span className="text-[9px] text-ink-soft">{new Date(appt.requestedTime).toLocaleDateString([], { weekday: "short" })}</span>
                  </div>
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#EEE8FF] text-[#8956E8]"><svg width="21" height="21"><use href="#i-stethoscope" /></svg></span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold text-ink">{appt.professional.name}</div>
                    <div className="mt-1 text-[11px] text-ink-soft">{proTypeLabel[appt.professional.professionalType]}</div><div className="mt-1 text-[10px] text-ink-soft">◷ {time}</div>
                    {appt.outcome && <div className="mt-1 text-xs italic text-ink-soft">{t.outcomeLabel}: {appt.outcome}</div>}
                  </div>
                  <span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-bold ${STATUS_STYLE[appt.status] ?? "bg-teal-100 text-teal-700"}`}>
                    {statusLabel[appt.status] ?? appt.status}
                  </span>
                </div>
                {canManage && <div className="mt-3 flex flex-wrap items-center justify-end gap-2">
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
                          {t.save}
                        </button>
                        <button onClick={() => setRescheduling(null)} className="rounded-full border border-line px-3 py-1.5 text-[12px] font-semibold text-ink-soft">
                          {t.cancel}
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={(event) => { event.stopPropagation();
                            setRescheduling(appt.id);
                            setRescheduleTime("");
                          }}
                          className="rounded-lg border border-teal-700 px-3 py-1.5 text-[11px] font-semibold text-teal-700 hover:bg-paper-2"
                        >
                          {t.reschedule}
                        </button>
                        <button onClick={(event) => { event.stopPropagation(); setCancelTarget(appt.id); }}
                          className="rounded-lg border border-coral-dark px-3 py-1.5 text-[11px] font-semibold text-coral-dark hover:bg-coral-100"
                        >
                          {t.cancel}
                        </button>
                      </>
                    )}
                  </div>}
              </div>
            );
          })}
        </div>
        <div className="flex items-center justify-between rounded-2xl border border-[#CDE5DF] bg-gradient-to-r from-[#EFF9F6] to-white p-5"><div><h3 className="text-sm font-bold">Need help choosing the right appointment?</h3><p className="mt-1 text-[11px] text-ink-soft">Choose a professional type below or find nearby care.</p></div><a href="#book-appointment" className="rounded-xl bg-teal-700 px-4 py-2 text-[11px] font-semibold text-white">{t.requestAppointment}</a></div>
        </div>

        <aside className="space-y-4">
          {selected && <div className="rounded-2xl border border-line bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><h3 className="text-sm font-bold">Appointment details</h3><span className={`rounded-full px-3 py-1 text-[10px] font-semibold ${STATUS_STYLE[selected.status]}`}>{statusLabel[selected.status]}</span></div><div className="mt-5 space-y-4"><div className="flex gap-3"><span className="text-[#8956E8]">♙</span><div><div className="text-[10px] text-ink-soft">Professional</div><div className="mt-1 text-xs font-bold">{selected.professional.name}</div><div className="text-[10px] text-ink-soft">{proTypeLabel[selected.professional.professionalType]}</div></div></div><div className="flex gap-3"><span>▣</span><div><div className="text-[10px] text-ink-soft">Date & time</div><div className="mt-1 text-xs font-semibold">{new Date(selected.requestedTime).toLocaleString()}</div></div></div>{selected.notes && <div className="flex gap-3"><span>▤</span><div><div className="text-[10px] text-ink-soft">Notes</div><div className="mt-1 text-xs leading-5">{selected.notes}</div></div></div>}{selected.outcome && <div className="rounded-xl bg-teal-100 p-3 text-xs"><b>{t.outcomeLabel}</b><p className="mt-1">{selected.outcome}</p></div>}</div></div>}
          <form id="book-appointment" onSubmit={(e) => void handleRequest(e)} className="rounded-2xl border border-line bg-white p-5 shadow-sm">
            <h3 className="mb-4 text-sm font-bold">{t.requestNewTime}</h3>
            <label className="mb-1 block text-[12.5px] font-bold text-ink-soft">{t.professionalType}</label>
            <select
              className="mb-3.5 w-full rounded-[10px] border border-line bg-paper-2 px-3.5 py-3 text-sm"
              value={professionalType}
              onChange={(e) => setProfessionalType(e.target.value as ProfessionalType)}
            >
              {(Object.keys(proTypeLabel) as ProfessionalType[]).map((k) => (
                <option key={k} value={k}>{proTypeLabel[k]}</option>
              ))}
            </select>

            <label className="mb-1 block text-[12.5px] font-bold text-ink-soft">{t.professional}</label>
            <select
              className={`w-full rounded-[10px] border bg-paper-2 px-3.5 py-3 text-sm ${errors.professionalId ? "border-danger" : "border-line"}`}
              value={professionalId}
              onChange={(e) => setProfessionalId(e.target.value)}
            >
              {professionals.length === 0 && <option value="">{t.noneAvailable}</option>}
              {professionals.map((p) => (
                <option key={p.id} value={p.id}>{p.name}{p.specialization ? ` · ${p.specialization}` : ""}{p.availability ? ` — ${p.availability}` : ""}</option>
              ))}
            </select>
            <p className="mb-1 mt-1 min-h-[14px] text-xs font-semibold text-danger">{errors.professionalId}</p>

            <label className="mb-1 block text-[12.5px] font-bold text-ink-soft">{t.preferredTime}</label>
            <input
              type="datetime-local"
              className={`w-full rounded-[10px] border bg-paper-2 px-3.5 py-3 text-sm ${errors.requestedTime ? "border-danger" : "border-line"}`}
              min={minDateTime}
              value={requestedTime}
              onChange={(e) => setRequestedTime(e.target.value)}
            />
            <p className="mb-3.5 mt-1 min-h-[14px] text-xs font-semibold text-danger">{errors.requestedTime}</p>

            <label className="mb-1 block text-[12.5px] font-bold text-ink-soft">{t.reasonOptional}</label>
            <textarea
              className="mb-4 w-full rounded-[10px] border border-line bg-paper-2 px-3.5 py-3 text-sm"
              rows={3}
              placeholder={t.reasonPlaceholder}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />

            <button
              type="submit"
              disabled={submitting || !professionalId}
              className="w-full rounded-xl bg-teal-700 px-[26px] py-[12px] text-[13px] font-semibold text-white transition hover:bg-teal-900 disabled:opacity-50"
            >
              {submitting ? t.requesting : t.requestAppointment}
            </button>
          </form>
        </aside>
      </div>
      </>}

      <ConfirmModal
        open={cancelTarget !== null}
        title={t.cancelModalTitle}
        message={t.cancelModalMessage}
        confirmLabel={t.cancelModalConfirm}
        cancelLabel={t.cancelModalKeep}
        variant="danger"
        onConfirm={() => cancelTarget && void handleCancel(cancelTarget)}
        onCancel={() => setCancelTarget(null)}
      />
    </section>
  );
}

function ProfessionalView({ language }: { language: Language }) {
  const { toast } = useToast();
  const t = COPY[language];
  const v = VALIDATION[language];
  const statusLabel = STATUS_LABEL[language];
  const [appointments, setAppointments] = useState<ProfessionalAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [outcomeDraft, setOutcomeDraft] = useState<Record<string, string>>({});

  async function load() {
    setLoading(true);
    try {
      setAppointments(await getProfessionalCalendar());
    } catch {
      toast(t.errLoadCalendar, "error");
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
      toast(accept ? t.successConfirmed : t.successDeclined, "success");
      await load();
    } catch (err) {
      toast(err instanceof Error ? err.message : t.errRespondFailed, "error");
    }
  }

  async function handleOutcome(id: string) {
    const outcome = outcomeDraft[id]?.trim();
    if (!outcome) {
      toast(v.required, "error");
      return;
    }
    try {
      await recordAppointmentOutcome(id, outcome);
      toast(t.successOutcome, "success");
      setOutcomeDraft((prev) => ({ ...prev, [id]: "" }));
      await load();
    } catch (err) {
      toast(err instanceof Error ? err.message : t.errOutcomeFailed, "error");
    }
  }

  return (
    <section className="pb-16 pt-5">
      <div className="card py-1.5">
        <div className="flex items-center justify-between px-5 pb-1.5 pt-[14px]">
          <h3 className="text-base text-teal-900">{t.calendar}</h3>
        </div>

        {loading && <PageLoading />}

        {!loading && appointments.length === 0 && (
          <p className="px-5 pb-5 pt-2 text-[13.5px] text-ink-soft">{t.noneAssigned}</p>
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
                  {appt.outcome && <div className="mt-1 text-xs italic text-ink-soft">{t.outcomeLabel}: {appt.outcome}</div>}
                </div>
                <span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-bold ${STATUS_STYLE[appt.status] ?? "bg-teal-100 text-teal-700"}`}>
                  {statusLabel[appt.status] ?? appt.status}
                </span>
              </div>

              {(appt.status === "REQUESTED" || appt.status === "RESCHEDULED") && (
                <div className="mt-3 flex gap-2 pl-[60px]">
                  <button onClick={() => void handleRespond(appt.id, true)} className="rounded-full bg-teal-700 px-3 py-1.5 text-[12px] font-semibold text-white">
                    {t.accept}
                  </button>
                  <button onClick={() => void handleRespond(appt.id, false)} className="rounded-full border border-coral-dark px-3 py-1.5 text-[12px] font-semibold text-coral-dark">
                    {t.decline}
                  </button>
                </div>
              )}

              {appt.status === "CONFIRMED" && (
                <div className="mt-3 flex flex-wrap items-center gap-2 pl-[60px]">
                  <input
                    className="min-w-[220px] flex-1 rounded-[10px] border border-line bg-paper-2 px-3 py-1.5 text-xs"
                    placeholder={t.outcomePlaceholder}
                    value={outcomeDraft[appt.id] ?? ""}
                    onChange={(e) => setOutcomeDraft((prev) => ({ ...prev, [appt.id]: e.target.value }))}
                  />
                  <button
                    onClick={() => void handleOutcome(appt.id)}
                    disabled={!outcomeDraft[appt.id]?.trim()}
                    className="rounded-full bg-teal-700 px-3 py-1.5 text-[12px] font-semibold text-white disabled:opacity-50"
                  >
                    {t.markCompleted}
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
