"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { PageLoading } from "@/components/Spinner";
import type { ChatListItem, ConsultationStatus } from "@/lib/userApiClient";

type ConsultationFilter = "ALL" | "ACTIVE" | "RESOLVED" | "ESCALATED";

const STATUS_UI: Record<ConsultationStatus, { label: string; badge: string }> = {
  PENDING: { label: "PENDING", badge: "bg-[#FFF0DC] text-[#DC8000]" },
  ASSIGNED: { label: "ASSIGNED", badge: "bg-[#E8F1FE] text-[#2773D4]" },
  IN_PROGRESS: { label: "IN PROGRESS", badge: "bg-[#E6F0FE] text-[#126FE0]" },
  RESOLVED: { label: "RESOLVED", badge: "bg-[#E2F4EA] text-[#11865B]" },
  ESCALATED: { label: "ESCALATED", badge: "bg-[#FFE7E6] text-[#E24E4E]" },
};

function Icon({ name, size = 17 }: { name: string; size?: number }) {
  return <svg width={size} height={size} aria-hidden="true"><use href={`#${name}`} /></svg>;
}

function ConsultationMetric({ label, value, icon, color, background, onClick }: { label: string; value: number; icon: string; color: string; background: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="flex min-h-[127px] items-center rounded-[14px] border border-[#E7E4DE] bg-white px-4 text-left shadow-[0_2px_8px_rgba(34,63,58,.055)] transition hover:-translate-y-0.5 hover:shadow-md">
      <span className="flex h-[54px] w-[54px] shrink-0 items-center justify-center rounded-full" style={{ color, background }}><Icon name={icon} size={27} /></span>
      <span className="ml-4 min-w-0"><b className="font-display text-[28px] leading-none text-[#073E3A]">{value}</b><span className="mt-2 block truncate text-[10.5px] text-[#526B73]">{label}</span><span className="mt-[17px] flex items-center gap-2 text-[10px] font-semibold text-[#00786F]">View all <Icon name="i-arrow" size={13} /></span></span>
    </button>
  );
}

