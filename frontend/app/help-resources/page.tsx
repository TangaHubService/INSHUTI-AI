"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { AppShell } from "@/components/AppShell";
import { FullPageLoading, PageLoading } from "@/components/Spinner";
import { getCrisisResources, getPublicLibraryArticles, getPublicLibraryTopics, type CrisisResource, type PublicLibraryArticle, type PublicLibraryTopic } from "@/lib/apiClient";
import { useLanguage } from "@/lib/LanguageContext";
import { useRequireUser } from "@/lib/useUserAuth";
import { useToast } from "@/lib/useToast";

const ACTIONS = [
  { icon: "i-shield", color: "#19996C", title: "Crisis Resources", body: "Get immediate help in urgent situations.", href: "#crisis", cta: "View resources" },
  { icon: "i-book", color: "#8254E8", title: "Health Topics", body: "Learn about health, relationships, and more.", href: "/library", cta: "Explore topics" },
  { icon: "i-file", color: "#F0A01E", title: "FAQs", body: "Find answers to common questions.", href: "/faq", cta: "View FAQs" },
  { icon: "i-phone", color: "#3986D7", title: "Contact Support", body: "Talk to our support team.", href: "/contact", cta: "Contact us" },
];

function topicName(topic: PublicLibraryTopic, language: string) {
  if (language === "RW") return topic.nameRw;
  if (language === "FR") return topic.nameFr;
  if (language === "SW") return topic.nameSw;
  return topic.nameEn;
}

