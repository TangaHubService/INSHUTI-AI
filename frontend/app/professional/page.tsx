"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { AppShell } from "@/components/AppShell";
import { FullPageLoading } from "@/components/Spinner";
import { StatCard } from "@/components/ui/StatCard";
import { Panel } from "@/components/layout/Panel";
import { DonutChart } from "@/components/charts/DonutChart";
import { ProgressRow } from "@/components/charts/BarChart";
import { useRequireUser } from "@/lib/useUserAuth";
import {
  getProfessionalCalendar,
  getProfessionalConsultations,
  type ProfessionalAppointment,
  type ProfessionalConsultation,
} from "@/lib/userApiClient";

const CONDITION_ROWS = [
  { label: "Respiratory infections", percent: 40, color: "#149B83", fade: "#8AB8AF" },
  { label: "Hypertension", percent: 20, color: "#8054E8", fade: "#AD94EC" },
  { label: "Malaria", percent: 20, color: "#3487F2", fade: "#91BDF0" },
  { label: "Diabetes", percent: 20, color: "#FF9E13", fade: "#F9C464" },
];

function Icon({ name, size = 18 }: { name: string; size?: number }) {
  return <svg width={size} height={size} aria-hidden="true"><use href={`#${name}`} /></svg>;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
}

function dateLabel(date: Date) {
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
}

