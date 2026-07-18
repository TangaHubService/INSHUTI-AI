"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { AdminShell } from "@/components/AdminShell";
import { getKbArticle, updateKbArticle, type ArticleStatus, type KbArticle } from "@/lib/adminApiClient";
import { useRequireAdmin } from "@/lib/useAdminAuth";

export default function ArticleEditorPage() {
  const { admin, loading: authLoading } = useRequireAdmin("CONTENT_REVIEWER");
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [article, setArticle] = useState<KbArticle | null>(null);
  const [lang, setLang] = useState<"EN" | "RW">("EN");
  const [titleEn, setTitleEn] = useState("");
  const [titleRw, setTitleRw] = useState("");
  const [bodyEn, setBodyEn] = useState("");
  const [bodyRw, setBodyRw] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!admin) return;
    getKbArticle(params.id).then((a) => {
      setArticle(a);
      setTitleEn(a.titleEn);
      setTitleRw(a.titleRw);
      setBodyEn(a.bodyEn);
      setBodyRw(a.bodyRw);
      setTagsInput(a.tags.join(", "));
      setLoading(false);
    });
  }, [admin, params.id]);

  async function save(status?: ArticleStatus) {
    setSaving(true);
    setError(null);
    try {
      const tags = tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      const updated = await updateKbArticle(params.id, {
        titleEn,
        titleRw,
        bodyEn,
        bodyRw,
        tags,
        ...(status ? { status } : {}),
      });
      setArticle(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  if (authLoading || !admin) return null;

  return (
    <AdminShell active="/admin/knowledge-base" admin={admin}>
      <button onClick={() => router.push("/admin/knowledge-base")} className="mb-4 text-sm font-semibold text-teal-700">
        ← Back to Knowledge Base
      </button>

      {loading && <p className="text-sm text-ink-soft">Loading…</p>}

      {!loading && article && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_300px]">
          <div className="rounded-md border border-[rgba(22,48,44,0.05)] bg-white p-6 shadow-card">
            <div className="mb-3.5 flex gap-1.5">
              <button
                onClick={() => setLang("EN")}
                className={`rounded-[9px] border px-4 py-2 text-[13px] font-bold ${
                  lang === "EN" ? "border-teal-700 bg-teal-700 text-white" : "border-line text-ink-soft"
                }`}
              >
                English
              </button>
              <button
                onClick={() => setLang("RW")}
                className={`rounded-[9px] border px-4 py-2 text-[13px] font-bold ${
                  lang === "RW" ? "border-teal-700 bg-teal-700 text-white" : "border-line text-ink-soft"
                }`}
              >
                Kinyarwanda
              </button>
            </div>

            {lang === "EN" ? (
              <>
                <label className="mb-1.5 block text-[12.5px] font-bold text-ink-soft">Title (English)</label>
                <input
                  className="mb-4 w-full rounded-[10px] border border-line bg-paper-2 px-[14px] py-3 text-sm"
                  value={titleEn}
                  onChange={(e) => setTitleEn(e.target.value)}
                />
                <label className="mb-1.5 block text-[12.5px] font-bold text-ink-soft">Body (English)</label>
                <textarea
                  className="w-full resize-y rounded-[10px] border border-line bg-paper-2 px-[14px] py-3 text-sm"
                  rows={10}
                  value={bodyEn}
                  onChange={(e) => setBodyEn(e.target.value)}
                />
              </>
            ) : (
              <>
                <label className="mb-1.5 block text-[12.5px] font-bold text-ink-soft">Title (Kinyarwanda)</label>
                <input
                  className="mb-4 w-full rounded-[10px] border border-line bg-paper-2 px-[14px] py-3 text-sm"
                  value={titleRw}
                  onChange={(e) => setTitleRw(e.target.value)}
                />
                <label className="mb-1.5 block text-[12.5px] font-bold text-ink-soft">Body (Kinyarwanda)</label>
                <textarea
                  className="w-full resize-y rounded-[10px] border border-line bg-paper-2 px-[14px] py-3 text-sm"
                  rows={10}
                  value={bodyRw}
                  onChange={(e) => setBodyRw(e.target.value)}
                />
              </>
            )}

            <label className="mb-1.5 mt-4 block text-[12.5px] font-bold text-ink-soft">Tags (comma-separated)</label>
            <input
              className="w-full rounded-[10px] border border-line bg-paper-2 px-[14px] py-3 text-sm"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
            />

            {error && <p className="mt-4 text-[13px] font-semibold text-danger">{error}</p>}

            <div className="mt-5 flex gap-2.5">
              <button
                onClick={() => void save()}
                disabled={saving}
                className="rounded-full border-[1.5px] border-teal-700 px-4 py-[9px] text-[13px] font-semibold text-teal-700 disabled:opacity-50"
              >
                Save draft
              </button>
              <button
                onClick={() => void save("REVIEWED")}
                disabled={saving}
                className="rounded-full bg-coral px-4 py-[9px] text-[13px] font-semibold text-white shadow-[0_8px_20px_rgba(232,115,92,0.35)] disabled:opacity-50"
              >
                {article.status === "REVIEWED" ? "Reviewed ✓" : "Mark as Reviewed"}
              </button>
            </div>
          </div>

          <div className="rounded-md border border-[rgba(22,48,44,0.05)] bg-white p-5 shadow-card">
            <div className="mb-3 text-[12.5px] font-bold text-ink-soft">Status</div>
            <span
              className={`inline-flex items-center gap-1.5 text-[12.5px] font-semibold before:h-2 before:w-2 before:rounded-full before:content-[''] ${
                article.status === "REVIEWED" ? "text-[#1E7A5A] before:bg-[#2E9E76]" : "text-[#8A5E1E] before:bg-gold"
              }`}
            >
              {article.status === "REVIEWED" ? "Reviewed" : "Needs review"}
            </span>
            {article.reviewedBy && (
              <p className="mt-3 text-[12.5px] leading-[1.5] text-ink-soft">
                Reviewed by <span className="font-semibold">{article.reviewedBy}</span>
                {article.reviewedAt && ` on ${new Date(article.reviewedAt).toLocaleDateString()}`}
              </p>
            )}
            <p className="mt-4 text-[12.5px] leading-[1.5] text-ink-soft">
              Publishing to Reviewed is blocked until both the English and Kinyarwanda bodies are
              filled in.
            </p>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