function ConsultationList({ chats, loading, onlineUsers, filter, onFilterChange }: { chats: ChatListItem[]; loading: boolean; onlineUsers: Set<string>; filter: ConsultationFilter; onFilterChange: (filter: ConsultationFilter) => void }) {
  const [status, setStatus] = useState<"ALL" | ConsultationStatus>("ALL");
  const [search, setSearch] = useState("");

  const visible = useMemo(() => chats.filter((chat) => {
    if (filter === "ACTIVE" && !["PENDING", "ASSIGNED", "IN_PROGRESS"].includes(chat.status)) return false;
    if (filter === "RESOLVED" && chat.status !== "RESOLVED") return false;
    if (filter === "ESCALATED" && chat.status !== "ESCALATED") return false;
    if (status !== "ALL" && chat.status !== status) return false;
    const query = search.trim().toLowerCase();
    return !query || chat.otherParty?.name.toLowerCase().includes(query) || chat.lastMessage?.content.toLowerCase().includes(query);
  }), [chats, filter, search, status]);

  return (
    <section id="consultation-list" className="mt-[18px] overflow-hidden rounded-[14px] border border-[#E7E4DE] bg-white shadow-[0_2px_8px_rgba(34,63,58,.055)]">
      <div className="flex flex-col justify-between gap-3 border-b border-[#E8E5E0] px-5 pt-3 lg:flex-row lg:items-center">
        <div className="flex gap-8 overflow-x-auto">{(["ALL", "ACTIVE", "RESOLVED", "ESCALATED"] as ConsultationFilter[]).map((item) => <button type="button" key={item} onClick={() => onFilterChange(item)} className={`whitespace-nowrap border-b-2 px-0.5 py-[14px] text-[10.5px] font-semibold ${filter === item ? "border-[#008176] text-[#006D65]" : "border-transparent text-[#4F666D]"}`}>{item === "ALL" ? "All consultations" : item.charAt(0) + item.slice(1).toLowerCase()}</button>)}</div>
        <div className="flex items-center gap-3 pb-3 lg:pb-0">
          <label className="flex h-9 min-w-0 flex-1 items-center gap-2 rounded-lg border border-[#E0E1DE] bg-[#FAFAF9] px-3 lg:w-[240px]"><span className="text-[#71858A]"><Icon name="i-search" size={15} /></span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search consultations..." className="min-w-0 flex-1 bg-transparent text-[10.5px] text-[#25434A] outline-none" /></label>
          <label className="flex h-9 items-center gap-2 rounded-lg border border-[#E0E1DE] bg-white px-3 text-[10px] font-semibold text-[#356067]"><Icon name="i-filter" size={15} />Filter<select value={status} onChange={(event) => setStatus(event.target.value as "ALL" | ConsultationStatus)} className="w-4 bg-transparent text-transparent outline-none" aria-label="Filter consultation status"><option value="ALL">All statuses</option><option value="PENDING">Pending</option><option value="ASSIGNED">Assigned</option><option value="IN_PROGRESS">In progress</option><option value="RESOLVED">Resolved</option><option value="ESCALATED">Escalated</option></select></label>
        </div>
      </div>

      {loading ? <PageLoading /> : <div>
        {visible.length === 0 && <div className="flex min-h-[290px] flex-col items-center justify-center px-6 text-center"><span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#F0EAFD] text-[#7D4DE2]"><Icon name="i-stethoscope" size={29} /></span><h3 className="mt-4 text-[14px] font-bold text-[#18343C]">No matching consultations</h3><p className="mt-2 text-[10.5px] text-[#6A7D82]">Try another tab, status, or patient name.</p></div>}
        {visible.map((chat) => {
          const name = chat.otherParty?.name ?? "Patient awaiting support";
          const date = new Date(chat.createdAt);
          const updated = new Date(chat.updatedAt);
          const statusUi = STATUS_UI[chat.status];
          const isOnline = chat.otherParty ? onlineUsers.has(chat.otherParty.id) : false;
          return (
            <button type="button" onClick={() => window.dispatchEvent(new CustomEvent("private-messages:open", { detail: { chatId: chat.id } }))} key={chat.id} className="group mx-5 grid min-h-[125px] w-[calc(100%-2.5rem)] grid-cols-[54px_minmax(0,1fr)_auto] items-center gap-4 border-b border-[#ECEAE6] py-4 text-left last:border-b-0 hover:bg-[#FAFCFB]">
              <span className={`relative flex h-[54px] w-[54px] items-center justify-center rounded-full text-[19px] font-semibold ${chat.status === "RESOLVED" ? "bg-[#E3F2ED] text-[#075F5A]" : "bg-[#F0EAFE] text-[#7444D8]"}`}>{name.charAt(0).toUpperCase()}{isOnline && <i className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500" />}</span>
              <span className="min-w-0"><span className="flex items-center gap-2"><b className="truncate text-[13px] text-[#17313A]">{name}</b><span className={`rounded-full px-2 py-1 text-[8px] font-semibold ${chat.status === "RESOLVED" ? "bg-[#E5F4EF] text-[#08796F]" : "bg-[#E8F1FE] text-[#176ED5]"}`}>{chat.status === "RESOLVED" ? "VIDEO CALL" : statusUi.label}</span>{chat.unreadCount > 0 && <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#F05249] px-1 text-[9px] font-bold text-white">{chat.unreadCount}</span>}</span><span className="mt-2 block truncate text-[10.5px] text-[#526B72]">{chat.lastMessage?.content ?? (chat.status === "RESOLVED" ? "General consultation – follow-up complete" : "Private consultation awaiting your reply")}</span><span className="mt-2 block text-[9.5px] text-[#516A71]">Request ID: #CNS-{date.getFullYear()}-{chat.id.slice(-4).toUpperCase()} <i className="px-1 not-italic">•</i> {date.toLocaleDateString([], { day: "2-digit", month: "short", year: "numeric" })}, {date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span></span>
              <span className="flex min-w-[175px] items-center gap-4"><span><span className={`inline-block rounded-full px-3 py-1.5 text-[8.5px] font-semibold ${statusUi.badge}`}>{statusUi.label}</span><span className="mt-3 flex items-center gap-2 text-[9.5px] text-[#526B72]"><Icon name="i-calendar" size={13} />{chat.status === "RESOLVED" ? "Completed" : "Scheduled"}</span><span className="mt-2 block text-[9.5px] text-[#526B72]">{updated.toLocaleDateString([], { day: "2-digit", month: "short", year: "numeric" })}, {updated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span></span><span className="ml-auto text-xl font-bold text-[#006B64]">⋮</span></span>
            </button>
          );
        })}
        <div className="flex items-center justify-between border-t border-[#ECEAE6] px-5 py-4 text-[9.5px] text-[#657A80]"><span>Showing {visible.length ? 1 : 0} to {visible.length} of {visible.length} consultations</span><div className="flex items-center gap-4"><button type="button" disabled>‹</button><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#E9F3F0] font-semibold text-[#08776D]">1</span><button type="button" disabled>›</button></div></div>
      </div>}
    </section>
  );
}

function AiPromoCard() {
  return (
    <section className="rounded-[14px] bg-[linear-gradient(135deg,#F2ECFF,#FBF8FF)] p-[18px] shadow-[0_2px_10px_rgba(103,70,190,.08)]">
      <div className="flex gap-4"><span className="flex h-[105px] w-[92px] shrink-0 items-center justify-center rounded-[45px] bg-[#DDD0FA] text-[48px]">👩🏽‍⚕️</span><div><h2 className="text-[15px] font-bold leading-6 text-[#17233D]">Need to talk to a professional?</h2><p className="mt-2 text-[10px] leading-[19px] text-[#45516B]">Our AI assistant can help you draft notes, suggest responses and prepare for your consultations.</p></div></div>
      <Link href="/chat" className="mt-4 flex h-11 items-center justify-center gap-2 rounded-xl bg-[linear-gradient(100deg,#6C38D7,#7C42E6)] text-[11px] font-semibold text-white"><Icon name="i-chat" size={15} />Start from AI Chat</Link>
    </section>
  );
}

function HowItWorksCard() {
  const items = [
    ["i-lock", "Private & confidential", "All consultations are secure and encrypted."],
    ["i-users", "Qualified professionals", "Verified healthcare professionals."],
    ["i-calendar", "Reply when convenient", "Respond at your available time."],
    ["i-shield", "Safe & supportive", "Patient wellbeing is our priority."],
  ];
  return <section className="rounded-[14px] border border-[#E7E4DE] bg-white p-[18px] shadow-[0_2px_8px_rgba(34,63,58,.055)]"><h2 className="text-[12.5px] font-bold text-[#17323B]">How consultations work</h2><div className="mt-5 space-y-5">{items.map(([icon, title, body]) => <div key={title} className="flex gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F0EAFE] text-[#7C49E4]"><Icon name={icon} size={18} /></span><span><b className="block text-[10.5px] text-[#17323B]">{title}</b><span className="mt-1 block text-[9.5px] text-[#66787F]">{body}</span></span></div>)}</div></section>;
}

function SpecialtiesCard() {
  const specialties = [
    ["i-calendar", "General Health", "bg-[#E8F5F1] text-[#08786F]"], ["i-heart", "Mental Health", "bg-[#EAF2FD] text-[#2674D8]"],
    ["i-mind", "Maternal Health", "bg-[#FDEDEC] text-[#E45255]"], ["i-sparkle", "Child Health", "bg-[#FFF3E2] text-[#E78B00]"],
    ["i-shield", "Chronic Care", "bg-[#F0EBFC] text-[#7A4CE2]"], ["i-stethoscope", "Nutrition", "bg-[#E8F4F1] text-[#078073]"],
  ];
  return <section className="rounded-[14px] border border-[#E7E4DE] bg-white p-[18px] shadow-[0_2px_8px_rgba(34,63,58,.055)]"><h2 className="text-[12.5px] font-bold text-[#17323B]">Popular specialties</h2><div className="mt-4 grid grid-cols-2 gap-3">{specialties.map(([icon, label, style]) => <span key={label} className={`flex h-10 items-center gap-2 rounded-full px-3 text-[9px] font-semibold ${style}`}><Icon name={icon} size={14} />{label}</span>)}</div><Link href="/library" className="mt-5 flex items-center justify-center gap-2 border-t border-[#EEECE8] pt-4 text-[9.5px] font-semibold text-[#00786F]">View all specialties <Icon name="i-arrow" size={13} /></Link></section>;
}

function AssistantPanel() {
  return <section className="mt-[18px] flex flex-col items-center gap-5 rounded-[14px] border border-[#E7E4DE] bg-white px-6 py-5 shadow-[0_2px_8px_rgba(34,63,58,.055)] sm:flex-row"><span className="flex h-[100px] w-[110px] shrink-0 items-center justify-center rounded-[45px] bg-[#E6F1EF] text-[55px]">🤖</span><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><h2 className="text-[14px] font-bold text-[#17323B]">Your AI Assistant</h2><span className="rounded-full bg-[#E5F0F2] px-2 py-1 text-[8px] font-semibold text-[#277080]">BETA</span></div><p className="mt-2 text-[10.5px] text-[#516971]">Get help with consultation notes, patient summaries, and professional recommendations.</p><div className="mt-3 flex flex-wrap gap-2">{[["i-file","Summarize consultation"],["i-edit","Draft follow-up note"],["i-sparkle","Suggest care plan"]].map(([icon,label]) => <button type="button" key={label} className="flex items-center gap-2 rounded-lg border border-[#DDE0DD] px-3 py-2 text-[9px] text-[#344D55]"><Icon name={icon} size={13} />{label}</button>)}</div></div><Link href="/chat" className="flex shrink-0 items-center gap-3 rounded-lg border border-[#158B82] px-4 py-3 text-[10px] font-semibold text-[#08766D]">Open AI Assistant <Icon name="i-arrow" size={14} /></Link></section>;
}

export function ProfessionalConsultationsView({ chats, loading, onlineUsers }: { chats: ChatListItem[]; loading: boolean; onlineUsers: Set<string> }) {
  const [filter, setFilter] = useState<ConsultationFilter>("ALL");
  const counts = useMemo(() => ({ resolved: chats.filter((chat) => chat.status === "RESOLVED").length, active: chats.filter((chat) => ["PENDING", "ASSIGNED", "IN_PROGRESS"].includes(chat.status)).length, escalated: chats.filter((chat) => chat.status === "ESCALATED").length }), [chats]);
  const metrics = [
    { label: "Total consultations", value: chats.length, icon: "i-users", color: "#8250E5", background: "#F0EAFE", onClick: () => setFilter("ALL") },
    { label: "Resolved", value: counts.resolved, icon: "i-check", color: "#13A669", background: "#E4F5EB", onClick: () => setFilter("RESOLVED") },
    { label: "Active", value: counts.active, icon: "i-clock", color: "#F19A16", background: "#FFF2DF", onClick: () => setFilter("ACTIVE") },
    { label: "Escalated", value: counts.escalated, icon: "i-close", color: "#EE5555", background: "#FFE9E9", onClick: () => setFilter("ESCALATED") },
  ];
  return (
    <main className="mx-auto max-w-[1248px] pb-3">
      <header className="flex items-end justify-between gap-5">
        <div><span className="font-mono text-[10.5px] font-medium uppercase tracking-[0.12em] text-[#EF5144]">Healthcare Professional Portal</span><div className="mt-3 flex items-center gap-3"><h1 className="font-display text-[32px] font-bold leading-none text-[#073F3B]">Consultations</h1><span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#DFF1ED] text-[#087A70]"><Icon name="i-stethoscope" size={22} /></span></div><p className="mt-3 text-[11.5px] text-[#597079]">Connect with patients and provide professional care through secure consultations.</p></div>
        <Link href="/appointments" className="mb-2 flex items-center gap-2 rounded-lg border border-[#DDE0DC] bg-white px-4 py-3 text-[9.5px] font-semibold text-[#17434A] shadow-sm"><Icon name="i-calendar" size={14} />Calendar view</Link>
      </header>
      <div className="mt-[18px] grid gap-[22px] xl:grid-cols-[minmax(0,1fr)_337px]">
        <div className="min-w-0"><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{metrics.map((metric) => <ConsultationMetric key={metric.label} {...metric} />)}</div><ConsultationList chats={chats} loading={loading} onlineUsers={onlineUsers} filter={filter} onFilterChange={setFilter} /><AssistantPanel /><div className="mt-[18px] flex items-center justify-between rounded-xl border border-[#DDEBE7] bg-[#EDF8F5] px-5 py-4 text-[10.5px] text-[#315B61]"><span className="flex items-center gap-3"><span className="text-[#078278]"><Icon name="i-shield" size={21} /></span>Tip: Keep patient information confidential and follow professional guidelines.</span><Link href="/privacy" className="flex items-center gap-2 font-semibold text-[#00786F]">View guidelines <Icon name="i-arrow" size={13} /></Link></div></div>
        <aside className="space-y-[18px]"><AiPromoCard /><HowItWorksCard /><SpecialtiesCard /></aside>
      </div>
    </main>
  );
}
