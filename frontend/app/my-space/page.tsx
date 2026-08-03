"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { AppShell } from "@/components/AppShell";
import { ConfirmModal } from "@/components/Modal";
import { FullPageLoading } from "@/components/Spinner";
import { clearHistory, getHistory, getSuggestions, type ConversationSummary, type Suggestion, type TopicCount } from "@/lib/apiClient";
import { useLanguage } from "@/lib/LanguageContext";
import { getCurrentUser, getMyAppointments, type Appointment, type UserProfile } from "@/lib/userApiClient";
import { useToast } from "@/lib/useToast";

const COLORS = ["#F05278", "#F5A623", "#16A06B", "#4188E8", "#8653DF", "#20A49B"];

function relativeTime(value: string) {
  const date = new Date(value);
  const days = Math.floor((Date.now() - date.getTime()) / 86400000);
  if (days <= 0) return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
}

function consecutiveDays(conversations: ConversationSummary[]) {
  const days = new Set(conversations.map((item) => new Date(item.createdAt).toISOString().slice(0, 10)));
  let streak = 0;
  const cursor = new Date();
  while (days.has(cursor.toISOString().slice(0, 10))) { streak += 1; cursor.setDate(cursor.getDate() - 1); }
  return streak;
}

function StatCard({ icon, color, value, title, note }: { icon: string; color: string; value: string | number; title: string; note: string }) {
  return <div className="flex min-h-[104px] items-center gap-4 rounded-2xl border border-line bg-white px-5 shadow-sm"><span className="flex h-12 w-12 items-center justify-center rounded-full" style={{ background: `${color}16`, color }}><svg width="23" height="23"><use href={`#${icon}`} /></svg></span><div><strong className="block text-[22px] leading-none text-ink">{value}</strong><span className="mt-2 block text-xs text-ink-soft">{title}</span><span className="mt-1 block text-[10px] font-medium" style={{ color }}>{note}</span></div></div>;
}

