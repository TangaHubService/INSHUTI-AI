"use client";

import { useCallback, useEffect, useState } from "react";

import { AppShell } from "@/components/AppShell";
import { Drawer } from "@/components/Drawer";
import { PageLoading } from "@/components/Spinner";
import { useRequireAdmin } from "@/lib/useAdminAuth";
import { useToast } from "@/lib/useToast";
import {
  createKbArticle,
  getKbArticle,
  getKbArticles,
  getKbTopics,
  updateKbArticle,
  type ArticleStatus,
  type KbArticle,
  type KbTopic,
} from "@/lib/adminApiClient";

export default function KnowledgeBasePage() {
  const { admin, loading: authLoading } = useRequireAdmin("CONTENT_REVIEWER");
  const { toast } = useToast();
  const [topics, setTopics] = useState<KbTopic[]>([]);
  const [articlesByTopic, setArticlesByTopic] = useState<Record<string, KbArticle[]>>({});
  const [loading, setLoading] = useState(true);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [article, setArticle] = useState<KbArticle | null>(null);
  const [lang, setLang] = useState<"EN" | "RW" | "FR" | "SW">("EN");
  const [titleEn, setTitleEn] = useState("");
  const [titleRw, setTitleRw] = useState("");
  const [bodyEn, setBodyEn] = useState("");
  const [bodyRw, setBodyRw] = useState("");
  const [titleFr, setTitleFr] = useState("");
  const [titleSw, setTitleSw] = useState("");
  const [bodyFr, setBodyFr] = useState("");
  const [bodySw, setBodySw] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [saving, setSaving] = useState(false);

  const [newDrawerOpen, setNewDrawerOpen] = useState(false);
  const [newArticle, setNewArticle] = useState({ topicId: "", titleEn: "", titleRw: "", titleFr: "", titleSw: "" });
  const [newArticleErrors, setNewArticleErrors] = useState<{ titleEn?: string; titleRw?: string }>({});

  async function loadAll() {
    setLoading(true);
    const [topicList, articleList] = await Promise.all([getKbTopics(), getKbArticles()]);
    setTopics(topicList);
    const grouped: Record<string, KbArticle[]> = {};
    for (const a of articleList) {
      (grouped[a.topicId] ??= []).push(a);
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
  }, [admin]);

  const openEditor = useCallback(async (id: string) => {
    setEditingId(id);
    setDrawerOpen(true);
    setDrawerLoading(true);
    try {
      const a = await getKbArticle(id);
      setArticle(a);
      setTitleEn(a.titleEn);
      setTitleRw(a.titleRw);
      setBodyEn(a.bodyEn);
      setBodyRw(a.bodyRw);
      setTitleFr(a.titleFr ?? "");
      setTitleSw(a.titleSw ?? "");
      setBodyFr(a.bodyFr ?? "");
      setBodySw(a.bodySw ?? "");
      setTagsInput(a.tags.join(", "));
    } catch {
      toast("Failed to load article", "error");
    } finally {
      setDrawerLoading(false);
    }
  }, [toast]);

  function closeDrawer() {
    setDrawerOpen(false);
    setEditingId(null);
    setArticle(null);
    setTitleFr("");
    setTitleSw("");
    setBodyFr("");
    setBodySw("");
  }

  async function save(status?: ArticleStatus) {
    if (!editingId) return;
    if (status === "REVIEWED" && (!titleEn.trim() || !bodyEn.trim() || !titleRw.trim() || !bodyRw.trim())) {
      toast("English and Kinyarwanda title and body are required before marking an article reviewed.", "error");
      return;
    }
    setSaving(true);
    try {
      const tags = tagsInput.split(",").map((t) => t.trim()).filter(Boolean);
      const updated = await updateKbArticle(editingId, {
        titleEn, titleRw, titleFr, titleSw, bodyEn, bodyRw, bodyFr, bodySw, tags, ...(status ? { status } : {}),
      });
      setArticle(updated);
      toast(status === "REVIEWED" ? "Article reviewed and published" : "Draft saved", "success");
      void loadAll();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to save", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleCreate() {
    const next: typeof newArticleErrors = {};
    if (!newArticle.titleEn.trim()) next.titleEn = "Required";
    if (!newArticle.titleRw.trim()) next.titleRw = "Required";
    setNewArticleErrors(next);
    if (!newArticle.topicId || Object.keys(next).length > 0) {
      toast("Pick a topic and fill in both titles.", "error");
      return;
    }
    try {
      const a = await createKbArticle(newArticle);
      setNewDrawerOpen(false);
      setNewArticle({ topicId: topics[0]?.id ?? "", titleEn: "", titleRw: "", titleFr: "", titleSw: "" });
      setNewArticleErrors({});
      toast("Article created", "success");
      void loadAll();
      void openEditor(a.id);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to create article", "error");
    }
  }

  function openNewArticle() {
    setNewArticle({ topicId: topics[0]?.id ?? "", titleEn: "", titleRw: "", titleFr: "", titleSw: "" });
    setNewArticleErrors({});
    setNewDrawerOpen(true);
  }

  if (authLoading || !admin) return null;

  return (
    <AppShell active="/admin/knowledge-base" session={{ kind: "admin", admin }}>
      <div className="mb-[22px] flex items-center justify-between">
        <div>
          <h1 className="font-display text-[26px] text-teal-900">Knowledge Base</h1>
          <p className="mt-1 text-sm text-ink-soft">
            Articles grounding chat answers, grouped by topic.
          </p>
        </div>
        <button
          onClick={openNewArticle}
          className="inline-flex items-center gap-2 rounded-full bg-coral px-4 py-[9px] text-[13px] font-semibold text-white shadow-[0_8px_20px_rgba(232,115,92,0.35)]"
        >
          <svg width="15" height="15"><use href="#i-plus" /></svg>
          New article
        </button>
      </div>

      {loading && <PageLoading />}

      {!loading && topics.map((topic) => (
        <div key={topic.id} className="mb-4 rounded-md border border-[rgba(22,48,44,0.05)] bg-white shadow-card">
          <div className="flex items-center justify-between border-b border-line px-5 py-[14px]">
            <div className="flex items-center gap-3.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-[11px] bg-teal-100 text-teal-700">
                <svg width="18" height="18"><use href={`#${topic.icon}`} /></svg>
              </div>
              <div>
                <div className="font-bold text-teal-900">{topic.nameEn}</div>
                <div className="mt-[3px] text-[12.5px] text-ink-soft">{topic.reviewedCount} / {topic.articleCount} reviewed</div>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[13.5px]">
              <tbody>
                {(articlesByTopic[topic.id] ?? []).length === 0 && (
                  <tr><td className="px-5 py-4 text-ink-soft">No articles in this topic yet.</td></tr>
                )}
                {(articlesByTopic[topic.id] ?? []).map((article) => (
                  <tr
                    key={article.id}
                    onClick={() => void openEditor(article.id)}
                    className="cursor-pointer border-b border-line last:border-b-0 hover:bg-paper-2"
                  >
                    <td className="px-5 py-[14px] font-semibold text-ink">{article.titleEn}</td>
                    <td className="px-5 py-[14px] text-right">
                      <span className={`inline-flex items-center gap-1.5 text-[12.5px] font-semibold before:h-2 before:w-2 before:rounded-full before:content-[''] ${article.status === "REVIEWED" ? "text-[#1E7A5A] before:bg-[#2E9E76]" : "text-[#8A5E1E] before:bg-gold"}`}>
                        {article.status === "REVIEWED" ? "Reviewed" : "Needs review"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      <Drawer open={newDrawerOpen} onClose={() => setNewDrawerOpen(false)} title="New Article">
        <div className="flex flex-col gap-4">
          <label className="text-[12.5px] font-bold text-ink-soft">Topic</label>
          <select className="rounded-[10px] border border-line bg-white px-[14px] py-3 text-sm" value={newArticle.topicId} onChange={(e) => setNewArticle({ ...newArticle, topicId: e.target.value })}>
            {topics.map((t) => <option key={t.id} value={t.id}>{t.nameEn}</option>)}
          </select>

          <label className="text-[12.5px] font-bold text-ink-soft">Title (English)</label>
          <input className={`rounded-[10px] border bg-white px-[14px] py-3 text-sm ${newArticleErrors.titleEn ? "border-danger" : "border-line"}`} value={newArticle.titleEn} onChange={(e) => setNewArticle({ ...newArticle, titleEn: e.target.value })} />

          <label className="text-[12.5px] font-bold text-ink-soft">Title (Kinyarwanda)</label>
          <input className={`rounded-[10px] border bg-white px-[14px] py-3 text-sm ${newArticleErrors.titleRw ? "border-danger" : "border-line"}`} value={newArticle.titleRw} onChange={(e) => setNewArticle({ ...newArticle, titleRw: e.target.value })} />

          <label className="text-[12.5px] font-bold text-ink-soft">Title (French)</label>
          <input className="rounded-[10px] border border-line bg-white px-[14px] py-3 text-sm" value={newArticle.titleFr} onChange={(e) => setNewArticle({ ...newArticle, titleFr: e.target.value })} />

          <label className="text-[12.5px] font-bold text-ink-soft">Title (Kiswahili)</label>
          <input className="rounded-[10px] border border-line bg-white px-[14px] py-3 text-sm" value={newArticle.titleSw} onChange={(e) => setNewArticle({ ...newArticle, titleSw: e.target.value })} />

          <button onClick={() => void handleCreate()} className="mt-2 w-full rounded-full bg-coral px-[26px] py-[13px] text-[15px] font-semibold text-white shadow-[0_8px_20px_rgba(232,115,92,0.35)]">
            Create &amp; edit
          </button>
        </div>
      </Drawer>

      <Drawer open={drawerOpen} onClose={closeDrawer} title={article?.titleEn ?? "Article Editor"}>
        {drawerLoading && <PageLoading />}
        {!drawerLoading && article && (
          <div className="flex flex-col gap-4">
            <div className="mb-1 flex gap-1.5">
              {(["EN", "RW", "FR", "SW"] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`rounded-[9px] border px-3 py-2 text-[12px] font-bold ${lang === l ? "border-teal-700 bg-teal-700 text-white" : "border-line text-ink-soft"}`}
                >
                  {l === "EN" ? "English" : l === "RW" ? "Kinyarwanda" : l === "FR" ? "French" : "Kiswahili"}
                </button>
              ))}
            </div>

            {lang === "EN" && (
              <>
                <label className="text-[12.5px] font-bold text-ink-soft">Title (English)</label>
                <input className="rounded-[10px] border border-line bg-white px-[14px] py-3 text-sm" value={titleEn} onChange={(e) => setTitleEn(e.target.value)} />
                <label className="text-[12.5px] font-bold text-ink-soft">Body (English)</label>
                <textarea className="w-full resize-y rounded-[10px] border border-line bg-white px-[14px] py-3 text-sm" rows={8} value={bodyEn} onChange={(e) => setBodyEn(e.target.value)} />
              </>
            )}
            {lang === "RW" && (
              <>
                <label className="text-[12.5px] font-bold text-ink-soft">Title (Kinyarwanda)</label>
                <input className="rounded-[10px] border border-line bg-white px-[14px] py-3 text-sm" value={titleRw} onChange={(e) => setTitleRw(e.target.value)} />
                <label className="text-[12.5px] font-bold text-ink-soft">Body (Kinyarwanda)</label>
                <textarea className="w-full resize-y rounded-[10px] border border-line bg-white px-[14px] py-3 text-sm" rows={8} value={bodyRw} onChange={(e) => setBodyRw(e.target.value)} />
              </>
            )}
            {lang === "FR" && (
              <>
                <label className="text-[12.5px] font-bold text-ink-soft">Title (French)</label>
                <input className="rounded-[10px] border border-line bg-white px-[14px] py-3 text-sm" value={titleFr} onChange={(e) => setTitleFr(e.target.value)} />
                <label className="text-[12.5px] font-bold text-ink-soft">Body (French)</label>
                <textarea className="w-full resize-y rounded-[10px] border border-line bg-white px-[14px] py-3 text-sm" rows={8} value={bodyFr} onChange={(e) => setBodyFr(e.target.value)} />
              </>
            )}
            {lang === "SW" && (
              <>
                <label className="text-[12.5px] font-bold text-ink-soft">Title (Kiswahili)</label>
                <input className="rounded-[10px] border border-line bg-white px-[14px] py-3 text-sm" value={titleSw} onChange={(e) => setTitleSw(e.target.value)} />
                <label className="text-[12.5px] font-bold text-ink-soft">Body (Kiswahili)</label>
                <textarea className="w-full resize-y rounded-[10px] border border-line bg-white px-[14px] py-3 text-sm" rows={8} value={bodySw} onChange={(e) => setBodySw(e.target.value)} />
              </>
            )}

            <label className="text-[12.5px] font-bold text-ink-soft">Tags (comma-separated)</label>
            <input className="rounded-[10px] border border-line bg-white px-[14px] py-3 text-sm" value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} />

            <div className="rounded-xl border border-[rgba(22,48,44,0.05)] bg-white p-4 shadow-card">
              <div className="mb-2 text-[12.5px] font-bold text-ink-soft">Status</div>
              <span className={`inline-flex items-center gap-1.5 text-[12.5px] font-semibold before:h-2 before:w-2 before:rounded-full before:content-[''] ${article.status === "REVIEWED" ? "text-[#1E7A5A] before:bg-[#2E9E76]" : "text-[#8A5E1E] before:bg-gold"}`}>
                {article.status === "REVIEWED" ? "Reviewed" : "Needs review"}
              </span>
              {article.reviewedBy && (
                <p className="mt-2 text-[12.5px] text-ink-soft">Reviewed by <span className="font-semibold">{article.reviewedBy}</span>{article.reviewedAt && ` on ${new Date(article.reviewedAt).toLocaleDateString()}`}</p>
              )}
            </div>

            <div className="flex gap-2.5">
              <button onClick={() => void save()} disabled={saving} className="rounded-full border-[1.5px] border-teal-700 px-4 py-[9px] text-[13px] font-semibold text-teal-700 disabled:opacity-50">
                {saving ? "Saving…" : "Save draft"}
              </button>
              <button onClick={() => void save("REVIEWED")} disabled={saving} className="rounded-full bg-coral px-4 py-[9px] text-[13px] font-semibold text-white shadow-[0_8px_20px_rgba(232,115,92,0.35)] disabled:opacity-50">
                {article.status === "REVIEWED" ? "Reviewed ✓" : "Mark as Reviewed"}
              </button>
            </div>
          </div>
        )}
      </Drawer>
    </AppShell>
  );
}
