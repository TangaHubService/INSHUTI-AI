"use client";

import { useEffect, useState } from "react";

import type { HealthEducationAttachmentSummary } from "@/lib/apiClient";
import { getHealthEducationAttachmentDownloadUrl } from "@/lib/apiClient";
import { formatFileSize, getFileTypeMeta } from "@/lib/healthEducationTypes";

function TextPreview({ url, onFail }: { url: string; onFail: () => void }) {
  const [text, setText] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.text();
      })
      .then((body) => {
        if (!cancelled) setText(body.slice(0, 5000));
      })
      .catch(() => {
        if (!cancelled) onFail();
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  if (text === null) {
    return <div className="py-6 text-center text-[13px] text-ink-soft">Loading preview…</div>;
  }
  return (
    <pre className="max-h-[400px] overflow-auto whitespace-pre-wrap break-words rounded-[var(--radius-sm)] bg-paper-2 p-4 text-[12.5px] leading-[1.6] text-ink">
      {text}
      {text.length >= 5000 && "\n…"}
    </pre>
  );
}

export function AttachmentPreview({ attachment }: { attachment: HealthEducationAttachmentSummary }) {
  const meta = getFileTypeMeta(attachment.fileExtension);
  const downloadUrl = getHealthEducationAttachmentDownloadUrl(attachment.id);
  const [textFailed, setTextFailed] = useState(false);

  return (
    <div id={`attachment-${attachment.id}`} className="card overflow-hidden p-0">
      <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-3.5">
        <div className="flex min-w-0 items-center gap-2.5">
          <svg width="18" height="18" className="flex-shrink-0 text-teal-700"><use href={`#${meta.icon}`} /></svg>
          <div className="min-w-0">
            <div className="truncate text-[13.5px] font-semibold text-ink">{attachment.originalFileName}</div>
            <div className="text-[12px] text-ink-soft">
              {meta.label} • {formatFileSize(attachment.fileSize)}
            </div>
          </div>
        </div>
        <a
          href={downloadUrl}
          className="flex-shrink-0 rounded-full bg-teal-700 px-4 py-[7px] text-[12.5px] font-semibold text-white transition hover:bg-teal-900"
        >
          Download
        </a>
      </div>

      <div className="p-5">
        {meta.kind === "image" && (
          <img src={attachment.secureUrl} alt={attachment.originalFileName} className="mx-auto max-h-[480px] rounded-[var(--radius-sm)]" />
        )}
        {meta.kind === "pdf" && (
          <iframe src={attachment.secureUrl} title={attachment.originalFileName} className="h-[600px] w-full rounded-[var(--radius-sm)] border border-line" />
        )}
        {meta.kind === "video" && (
          <video controls className="mx-auto max-h-[480px] w-full rounded-[var(--radius-sm)]">
            <source src={attachment.secureUrl} type={attachment.mimeType} />
          </video>
        )}
        {meta.kind === "audio" && (
          <div className="flex items-center gap-4 rounded-[var(--radius-md)] bg-teal-100/40 p-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-teal-100 text-teal-700">
              <svg width="20" height="20"><use href="#i-mic" /></svg>
            </span>
            <audio controls preload="metadata" className="w-full flex-1">
              <source src={attachment.secureUrl} type={attachment.mimeType} />
              Your browser does not support inline audio playback.
              <a href={downloadUrl}>Download the audio file</a> instead.
            </audio>
          </div>
        )}
        {meta.kind === "text" && !textFailed && <TextPreview url={attachment.secureUrl} onFail={() => setTextFailed(true)} />}
        {(meta.kind === "office" || meta.kind === "archive" || (meta.kind === "text" && textFailed) || meta.kind === "other") && (
          <div className="flex flex-col items-center gap-2 py-6 text-center">
            <svg width="30" height="30" className="text-ink-soft"><use href={`#${meta.icon}`} /></svg>
            <p className="text-[13px] font-semibold text-ink-soft">Preview unavailable</p>
            <a href={downloadUrl} className="mt-1 rounded-full bg-teal-700 px-5 py-2 text-[13px] font-semibold text-white transition hover:bg-teal-900">
              Download File
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
