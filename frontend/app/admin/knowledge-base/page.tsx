"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { AdminShell } from "@/components/AdminShell";
import { createKbArticle, getKbArticles, getKbTopics, type KbArticle, type KbTopic } from "@/lib/adminApiClient";
import { useRequireAdmin } from "@/lib/useAdminAuth";

export default function KnowledgeBasePage() {
  const { admin, loading: authLoading } = useRequireAdmin("CONTENT_REVIEWER");
  const router = useRouter();
  const [topics, setTopics] = useState<KbTopic[]>([]);
  const [articlesByTopic, setArticlesByTopic] = useState<Record<string, KbArticle[]>>({});
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newArticle, setNewArticle] = useState({ topicId: "", titleEn: "", titleRw: "" });
  const [createError, setCreateError] = useState<string | null>(null);

  async function loadAll() {
    setLoading(true);
    const [topicList, articleList] = await Promise.all([getKbTopics(), getKbArticles()]);
    setTopics(topicList);
    const grouped: Record<string, KbArticle[]> = {};
    for (const article of articleList) {
      (grouped[article.topicId] ??= []).push(article);
    }
    setArticlesByTopic(grouped);
    setLoading(false);
    if (!newArticle.topicId && topicList.length > 0) {
      setNewArticle((prev) => ({ ...prev, topicId: topicList[0].id }));
    }
  }

  useEffect(() => {
    if (!admin) return;
    void loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [admin]);

  async function handleCreate() {
    if (!newArticle.topicId || !newArticle.titleEn.trim() || !newArticle.titleRw.trim()) {
      setCreateError("Pick a topic and fill in both titles.");
      return;
    }
    setCreateError(null);
    try {
      const article = await createKbArticle(newArticle);
      router.push(`/admin/knowledge-base/${article.id}`);
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Failed to create article");
    }
  }

  if (authLoading || !admin) return null;

  return (
    <AdminShell active="/admin/knowledge-base" admin={admin}>
      <div className="mb-[22px] flex items-center justify-between">
        <div>
          <h1 className="font-display text-[26px] text-teal-900">Knowledge Base</h1>
          <p className="mt-1 text-sm text-ink-soft">
            Articles grounding chat answers, grouped by topic. Both EN and RW bodies are required
            before an article can be marked Reviewed.
          </p>
        </div>
        <button
          onClick={() => setCreating((v) => !v)}
          className="inline-flex items-center gap-2 rounded-full bg-coral px-4 py-[9px] text-[13px] font-semibold text-white shadow-[0_8px_20px_rgba(232,115,92,0.35)]"
        >
          <svg width="15" height="15">
            <use href="#i-plus" />
          </svg>
          New article
        </button>
      </div>

      {creating && (
        <div className="mb-4 rounded-md border border-[rgba(22,48,44,0.05)] bg-white p-5 shadow-card">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <select
              className="rounded-[10px] border border-line bg-paper-2 px-3.5 py-2.5 text-sm"
              value={newArticle.topicId}
              onChange={(e) => setNewArticle({ ...newArticle, topicId: e.target.value })}
            >
              {topics.map((topic) => (
                <option key={topic.id} value={topic.id}>
                  {topic.nameEn}
                </option>
              ))}
            </select>
            <input
              className="rounded-[10px] border border-line bg-paper-2 px-3.5 py-2.5 text-sm"
              placeholder="Title (English)"
              value={newArticle.titleEn}
              onChange={(e) => setNewArticle({ ...newArticle, titleEn: e.target.value })}
            />
            <input
              className="rounded-[10px] border border-line bg-paper-2 px-3.5 py-2.5 text-sm"
              placeholder="Title (Kinyarwanda)"
              value={newArticle.titleRw}
              onChange={(e) => setNewArticle({ ...newArticle, titleRw: e.target.value })}
            />
          </div>
          {createError && <p className="mt-3 text-[13px] font-semibold text-danger">{createError}</p>}
          <div className="mt-4 flex gap-2.5">
            <button
              onClick={() => void handleCreate()}
              className="rounded-full bg-coral px-4 py-[9px] text-[13px] font-semibold text-white shadow-[0_8px_20px_rgba(232,115,92,0.35)]"
            >
              Create &amp; edit
            </button>
            <button
              onClick={() => setCreating(false)}
              className="rounded-full px-4 py-[9px] text-[13px] font-semibold text-ink-soft"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {loading && <p className="text-sm text-ink-soft">Loading…</p>}

      {!loading &&
        topics.map((topic) => (
          <div key={topic.id} className="mb-4 rounded-md border border-[rgba(22,48,44,0.05)] bg-white shadow-card">
            <div className="flex items-center justify-between border-b border-line px-5 py-[14px]">
              <div className="flex items-center gap-3.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-[11px] bg-teal-100 text-teal-700">
                  <svg width="18" height="18">
                    <use href={`#${topic.icon}`} />
                  </svg>
                </div>
                <div>
                  <div className="font-bold text-teal-900">{topic.nameEn}</div>
                  <div className="mt-[3px] text-[12.5px] text-ink-soft">
                    {topic.reviewedCount} / {topic.articleCount} reviewed
                  </div>
                </div>
              </div>
            </div>
            {(articlesByTopic[topic.id] ?? []).map((article) => (
              <Link
                key={article.id}
                href={`/admin/knowledge-base/${article.id}`}
                className="flex items-center justify-between border-b border-line px-5 py-[14px] last:border-b-0 hover:bg-paper-2"
              >
                <span className="text-sm font-semibold text-ink">{article.titleEn}</span>
                <span
                  className={`inline-flex items-center gap-1.5 text-[12.5px] font-semibold before:h-2 before:w-2 before:rounded-full before:content-[''] ${
                    article.status === "REVIEWED"
                      ? "text-[#1E7A5A] before:bg-[#2E9E76]"
                      : "text-[#8A5E1E] before:bg-gold"
                  }`}
                >
                  {article.status === "REVIEWED" ? "Reviewed" : "Needs review"}
                </span>
              </Link>
            ))}
          </div>
        ))}
    </AdminShell>
  );
}
