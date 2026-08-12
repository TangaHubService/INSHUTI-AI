"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { AppShell } from "@/components/AppShell";
import { FullPageLoading, PageLoading } from "@/components/Spinner";
import { StatCard } from "@/components/ui/StatCard";
import { Panel } from "@/components/layout/Panel";
import { DonutChart } from "@/components/charts/DonutChart";
import { LineChart } from "@/components/charts/LineChart";
import { BarChart } from "@/components/charts/BarChart";
import { getHistory, type ConversationSummary } from "@/lib/apiClient";
import { useLanguage } from "@/lib/LanguageContext";
import { getMyAppointments, type Appointment } from "@/lib/userApiClient";
import { useRequireUser } from "@/lib/useUserAuth";

const TOPICS = [
  { slug: "menstrual-health", name: "Menstrual Health", color: "#E9567D", icon: "i-droplet" },
  { slug: "pregnancy", name: "Pregnancy", color: "#F5A623", icon: "i-baby" },
  { slug: "relationships", name: "Relationships", color: "#4CB686", icon: "i-heart" },
  { slug: "family-planning", name: "Family Planning", color: "#4F91DA", icon: "i-pill" },
  { slug: "hiv-stis", name: "HIV & STIs", color: "#9561D8", icon: "i-shield" },
  { slug: "mental-health", name: "Mental Health", color: "#2DAEA5", icon: "i-mind" },
];

const COPY = {
  EN: {
    welcome: "Welcome back to Inshuti. We're here for your health, your choices, your future.", chat: "Start chatting",
    conversations: "Conversations", appointments: "Appointments", streak: "Learning streak", xp: "XP points", explored: "Topics explored",
    journey: "Your health learning journey", journeySub: "Topics you've explored", activity: "Conversations over time", top: "Top topics",
    recent: "Recent conversations", upcoming: "Upcoming appointments", tips: "Health tips for you", viewAll: "View all",
    noChats: "Your private conversations will appear here.", noAppointments: "No upcoming appointments.", book: "Book an appointment",
    tipTitle: "Small steps matter", tipBody: "Rest, drink water, and ask for support whenever something feels uncertain.",
    talk: "Need to talk to someone?", talkBody: "You can ask a health professional for private support.", findCare: "Find care",
    emergency: "In an emergency or need immediate help?", emergencyBody: "You're not alone. Reach someone you trust or contact a professional.", crisis: "View crisis resources",
  },
  RW: {
    welcome: "Murakaza neza muri Inshuti. Turi hano ku buzima bwawe, amahitamo yawe n'ejo hazaza.", chat: "Tangira kuganira",
    conversations: "Ibiganiro", appointments: "Gahunda", streak: "Iminsi yo kwiga", xp: "Amanota XP", explored: "Insanganyamatsiko",
    journey: "Urugendo rwawe rwo kwiga ubuzima", journeySub: "Insanganyamatsiko wasuzumye", activity: "Ibiganiro uko iminsi ishira", top: "Insanganyamatsiko zikuru",
    recent: "Ibiganiro bya vuba", upcoming: "Gahunda ziri imbere", tips: "Inama z'ubuzima", viewAll: "Reba byose",
    noChats: "Ibiganiro byawe by'ibanga bizagaragara hano.", noAppointments: "Nta gahunda iri imbere.", book: "Fata gahunda",
    tipTitle: "Intambwe nto zirafasha", tipBody: "Ruhuka, unywe amazi kandi usabe ubufasha igihe hari icyo utumva neza.",
    talk: "Ukeneye uwo muganira?", talkBody: "Wasaba umukozi w'ubuzima ubufasha bw'ibanga.", findCare: "Shaka ubufasha",
    emergency: "Hari ikibazo cyihutirwa?", emergencyBody: "Nturi wenyine. Hamagara uwo wizera cyangwa umukozi w'ubuzima.", crisis: "Reba nimero z'ubutabazi",
  },
  FR: {
    welcome: "Bienvenue sur Inshuti. Nous sommes là pour votre santé, vos choix et votre avenir.", chat: "Commencer à discuter",
    conversations: "Conversations", appointments: "Rendez-vous", streak: "Série d'apprentissage", xp: "Points XP", explored: "Sujets explorés",
    journey: "Votre parcours d'apprentissage santé", journeySub: "Sujets que vous avez explorés", activity: "Conversations au fil du temps", top: "Sujets principaux",
    recent: "Conversations récentes", upcoming: "Rendez-vous à venir", tips: "Conseils santé", viewAll: "Tout voir",
    noChats: "Vos conversations privées apparaîtront ici.", noAppointments: "Aucun rendez-vous à venir.", book: "Prendre rendez-vous",
    tipTitle: "Les petits pas comptent", tipBody: "Reposez-vous, buvez de l'eau et demandez de l'aide lorsque vous avez un doute.",
    talk: "Besoin de parler à quelqu'un ?", talkBody: "Demandez un soutien privé à un professionnel de santé.", findCare: "Trouver des soins",
    emergency: "Une urgence ou besoin d'aide immédiate ?", emergencyBody: "Vous n'êtes pas seul·e. Contactez une personne de confiance ou un professionnel.", crisis: "Voir les ressources d'urgence",
  },
  SW: {
    welcome: "Karibu tena Inshuti. Tuko hapa kwa afya yako, maamuzi yako na maisha yako ya baadaye.", chat: "Anza kuzungumza",
    conversations: "Mazungumzo", appointments: "Miadi", streak: "Mfululizo wa kujifunza", xp: "Pointi za XP", explored: "Mada ulizochunguza",
    journey: "Safari yako ya kujifunza afya", journeySub: "Mada ulizochunguza", activity: "Mazungumzo kwa muda", top: "Mada kuu",
    recent: "Mazungumzo ya hivi karibuni", upcoming: "Miadi inayokuja", tips: "Vidokezo vya afya", viewAll: "Ona yote",
    noChats: "Mazungumzo yako ya siri yataonekana hapa.", noAppointments: "Hakuna miadi inayokuja.", book: "Weka miadi",
    tipTitle: "Hatua ndogo ni muhimu", tipBody: "Pumzika, kunywa maji na uombe msaada wakati jambo halieleweki.",
    talk: "Unahitaji kuzungumza na mtu?", talkBody: "Unaweza kuomba msaada wa siri kutoka kwa mhudumu wa afya.", findCare: "Tafuta huduma",
    emergency: "Dharura au unahitaji msaada sasa?", emergencyBody: "Hauko peke yako. Wasiliana na mtu unayemwamini au mhudumu wa afya.", crisis: "Ona rasilimali za dharura",
  },
};

