"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { PageLayout } from "@/components/layout/PageLayout";
import { ResourceCard } from "@/components/healthEducation/ResourceCard";
import { useLanguage } from "@/lib/LanguageContext";
import { NAV } from "@/lib/i18nCommon";
import {
  getPublicLibraryTopics,
  getPublicLibraryArticles,
  type PublicLibraryTopic,
  type PublicLibraryArticle,
  getHealthEducationFilters,
  getPublicHealthEducationResources,
  type HealthEducationFilters,
  type HealthEducationResourceSummary,
  type HealthEducationSort,
} from "@/lib/apiClient";

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

const SORT_LABELS: Record<HealthEducationSort, string> = {
  newest: "Newest first",
  oldest: "Oldest first",
  alpha: "Alphabetical",
};

function getBodyPreview(text: string, maxLen = 180): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, text.lastIndexOf(" ", maxLen)) + "…";
}

type Tab = "articles" | "resources";

export default function LibraryPage() {
  const { language } = useLanguage();
  const nav = NAV[language];
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<Tab>(searchParams.get("tab") === "resources" ? "resources" : "articles");

  // --- Articles (Knowledge Base) ---
  const [topics, setTopics] = useState<PublicLibraryTopic[]>([]);
  const [articles, setArticles] = useState<PublicLibraryArticle[]>([]);
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [articlesLoading, setArticlesLoading] = useState(true);

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
        if (!cancelled) setArticlesLoading(false);
      }
    }
    void load();
    return () => { cancelled = true; };
  }, [language]);

  const filteredArticles = selectedTopicId ? articles.filter((a) => a.topicId === selectedTopicId) : articles;
  const selectedTopic = topics.find((t) => t.id === selectedTopicId);

  // --- Resources (Health Education Library) ---
  const [filters, setFilters] = useState<HealthEducationFilters | null>(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [resourceTopic, setResourceTopic] = useState<string | null>(null);
  const [fileType, setFileType] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sort, setSort] = useState<HealthEducationSort>("newest");
  const [view, setView] = useState<"grid" | "list">("grid");

  const [resources, setResources] = useState<HealthEducationResourceSummary[]>([]);
  const [resPage, setResPage] = useState(1);
  const [resPageCount, setResPageCount] = useState(1);
  const [resTotal, setResTotal] = useState(0);
  const [resourcesLoading, setResourcesLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    void getHealthEducationFilters().then(setFilters).catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;
    setResourcesLoading(true);
    setResPage(1);
    getPublicHealthEducationResources({
      search: search || undefined,
      category: category ?? undefined,
      topic: resourceTopic ?? undefined,
      fileType: fileType ?? undefined,
      tags: selectedTags.length ? selectedTags : undefined,
      sort,
      page: 1,
      limit: 12,
    })
      .then((data) => {
        if (cancelled) return;
        setResources(data.resources);
        setResPageCount(data.pageCount);
        setResTotal(data.total);
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setResourcesLoading(false); });
    return () => { cancelled = true; };
  }, [search, category, resourceTopic, fileType, selectedTags, sort]);

  async function loadMoreResources() {
    setLoadingMore(true);
    try {
      const nextPage = resPage + 1;
      const data = await getPublicHealthEducationResources({
        search: search || undefined,
        category: category ?? undefined,
        topic: resourceTopic ?? undefined,
        fileType: fileType ?? undefined,
        tags: selectedTags.length ? selectedTags : undefined,
        sort,
        page: nextPage,
        limit: 12,
      });
      setResources((prev) => [...prev, ...data.resources]);
      setResPage(nextPage);
    } catch {
      // silent
    } finally {
      setLoadingMore(false);
    }
  }

  function toggleTag(tag: string) {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  }

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
          Explore evidence-based articles, plus downloadable guides, videos, and files, on the topics young people ask about most.
        </p>
      </section>

      <section className="pb-6">
        <div className="inline-flex rounded-full border border-line bg-white p-1">
          <button
            onClick={() => setTab("articles")}
            className={`rounded-full px-5 py-2 text-[13.5px] font-semibold transition-all duration-150 ${tab === "articles" ? "bg-teal-700 text-white" : "text-ink-soft hover:bg-paper-2"}`}
          >
            Articles
          </button>
          <button
            onClick={() => setTab("resources")}
            className={`rounded-full px-5 py-2 text-[13.5px] font-semibold transition-all duration-150 ${tab === "resources" ? "bg-teal-700 text-white" : "text-ink-soft hover:bg-paper-2"}`}
          >
            Resources
          </button>
        </div>
      </section>

      {tab === "articles" && (
        <>
          <section className="pb-8">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedTopicId(null)}
                className={`rounded-full px-4 py-2 text-[13px] font-semibold transition-all duration-150 ${!selectedTopicId ? "bg-teal-700 text-white" : "bg-teal-100 text-teal-700 hover:bg-teal-200"}`}
              >
                All Topics
              </button>
              {topics.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTopicId(t.id)}
                  className={`rounded-full px-4 py-2 text-[13px] font-semibold transition-all duration-150 ${selectedTopicId === t.id ? "bg-teal-700 text-white" : "bg-teal-100 text-teal-700 hover:bg-teal-200"}`}
                >
                  {t[`name${language}` as keyof typeof t] as string || t.nameEn} ({t.articleCount})
                </button>
              ))}
            </div>
          </section>

          <section className="pb-16">
            {articlesLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-200 border-t-teal-700" />
              </div>
            ) : (
              <>
                {filteredArticles.length === 0 && (
                  <div className="rounded-xl bg-teal-100 p-8 text-center">
                    <p className="text-[15px] font-semibold text-teal-700">
                      {selectedTopic
                        ? `No articles available for "${selectedTopic.nameEn}" in the selected language yet.`
                        : "No reviewed articles available yet. Check back soon!"}
                    </p>
                  </div>
                )}
                <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-2 lg:grid-cols-3">
                  {filteredArticles.map((article) => {
                    const articleTopic = topics.find((t) => t.id === article.topicId);
                    const slug = articleTopic?.slug ?? "";
                    return (
                      <a
                        key={article.id}
                        href={`/library/${article.id}`}
                        className="group flex cursor-pointer flex-col gap-[14px] card p-6 transition-all duration-150 hover:-translate-y-1 hover:shadow-soft"
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
                      </a>
                    );
                  })}
                </div>
              </>
            )}
          </section>

          <section className="pb-16">
            <div className="rounded-xl bg-gold-100 p-5 text-center text-[13px] leading-[1.6] text-[#8A5E1E]">
              All content in this library has been reviewed by healthcare professionals. This information is for educational purposes and is not a substitute for professional medical advice.
            </div>
          </section>
        </>
      )}

      {tab === "resources" && (
        <>
          <section className="pb-8">
            <div className="flex flex-wrap items-center gap-2.5">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search resources…"
                className="min-w-[220px] flex-1 rounded-full border border-line bg-white px-4 py-2.5 text-[13.5px]"
              />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as HealthEducationSort)}
                className="rounded-full border border-line bg-white px-4 py-2.5 text-[13px] font-semibold text-ink-soft"
              >
                {Object.entries(SORT_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
              <div className="flex overflow-hidden rounded-full border border-line">
                <button
                  onClick={() => setView("grid")}
                  className={`px-3.5 py-2.5 text-[13px] font-semibold ${view === "grid" ? "bg-teal-700 text-white" : "text-ink-soft hover:bg-paper-2"}`}
                >
                  Grid
                </button>
                <button
                  onClick={() => setView("list")}
                  className={`px-3.5 py-2.5 text-[13px] font-semibold ${view === "list" ? "bg-teal-700 text-white" : "text-ink-soft hover:bg-paper-2"}`}
                >
                  List
                </button>
              </div>
            </div>

            {filters && (
              <div className="mt-4 flex flex-col gap-2.5">
                {filters.categories.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    <button onClick={() => setCategory(null)} className={`rounded-full px-3.5 py-1.5 text-[12.5px] font-semibold ${!category ? "bg-teal-700 text-white" : "bg-teal-100 text-teal-700"}`}>
                      All categories
                    </button>
                    {filters.categories.map((c) => (
                      <button key={c} onClick={() => setCategory(c)} className={`rounded-full px-3.5 py-1.5 text-[12.5px] font-semibold ${category === c ? "bg-teal-700 text-white" : "bg-teal-100 text-teal-700 hover:bg-teal-200"}`}>
                        {c}
                      </button>
                    ))}
                  </div>
                )}
                {filters.topics.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    <button onClick={() => setResourceTopic(null)} className={`rounded-full px-3.5 py-1.5 text-[12px] font-semibold ${!resourceTopic ? "bg-coral text-white" : "bg-coral-100 text-coral-dark"}`}>
                      All topics
                    </button>
                    {filters.topics.map((t) => (
                      <button key={t} onClick={() => setResourceTopic(t)} className={`rounded-full px-3.5 py-1.5 text-[12px] font-semibold ${resourceTopic === t ? "bg-coral text-white" : "bg-coral-100 text-coral-dark hover:bg-coral-100/70"}`}>
                        {t}
                      </button>
                    ))}
                  </div>
                )}
                {filters.fileTypes.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    <button onClick={() => setFileType(null)} className={`rounded-[var(--radius-sm)] px-3 py-1 text-[11.5px] font-bold ${!fileType ? "bg-ink text-white" : "bg-paper-2 text-ink-soft"}`}>
                      All file types
                    </button>
                    {filters.fileTypes.map((ft) => (
                      <button key={ft} onClick={() => setFileType(ft.toLowerCase())} className={`rounded-[var(--radius-sm)] px-3 py-1 text-[11.5px] font-bold ${fileType === ft.toLowerCase() ? "bg-ink text-white" : "bg-paper-2 text-ink-soft hover:bg-paper"}`}>
                        {ft}
                      </button>
                    ))}
                  </div>
                )}
                {filters.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {filters.tags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className={`rounded-full border px-3 py-1 text-[11.5px] font-semibold ${selectedTags.includes(tag) ? "border-teal-700 bg-teal-700 text-white" : "border-line text-ink-soft hover:bg-paper-2"}`}
                      >
                        #{tag}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </section>

          <section className="pb-16">
            {resourcesLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-200 border-t-teal-700" />
              </div>
            ) : (
              <>
                {resources.length === 0 && (
                  <div className="rounded-xl bg-teal-100 p-8 text-center">
                    <p className="text-[15px] font-semibold text-teal-700">No resources match these filters yet.</p>
                  </div>
                )}
                <p className="mb-4 text-[12.5px] text-ink-soft">{resTotal} resource{resTotal === 1 ? "" : "s"}</p>
                <div className={view === "grid" ? "grid grid-cols-1 gap-[18px] sm:grid-cols-2 lg:grid-cols-3" : "flex flex-col gap-4"}>
                  {resources.map((resource) => (
                    <ResourceCard key={resource.id} resource={resource} viewHref={`/resources/${resource.id}`} layout={view} />
                  ))}
                </div>
                {resPage < resPageCount && (
                  <div className="mt-8 flex justify-center">
                    <button
                      onClick={() => void loadMoreResources()}
                      disabled={loadingMore}
                      className="rounded-full border-[1.5px] border-teal-700 px-6 py-2.5 text-[13.5px] font-semibold text-teal-700 transition hover:bg-teal-100 disabled:opacity-50"
                    >
                      {loadingMore ? "Loading…" : "Load more"}
                    </button>
                  </div>
                )}
              </>
            )}
          </section>
        </>
      )}
    </PageLayout>
  );
}