export default function MySpacePage() {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [topicCounts, setTopicCounts] = useState<TopicCount[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showClear, setShowClear] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      const [history, suggested, booked] = await Promise.all([getHistory(), getSuggestions(language), currentUser ? getMyAppointments() : Promise.resolve([])]);
      setConversations(history.conversations); setTopicCounts(history.topicCounts); setSuggestions(suggested); setAppointments(booked);
    } catch { toast("Could not load My Space", "error"); }
    finally { setLoading(false); }
  }

  // Reload localized suggestions when the selected language changes.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { void load(); }, [language]);

  const upcoming = useMemo(() => appointments.filter((item) => !["CANCELLED", "COMPLETED"].includes(item.status) && new Date(item.requestedTime) >= new Date()).sort((a, b) => +new Date(a.requestedTime) - +new Date(b.requestedTime)), [appointments]);
  const totalTopics = topicCounts.reduce((sum, item) => sum + item.count, 0);
  const streak = consecutiveDays(conversations);
  const chart = Array.from({ length: 7 }, (_, index) => { const date = new Date(); date.setDate(date.getDate() - (6 - index)); const key = date.toISOString().slice(0, 10); return { label: date.toLocaleDateString([], { weekday: "short" }), value: conversations.filter((item) => item.createdAt.slice(0, 10) === key).length }; });
  const maxChart = Math.max(1, ...chart.map((item) => item.value));
  const achievements = [
    { title: "Curious Learner", detail: `Asked ${conversations.length} questions`, unlocked: conversations.length >= 5, color: "#14936B" },
    { title: "Health Explorer", detail: `Explored ${topicCounts.length} topics`, unlocked: topicCounts.length >= 3, color: "#8653DF" },
    { title: "Consistency Star", detail: `${streak} active days in a row`, unlocked: streak >= 3, color: "#F5A623" },
  ];

  if (loading || !user) return <FullPageLoading />;

  return <AppShell active="/my-space" session={{ kind: "user", user }}><div className="mx-auto max-w-[1220px] pb-10">
    <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start"><header><h1 className="text-[30px] font-bold">My Space</h1><p className="mt-1 text-sm text-ink-soft">Your personal health journey at a glance.</p></header><section className="flex min-h-[132px] w-full items-center rounded-2xl border border-[#CDE5DF] bg-[linear-gradient(105deg,#F1FAF7,#E8F6F5)] px-7 lg:max-w-[480px]"><span className="mr-5 flex h-20 w-20 items-center justify-center rounded-full bg-coral-100 text-4xl">👋🏾</span><div><h2 className="text-base font-bold">You&apos;re doing great, {user.name.split(" ")[0]}!</h2><p className="mt-2 text-xs text-ink-soft">Small steps today, better tomorrow.</p><Link href="/chat" className="mt-3 inline-flex rounded-lg bg-teal-700 px-5 py-2 text-[11px] font-semibold text-white">Keep going</Link></div></section></div>

    <section className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><StatCard icon="i-chat" color="#16A06B" value={conversations.length} title="Conversations" note={conversations.length ? "Keep exploring" : "Start your first chat"} /><StatCard icon="i-calendar" color="#8653DF" value={upcoming.length} title="Appointments" note="Upcoming" /><StatCard icon="i-shield" color="#F5A623" value={`${streak}d`} title="Activity streak" note={streak ? "Keep it up!" : "Begin today"} /><StatCard icon="i-sparkle" color="#4188E8" value={totalTopics} title="Topics explored" note={`${topicCounts.length} categories`} /></section>

    <section className="mt-5 grid gap-4 xl:grid-cols-[1.05fr_1.05fr_1fr]">
      <div className="rounded-2xl border border-line bg-white p-5 shadow-sm"><h2 className="text-sm font-bold">My Learning Journey</h2><p className="mt-2 text-[10px] text-ink-soft">Topics you&apos;ve explored</p>{topicCounts.length ? <div className="mt-6 flex items-center gap-6"><div className="relative flex h-36 w-36 shrink-0 items-center justify-center rounded-full" style={{ background: `conic-gradient(${topicCounts.map((item, index) => `${COLORS[index % COLORS.length]} ${topicCounts.slice(0, index).reduce((sum, entry) => sum + entry.count, 0) / totalTopics * 100}% ${(topicCounts.slice(0, index + 1).reduce((sum, entry) => sum + entry.count, 0) / totalTopics) * 100}%`).join(",")})` }}><div className="flex h-[92px] w-[92px] flex-col items-center justify-center rounded-full bg-white"><strong className="text-2xl">{totalTopics}</strong><span className="text-[10px] text-ink-soft">Explored</span></div></div><div className="min-w-0 flex-1 space-y-3">{topicCounts.slice(0, 6).map(({ topic, count }, index) => topic && <div key={topic.id} className="flex items-center gap-2 text-[10px]"><span className="h-2.5 w-2.5 rounded-full" style={{ background: COLORS[index % COLORS.length] }} /><span className="truncate">{language === "RW" ? topic.nameRw : topic.nameEn}</span><strong className="ml-auto">{count}</strong></div>)}</div></div> : <p className="mt-8 text-xs text-ink-soft">Your learning journey will appear after your first conversation.</p>}<Link href="/library" className="mt-6 inline-flex text-[11px] font-semibold text-teal-700">Explore more topics →</Link></div>
      <div className="rounded-2xl border border-line bg-white p-5 shadow-sm"><h2 className="text-sm font-bold">My Progress</h2><p className="mt-2 text-[10px] text-ink-soft">Your conversation activity over the last 7 days</p><div className="mt-8 flex h-44 items-end gap-3 border-b border-line px-2">{chart.map((item) => <div key={item.label} className="flex h-full flex-1 flex-col items-center justify-end"><span className="mb-1 text-[9px] font-semibold text-teal-700">{item.value || ""}</span><div className="w-full max-w-8 rounded-t-lg bg-[linear-gradient(#25A678,#BCE7D8)] transition-all" style={{ height: `${Math.max(4, item.value / maxChart * 80)}%` }} /><span className="mt-2 text-[9px] text-ink-soft">{item.label}</span></div>)}</div></div>
      <div className="rounded-2xl border border-line bg-white p-5 shadow-sm"><div className="flex justify-between"><h2 className="text-sm font-bold">My Achievements</h2><span className="text-[10px] text-teal-700">Based on your activity</span></div><div className="mt-3 divide-y divide-line">{achievements.map((item) => <div key={item.title} className={`flex items-center gap-3 py-4 ${item.unlocked ? "" : "opacity-45"}`}><span className="flex h-10 w-10 items-center justify-center rounded-xl text-white" style={{ background: item.color }}><svg width="18" height="18"><use href="#i-check" /></svg></span><div><strong className="text-xs">{item.title}</strong><p className="mt-1 text-[10px] text-ink-soft">{item.detail}</p></div><span className="ml-auto text-success">{item.unlocked ? "●" : "○"}</span></div>)}</div></div>
    </section>

    <section className="mt-4 grid gap-4 xl:grid-cols-[1.05fr_1.05fr_1fr]">
      <div className="rounded-2xl border border-line bg-white p-5 shadow-sm"><div className="flex justify-between"><h2 className="text-sm font-bold">Recent Conversations</h2><Link href="/chat" className="text-[10px] text-teal-700">View all</Link></div><div className="mt-3 divide-y divide-line">{conversations.slice(0, 4).map((item) => <Link href={`/chat?conversation=${item.id}`} key={item.id} className="flex items-center gap-3 py-3"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-coral-100 text-coral"><svg width="15" height="15"><use href={`#${item.topic?.icon ?? "i-chat"}`} /></svg></span><div className="min-w-0 flex-1"><p className="truncate text-[11px] font-medium">{item.firstUserMessage ?? "Conversation"}</p><p className="mt-1 text-[9px] text-ink-soft">{item.topic ? (language === "RW" ? item.topic.nameRw : item.topic.nameEn) : "General"} · {relativeTime(item.createdAt)}</p></div><span>›</span></Link>)}{!conversations.length && <p className="py-8 text-center text-xs text-ink-soft">No conversations yet.</p>}</div></div>
      <div className="rounded-2xl border border-line bg-white p-5 shadow-sm"><div className="flex justify-between"><h2 className="text-sm font-bold">Upcoming Appointments</h2><Link href="/appointments" className="text-[10px] text-teal-700">View all</Link></div><div className="mt-3 divide-y divide-line">{upcoming.slice(0, 3).map((item) => { const date = new Date(item.requestedTime); return <div key={item.id} className="flex items-center gap-3 py-3"><div className="rounded-lg border border-[#B6DCCF] bg-[#EFF9F6] px-2 py-1 text-center"><span className="block text-[8px] uppercase text-teal-700">{date.toLocaleDateString([], { month: "short" })}</span><strong className="text-base">{date.getDate()}</strong></div><div className="min-w-0"><p className="truncate text-[11px] font-medium">{item.professional.name}</p><p className="mt-1 text-[9px] text-ink-soft">{date.toLocaleString([], { weekday: "short", hour: "2-digit", minute: "2-digit" })}</p></div><span className="ml-auto rounded-full bg-teal-100 px-2 py-1 text-[8px] text-success">{item.status}</span></div>; })}{!upcoming.length && <p className="py-8 text-center text-xs text-ink-soft">No upcoming appointments.</p>}</div></div>
      <div className="rounded-2xl border border-line bg-white p-5 shadow-sm"><div className="flex justify-between"><h2 className="text-sm font-bold">Suggested for You</h2><Link href="/library" className="text-[10px] text-teal-700">View all</Link></div><div className="mt-3 divide-y divide-line">{suggestions.slice(0, 3).map((item) => <Link href="/chat" key={item.title} className="block py-3"><span className="text-[9px] font-semibold text-coral-dark">{item.tag}</span><p className="mt-1 text-[11px] font-medium">{item.title}</p><p className="mt-1 line-clamp-1 text-[9px] text-ink-soft">{item.body}</p></Link>)}</div><button onClick={() => setShowClear(true)} className="mt-4 text-[10px] font-semibold text-coral-dark">Clear conversation history</button></div>
    </section>

    <section className="mt-4 flex items-center rounded-2xl border border-coral-100 bg-[#FFF8F6] p-5"><span className="mr-4 flex h-11 w-11 items-center justify-center rounded-full bg-coral-100 text-coral"><svg width="22" height="22"><use href="#i-heart" /></svg></span><div><h2 className="text-sm font-bold">You&apos;re not alone</h2><p className="mt-1 text-[10px] text-ink-soft">If you ever need to talk to someone right away, help is available.</p></div><Link href="/facility-locator" className="ml-auto rounded-xl bg-coral px-5 py-3 text-[11px] font-semibold text-white">View Crisis Resources</Link></section>
    <ConfirmModal open={showClear} title="Clear history" message="Are you sure you want to clear all conversation history on this device?" confirmLabel="Clear" cancelLabel="Cancel" variant="danger" onConfirm={() => { setShowClear(false); void clearHistory().then(load).then(() => toast("History cleared", "success")); }} onCancel={() => setShowClear(false)} />
  </div></AppShell>;
}
