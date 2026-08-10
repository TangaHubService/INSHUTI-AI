"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";

import { AppShell } from "@/components/AppShell";
import { ProfessionalConsultationsView } from "@/components/ProfessionalConsultationsView";
import { FullPageLoading, PageLoading } from "@/components/Spinner";
import { useLanguage } from "@/lib/LanguageContext";
import { getChatList, type ChatListItem, type ConsultationStatus } from "@/lib/userApiClient";
import { useRequireUser } from "@/lib/useUserAuth";
import { useToast } from "@/lib/useToast";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
type Filter = "ALL" | "ACTIVE" | "RESOLVED" | "ESCALATED";

const STATUS_STYLE: Record<ConsultationStatus, string> = {
  PENDING: "bg-gold-100 text-[#8A5E1E]", ASSIGNED: "bg-[#EEE8FF] text-[#7444C8]", IN_PROGRESS: "bg-[#E9F3FF] text-[#256AAF]",
  RESOLVED: "bg-teal-100 text-success", ESCALATED: "bg-coral-100 text-coral-dark",
};

const COPY = {
  EN: { title: "Consultations", subtitle: "Connect with health professionals for private and confidential support.", total: "Total consultations", resolved: "Resolved", active: "Active", escalated: "Escalated", all: "All consultations", empty: "No consultations yet. Ask to speak with a health worker from the AI chat.", professional: "Need to talk to a professional?", proBody: "Our healthcare professionals are here to support you confidentially.", book: "Start from AI chat", how: "How consultations work", confidential: "Private & confidential", qualified: "Qualified professionals", flexible: "Reply when convenient", safe: "Safe & supportive", crisis: "In an emergency?", crisisBody: "If you or someone you know is in immediate danger, reach out right away.", resources: "View crisis resources" },
  RW: { title: "Kugisha inama", subtitle: "Vugana n'abakozi b'ubuzima mu ibanga.", total: "Inama zose", resolved: "Zarangiye", active: "Zikomeje", escalated: "Zihutirwa", all: "Inama zose", empty: "Nta nama urasaba. Saba umukozi w'ubuzima muri chat ya AI.", professional: "Ukeneye umukozi w'ubuzima?", proBody: "Abakozi bacu biteguye kugufasha mu ibanga.", book: "Tangirira muri chat", how: "Uko inama zikora", confidential: "Ni ibanga", qualified: "Abakozi babishoboye", flexible: "Subizwa igihe bibereye", safe: "Umutekano n'inkunga", crisis: "Hari ikibazo cyihutirwa?", crisisBody: "Niba hari uri mu kaga, saba ubufasha ako kanya.", resources: "Reba ubufasha bwihutirwa" },
  FR: { title: "Consultations", subtitle: "Échangez avec des professionnels de santé en toute confidentialité.", total: "Total", resolved: "Terminées", active: "Actives", escalated: "Escaladées", all: "Toutes les consultations", empty: "Aucune consultation. Demandez un professionnel depuis le chat IA.", professional: "Besoin d'un professionnel ?", proBody: "Nos professionnels vous accompagnent en toute confidentialité.", book: "Commencer dans le chat", how: "Comment ça marche", confidential: "Privé et confidentiel", qualified: "Professionnels qualifiés", flexible: "Réponse flexible", safe: "Sûr et bienveillant", crisis: "Une urgence ?", crisisBody: "En cas de danger immédiat, demandez de l'aide sans attendre.", resources: "Voir les ressources d'urgence" },
  SW: { title: "Mashauriano", subtitle: "Ungana na wahudumu wa afya kwa msaada wa siri.", total: "Jumla", resolved: "Yaliyokamilika", active: "Yanayoendelea", escalated: "Ya dharura", all: "Mashauriano yote", empty: "Hakuna mashauriano. Omba mhudumu kupitia gumzo la AI.", professional: "Unahitaji mhudumu wa afya?", proBody: "Wahudumu wetu wako tayari kukusaidia kwa siri.", book: "Anza kwenye gumzo", how: "Jinsi yanavyofanya kazi", confidential: "Siri na faragha", qualified: "Wataalamu waliohitimu", flexible: "Jibu kwa wakati unaofaa", safe: "Salama na yenye msaada", crisis: "Dharura?", crisisBody: "Ikiwa kuna hatari ya haraka, tafuta msaada sasa.", resources: "Ona msaada wa dharura" },
};

function Stat({ icon, color, value, label }: { icon: string; color: string; value: number; label: string }) {
  return <div className="flex items-center gap-4 rounded-2xl border border-line bg-white p-4 shadow-sm"><span className="flex h-12 w-12 items-center justify-center rounded-full" style={{ background: `${color}15`, color }}><svg width="22" height="22"><use href={`#${icon}`} /></svg></span><div><div className="text-xl font-bold">{value}</div><div className="mt-1 text-[11px] text-ink-soft">{label}</div><div className="mt-1 text-[9px] text-ink-soft">All time</div></div></div>;
}

