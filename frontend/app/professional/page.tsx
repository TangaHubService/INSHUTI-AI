"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { AppShell } from "@/components/AppShell";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { FullPageLoading } from "@/components/Spinner";
import { StatCard } from "@/components/ui/StatCard";
import { Panel } from "@/components/layout/Panel";
import { DonutChart } from "@/components/charts/DonutChart";
import { useRequireUser } from "@/lib/useUserAuth";
import {
  getProfessionalCalendar,
  getProfessionalConsultations,
  type ProfessionalAppointment,
  type ProfessionalConsultation,
} from "@/lib/userApiClient";

function Icon({ name, size = 18 }: { name: string; size?: number }) {
  return <svg width={size} height={size} aria-hidden="true"><use href={`#${name}`} /></svg>;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
}

function ScheduleCard({ appointments }: { appointments: ProfessionalAppointment[] }) {
  const visible = appointments.slice(0, 2);
  return (
    <Panel title="Upcoming appointments" titleIcon="i-calendar" subtitle="Requested, confirmed, or rescheduled" className="min-h-[314px] overflow-hidden">
      <div className="mx-[18px] border-t border-line">
        {visible.length === 0 ? (
          <div className="flex h-[174px] flex-col items-center justify-center px-6 text-center text-[12px] leading-5 text-ink-soft">No upcoming appointments. New requests will appear here.</div>
        ) : visible.map((appointment) => (
          <Link href="/appointments" key={appointment.id} className="grid min-h-[86px] grid-cols-[66px_minmax(0,1fr)_auto] items-center gap-[17px] border-b border-line py-3 transition hover:bg-paper-2">
            <span className="flex h-[60px] items-center justify-center rounded-lg bg-teal-100 text-[12px] font-bold text-teal-900">
              {formatTime(appointment.requestedTime)}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-[13px] font-semibold text-ink">{appointment.user.name}</span>
              <span className="mt-1 block truncate text-[12px] text-ink-soft">{new Date(appointment.requestedTime).toLocaleDateString([], { day: "numeric", month: "short" })}</span>
              <span className="mt-1 block text-[12px] text-ink-soft">{appointment.status.replaceAll("_", " ")}</span>
            </span>
            <span className="text-teal-700">›</span>
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
    <Panel title="Your activity" subtitle="Appointments and resolved cases assigned to you" className="min-h-[314px] overflow-hidden">
      <div className="px-[26px] pb-[22px] pt-2">
        {total === 0 ? (
          <p className="py-10 text-center text-[13px] leading-6 text-ink-soft">Nothing to summarise yet. Counts appear after a case or appointment is recorded.</p>
        ) : (
          <DonutChart
            size={160}
            centerValue={total}
            centerLabel="Total"
            data={items.filter((item) => item.count > 0).map((item) => ({ label: item.label, value: item.count, color: item.color }))}
          />
        )}
      </div>
    </Panel>
  );
}

function RecentCasesCard({ consultations }: { consultations: ProfessionalConsultation[] }) {
  const recent = consultations.slice(0, 4);
  return (
    <Panel
      title="Recent cases"
      titleIcon="i-activity"
      action={<Link href="/consultations" className="text-[10.5px] font-semibold text-teal-700 underline">View all</Link>}
      className="min-h-[278px]"
      bodyClassName="px-[18px] pb-[20px]"
    >
      {recent.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-[13px] font-semibold text-ink">Your cases will appear here</p>
          <p className="mt-2 text-[12px] leading-5 text-ink-soft">When a person is assigned to you, the conversation shows up in this list.</p>
          <Link href="/consultations" className="mt-4 inline-flex text-[12px] font-semibold text-teal-700">View cases</Link>
        </div>
      ) : (
        <ul className="divide-y divide-line">
          {recent.map((item) => (
            <li key={item.id}>
              <Link href="/consultations" className="flex items-center justify-between gap-3 py-3">
                <span>
                  <span className="block text-[12px] font-semibold text-ink">{item.patientName || "Person awaiting support"}</span>
                  <span className="mt-1 block text-[11px] text-ink-soft">{item.status.replaceAll("_", " ")}</span>
                </span>
                <span className="text-teal-700">›</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

function WorkloadCard({ waiting, resolved }: { waiting: number; resolved: number }) {
  return (
    <Panel title="My workload" titleIcon="i-stethoscope" className="min-h-[278px]" bodyClassName="px-[18px] pb-[20px]">
      <dl className="mt-2 space-y-4">
        <div className="flex items-center justify-between border-b border-line pb-3">
          <dt className="text-[12px] text-ink-soft">Waiting or active</dt>
          <dd className="text-[20px] font-bold text-teal-900">{waiting}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-[12px] text-ink-soft">Resolved</dt>
          <dd className="text-[20px] font-bold text-teal-900">{resolved}</dd>
        </div>
      </dl>
      <p className="mt-6 text-[12px] leading-5 text-ink-soft">These counts come from cases assigned to you. Inshuti does not keep a diagnosis register, so condition charts are not shown.</p>
      <Link href="/consultations" className="mt-4 inline-flex text-[12px] font-semibold text-teal-700">Open my cases</Link>
    </Panel>
  );
}

function QuickActions() {
  const actions = [
    { icon: "i-stethoscope", title: "View cases", subtitle: "Open conversations assigned to you", href: "/consultations" },
    { icon: "i-calendar", title: "Review requests", subtitle: "Accept, decline, or record an outcome", href: "/appointments" },
    { icon: "i-book", title: "Reviewed information", subtitle: "Open the health library", href: "/library" },
    { icon: "i-bell", title: "Check alerts", subtitle: "See notifications about new cases", href: "/notifications" },
  ];
  return (
    <Panel title="Next steps" className="min-h-[328px]" bodyClassName="px-[18px] pb-[18px]">
      <div className="space-y-2.5">
        {actions.map((action) => (
          <Link key={action.title} href={action.href} className="flex min-h-[57px] items-center gap-3 rounded-xl border border-line bg-paper-2 px-3 transition hover:bg-white">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-100 text-teal-700"><Icon name={action.icon} size={18} /></span>
            <span className="min-w-0">
              <span className="block truncate text-[13px] font-semibold text-ink">{action.title}</span>
              <span className="mt-0.5 block truncate text-[12px] text-ink-soft">{action.subtitle}</span>
            </span>
          </Link>
        ))}
      </div>
    </Panel>
  );
}

function RightRail() {
  return (
    <aside className="space-y-[18px]">
      <QuickActions />
      <Panel title="Scope of this workspace" titleIcon="i-heart" titleIconColor="#C5573F" bodyClassName="px-[18px] pb-[18px]">
        <p className="text-[12px] leading-5 text-ink-soft">Reply inside the assigned consultation, record appointment outcomes here, and escalate when a case needs a higher tier. Inshuti is not a full clinical record.</p>
      </Panel>
      <Panel title="How cases arrive" titleIcon="i-shield" titleIconColor="#19A963" className="min-h-[118px]" bodyClassName="px-[18px] pb-[18px]">
        <p className="text-[11px] leading-5 text-ink-soft">You receive a case only after an administrator approves your account, and only when you do not already have another active consultation.</p>
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
        { label: "Completed", count: completed, color: "#146661" },
        { label: "Upcoming", count: upcoming.length, color: "#C4A15A" },
        { label: "Resolved", count: resolved, color: "#2DAEA5" },
        { label: "Cancelled", count: cancelled, color: "#C5573F" },
      ],
    };
  }, [appointments, consultations]);

  if (authLoading || !user) return <FullPageLoading />;

  return (
    <AppShell active="/professional" session={{ kind: "user", user }}>
      <main className="mx-auto max-w-[1160px] pb-8">
        <DashboardHeader
          eyebrow="Professional workspace"
          title={user.name.split(" ")[0]}
          body="Cases assigned to you, upcoming appointments, and the requests waiting for a reply."
          actions={<Link href="/consultations" className="inline-flex min-h-11 items-center rounded-full bg-teal-700 px-5 text-[14px] font-semibold text-white">Open cases</Link>}
        />

        {user.healthcareProfessional?.approvalStatus !== "APPROVED" && (
          <div className="mb-4 rounded-xl border border-[#EBCB8A] bg-[#FFF7E8] px-4 py-3 text-[13px] leading-6 text-[#8A5E1E]">Your professional account is awaiting administrator approval. You will not receive a case until it is approved.</div>
        )}

        <div className="grid gap-[22px] xl:grid-cols-[minmax(0,1fr)_284px]">
          <div className="min-w-0">
            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <StatCard icon="i-users" value={data.waiting} label="Waiting on you" href="/consultations" actionLabel="View all" />
              <StatCard icon="i-check" value={data.resolved} label="Resolved consultations" href="/consultations" actionLabel="View all" />
              <StatCard icon="i-calendar" value={data.upcoming.length} label="Upcoming appointments" href="/appointments" actionLabel="View schedule" />
            </section>

            <section className="mt-[18px] grid gap-[18px] lg:grid-cols-[1.08fr_.97fr]">
              <ScheduleCard appointments={data.upcoming} />
              <OverviewCard items={data.overview} />
              <RecentCasesCard consultations={consultations} />
              <WorkloadCard waiting={data.waiting} resolved={data.resolved} />
            </section>
          </div>
          <RightRail />
        </div>
      </main>
    </AppShell>
  );
}
