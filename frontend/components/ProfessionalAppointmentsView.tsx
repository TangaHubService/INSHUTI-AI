"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { PageLoading } from "@/components/Spinner";
import {
  cancelAppointment,
  getProfessionalCalendar,
  recordAppointmentOutcome,
  rescheduleAppointment,
  respondToAppointment,
  type AppointmentStatus,
  type ProfessionalAppointment,
} from "@/lib/userApiClient";
import { useToast } from "@/lib/useToast";

type AppointmentFilter = "ALL" | "UPCOMING" | "COMPLETED" | "CANCELLED";
type AppointmentView = "LIST" | "CALENDAR";

const ACTIVE_STATUSES: AppointmentStatus[] = ["REQUESTED", "CONFIRMED", "RESCHEDULED"];

const STATUS_PRESENTATION: Record<AppointmentStatus, { label: string; badge: string; date: string }> = {
  REQUESTED: { label: "Pending Confirmation", badge: "bg-[#FFF0DC] text-[#E98100]", date: "bg-[#FFF3E4] text-[#F08A00]" },
  CONFIRMED: { label: "Upcoming", badge: "bg-[#F0EAFE] text-[#7845E9]", date: "bg-[#E9F6F2] text-[#08776D]" },
  RESCHEDULED: { label: "Upcoming", badge: "bg-[#F0EAFE] text-[#7845E9]", date: "bg-[#E9F6F2] text-[#08776D]" },
  CANCELLED: { label: "Cancelled", badge: "bg-[#FFE9E8] text-[#E84E4E]", date: "bg-[#FFEDED] text-[#F04F4F]" },
  COMPLETED: { label: "Completed", badge: "bg-[#E6F3EF] text-[#08796F]", date: "bg-[#E5F3EF] text-[#08796F]" },
};

function Icon({ name, size = 17 }: { name: string; size?: number }) {
  return <svg width={size} height={size} aria-hidden="true"><use href={`#${name}`} /></svg>;
}

