"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { PageLayout } from "@/components/layout/PageLayout";
import { AttachmentPreview } from "@/components/healthEducation/AttachmentPreview";
import { useLanguage } from "@/lib/LanguageContext";
import { NAV } from "@/lib/i18nCommon";
import { getPublicHealthEducationResource, type HealthEducationResourceDetail } from "@/lib/apiClient";

export default function HealthEducationResourceDetailPage() {
  const { language } = useLanguage();
  const nav = NAV[language];
  const params = useParams();
  const id = params.id as string;

  const [resource, setResource] = useState<HealthEducationResourceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getPublicHealthEducationResource(id)
      .then((r) => { if (!cancelled) setResource(r); })
      .catch(() => { if (!cancelled) setError(true); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [id]);

  return (
    <PageLayout
      activeHref="/library"
      navItems={[
        { href: "/chat", label: nav.chat },
        { href: "/library", label: "Library" },
        { href: "/faq", label: "FAQ" },
      ]}
    >
      {loading ? (
        <div className="flex items-center justify-center py-40">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-200 border-t-teal-700" />
        </div>
      ) : error || !resource ? (
        <section className="animate-slide-up py-[76px]">
          <Link href="/library?tab=resources" className="mb-6 inline-flex items-center gap-1.5 text-[13px] font-bold text-coral-dark">
            <svg width="13" height="13" className="rotate-180"><use href="#i-arrow" /></svg>
            Back to Library
          </Link>
          <div className="rounded-xl bg-teal-100 p-8 text-center">
            <p className="text-[15px] font-semibold text-teal-700">Resource not found.</p>
          </div>
        </section>
      ) : (
        <section className="animate-slide-up py-[76px]">
          <Link href="/library?tab=resources" className="mb-6 inline-flex items-center gap-1.5 text-[13px] font-bold text-coral-dark hover:gap-2 transition-all duration-150">
            <svg width="13" height="13" className="rotate-180"><use href="#i-arrow" /></svg>
            Back to Library
          </Link>

          {resource.thumbnailSecureUrl && (
            <img src={resource.thumbnailSecureUrl} alt={resource.title} className="mb-6 h-[220px] w-full rounded-[var(--radius-lg)] object-cover" />
          )}

          <div className="mb-4 flex flex-wrap items-center gap-1.5 text-[12px] font-semibold">
            <span className="rounded-full bg-coral-100 px-3 py-1 text-coral-dark">{resource.category}</span>
            <span className="rounded-full bg-teal-100 px-3 py-1 text-teal-700">{resource.topic}</span>
            <span className="rounded-full bg-gold-100 px-3 py-1 text-[#8A5E1E]">{resource.language}</span>
          </div>

          <h1 className="font-display text-[38px] leading-[1.1] text-teal-900">{resource.title}</h1>
          <p className="mt-4 text-[17px] leading-[1.6] text-ink-soft">{resource.shortDescription}</p>

          <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-ink-soft">
            <span>By {resource.author}</span>
            <span>•</span>
            <span>For {resource.targetAudience}</span>
            <span>•</span>
            <span>Published {new Date(resource.publishedDate).toLocaleDateString()}</span>
          </div>

          {resource.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {resource.tags.map((tag) => (
                <span key={tag} className="rounded-full border border-line px-3 py-1 text-[11.5px] font-semibold text-ink-soft">#{tag}</span>
              ))}
            </div>
          )}

          <div className="prose-custom mt-8 max-w-none text-[16px] leading-[1.8] text-ink-soft">
            {resource.fullDescription.split("\n").map((paragraph, i) => (
              paragraph.trim() ? <p key={i} className="mb-5">{paragraph}</p> : null
            ))}
          </div>

          <div id="attachments" className="mt-10 scroll-mt-24">
            <h2 className="mb-4 font-display text-[22px] text-teal-900">Attachments</h2>
            {resource.attachments.length === 0 ? (
              <p className="text-[14px] text-ink-soft">No attachments on this resource.</p>
            ) : (
              <div className="flex flex-col gap-4">
                {resource.attachments.map((attachment) => (
                  <AttachmentPreview key={attachment.id} attachment={attachment} />
                ))}
              </div>
            )}
          </div>
        </section>
      )}
    </PageLayout>
  );
}