export default function HelpResourcesPage() {
  const { user, loading: authLoading } = useRequireUser();
  const { language } = useLanguage();
  const { toast } = useToast();
  const [topics, setTopics] = useState<PublicLibraryTopic[]>([]);
  const [articles, setArticles] = useState<PublicLibraryArticle[]>([]);
  const [resources, setResources] = useState<CrisisResource[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    Promise.all([getPublicLibraryTopics(), getPublicLibraryArticles(language), getCrisisResources()])
      .then(([loadedTopics, loadedArticles, loadedResources]) => { setTopics(loadedTopics); setArticles(loadedArticles); setResources(loadedResources); })
      .catch(() => toast("Could not load help resources", "error"))
      .finally(() => setLoading(false));
  }, [language, toast, user]);

  const visibleArticles = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return articles.slice(0, 4);
    return articles.filter((article) => `${article.title} ${article.body} ${article.tags.join(" ")}`.toLowerCase().includes(normalized)).slice(0, 8);
  }, [articles, query]);

  if (authLoading || !user) return <FullPageLoading />;

  return <AppShell active="/help-resources" session={{ kind: "user", user }}><div className="mx-auto max-w-[1120px] pb-12">
    <header><h1 className="text-[32px] font-bold">Help & Resources</h1><p className="mt-1 text-sm text-ink-soft">We&apos;re here to support you with trusted information and help.</p></header>

    <section className="mt-5 flex min-h-[180px] flex-col items-center gap-6 rounded-2xl border border-[#D8E5F0] bg-[linear-gradient(110deg,#F5FBF9,#EEF6FF)] p-6 md:flex-row"><span className="flex h-28 w-28 shrink-0 items-center justify-center rounded-full bg-coral-100 text-6xl">👋🏾</span><div className="flex-1"><h2 className="text-xl font-bold">How can we help you today?</h2><p className="mt-2 text-xs text-ink-soft">Explore resources, find answers, or talk to someone you trust.</p><div className="relative mt-5"><svg width="17" height="17" className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft"><use href="#i-search" /></svg><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search for help topics, resources…" className="h-12 w-full rounded-xl border border-line bg-white pl-11 pr-4 text-xs outline-none focus:border-teal-600" /></div></div></section>

    <section className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{ACTIONS.map((item) => <Link key={item.title} href={item.href} className="rounded-2xl border border-line bg-white p-5 text-center shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"><span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full" style={{ background: `${item.color}15`, color: item.color }}><svg width="26" height="26"><use href={`#${item.icon}`} /></svg></span><h3 className="mt-4 text-xs font-bold">{item.title}</h3><p className="mt-2 min-h-9 text-[10px] leading-4 text-ink-soft">{item.body}</p><span className="mt-4 inline-flex text-[10px] font-semibold text-teal-700">{item.cta} →</span></Link>)}</section>

    <section id="crisis" className="mt-5 rounded-2xl border border-coral-100 bg-[#FFF6F5] p-5"><div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center"><span className="flex h-12 w-12 items-center justify-center rounded-full bg-coral-100 text-coral"><svg width="24" height="24"><use href="#i-heart" /></svg></span><div className="flex-1"><h2 className="text-sm font-bold">In an emergency?</h2><p className="mt-1 text-[10px] text-ink-soft">If you or someone you know is in immediate danger, please reach out right away.</p>{resources.length > 0 && <p className="mt-2 text-[10px] font-medium text-coral-dark">{resources.slice(0, 2).map((resource) => `${resource.name}: ${resource.contact}`).join(" · ")}</p>}</div><Link href="/facility-locator" className="rounded-xl bg-coral px-6 py-3 text-[11px] font-semibold text-white">View Crisis Resources</Link></div></section>

    {loading ? <PageLoading /> : <><section className="mt-5 rounded-2xl border border-line bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><h2 className="text-sm font-bold">Popular topics</h2><Link href="/library" className="text-[10px] font-semibold text-teal-700">View all topics →</Link></div><div className="mt-4 flex flex-wrap gap-2">{topics.slice(0, 8).map((topic) => <Link href={`/library?topic=${topic.id}`} key={topic.id} className="inline-flex items-center gap-2 rounded-full bg-paper-2 px-4 py-2 text-[10px] font-medium"><svg width="14" height="14"><use href={`#${topic.icon}`} /></svg>{topicName(topic, language)}</Link>)}</div></section>

    <section className="mt-5 grid gap-4 lg:grid-cols-[1fr_280px]"><div className="rounded-2xl border border-line bg-white p-5 shadow-sm"><h2 className="text-sm font-bold">{query ? "Search results" : "Featured articles"}</h2><div className="mt-3 divide-y divide-line">{visibleArticles.map((article) => <Link href={`/library/${article.id}`} key={article.id} className="flex items-center gap-3 py-3"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#F1EEFF] text-[#8254E8]"><svg width="16" height="16"><use href="#i-file" /></svg></span><div className="min-w-0 flex-1"><p className="truncate text-[11px] font-semibold">{article.title}</p><p className="mt-1 truncate text-[9px] text-ink-soft">{article.topic.nameEn}</p></div><span className="text-ink-soft">›</span></Link>)}{visibleArticles.length === 0 && <div className="py-8 text-center"><p className="text-xs font-semibold">No matching resources</p><p className="mt-2 text-[10px] text-ink-soft">Try a broader search or browse all health topics.</p></div>}</div></div><div className="rounded-2xl border border-[#E3DDF6] bg-[linear-gradient(145deg,#F9F6FF,#F0FAF7)] p-5"><h2 className="text-sm font-bold">Need to talk?</h2><div className="my-5 flex justify-center text-5xl">👩🏾‍⚕️</div><p className="text-[10px] leading-4 text-ink-soft">Our team is here to listen and support you confidentially.</p><Link href="/chat" className="mt-5 block rounded-xl bg-teal-700 px-4 py-3 text-center text-[10px] font-semibold text-white">Chat with Inshuti</Link></div></section></>}

    <section className="mt-5 flex items-center gap-4 rounded-2xl border border-[#E4DDF9] bg-[#F6F2FF] p-5"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E9E0FF] text-[#8254E8]"><svg width="18" height="18"><use href="#i-shield" /></svg></span><div><h2 className="text-xs font-bold">You&apos;re not alone.</h2><p className="mt-1 text-[10px] text-ink-soft">Inshuti is here to support you every step of the way.</p></div></section>
  </div></AppShell>;
}
