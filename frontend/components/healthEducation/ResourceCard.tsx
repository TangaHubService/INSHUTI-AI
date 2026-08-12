"use client";

import Link from "next/link";

import { cloudinaryImageTransform } from "@/lib/healthEducationTypes";

export interface ResourceCardData {
  id: string;
  title: string;
  shortDescription: string;
  category: string;
  topic: string;
  author: string;
  publishedDate: string;
  createdAt: string;
  thumbnailSecureUrl?: string | null;
  attachmentCount?: number;
  availableFileTypes?: string[];
}

export function ResourceCard({
  resource,
  viewHref,
  isAdmin = false,
  onEdit,
  onDelete,
  layout = "grid",
}: {
  resource: ResourceCardData;
  viewHref: string;
  isAdmin?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  layout?: "grid" | "list";
}) {
  const fileTypes = resource.availableFileTypes ?? [];
  const attachmentCount = resource.attachmentCount ?? 0;

  return (
    <div className={`card flex gap-4 p-5 ${layout === "grid" ? "flex-col" : "flex-col sm:flex-row sm:items-start"}`}>
      <div
        className={`flex-shrink-0 overflow-hidden rounded-[var(--radius-md)] bg-teal-100 ${
          layout === "grid" ? "h-[140px] w-full" : "h-[110px] w-full sm:w-[150px]"
        }`}
      >
        {resource.thumbnailSecureUrl ? (
          <img
            src={cloudinaryImageTransform(resource.thumbnailSecureUrl, 400)}
            alt={resource.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-teal-700">
            <svg width="34" height="34"><use href="#i-file" /></svg>
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex flex-wrap items-center gap-1.5 text-[11.5px] font-semibold text-coral-dark">
          <span className="rounded-full bg-coral-100 px-2.5 py-0.5">{resource.category}</span>
          <span className="rounded-full bg-teal-100 px-2.5 py-0.5 text-teal-700">{resource.topic}</span>
        </div>
        <h3 className="line-clamp-2 text-[16px] font-bold text-teal-900">{resource.title}</h3>
        <p className="line-clamp-2 text-[13px] leading-[1.5] text-ink-soft">{resource.shortDescription}</p>

        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-ink-soft">
          <span>By {resource.author}</span>
          <span>•</span>
          <span>{new Date(resource.createdAt).toLocaleDateString()}</span>
          <span>•</span>
          <span>
            {attachmentCount} attachment{attachmentCount === 1 ? "" : "s"}
          </span>
        </div>

        {fileTypes.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {fileTypes.map((type) => (
              <span key={type} className="rounded-[var(--radius-sm)] bg-paper-2 px-2 py-0.5 text-[10.5px] font-bold text-ink-soft">
                {type}
              </span>
            ))}
          </div>
        )}

        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Link
            href={viewHref}
            className="rounded-full bg-coral px-4 py-[7px] text-[12.5px] font-semibold text-white shadow-btn transition hover:-translate-y-px hover:bg-coral-dark"
          >
            View
          </Link>
          <Link
            href={`${viewHref}#attachments`}
            className="rounded-full border-[1.5px] border-teal-700 px-4 py-[7px] text-[12.5px] font-semibold text-teal-700 transition hover:bg-teal-100"
          >
            Download
          </Link>
          {isAdmin && (
            <>
              <button
                type="button"
                onClick={onEdit}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-line text-ink-soft transition hover:bg-paper-2"
                title="Edit"
              >
                <svg width="14" height="14"><use href="#i-edit" /></svg>
              </button>
              <button
                type="button"
                onClick={onDelete}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-line text-danger transition hover:bg-danger/10"
                title="Delete"
              >
                <svg width="14" height="14"><use href="#i-trash" /></svg>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
