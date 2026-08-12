"use client";

import { useEffect, useState } from "react";

import {
  createHealthEducationResource,
  getHealthEducationResource,
  updateHealthEducationResource,
  type HealthEducationResource,
} from "@/lib/adminApiClient";
import { useToast } from "@/lib/useToast";
import { PageLoading } from "@/components/Spinner";
import { AttachmentUploader } from "./AttachmentUploader";
import { ThumbnailUploader } from "./ThumbnailUploader";

const LANGUAGES = ["EN", "RW", "FR", "SW"] as const;

const LIMITS = {
  title: 300,
  shortDescription: 500,
  category: 120,
  topic: 120,
  targetAudience: 200,
  author: 200,
} as const;

type FieldErrors = Partial<Record<"title" | "shortDescription" | "fullDescription" | "category" | "topic" | "targetAudience" | "author" | "publishedDate", string>>;

function toDateInputValue(iso?: string) {
  if (!iso) return "";
  return iso.slice(0, 10);
}

const inputClass = (hasError: boolean) =>
  `rounded-[var(--radius-sm)] border bg-white px-[14px] py-3 text-sm ${hasError ? "border-danger" : "border-line"}`;

export function ResourceEditor({
  resourceId,
  onCreated,
  onSaved,
}: {
  resourceId?: string;
  onCreated?: (id: string) => void;
  onSaved?: () => void;
}) {
  const { toast } = useToast();

  const [loading, setLoading] = useState(Boolean(resourceId));
  const [saving, setSaving] = useState(false);
  const [resource, setResource] = useState<HealthEducationResource | null>(null);
  const [currentId, setCurrentId] = useState<string | undefined>(resourceId);
  const [errors, setErrors] = useState<FieldErrors>({});

  const [title, setTitle] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [fullDescription, setFullDescription] = useState("");
  const [category, setCategory] = useState("");
  const [topic, setTopic] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [language, setLanguage] = useState<(typeof LANGUAGES)[number]>("EN");
  const [tagsInput, setTagsInput] = useState("");
  const [author, setAuthor] = useState("");
  const [publishedDate, setPublishedDate] = useState(() => new Date().toISOString().slice(0, 10));

  useEffect(() => {
    setCurrentId(resourceId);
    if (!resourceId) return;
    let cancelled = false;
    setLoading(true);
    getHealthEducationResource(resourceId)
      .then((r) => {
        if (cancelled) return;
        setResource(r);
        setCurrentId(r.id);
        setTitle(r.title);
        setShortDescription(r.shortDescription);
        setFullDescription(r.fullDescription);
        setCategory(r.category);
        setTopic(r.topic);
        setTargetAudience(r.targetAudience);
        setLanguage(r.language);
        setTagsInput(r.tags.join(", "));
        setAuthor(r.author);
        setPublishedDate(toDateInputValue(r.publishedDate));
        setErrors({});
      })
      .catch(() => toast("Failed to load resource", "error"))
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resourceId]);

  function validate(): boolean {
    const next: FieldErrors = {};
    if (!title.trim()) next.title = "Title is required.";
    else if (title.length > LIMITS.title) next.title = `Must be ${LIMITS.title} characters or fewer.`;

    if (!shortDescription.trim()) next.shortDescription = "Short description is required.";
    else if (shortDescription.length > LIMITS.shortDescription) next.shortDescription = `Must be ${LIMITS.shortDescription} characters or fewer.`;

    if (!fullDescription.trim()) next.fullDescription = "Full description is required.";

    if (!category.trim()) next.category = "Category is required.";
    else if (category.length > LIMITS.category) next.category = `Must be ${LIMITS.category} characters or fewer.`;

    if (!topic.trim()) next.topic = "Topic is required.";
    else if (topic.length > LIMITS.topic) next.topic = `Must be ${LIMITS.topic} characters or fewer.`;

    if (!targetAudience.trim()) next.targetAudience = "Target audience is required.";
    else if (targetAudience.length > LIMITS.targetAudience) next.targetAudience = `Must be ${LIMITS.targetAudience} characters or fewer.`;

    if (!author.trim()) next.author = "Author is required.";
    else if (author.length > LIMITS.author) next.author = `Must be ${LIMITS.author} characters or fewer.`;

    if (!publishedDate) next.publishedDate = "Publication date is required.";
    else if (Number.isNaN(new Date(publishedDate).getTime())) next.publishedDate = "Enter a valid date.";

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function clearError(field: keyof FieldErrors) {
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
  }

  async function handleSave() {
    if (!validate()) {
      toast("Please fix the highlighted fields.", "error");
      return;
    }
    const tags = tagsInput.split(",").map((t) => t.trim()).filter(Boolean);
    const input = {
      title, shortDescription, fullDescription, category, topic, targetAudience,
      language, tags, author, publishedDate: new Date(publishedDate).toISOString(),
    };
    setSaving(true);
    try {
      if (currentId) {
        const updated = await updateHealthEducationResource(currentId, input);
        setResource((prev) => (prev ? { ...prev, ...updated } : updated));
        toast("Resource updated", "success");
        onSaved?.();
      } else {
        const created = await createHealthEducationResource(input);
        setResource(created);
        setCurrentId(created.id);
        toast("Resource details saved — you can now add attachments.", "success");
        onCreated?.(created.id);
        onSaved?.();
      }
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to save resource", "error");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <PageLoading />;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <label className="text-[12.5px] font-bold text-ink-soft">Title</label>
        <input
          className={inputClass(Boolean(errors.title))}
          value={title}
          onChange={(e) => { setTitle(e.target.value); clearError("title"); }}
        />
        {errors.title && <p className="text-xs font-semibold text-danger">{errors.title}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-[12.5px] font-bold text-ink-soft">Short description</label>
        <textarea
          className={`w-full resize-y ${inputClass(Boolean(errors.shortDescription))}`}
          rows={2}
          value={shortDescription}
          onChange={(e) => { setShortDescription(e.target.value); clearError("shortDescription"); }}
        />
        {errors.shortDescription && <p className="text-xs font-semibold text-danger">{errors.shortDescription}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-[12.5px] font-bold text-ink-soft">Full description</label>
        <textarea
          className={`w-full resize-y ${inputClass(Boolean(errors.fullDescription))}`}
          rows={6}
          value={fullDescription}
          onChange={(e) => { setFullDescription(e.target.value); clearError("fullDescription"); }}
        />
        {errors.fullDescription && <p className="text-xs font-semibold text-danger">{errors.fullDescription}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-[12.5px] font-bold text-ink-soft">Category</label>
          <input
            className={inputClass(Boolean(errors.category))}
            value={category}
            onChange={(e) => { setCategory(e.target.value); clearError("category"); }}
            placeholder="e.g. Nutrition"
          />
          {errors.category && <p className="text-xs font-semibold text-danger">{errors.category}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[12.5px] font-bold text-ink-soft">Topic</label>
          <input
            className={inputClass(Boolean(errors.topic))}
            value={topic}
            onChange={(e) => { setTopic(e.target.value); clearError("topic"); }}
            placeholder="e.g. Menstrual Health"
          />
          {errors.topic && <p className="text-xs font-semibold text-danger">{errors.topic}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[12.5px] font-bold text-ink-soft">Target audience</label>
          <input
            className={inputClass(Boolean(errors.targetAudience))}
            value={targetAudience}
            onChange={(e) => { setTargetAudience(e.target.value); clearError("targetAudience"); }}
            placeholder="e.g. Teenagers"
          />
          {errors.targetAudience && <p className="text-xs font-semibold text-danger">{errors.targetAudience}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[12.5px] font-bold text-ink-soft">Language</label>
          <select className={inputClass(false)} value={language} onChange={(e) => setLanguage(e.target.value as (typeof LANGUAGES)[number])}>
            {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[12.5px] font-bold text-ink-soft">Author / Uploaded by</label>
          <input
            className={inputClass(Boolean(errors.author))}
            value={author}
            onChange={(e) => { setAuthor(e.target.value); clearError("author"); }}
          />
          {errors.author && <p className="text-xs font-semibold text-danger">{errors.author}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[12.5px] font-bold text-ink-soft">Publication date</label>
          <input
            type="date"
            className={inputClass(Boolean(errors.publishedDate))}
            value={publishedDate}
            onChange={(e) => { setPublishedDate(e.target.value); clearError("publishedDate"); }}
          />
          {errors.publishedDate && <p className="text-xs font-semibold text-danger">{errors.publishedDate}</p>}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-[12.5px] font-bold text-ink-soft">Tags (comma-separated)</label>
        <input className={inputClass(false)} value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} />
      </div>

      <button
        onClick={() => void handleSave()}
        disabled={saving}
        className="w-fit rounded-full bg-coral px-6 py-[11px] text-[14px] font-semibold text-white shadow-btn transition hover:-translate-y-px hover:bg-coral-dark disabled:opacity-50"
      >
        {saving ? "Saving…" : currentId ? "Save changes" : "Save details"}
      </button>

      <div className="flex flex-col gap-3 border-t border-line pt-5">
        <h2 className="font-display text-[16px] text-teal-900">Cover image</h2>
        {currentId ? (
          <ThumbnailUploader
            resourceId={currentId}
            thumbnailSecureUrl={resource?.thumbnailSecureUrl ?? null}
            onChange={(r) => setResource(r)}
          />
        ) : (
          <p className="text-[13px] text-ink-soft">Save resource details first to upload a cover image.</p>
        )}
      </div>

      <div className="flex flex-col gap-3 border-t border-line pt-5">
        <h2 className="font-display text-[16px] text-teal-900">Attachments</h2>
        {currentId ? (
          <AttachmentUploader resourceId={currentId} initialAttachments={resource?.attachments ?? []} />
        ) : (
          <p className="text-[13px] text-ink-soft">Save resource details first to add attachments.</p>
        )}
      </div>
    </div>
  );
}
