"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { PageLayout } from "@/components/layout/PageLayout";
import { useLanguage } from "@/lib/LanguageContext";
import { NAV } from "@/lib/i18nCommon";
import { getPublicLibraryArticle, type PublicLibraryArticle } from "@/lib/apiClient";

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

export default function ArticleDetailPage() {
  const { language } = useLanguage();
  const nav = NAV[language];
  const params = useParams();
  const id = params.id as string;

  const [article, setArticle] = useState<PublicLibraryArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const fetched = await getPublicLibraryArticle(id, language);
        if (!cancelled) setArticle(fetched);
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => { cancelled = true; };
  }, [id, language]);

  const topic = article?.topic;

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
      {loading ? (
        <div className="flex items-center justify-center py-40">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-200 border-t-teal-700" />
        </div>
      ) : error || !article ? (
        <section className="animate-slide-up py-[76px]">
          <Link href="/library" className="mb-6 inline-flex items-center gap-1.5 text-[13px] font-bold text-coral-dark">
            <svg width="13" height="13"><use href="#i-arrow" /></svg>
            Back to Library
          </Link>
          <div className="rounded-xl bg-teal-100 p-8 text-center">
            <p className="text-[15px] font-semibold text-teal-700">
              Article not found or unavailable in the selected language.
            </p>
          </div>
        </section>
      ) : (
        <section className="animate-slide-up py-[76px]">
          <Link href="/library" className="mb-6 inline-flex items-center gap-1.5 text-[13px] font-bold text-coral-dark hover:gap-2 transition-all duration-150">
            <svg width="13" height="13" className="rotate-180"><use href="#i-arrow" /></svg>
            Back to Library
          </Link>

          {topic && (
            <div className={`mb-6 flex h-[46px] w-[46px] items-center justify-center rounded-[14px] ${TOPIC_BG[topic.slug] ?? "bg-teal-100"} ${TOPIC_FG[topic.slug] ?? "text-teal-700"}`}>
              <svg width="22" height="22"><use href={`#${TOPIC_ICONS[topic.slug] ?? "i-book"}`} /></svg>
            </div>
          )}

          <h1 className="font-display text-[42px] leading-[1.06] text-teal-900">
            {article.title}
          </h1>

          {topic && (
            <p className="mt-4 text-[15px] font-semibold text-ink-soft">
              {topic.nameEn}
            </p>
          )}

          <div className="prose-custom mt-8 max-w-none text-[17.5px] leading-[1.8] text-ink-soft">
            {article.body.split("\n").map((paragraph, i) => (
              paragraph.trim() ? (
                <p key={i} className="mb-5">{paragraph}</p>
              ) : null
            ))}
          </div>

          {article.externalUrl && (
            <div className="mt-10">
              <a
                href={article.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full bg-teal-700 px-6 py-3 text-[14px] font-bold text-white transition-all duration-150 hover:bg-teal-800"
              >
                View external source
                <svg width="14" height="14"><use href="#i-arrow" /></svg>
              </a>
            </div>
          )}

          <div className="mt-10 flex items-center gap-3 text-[12.5px] text-ink-soft">
            {article.reviewedAt && (
              <span>Reviewed {new Date(article.reviewedAt).toLocaleDateString()}</span>
            )}
            <span>Updated {new Date(article.updatedAt).toLocaleDateString()}</span>
          </div>
        </section>
      )}
    </PageLayout>
  );
}