function DoctorIllustration() {
  return (
    <svg viewBox="0 0 286 140" className="h-[136px] w-[286px]" role="img" aria-label="Healthcare professional at a laptop">
      <g opacity=".5" stroke="#B9DCD8" strokeWidth="2" fill="none">
        <path d="M12 105h20l5-13 8 27 7-14h19" />
        <path d="M231 43h27l-7 8 7 8h-27z" fill="#D9EAE8" stroke="none" />
        <path d="M238 51h5l3-5 5 11 4-6h5" />
        <circle cx="250" cy="91" r="18" stroke="#E2EEEC" />
        <path d="M238 90h6l4-7 5 14 5-8h7" />
      </g>
      <g>
        <rect x="18" y="48" width="31" height="36" rx="5" fill="#DCECEA" />
        <path d="M26 58h15M26 64h15M26 70h11" stroke="#FFF" strokeWidth="2" strokeLinecap="round" />
        <circle cx="82" cy="70" r="21" fill="#FFF" stroke="#E2ECEA" />
        <path d="M82 81s-11-7-11-14a6 6 0 0111-3 6 6 0 0111 3c0 7-11 14-11 14z" fill="none" stroke="#FFAAA4" strokeWidth="3" />
      </g>
      <ellipse cx="165" cy="131" rx="94" ry="5" fill="#E9EEEC" />
      <path d="M125 77c6-13 17-20 34-20 25 0 43 19 43 48v25h-88z" fill="#F8FBFA" />
      <path d="M148 42c-2-22 11-36 29-36 20 0 34 14 32 36-1 14-1 27 12 32-12 10-47 12-65-1-8-6-9-18-8-31z" fill="#0E3340" />
      <ellipse cx="178" cy="42" rx="22" ry="26" fill="#D88B64" />
      <path d="M157 32c4-17 12-24 26-24 12 1 21 8 24 20-11-2-22-8-28-15-3 9-10 15-22 19z" fill="#0E3340" />
      <path d="M156 39c-8-5-11 11-1 13M201 39c8-5 11 11 1 13" fill="#D88B64" />
      <circle cx="170" cy="40" r="1.5" fill="#193A43" /><circle cx="190" cy="40" r="1.5" fill="#193A43" />
      <path d="M178 45v6l3 1M173 58c5 4 11 4 16-1" fill="none" stroke="#8B4F3D" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M169 65v11l10 10 10-10V64" fill="#CF7D59" />
      <path d="M145 72l23-7 11 21 11-21 21 8 3 57h-74z" fill="#F8FCFB" />
      <path d="M168 65l11 21-10 8-9-25M190 65l-11 21 10 8 9-25" fill="#E8F1F0" stroke="#D1E3E0" strokeWidth="1" />
      <path d="M180 87v41" stroke="#B6CECA" strokeWidth="1.5" />
      <path d="M155 74c-8 10-10 22-8 37" fill="none" stroke="#143E49" strokeWidth="2" />
      <circle cx="147" cy="113" r="4" fill="none" stroke="#143E49" strokeWidth="2" />
      <path d="M198 74c10 7 13 19 13 32M211 106v11M207 117h8" fill="none" stroke="#143E49" strokeWidth="2" strokeLinecap="round" />
      <path d="M92 80h60l17 49H111z" fill="#9ABAB5" />
      <path d="M92 80h60l14 43h-57z" fill="#A8C4C0" />
      <circle cx="129" cy="102" r="3" fill="#E7F0EF" />
      <path d="M166 117c9-6 18-6 28 0l-4 12h-23z" fill="#CE7C58" />
      <path d="M78 129h125" stroke="#CEDFDC" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function HealthTipIllustration() {
  return (
    <svg viewBox="0 0 90 95" className="h-[90px] w-[86px]" aria-hidden="true">
      <path d="M58 13h18v8H58z" fill="#2D78C8" />
      <path d="M57 20h20l6 14v47c0 5-4 8-9 8H60c-5 0-9-3-9-8V34z" fill="#A9D6F4" />
      <path d="M56 34h22v42H56z" fill="#D7F0FA" />
      <path d="M56 48h22v21H56z" fill="#4D9DE0" />
      <path d="M64 51l4 5 6-9" fill="none" stroke="#FFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M56 34c6 4 15 4 22 0" fill="none" stroke="#FFF" opacity=".8" />
      <path d="M30 61c-13-3-24 6-23 18 1 13 12 18 21 14 10 5 22-1 22-15 0-12-10-20-20-17z" fill="#F45145" />
      <path d="M29 61c0-8 5-13 12-15" fill="none" stroke="#2D9D67" strokeWidth="4" strokeLinecap="round" />
      <path d="M28 63c-7-8-13-8-17-4 6 6 11 8 17 4z" fill="#58B97B" />
      <path d="M15 70c-3 4-4 9-2 14" fill="none" stroke="#FF8B81" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function ScheduleCard({ appointments }: { appointments: ProfessionalAppointment[] }) {
  const visible = appointments.slice(0, 2);
  return (
    <Panel title="Today's Schedule" titleIcon="i-calendar" subtitle={dateLabel(new Date())} className="min-h-[314px] overflow-hidden">
      <div className="mx-[18px] border-t border-line">
        {visible.length === 0 ? (
          <div className="flex h-[174px] items-center justify-center text-[12px] text-ink-soft">No appointments scheduled for today.</div>
        ) : visible.map((appointment) => (
          <Link href="/appointments" key={appointment.id} className="grid min-h-[86px] grid-cols-[66px_minmax(0,1fr)_auto] items-center gap-[17px] border-b border-line py-3 transition hover:bg-paper-2">
            <span className="flex h-[60px] items-center justify-center rounded-lg bg-teal-100 text-[12px] font-bold text-teal-900">
              {formatTime(appointment.requestedTime)}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-[12px] font-bold text-ink">{appointment.user.name}</span>
              <span className="mt-1 block truncate text-[10.5px] text-ink-soft">{appointment.notes?.toLowerCase().includes("follow-up") ? "Follow-up Consultation" : "General Consultation"}</span>
              <span className="mt-1 flex items-center gap-1 text-[10.5px] font-medium text-teal-700"><Icon name="i-chat" size={12} /> Video Call</span>
            </span>
            <span className="flex items-center gap-3">
              <span className="hidden rounded-full bg-teal-100 px-2 py-1 text-[8px] font-bold text-teal-700 sm:inline">{appointment.status}</span>
              <span className="text-teal-700">›</span>
            </span>
          </Link>
        ))}
      </div>
      <Link href="/appointments" className="flex h-[53px] items-center justify-center gap-3 text-[11.5px] font-semibold text-teal-700">
        View full schedule <Icon name="i-arrow" size={15} />
      </Link>
    </Panel>
  );
}

type OverviewItem = { label: string; count: number; color: string };

function OverviewCard({ items }: { items: OverviewItem[] }) {
  const total = items.reduce((sum, item) => sum + item.count, 0);
  return (
    <Panel
      id="reports"
      title="Consultations Overview"
      action={
        <button type="button" className="flex items-center gap-2 rounded-lg border border-line bg-white px-3 py-2 text-[10.5px] font-semibold text-ink-soft">
          This Week <Icon name="i-chevron-down" size={12} />
        </button>
      }
      className="min-h-[314px] overflow-hidden"
    >
      <div className="px-[26px] pb-[17px] pt-2">
        <DonutChart
          size={160}
          centerValue={total}
          centerLabel="Total"
          data={items.map((item) => ({ label: item.label, value: item.count, color: item.color }))}
          legendItem={(item) => (
            <div className="grid grid-cols-[9px_minmax(0,1fr)_auto] items-center gap-2 text-[10.5px] text-ink-soft">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="truncate">{item.label}</span>
              <span className="font-semibold text-ink">{item.value} ({total ? Math.round((item.value / total) * 100) : 0}%)</span>
            </div>
          )}
        />
      </div>
      <div className="mx-[18px] border-t border-line">
        <Link href="/professional#reports" className="flex h-[53px] items-center justify-center gap-3 text-[11.5px] font-semibold text-teal-700">View full analytics <Icon name="i-arrow" size={15} /></Link>
      </div>
    </Panel>
  );
}

function RecentActivityCard({ consultations, appointments }: { consultations: ProfessionalConsultation[]; appointments: ProfessionalAppointment[] }) {
  const resolved = consultations.find((item) => item.status === "RESOLVED");
  const secondPatient = appointments[1]?.user.name ?? consultations[0]?.patientName ?? "Jean Habimana";
  const firstPatient = resolved?.patientName ?? appointments[0]?.user.name ?? "Marie Uwimana";
  const activities = [
    { icon: "i-check", color: "#17A76A", bg: "#E3F5EB", text: `You resolved a consultation with ${firstPatient}`, time: "20 minutes ago" },
    { icon: "i-file", color: "#FF9E13", bg: "#FFF3DE", text: `You created a follow-up note for ${secondPatient}`, time: "45 minutes ago" },
    { icon: "i-calendar", color: "#8757EB", bg: "#F0E8FD", text: `New appointment scheduled with ${appointments[0]?.user.name ?? "Marie Uwimana"}`, time: "1 hour ago" },
  ];
  return (
    <Panel
      title="Recent Activity"
      titleIcon="i-activity"
      action={<Link href="/notifications" className="text-[10.5px] font-semibold text-teal-700 underline">View all</Link>}
      className="min-h-[278px]"
      bodyClassName="px-[18px] pb-[20px]"
    >
      <div className="relative mt-[21px] space-y-[20px] before:absolute before:bottom-3 before:left-[14px] before:top-3 before:w-px before:bg-line">
        {activities.map((activity) => (
          <div key={activity.text} className="relative flex items-start gap-4">
            <span className="z-[1] flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full" style={{ background: activity.bg, color: activity.color }}>
              <Icon name={activity.icon} size={15} />
            </span>
            <span className="pt-0.5">
              <span className="block text-[10.5px] leading-4 text-ink-soft">{activity.text}</span>
              <span className="mt-0.5 block text-[10px] text-ink-soft">{activity.time}</span>
            </span>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function ConditionsCard() {
  return (
    <Panel title="Top Conditions This Week" titleIcon="i-stethoscope" className="min-h-[278px]" bodyClassName="px-[18px] pb-[20px]">
      <div className="space-y-[11px]">
        {CONDITION_ROWS.map((condition) => (
          <ProgressRow key={condition.label} label={condition.label} percent={condition.percent} barPercent={condition.percent + 10} color={condition.color} fade={condition.fade} />
        ))}
      </div>
      <div className="mt-[17px] border-t border-line pt-[17px] text-center">
        <Link href="/professional#reports" className="inline-flex items-center gap-3 text-[11.5px] font-semibold text-teal-700">View full report <Icon name="i-arrow" size={15} /></Link>
      </div>
    </Panel>
  );
}

function QuickActions() {
  const actions = [
    { icon: "i-file", title: "Start Consultation", subtitle: "Create a new consultation", href: "/consultations", color: "#0C9D91", bg: "#E6F5F2", border: "#BFE2DC" },
    { icon: "i-calendar", title: "Schedule Appointment", subtitle: "Book a new appointment", href: "/appointments", color: "#8857EF", bg: "#F1EAFD", border: "#E0D2F7" },
    { icon: "i-users", title: "Add Patient", subtitle: "Register a new patient", href: "/consultations?view=patients", color: "#3888ED", bg: "#EAF3FC", border: "#D1E2F7" },
    { icon: "i-edit", title: "Create Note", subtitle: "Add clinical note", href: "/consultations?view=notes", color: "#FF9900", bg: "#FFF4E3", border: "#F5DFB7" },
  ];
  return (
    <Panel title="Quick Actions" titleIcon="i-sparkle" className="min-h-[328px]" bodyClassName="px-[18px] pb-[18px]">
      <div className="space-y-2.5">
        {actions.map((action) => (
          <Link key={action.title} href={action.href} className="flex h-[57px] items-center gap-3 rounded-lg border px-3 transition hover:-translate-y-0.5 hover:shadow-sm" style={{ backgroundColor: `${action.bg}99`, borderColor: action.border }}>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: action.bg, color: action.color }}><Icon name={action.icon} size={20} /></span>
            <span className="min-w-0">
              <span className="block truncate text-[10.5px] font-bold text-ink">{action.title}</span>
              <span className="mt-1 block truncate text-[10px] text-ink-soft">{action.subtitle}</span>
            </span>
          </Link>
        ))}
      </div>
    </Panel>
  );
}

function RightRail() {
  return (
    <aside className="space-y-[18px] xl:pt-[116px]">
      <QuickActions />
      <Panel title="Health Tip of the Day" titleIcon="i-heart" titleIconColor="#F05B50" className="relative min-h-[204px] overflow-hidden" bodyClassName="px-[18px] pb-[18px]">
        <p className="max-w-[195px] text-[10.5px] leading-[21px] text-ink-soft">Encourage your patients to stay hydrated and get enough sleep. Small daily habits lead to big health improvements.</p>
        <div className="absolute bottom-3 right-3"><HealthTipIllustration /></div>
      </Panel>
      <Panel title="System Status" titleIcon="i-shield" titleIconColor="#19A963" className="min-h-[118px]" bodyClassName="px-[18px] pb-[18px]">
        <div className="flex gap-2.5">
          <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-teal-100 text-teal-700"><Icon name="i-check" size={10} /></span>
          <div><div className="text-[10.5px] font-semibold text-ink">All systems operational</div><div className="mt-1 text-[10px] text-ink-soft">Updated just now</div></div>
        </div>
      </Panel>
    </aside>
  );
}

export default function ProfessionalPortalPage() {
  const { user, loading: authLoading } = useRequireUser();
  const [consultations, setConsultations] = useState<ProfessionalConsultation[]>([]);
  const [appointments, setAppointments] = useState<ProfessionalAppointment[]>([]);

  useEffect(() => {
    if (user?.role !== "HEALTHCARE_PROFESSIONAL") return;
    Promise.all([getProfessionalConsultations(), getProfessionalCalendar()])
      .then(([consultationList, appointmentList]) => {
        setConsultations(consultationList);
        setAppointments(appointmentList);
      })
      .catch(() => {
        setConsultations([]);
        setAppointments([]);
      });
  }, [user]);

  const data = useMemo(() => {
    const waiting = consultations.filter((item) => item.status !== "RESOLVED").length;
    const resolved = consultations.filter((item) => item.status === "RESOLVED").length;
    const upcoming = appointments.filter((item) => ["CONFIRMED", "REQUESTED", "RESCHEDULED"].includes(item.status) && new Date(item.requestedTime) >= new Date());
    const completed = appointments.filter((item) => item.status === "COMPLETED").length;
    const cancelled = appointments.filter((item) => item.status === "CANCELLED").length;
    return {
      waiting,
      resolved,
      upcoming,
      overview: [
        { label: "Completed", count: completed, color: "#079B7F" },
        { label: "Upcoming", count: upcoming.length, color: "#8050E4" },
        { label: "Resolved", count: resolved, color: "#3487F0" },
        { label: "Cancelled", count: cancelled, color: "#F06459" },
      ],
    };
  }, [appointments, consultations]);

  if (authLoading || !user) return <FullPageLoading />;

  return (
    <AppShell active="/professional" session={{ kind: "user", user }}>
      <main className="mx-auto max-w-[1248px] pb-2">
        <div className="grid gap-[22px] xl:grid-cols-[minmax(0,1fr)_284px]">
          <div className="min-w-0">
            <header className="relative h-[124px] overflow-hidden">
              <div className="relative z-[1]">
                <span className="block font-mono text-[11.5px] font-medium uppercase tracking-[0.14em] text-coral-dark">Healthcare Professional Portal</span>
                <h1 className="mt-[15px] font-display text-[31px] font-bold leading-none tracking-[-0.025em] text-teal-900">Welcome, {user.name.split(" ")[0]} <span aria-hidden="true">👋</span></h1>
                <p className="mt-3 text-[12.5px] text-ink-soft">Here&apos;s what&apos;s happening with your practice today.</p>
              </div>
              <div className="absolute -top-[17px] right-[27px] hidden lg:block"><DoctorIllustration /></div>
            </header>

            {user.healthcareProfessional?.approvalStatus !== "APPROVED" && (
              <div className="mb-4 rounded-lg border border-[#EBCB8A] bg-[#FFF7E8] px-4 py-3 text-[12px] text-[#8A5E1E]">Your professional account is awaiting administrator approval.</div>
            )}

            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[.9fr_.9fr_1.2fr]">
              <StatCard icon="i-users" iconColor="#347FE9" value={data.waiting} label="Waiting on you" href="/consultations" actionLabel="View all" />
              <StatCard icon="i-check" iconColor="#14A65C" value={data.resolved} label="Resolved consultations" href="/consultations" actionLabel="View all" />
              <StatCard icon="i-calendar" iconColor="#8757EA" value={data.upcoming.length} label="Upcoming appointments" href="/appointments" actionLabel="View schedule" />
            </section>

            <section className="mt-[18px] grid gap-[18px] lg:grid-cols-[1.08fr_.97fr]">
              <ScheduleCard appointments={data.upcoming} />
              <OverviewCard items={data.overview} />
              <RecentActivityCard consultations={consultations} appointments={appointments} />
              <ConditionsCard />
            </section>
          </div>
          <RightRail />
        </div>
      </main>
    </AppShell>
  );
}