function toLocalInputValue(date: Date) {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function isSameDay(left: Date, right: Date) {
  return left.getFullYear() === right.getFullYear() && left.getMonth() === right.getMonth() && left.getDate() === right.getDate();
}

function AppointmentMetric({
  label,
  value,
  helper,
  icon,
  color,
  background,
  onClick,
}: {
  label: string;
  value: number;
  helper: string;
  icon: string;
  color: string;
  background: string;
  onClick: () => void;
}) {
  return (
    <button type="button" onClick={onClick} className="flex min-h-[139px] items-center rounded-[14px] border border-[#E7E4DE] bg-white px-4 text-left shadow-[0_2px_8px_rgba(34,63,58,.055)] transition hover:-translate-y-0.5 hover:shadow-md">
      <span className="flex h-[51px] w-[51px] shrink-0 items-center justify-center rounded-full" style={{ color, background }}><Icon name={icon} size={26} /></span>
      <span className="ml-4 min-w-0">
        <b className="font-display text-[28px] leading-none text-[#073E3A]">{value}</b>
        <span className="mt-2 block truncate text-[10.5px] text-[#536D74]">{label}</span>
        <span className="mt-1 block text-[9.5px] text-[#657A80]">{helper}</span>
        <span className="mt-4 flex items-center gap-2 text-[10.5px] font-semibold text-[#00786F]">{label === "Upcoming" ? "View schedule" : "View all"} <Icon name="i-arrow" size={14} /></span>
      </span>
    </button>
  );
}

function CalendarOverview({ appointments }: { appointments: ProfessionalAppointment[] }) {
  const [cursor, setCursor] = useState(() => new Date());
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstDay = new Date(year, month, 1);
  const startOffset = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPreviousMonth = new Date(year, month, 0).getDate();

  const cells = Array.from({ length: 42 }, (_, index) => {
    const rawDay = index - startOffset + 1;
    if (rawDay < 1) return { date: new Date(year, month - 1, daysInPreviousMonth + rawDay), muted: true };
    if (rawDay > daysInMonth) return { date: new Date(year, month + 1, rawDay - daysInMonth), muted: true };
    return { date: new Date(year, month, rawDay), muted: false };
  });

  function calendarColor(date: Date) {
    const matches = appointments.filter((appointment) => isSameDay(new Date(appointment.requestedTime), date));
    if (matches.some((appointment) => appointment.status === "COMPLETED")) return "bg-[#159581] text-white";
    if (matches.some((appointment) => appointment.status === "CONFIRMED" || appointment.status === "RESCHEDULED")) return "bg-[#E9DEFC] text-[#7448D7]";
    if (matches.some((appointment) => appointment.status === "REQUESTED")) return "bg-[#FFE8CA] text-[#E88400]";
    return "";
  }

  return (
    <section className="rounded-[14px] border border-[#E7E4DE] bg-white p-[18px] shadow-[0_2px_8px_rgba(34,63,58,.055)]">
      <h2 className="text-[13px] font-bold text-[#17323B]">Calendar Overview</h2>
      <div className="mt-[18px] flex items-center justify-between">
        <button type="button" onClick={() => setCursor(new Date(year, month - 1, 1))} className="flex h-7 w-7 items-center justify-center text-[#00766E]" aria-label="Previous month">‹</button>
        <strong className="text-[11px] text-[#15323A]">{cursor.toLocaleDateString([], { month: "long", year: "numeric" })}</strong>
        <button type="button" onClick={() => setCursor(new Date(year, month + 1, 1))} className="flex h-7 w-7 items-center justify-center text-[#00766E]" aria-label="Next month">›</button>
      </div>
      <div className="mt-3 grid grid-cols-7 text-center text-[9px] text-[#6C7D84]">{["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => <span key={day}>{day}</span>)}</div>
      <div className="mt-2 grid grid-cols-7 gap-y-1 text-center text-[9.5px] font-medium text-[#17323B]">
        {cells.map(({ date, muted }, index) => (
          <span key={`${date.toISOString()}-${index}`} className={`mx-auto flex h-[25px] w-[25px] items-center justify-center rounded-full ${muted ? "text-[#9BA8AB]" : ""} ${calendarColor(date)}`}>{date.getDate()}</span>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-4 border-t border-[#F0EEEA] pt-3 text-[9px] text-[#3F5860]">
        <span className="flex items-center gap-1.5"><i className="h-1.5 w-1.5 rounded-full bg-[#159581]" />Completed</span>
        <span className="flex items-center gap-1.5"><i className="h-1.5 w-1.5 rounded-full bg-[#8957E8]" />Upcoming</span>
        <span className="flex items-center gap-1.5"><i className="h-1.5 w-1.5 rounded-full bg-[#F29A16]" />Pending</span>
      </div>
    </section>
  );
}

function TodaySchedule({ appointments }: { appointments: ProfessionalAppointment[] }) {
  const today = new Date();
  const current = appointments.filter((appointment) => isSameDay(new Date(appointment.requestedTime), today) && ACTIVE_STATUSES.includes(appointment.status));
  const visible = (current.length ? current : appointments.filter((appointment) => ACTIVE_STATUSES.includes(appointment.status))).slice(0, 2);
  return (
    <section className="rounded-[14px] border border-[#E7E4DE] bg-white p-[18px] shadow-[0_2px_8px_rgba(34,63,58,.055)]">
      <div className="flex items-center justify-between gap-3"><h2 className="text-[12.5px] font-bold text-[#17323B]">Today&apos;s Schedule</h2><Link href="/appointments" className="flex items-center gap-2 text-[9.5px] font-semibold text-[#00786F]">View full schedule <Icon name="i-arrow" size={13} /></Link></div>
      <div className="mt-4 space-y-4">
        {visible.length === 0 && <p className="py-5 text-center text-[10px] text-[#74858A]">No appointments scheduled.</p>}
        {visible.map((appointment) => {
          const date = new Date(appointment.requestedTime);
          return (
            <div key={appointment.id} className="grid grid-cols-[46px_minmax(0,1fr)_auto] items-center gap-3">
              <span className="flex h-[48px] flex-col items-center justify-center rounded-lg bg-[#E9F5F1] text-[9px] font-bold leading-[12px] text-[#096F68]">{date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
              <span className="min-w-0"><b className="block truncate text-[10px] text-[#17313A]">{appointment.user.name}</b><span className="mt-1 block truncate text-[8.5px] text-[#61757B]">{appointment.notes || "General consultation"}</span><span className="mt-1 flex items-center gap-1 text-[8.5px] text-[#526C73]"><Icon name="i-chat" size={10} /> Video Call</span></span>
              <span className="rounded-full bg-[#F0EAFE] px-2 py-1 text-[8px] font-semibold text-[#7646E3]">{appointment.status === "REQUESTED" ? "Pending" : "Upcoming"}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function TipsCard() {
  const tips = [
    ["i-sparkle", "Ensure a quiet and private environment"],
    ["i-calendar", "Prepare patient history in advance"],
    ["i-chat", "Use simple and clear communication"],
    ["i-activity", "Follow up and track progress"],
  ];
  return (
    <section className="rounded-[14px] border border-[#E7E4DE] bg-white p-[18px] shadow-[0_2px_8px_rgba(34,63,58,.055)]">
      <h2 className="text-[12.5px] font-bold text-[#17323B]">Tips for Better Consultations</h2>
      <div className="mt-4 space-y-4">{tips.map(([icon, label]) => <div key={label} className="flex items-center gap-3 text-[9.5px] text-[#29474F]"><span className="text-[#376A77]"><Icon name={icon} size={13} /></span>{label}</div>)}</div>
    </section>
  );
}

function SecureCard() {
  return (
    <section className="flex items-center gap-4 rounded-[14px] border border-[#DDEBE7] bg-[linear-gradient(130deg,#E9F8F5,#F9FCFB)] p-[18px] shadow-[0_2px_8px_rgba(34,63,58,.04)]">
      <span className="flex h-[54px] w-[58px] shrink-0 items-center justify-center rounded-lg bg-[#D4EEE8] text-[#08796F]"><Icon name="i-lock" size={26} /></span>
      <div><h2 className="text-[11px] font-bold text-[#17323B]">Secure &amp; Confidential</h2><p className="mt-1 text-[9px] leading-4 text-[#61767B]">All consultations are encrypted and 100% confidential.</p><Link href="/privacy" className="mt-2 flex items-center gap-2 text-[9.5px] font-semibold text-[#00786F]">Learn more <Icon name="i-arrow" size={12} /></Link></div>
    </section>
  );
}

export function ProfessionalAppointmentsView() {
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<ProfessionalAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<AppointmentFilter>("ALL");
  const [view, setView] = useState<AppointmentView>("LIST");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | AppointmentStatus>("ALL");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [rescheduleId, setRescheduleId] = useState<string | null>(null);
  const [rescheduleTime, setRescheduleTime] = useState("");
  const [outcomeId, setOutcomeId] = useState<string | null>(null);
  const [outcome, setOutcome] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      setAppointments(await getProfessionalCalendar());
    } catch {
      toast("Couldn't load your appointment calendar.", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const counts = useMemo(() => ({
    total: appointments.length,
    completed: appointments.filter((appointment) => appointment.status === "COMPLETED").length,
    upcoming: appointments.filter((appointment) => ACTIVE_STATUSES.includes(appointment.status)).length,
    cancelled: appointments.filter((appointment) => appointment.status === "CANCELLED").length,
  }), [appointments]);

  const visibleAppointments = useMemo(() => appointments.filter((appointment) => {
    if (filter === "UPCOMING" && !ACTIVE_STATUSES.includes(appointment.status)) return false;
    if (filter === "COMPLETED" && appointment.status !== "COMPLETED") return false;
    if (filter === "CANCELLED" && appointment.status !== "CANCELLED") return false;
    if (statusFilter !== "ALL" && appointment.status !== statusFilter) return false;
    const query = search.trim().toLowerCase();
    return !query || appointment.user.name.toLowerCase().includes(query) || appointment.notes?.toLowerCase().includes(query);
  }), [appointments, filter, search, statusFilter]);

  async function runAction(id: string, action: () => Promise<void>, success: string) {
    setBusyId(id);
    try {
      await action();
      toast(success, "success");
      setExpandedId(null);
      await load();
    } catch (error) {
      toast(error instanceof Error ? error.message : "Appointment update failed", "error");
    } finally {
      setBusyId(null);
    }
  }

  async function confirmAppointment(id: string) {
    await runAction(id, () => respondToAppointment(id, true), "Appointment confirmed");
  }

  async function saveReschedule(id: string) {
    if (!rescheduleTime || new Date(rescheduleTime).getTime() <= Date.now()) {
      toast("Choose a future date and time.", "error");
      return;
    }
    await runAction(id, () => rescheduleAppointment(id, new Date(rescheduleTime).toISOString()).then(() => undefined), "Appointment rescheduled");
    setRescheduleId(null);
    setRescheduleTime("");
  }

  async function saveOutcome(id: string) {
    if (!outcome.trim()) {
      toast("Enter the consultation outcome first.", "error");
      return;
    }
    await runAction(id, () => recordAppointmentOutcome(id, outcome.trim()), "Outcome recorded");
    setOutcomeId(null);
    setOutcome("");
  }

  const metrics = [
    { label: "Total appointments", value: counts.total, helper: "All time", icon: "i-calendar", color: "#8754E8", background: "#F0EAFD", action: () => setFilter("ALL") },
    { label: "Completed", value: counts.completed, helper: "All time", icon: "i-check", color: "#15A76A", background: "#E4F5EB", action: () => setFilter("COMPLETED") },
    { label: "Upcoming", value: counts.upcoming, helper: "Next 7 days", icon: "i-clock", color: "#F29A16", background: "#FFF2E0", action: () => setFilter("UPCOMING") },
    { label: "Cancelled", value: counts.cancelled, helper: "All time", icon: "i-close", color: "#EF5656", background: "#FFE8E8", action: () => setFilter("CANCELLED") },
  ];

  return (
    <section className="pb-4 pt-[18px]">
      <div className="grid gap-[22px] xl:grid-cols-[minmax(0,1fr)_307px]">
        <main className="min-w-0">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{metrics.map((metric) => <AppointmentMetric key={metric.label} {...metric} onClick={metric.action} />)}</div>

          <section className="mt-[18px] overflow-visible rounded-[14px] border border-[#E7E4DE] bg-white shadow-[0_2px_8px_rgba(34,63,58,.055)]">
            <div className="flex flex-col justify-between gap-3 border-b border-[#E8E5E0] px-5 pt-3 lg:flex-row lg:items-center">
              <div className="flex gap-7 overflow-x-auto">{(["ALL", "UPCOMING", "COMPLETED", "CANCELLED"] as AppointmentFilter[]).map((item) => <button type="button" key={item} onClick={() => setFilter(item)} className={`whitespace-nowrap border-b-2 px-0.5 py-[14px] text-[10.5px] font-semibold ${filter === item ? "border-[#008176] text-[#006D65]" : "border-transparent text-[#4F666D]"}`}>{item === "ALL" ? "All Appointments" : item.charAt(0) + item.slice(1).toLowerCase()}</button>)}</div>
              <div className="flex items-center gap-3 pb-3 lg:pb-0">
                <label className="flex h-9 min-w-0 flex-1 items-center gap-2 rounded-lg border border-[#E0E1DE] bg-[#FAFAF9] px-3 lg:w-[205px]"><span className="text-[#6E858B]"><Icon name="i-search" size={15} /></span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search appointments..." className="min-w-0 flex-1 bg-transparent text-[10.5px] text-[#25434A] outline-none" /></label>
                <label className="flex h-9 items-center gap-2 rounded-lg border border-[#E0E1DE] bg-white px-3 text-[10px] font-semibold text-[#356067]"><Icon name="i-filter" size={15} /><span>Filter</span><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as "ALL" | AppointmentStatus)} className="w-4 bg-transparent text-transparent outline-none" aria-label="Filter appointment status"><option value="ALL">All statuses</option><option value="REQUESTED">Pending</option><option value="CONFIRMED">Confirmed</option><option value="RESCHEDULED">Rescheduled</option><option value="COMPLETED">Completed</option><option value="CANCELLED">Cancelled</option></select></label>
                <div className="flex h-9 overflow-hidden rounded-lg border border-[#DFE2DF]"><button type="button" onClick={() => setView("LIST")} className={`flex w-9 items-center justify-center ${view === "LIST" ? "bg-[#E7F2EF] text-[#00766D]" : "text-[#73858A]"}`} aria-label="List view"><Icon name="i-menu" size={15} /></button><button type="button" onClick={() => setView("CALENDAR")} className={`flex w-9 items-center justify-center ${view === "CALENDAR" ? "bg-[#E7F2EF] text-[#00766D]" : "text-[#73858A]"}`} aria-label="Calendar view"><Icon name="i-calendar" size={14} /></button></div>
              </div>
            </div>

            {loading ? <PageLoading /> : view === "CALENDAR" ? (
              <div className="p-5"><CalendarOverview appointments={visibleAppointments} /></div>
            ) : (
              <div>
                <div className="px-5 pb-2 pt-4 text-[10.5px] font-bold text-[#19363E]">{filter === "ALL" ? "All appointments" : filter.charAt(0) + filter.slice(1).toLowerCase()}</div>
                {visibleAppointments.length === 0 && <div className="flex min-h-[330px] flex-col items-center justify-center px-5 text-center"><span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#F0EAFD] text-[#8150E4]"><Icon name="i-calendar" size={28} /></span><h3 className="mt-4 text-[14px] font-bold text-[#18343C]">No matching appointments</h3><p className="mt-2 text-[10.5px] text-[#6B7D82]">Try another tab, status, or search term.</p></div>}
                {visibleAppointments.map((appointment, index) => {
                  const date = new Date(appointment.requestedTime);
                  const presentation = STATUS_PRESENTATION[appointment.status];
                  const requested = appointment.status === "REQUESTED" || appointment.status === "RESCHEDULED";
                  const confirmed = appointment.status === "CONFIRMED";
                  return (
                    <article key={appointment.id} className="relative mx-5 border-b border-[#ECEAE6] py-[15px] last:border-b-0">
                      <div className="grid grid-cols-[58px_minmax(0,1fr)_auto] items-center gap-4">
                        <div className={`flex h-[59px] flex-col items-center justify-center rounded-[10px] ${presentation.date}`}><b className="font-display text-[19px] leading-none">{String(date.getDate()).padStart(2, "0")}</b><span className="mt-1 text-[8.5px] font-bold uppercase">{date.toLocaleDateString([], { month: "short" })}</span></div>
                        <div className="min-w-0"><h3 className="truncate text-[12px] font-bold text-[#17323B]">{appointment.user.name}</h3><p className="mt-1 truncate text-[10.5px] text-[#526A71]">{appointment.notes || "General consultation"}</p><div className="mt-1.5 flex items-center gap-4 text-[9px] text-[#5E7379]"><span className="flex items-center gap-1"><Icon name="i-clock" size={11} />{date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span><span className="flex items-center gap-1"><Icon name="i-chat" size={11} />{index % 3 === 2 ? "Clinic Visit" : "Video Call"}</span></div></div>
                        <div className="flex items-center gap-3">
                          <span className={`whitespace-nowrap rounded-full px-3 py-1.5 text-[8.5px] font-semibold ${presentation.badge}`}>{presentation.label}</span>
                          {requested && <button type="button" disabled={busyId === appointment.id} onClick={() => void confirmAppointment(appointment.id)} className="hidden rounded-lg border border-[#159389] px-4 py-2 text-[10px] font-semibold text-[#06776E] transition hover:bg-[#EFF8F6] md:block">Confirm</button>}
                          {requested && <button type="button" onClick={() => { setRescheduleId(appointment.id); setRescheduleTime(""); }} className="hidden rounded-lg border border-[#159389] px-4 py-2 text-[10px] font-semibold text-[#06776E] transition hover:bg-[#EFF8F6] lg:block">Reschedule</button>}
                          <button type="button" onClick={() => setExpandedId(expandedId === appointment.id ? null : appointment.id)} className="flex h-8 w-8 items-center justify-center text-lg font-bold text-[#006C65]" aria-label={`Actions for ${appointment.user.name}`}>⋮</button>
                        </div>
                      </div>

                      {expandedId === appointment.id && (
                        <div className="absolute right-0 top-[57px] z-20 w-40 overflow-hidden rounded-lg border border-[#E0DFDB] bg-white py-1 shadow-lg">
                          {requested && <button type="button" onClick={() => void confirmAppointment(appointment.id)} className="block w-full px-3 py-2 text-left text-[10px] hover:bg-[#F4F7F6]">Confirm appointment</button>}
                          {ACTIVE_STATUSES.includes(appointment.status) && <button type="button" onClick={() => { setRescheduleId(appointment.id); setExpandedId(null); }} className="block w-full px-3 py-2 text-left text-[10px] hover:bg-[#F4F7F6]">Reschedule</button>}
                          {confirmed && <button type="button" onClick={() => { setOutcomeId(appointment.id); setOutcome(appointment.outcome ?? ""); setExpandedId(null); }} className="block w-full px-3 py-2 text-left text-[10px] hover:bg-[#F4F7F6]">Record outcome</button>}
                          {ACTIVE_STATUSES.includes(appointment.status) && <button type="button" onClick={() => void runAction(appointment.id, () => cancelAppointment(appointment.id), "Appointment cancelled")} className="block w-full px-3 py-2 text-left text-[10px] text-[#D94C4C] hover:bg-[#FFF4F3]">Cancel appointment</button>}
                        </div>
                      )}

                      {rescheduleId === appointment.id && <div className="mt-3 flex flex-wrap items-center justify-end gap-2 rounded-lg bg-[#F5FAF8] p-3"><input type="datetime-local" min={toLocalInputValue(new Date(Date.now() + 60 * 60 * 1000))} value={rescheduleTime} onChange={(event) => setRescheduleTime(event.target.value)} className="rounded-lg border border-[#D8DFDC] bg-white px-3 py-2 text-[10px]" /><button type="button" onClick={() => void saveReschedule(appointment.id)} className="rounded-lg bg-[#08786F] px-4 py-2 text-[10px] font-semibold text-white">Save time</button><button type="button" onClick={() => setRescheduleId(null)} className="rounded-lg border border-[#D8DFDC] px-4 py-2 text-[10px]">Close</button></div>}
                      {outcomeId === appointment.id && <div className="mt-3 flex items-center gap-2 rounded-lg bg-[#F5FAF8] p-3"><input value={outcome} onChange={(event) => setOutcome(event.target.value)} placeholder="Record consultation outcome…" className="min-w-0 flex-1 rounded-lg border border-[#D8DFDC] bg-white px-3 py-2 text-[10px]" /><button type="button" onClick={() => void saveOutcome(appointment.id)} className="rounded-lg bg-[#08786F] px-4 py-2 text-[10px] font-semibold text-white">Complete</button><button type="button" onClick={() => setOutcomeId(null)} className="rounded-lg border border-[#D8DFDC] px-3 py-2 text-[10px]">Close</button></div>}
                    </article>
                  );
                })}
                <div className="flex items-center justify-between border-t border-[#ECEAE6] px-5 py-4 text-[9.5px] text-[#657A80]"><span>Showing {visibleAppointments.length ? 1 : 0} to {visibleAppointments.length} of {visibleAppointments.length} appointments</span><div className="flex items-center gap-4"><button type="button" disabled>‹</button><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#E9F3F0] font-semibold text-[#08776D]">1</span><button type="button" disabled>›</button></div></div>
              </div>
            )}
          </section>
        </main>

        <aside className="space-y-[18px]">
          <CalendarOverview appointments={appointments} />
          <TodaySchedule appointments={appointments} />
          <TipsCard />
          <SecureCard />
        </aside>
      </div>
    </section>
  );
}
