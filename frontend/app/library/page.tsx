"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { PageLayout } from "@/components/layout/PageLayout";
import { useLanguage } from "@/lib/LanguageContext";
import { NAV } from "@/lib/i18nCommon";
import { getPublicLibraryTopics, getPublicLibraryArticles, type PublicLibraryTopic, type PublicLibraryArticle } from "@/lib/apiClient";

const TOPIC_ICONS: Record<string, string> = {
  "menstrual-health": "i-droplet",
  pregnancy: "i-baby",
  relationships: "i-heart",
  "family-planning": "i-pill",
  "hiv-stis": "i-shield",
  "mental-health": "i-mind",
};

const TOPIC_BG: Record<string, string> = {
  "menstrual-health": "bg-coral-100",
  pregnancy: "bg-gold-100",
  relationships: "bg-teal-100",
  "family-planning": "bg-coral-100",
  "hiv-stis": "bg-teal-100",
  "mental-health": "bg-gold-100",
};

const TOPIC_FG: Record<string, string> = {
  "menstrual-health": "text-coral-dark",
  pregnancy: "text-[#8A5E1E]",
  relationships: "text-teal-700",
  "family-planning": "text-coral-dark",
  "hiv-stis": "text-teal-700",
  "mental-health": "text-[#8A5E1E]",
};

function getBodyPreview(text: string, maxLen = 180): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, text.lastIndexOf(" ", maxLen)) + "…";
}

export default function LibraryPage() {
  const { language } = useLanguage();
  const nav = NAV[language];
  const [topics, setTopics] = useState<PublicLibraryTopic[]>([]);
  const [articles, setArticles] = useState<PublicLibraryArticle[]>([]);
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [fetchedTopics, fetchedArticles] = await Promise.all([
          getPublicLibraryTopics(),
          getPublicLibraryArticles(language),
        ]);
        if (!cancelled) {
          setTopics(fetchedTopics);
          setArticles(fetchedArticles);
        }
      } catch {
        // silent
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => { cancelled = true; };
  }, [language]);

  const filtered = selectedTopicId ? articles.filter((a) => a.topicId === selectedTopicId) : articles;
  const selectedTopic = topics.find((t) => t.id === selectedTopicId);

  return (
    <PageLayout
      activeHref="/library"
      navItems={[
        { href: "/chat", label: nav.chat },
        { href: "/about", label: "About" },
        { href: "/services", label: "Services" },
        { href: "/library", label: "Library" },
        { href: "/faq", label: "FAQ" },
      ]}
    >
      <section className="animate-slide-up py-[76px]">
        <span className="block font-mono text-[12.5px] font-medium uppercase tracking-[0.12em] text-coral-dark">Library</span>
        <h1 className="mt-3 font-display text-[52px] leading-[1.06] text-teal-900">Health Education Library</h1>
        <p className="mt-5 max-w-[560px] text-[17.5px] leading-[1.6] text-ink-soft">
          Explore evidence-based articles on the topics young people ask about most. Each topic includes reviewed content from healthcare professionals.
        </p>
      </section>

      <section className="pb-8">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedTopicId(null)}
            className={`rounded-full px-4 py-2 text-[13px] font-semibold transition-all duration-150 ${!selectedTopicId ? "bg-teal-700 text-white" : "bg-teal-100 text-teal-700 hover:bg-teal-200"}`}
          >
            All Topics
          </button>
          {topics.map((topic) => (
            <button
              key={topic.id}
              onClick={() => setSelectedTopicId(topic.id)}
              className={`rounded-full px-4 py-2 text-[13px] font-semibold transition-all duration-150 ${selectedTopicId === topic.id ? "bg-teal-700 text-white" : "bg-teal-100 text-teal-700 hover:bg-teal-200"}`}
            >
              {topic[`name${language}` as keyof typeof topic] as string || topic.nameEn} ({topic.articleCount})
            </button>
          ))}
        </div>
      </section>

      <section className="pb-16">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-200 border-t-teal-700" />
          </div>
        ) : (
          <>
            {filtered.length === 0 && (
              <div className="rounded-xl bg-teal-100 p-8 text-center">
                <p className="text-[15px] font-semibold text-teal-700">
                  {selectedTopic
                    ? `No articles available for "${selectedTopic.nameEn}" in the selected language yet.`
                    : "No reviewed articles available yet. Check back soon!"}
                </p>
              </div>
            )}
            <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((article) => {
                const topic = topics.find((t) => t.id === article.topicId);
                const slug = topic?.slug ?? "";
                return (
                  <Link
                    key={article.id}
                    href={`/chat?topic=${slug}`}
                    className="group flex cursor-pointer flex-col gap-[14px] rounded-md border border-[rgba(22,48,44,0.05)] bg-white p-[26px] shadow-card transition-all duration-150 hover:-translate-y-1 hover:shadow-soft"
                  >
                    <div className={`flex h-[46px] w-[46px] items-center justify-center rounded-[14px] ${TOPIC_BG[slug] ?? "bg-teal-100"} ${TOPIC_FG[slug] ?? "text-teal-700"}`}>
                      <svg width="22" height="22"><use href={`#${TOPIC_ICONS[slug] ?? "i-book"}`} /></svg>
                    </div>
                    <h3 className="text-lg font-bold text-teal-900">{article.title}</h3>
                    <p className="flex-1 text-[13.5px] leading-[1.5] text-ink-soft">{getBodyPreview(article.body)}</p>
                    <span className="mt-auto flex items-center gap-1.5 text-[13px] font-bold text-coral-dark group-hover:gap-2 transition-all duration-150">
                      Read article
                      <svg width="13" height="13"><use href="#i-arrow" /></svg>
                    </span>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </section>

      <section className="pb-16">
        <div className="rounded-md border border-[rgba(22,48,44,0.05)] bg-gold-100 p-5 text-center text-[13px] leading-[1.6] text-[#8A5E1E]">
          All content in this library has been reviewed by healthcare professionals. This information is for educational purposes and is not a substitute for professional medical advice.
        </div>
      </section>
    </PageLayout>
  );
}