export default function ConsultationsPage() {
  const { toast } = useToast();
  const { language } = useLanguage();
  const { user, loading: authLoading } = useRequireUser();
  const [chats, setChats] = useState<ChatListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("ALL");
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const socketRef = useRef<Socket | null>(null);
  const t = COPY[language];

  useEffect(() => {
    if (authLoading || !user) return;
    let cancelled = false;
    const load = async () => { try { const data = await getChatList(); if (!cancelled) setChats(data); } catch { if (!cancelled) toast("Failed to load consultations", "error"); } finally { if (!cancelled) setLoading(false); } };
    void load();
    socketRef.current = io(`${API_URL}/chat-list`, { withCredentials: true, transports: ["websocket", "polling"] });
    socketRef.current.on("user:online", ({ userId, online }: { userId: string; online: boolean }) => setOnlineUsers((previous) => {
      const next = new Set(previous);
      if (online) next.add(userId);
      else next.delete(userId);
      return next;
    }));
    socketRef.current.on("message:new", () => void load());
    return () => { cancelled = true; socketRef.current?.disconnect(); socketRef.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user]);

  const stats = useMemo(() => ({ resolved: chats.filter((c) => c.status === "RESOLVED").length, active: chats.filter((c) => ["PENDING", "ASSIGNED", "IN_PROGRESS"].includes(c.status)).length, escalated: chats.filter((c) => c.status === "ESCALATED").length }), [chats]);
  const visible = chats.filter((chat) => filter === "ALL" || (filter === "ACTIVE" ? ["PENDING", "ASSIGNED", "IN_PROGRESS"].includes(chat.status) : chat.status === filter));
  if (authLoading || !user) return <FullPageLoading />;

  if (user.role === "HEALTHCARE_PROFESSIONAL") {
    return <AppShell active="/consultations" session={{ kind: "user", user }}><ProfessionalConsultationsView chats={chats} loading={loading} onlineUsers={onlineUsers} /></AppShell>;
  }

  return <AppShell active="/consultations" session={{ kind: "user", user }}><div className="mx-auto max-w-[1240px] pb-10">
    <header className="flex flex-wrap items-end justify-between gap-3"><div><h1 className="text-[30px] font-bold text-ink">{t.title}</h1><p className="mt-1 text-sm text-ink-soft">{t.subtitle}</p></div>
      <Link href="/call" className="flex items-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-[11px] font-semibold text-white hover:bg-teal-900"><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>Start group call</Link>
    </header>
    <div className="mt-6 grid gap-5 xl:grid-cols-[1fr_330px]">
      <main className="min-w-0 space-y-5">
        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><Stat icon="i-users" color="#8657E8" value={chats.length} label={t.total} /><Stat icon="i-check" color="#159A68" value={stats.resolved} label={t.resolved} /><Stat icon="i-clock" color="#F2A01B" value={stats.active} label={t.active} /><Stat icon="i-close" color="#F05268" value={stats.escalated} label={t.escalated} /></section>
        <section className="overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
          <div className="flex gap-5 overflow-x-auto border-b border-line px-5 pt-3">{(["ALL", "ACTIVE", "RESOLVED", "ESCALATED"] as Filter[]).map((value) => <button key={value} onClick={() => setFilter(value)} className={`whitespace-nowrap border-b-2 px-1 py-3 text-xs font-semibold ${filter === value ? "border-teal-700 text-teal-900" : "border-transparent text-ink-soft"}`}>{value === "ALL" ? t.all : value.charAt(0) + value.slice(1).toLowerCase()}</button>)}</div>
          {loading && <PageLoading />}{!loading && visible.length === 0 && <div className="flex min-h-[390px] flex-col items-center justify-center px-6 py-12 text-center"><span className="flex h-20 w-20 items-center justify-center rounded-full bg-[#EEE8FF] text-[#7444C8]"><svg width="35" height="35"><use href="#i-stethoscope" /></svg></span><h3 className="mt-5 text-lg font-bold">{filter === "ALL" ? "No consultations yet" : `No ${filter.toLowerCase()} consultations`}</h3><p className="mt-2 max-w-[420px] text-xs leading-5 text-ink-soft">{filter === "ALL" ? "When you need private support, ask Inshuti to connect you with a qualified health professional. Your consultation and replies will appear here." : "There are no consultations in this category. Choose another tab or start a private conversation whenever you need support."}</p><div className="mt-5 flex gap-3"><Link href="/chat" className="rounded-xl bg-[#7444C8] px-5 py-2.5 text-[11px] font-semibold text-white">Talk to Inshuti</Link><Link href="/facility-locator" className="rounded-xl border border-teal-700 px-5 py-2.5 text-[11px] font-semibold text-teal-700">Find nearby care</Link></div><div className="mt-7 flex flex-wrap justify-center gap-5 text-[10px] text-ink-soft"><span>🔒 Private</span><span>✓ Qualified professionals</span><span>♡ Safe and supportive</span></div></div>}
          {visible.map((chat) => {
            const online = chat.otherParty ? onlineUsers.has(chat.otherParty.id) : false;
            return (
              <button type="button" key={chat.id} onClick={() => window.dispatchEvent(new CustomEvent("private-messages:open", { detail: { chatId: chat.id } }))} className="flex w-full items-center gap-4 border-b border-line px-5 py-5 text-left last:border-0 hover:bg-paper-2">
                <span className={`relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-base font-bold ${chat.status === "RESOLVED" ? "bg-teal-100 text-success" : chat.status === "ESCALATED" ? "bg-coral-100 text-coral-dark" : "bg-[#EEE8FF] text-[#7444C8]"}`}>{chat.otherParty?.name?.[0]?.toUpperCase() ?? "?"}{online && <i className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500" />}</span>
                <span className="min-w-0 flex-1"><strong className="block truncate text-sm">{chat.otherParty?.name ?? (user.role === "HEALTHCARE_PROFESSIONAL" ? "User awaiting support" : "Awaiting professional assignment")}</strong><span className="mt-1 block truncate text-[11px] text-ink-soft">{chat.lastMessage?.content ?? "No professional messages yet"}</span><span className="mt-1 block text-[10px] text-ink-soft">Requested {new Date(chat.createdAt).toLocaleDateString()} · Priority {chat.priority}</span></span>
                <span className="text-right"><b className={`inline-block rounded-full px-3 py-1 text-[10px] ${STATUS_STYLE[chat.status]}`}>{chat.status.replace("_", " ")}</b>{chat.unreadCount > 0 && <span className="mt-2 block text-[10px] font-semibold text-coral">{chat.unreadCount} unread</span>}</span><span className="text-xl text-ink-soft">›</span>
              </button>
            );
          })}
        </section>
      </main>
      <aside className="space-y-4">
        <section className="overflow-hidden rounded-2xl border border-[#E6DDF8] bg-gradient-to-br from-[#F7F1FF] to-white p-5 shadow-sm"><div className="flex items-center gap-4"><span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[#EEE3FF] text-4xl">👩🏾‍⚕️</span><div><h2 className="text-base font-bold">{t.professional}</h2><p className="mt-2 text-[11px] leading-5 text-ink-soft">{t.proBody}</p></div></div><Link href="/chat" className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-[#7444C8] px-4 py-2.5 text-[11px] font-semibold text-white"><svg width="14" height="14"><use href="#i-chat" /></svg>{t.book}</Link></section>
        <section className="rounded-2xl border border-line bg-white p-5 shadow-sm"><h2 className="text-sm font-bold">{t.how}</h2><div className="mt-4 space-y-4">{[["i-lock",t.confidential],["i-user-check",t.qualified],["i-clock",t.flexible],["i-shield",t.safe]].map(([icon,label]) => <div key={label} className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F3F0FF] text-[#7444C8]"><svg width="16" height="16"><use href={`#${icon}`} /></svg></span><span className="text-[11px] font-semibold">{label}</span></div>)}</div></section>
        <section className="rounded-2xl border border-line bg-white p-5 shadow-sm"><h2 className="text-sm font-bold">Available through consultations</h2><div className="mt-4 flex flex-wrap gap-2">{["General Health","Mental Health","Menstrual Health","Family Planning","HIV & STIs","Relationships"].map((topic, index) => <span key={topic} className={`rounded-full px-3 py-1.5 text-[9px] ${index % 2 ? "bg-teal-100 text-teal-700" : "bg-[#EEF5FF] text-[#256AAF]"}`}>{topic}</span>)}</div><p className="mt-3 text-[10px] text-ink-soft">…and more</p></section>
        <section className="rounded-2xl border border-coral-100 bg-[#FFF7F6] p-5"><h2 className="text-sm font-bold">{t.crisis}</h2><p className="mt-2 text-[11px] leading-5 text-ink-soft">{t.crisisBody}</p><Link href="/facility-locator" className="mt-4 block rounded-xl bg-coral px-4 py-2.5 text-center text-[11px] font-semibold text-white">{t.resources}</Link></section>
      </aside>
    </div>
    <p className="mt-5 text-center text-[11px] text-ink-soft">ⓘ Can&apos;t find your consultation? <Link href="/contact" className="font-semibold text-teal-700">Contact our support team.</Link></p>
  </div></AppShell>;
}