function initials(name: string) {
  return name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}

function relativeTime(iso: string) {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
}

function topicFor(conversation: ConversationSummary) {
  const value = `${conversation.topic?.slug ?? ""} ${conversation.topic?.nameEn ?? ""}`.toLowerCase();
  return TOPICS.find((topic) => value.includes(topic.slug) || value.includes(topic.name.toLowerCase())) ?? TOPICS[5];
}

export default function TeenDashboardPage() {
  const { user, loading: authLoading } = useRequireUser();
  const { language } = useLanguage();
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const t = COPY[language];

  useEffect(() => {
    if (!user) return;
    Promise.all([getHistory(), getMyAppointments()])
      .then(([history, appointmentList]) => {
        setConversations(history.conversations);
        setAppointments(appointmentList);
      })
      .finally(() => setLoading(false));
  }, [user]);

  const dashboard = useMemo(() => {
    const counts = new Map(TOPICS.map((topic) => [topic.slug, 0]));
    conversations.forEach((conversation) => {
      const topic = topicFor(conversation);
      counts.set(topic.slug, (counts.get(topic.slug) ?? 0) + 1);
    });
    const explored = [...counts.values()].filter(Boolean).length;
    const lastSeven = Array.from({ length: 7 }, (_, index) => {
      const day = new Date();
      day.setHours(0, 0, 0, 0);
      day.setDate(day.getDate() - (6 - index));
      const next = new Date(day); next.setDate(next.getDate() + 1);
      return { label: day.toLocaleDateString([], { weekday: "short" }), count: conversations.filter((item) => {
        const created = new Date(item.createdAt); return created >= day && created < next;
      }).length };
    });
    const activeDays = new Set(conversations.map((item) => new Date(item.createdAt).toDateString())).size;
    return { counts, explored, lastSeven, activeDays, xp: conversations.length * 20 + explored * 15 };
  }, [conversations]);

  if (authLoading || !user) return <FullPageLoading />;
  const upcoming = appointments.filter((item) => item.status !== "CANCELLED" && new Date(item.requestedTime) >= new Date()).slice(0, 2);
  const exploredPercent = Math.round((dashboard.explored / TOPICS.length) * 100);

  return (
    <AppShell active="/dashboard" session={{ kind: "user", user }}>
      <div className="mx-auto max-w-[1240px] space-y-4 pb-8">
        <section className="grid gap-4 xl:grid-cols-[1.45fr_0.95fr]">
          <div className="flex items-center justify-between rounded-2xl bg-[radial-gradient(circle_at_top_right,#fff1ec,transparent_45%)] px-1 py-2">
            <div>
              <h1 className="font-display text-[30px] font-bold text-ink sm:text-[34px]">Hi, {user.name.split(" ")[0]}! <span aria-hidden="true">👋</span></h1>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-ink-soft">{t.welcome}</p>
              <Link href="/chat" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-coral px-5 py-2.5 text-sm font-semibold text-white shadow-btn transition hover:-translate-y-0.5 hover:bg-coral-dark">
                <svg width="17" height="17"><use href="#i-chat" /></svg>{t.chat}
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-2xl border border-[#F0E2DE] bg-gradient-to-r from-[#FFF5F2] to-white p-4 shadow-sm">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-[#FBE4E3] text-2xl font-bold text-coral-dark">{initials(user.name)}</div>
            <div><p className="text-[15px] font-bold leading-6 text-ink">“You’re doing great taking care of yourself.”</p><p className="mt-1 text-xs text-ink-soft">Small steps today, a healthier tomorrow.</p><span className="mt-2 block text-coral">♥</span></div>
          </div>
        </section>

        {loading ? <PageLoading /> : <>
          <section className="grid overflow-hidden rounded-2xl border border-line/70 bg-white shadow-sm sm:grid-cols-2 lg:grid-cols-5">
            <StatCard bare icon="i-chat" iconColor="#28A76F" value={conversations.length} label={t.conversations} helper="Private history" />
            <StatCard bare icon="i-calendar" iconColor="#9561D8" value={upcoming.length} label={t.appointments} helper="Upcoming" />
            <StatCard bare icon="i-activity" iconColor="#F5A623" value={dashboard.activeDays} label={t.streak} helper="Active days" />
            <StatCard bare icon="i-star" iconColor="#3888E8" value={dashboard.xp} label={t.xp} helper={`Level ${Math.max(1, Math.floor(dashboard.xp / 200) + 1)}`} />
            <StatCard bare icon="i-heart" iconColor="#E95668" value={dashboard.explored} label={t.explored} helper="Keep learning" />
          </section>

          <section className="grid gap-4 xl:grid-cols-[0.92fr_1.06fr_0.98fr]">
            <Panel title={t.journey} subtitle={t.journeySub}>
              <div className="px-5 pb-5 pt-2">
                <DonutChart
                  mode="equal"
                  size={128}
                  centerValue={`${exploredPercent}%`}
                  centerLabel="Explored"
                  data={TOPICS.map((topic) => ({ label: topic.name, value: dashboard.counts.get(topic.slug) ?? 0, color: topic.color }))}
                />
              </div>
            </Panel>

            <Panel title={t.activity} action={<span className="rounded-lg border border-line px-3 py-1.5 text-[11px] text-ink-soft">Last 7 days</span>}>
              <div className="px-5 pb-4">
                <LineChart ariaLabel={t.activity} data={dashboard.lastSeven.map((day) => ({ label: day.label, value: day.count }))} />
              </div>
            </Panel>

            <Panel title={t.top}>
              <div className="px-5 pb-5 pt-1">
                <BarChart
                  orientation="horizontal"
                  data={[...TOPICS]
                    .sort((a, b) => (dashboard.counts.get(b.slug) ?? 0) - (dashboard.counts.get(a.slug) ?? 0))
                    .map((topic) => ({ label: topic.name, value: dashboard.counts.get(topic.slug) ?? 0, color: topic.color }))}
                />
              </div>
            </Panel>
          </section>

          <section className="grid gap-4 xl:grid-cols-[1fr_1.15fr_1fr]">
            <Panel title={t.recent} action={<Link href="/my-space" className="text-[11px] font-semibold text-teal-700">{t.viewAll}</Link>}>
              <div className="pb-2">{conversations.length === 0 ? <p className="px-5 pb-5 text-xs text-ink-soft">{t.noChats}</p> : conversations.slice(0, 4).map((conversation) => {
                const topic = topicFor(conversation); return <Link key={conversation.id} href="/chat" className="flex items-center gap-3 border-t border-line/70 px-4 py-3 transition hover:bg-paper-2"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full" style={{ background: `${topic.color}15`, color: topic.color }}><svg width="15" height="15"><use href={`#${topic.icon}`} /></svg></span><span className="min-w-0 flex-1"><span className="block truncate text-[11.5px] font-medium text-ink">{conversation.firstUserMessage ?? "Private conversation"}</span><span className="mt-0.5 block text-[10px] text-ink-soft">{topic.name} · {relativeTime(conversation.createdAt)}</span></span><span className="text-ink-soft">›</span></Link>;
              })}</div>
            </Panel>

            <Panel title={t.upcoming} action={<Link href="/appointments" className="text-[11px] font-semibold text-teal-700">{t.viewAll}</Link>}>
              <div className="px-4 pb-4">{upcoming.length === 0 ? <div className="rounded-xl bg-paper-2 p-4 text-xs text-ink-soft">{t.noAppointments} <Link href="/appointments" className="font-semibold text-teal-700">{t.book}</Link></div> : upcoming.map((appointment) => {
                const date = new Date(appointment.requestedTime); return <div key={appointment.id} className="mb-2 flex items-center gap-3 rounded-xl border border-line p-3 last:mb-0"><div className="w-12 rounded-lg border border-[#B9DDC9] text-center"><div className="bg-[#E7F5EC] py-1 text-[8px] font-bold text-success">{date.toLocaleDateString([], { month: "short" }).toUpperCase()}</div><div className="py-1 text-base font-bold">{date.getDate()}</div></div><div className="min-w-0 flex-1"><div className="truncate text-[11.5px] font-semibold">{appointment.professional.name}</div><div className="mt-1 text-[10px] text-ink-soft">{date.toLocaleDateString()} · {date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div></div><span className="rounded-full bg-teal-100 px-2 py-1 text-[9px] font-semibold text-success">{appointment.status}</span></div>;
              })}</div>
            </Panel>

            <div className="space-y-4">
              <Panel title={t.tips}><div className="flex gap-3 px-5 pb-5"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-100 text-teal-700"><svg width="19" height="19"><use href="#i-sparkles" /></svg></span><div><div className="text-xs font-bold">{t.tipTitle}</div><p className="mt-1 text-[11px] leading-5 text-ink-soft">{t.tipBody}</p></div></div></Panel>
              <div className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-white p-4 shadow-sm"><div><div className="text-xs font-bold">{t.talk}</div><div className="mt-1 text-[10px] text-ink-soft">{t.talkBody}</div></div><Link href="/facility-locator" className="shrink-0 rounded-xl bg-teal-700 px-4 py-2 text-[11px] font-semibold text-white">{t.findCare}</Link></div>
            </div>
          </section>

          <section className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-[#CDE5DF] bg-gradient-to-r from-[#EFF9F6] to-white p-5 sm:flex-row sm:items-center">
            <div className="flex items-center gap-4"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#D9F2E8] text-success"><svg width="21" height="21"><use href="#i-shield" /></svg></span><div><h2 className="text-[14px] font-bold">{t.emergency}</h2><p className="mt-1 text-[11px] text-ink-soft">{t.emergencyBody}</p></div></div>
            <Link href="/chat" className="rounded-xl bg-teal-700 px-5 py-2.5 text-[11px] font-semibold text-white">{t.crisis}</Link>
          </section>
        </>}
      </div>
    </AppShell>
  );
}
