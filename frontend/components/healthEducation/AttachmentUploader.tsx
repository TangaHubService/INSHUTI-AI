"use client";

import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";

import {
  deleteHealthEducationAttachment,
  reorderHealthEducationAttachments,
  uploadHealthEducationAttachment,
  type HealthEducationAttachment,
} from "@/lib/adminApiClient";
import { formatFileSize, getFileTypeMeta } from "@/lib/healthEducationTypes";
import { useToast } from "@/lib/useToast";

interface UploadItem {
  key: string;
  file?: File;
  attachment?: HealthEducationAttachment;
  status: "uploading" | "success" | "error";
  progress: number;
  errorMessage?: string;
  abort?: () => void;
}

let keyCounter = 0;
function nextKey() {
  keyCounter += 1;
  return `local-${Date.now()}-${keyCounter}`;
}

export function AttachmentUploader({
  resourceId,
  initialAttachments,
}: {
  resourceId: string;
  initialAttachments: HealthEducationAttachment[];
}) {
  const { toast } = useToast();
  const [items, setItems] = useState<UploadItem[]>(
    initialAttachments
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((a) => ({ key: a.id, attachment: a, status: "success" as const, progress: 100 })),
  );

  useEffect(() => {
    setItems(
      initialAttachments
        .slice()
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((a) => ({ key: a.id, attachment: a, status: "success" as const, progress: 100 })),
    );
    // Only re-seed when the resource identity changes, not on every parent render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resourceId]);

  const startUpload = useCallback(
    (item: UploadItem) => {
      if (!item.file) return;
      const { promise, abort } = uploadHealthEducationAttachment(resourceId, item.file, (pct) => {
        setItems((prev) => prev.map((i) => (i.key === item.key ? { ...i, progress: pct } : i)));
      });
      setItems((prev) => prev.map((i) => (i.key === item.key ? { ...i, status: "uploading", progress: 0, abort, errorMessage: undefined } : i)));

      promise
        .then(({ status, body }) => {
          if (status >= 200 && status < 300) {
            const attachment = (body as { attachment: HealthEducationAttachment }).attachment;
            setItems((prev) => prev.map((i) => (i.key === item.key ? { ...i, status: "success", attachment, progress: 100 } : i)));
          } else {
            const message = (body as { error?: string })?.error ?? "Upload failed";
            setItems((prev) => prev.map((i) => (i.key === item.key ? { ...i, status: "error", errorMessage: message } : i)));
          }
        })
        .catch((err: Error) => {
          setItems((prev) =>
            prev.map((i) => (i.key === item.key ? { ...i, status: "error", errorMessage: err.message || "Upload failed" } : i)),
          );
        });
    },
    [resourceId],
  );

  const onDrop = useCallback(
    (accepted: File[]) => {
      const newItems: UploadItem[] = accepted.map((file) => ({ key: nextKey(), file, status: "uploading", progress: 0 }));
      setItems((prev) => [...prev, ...newItems]);
      newItems.forEach(startUpload);
    },
    [startUpload],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, multiple: true });

  function handleRetry(item: UploadItem) {
    startUpload(item);
  }

  async function handleRemove(item: UploadItem) {
    if (item.status === "uploading") {
      item.abort?.();
      setItems((prev) => prev.filter((i) => i.key !== item.key));
      return;
    }
    if (item.attachment) {
      try {
        await deleteHealthEducationAttachment(item.attachment.id);
        setItems((prev) => prev.filter((i) => i.key !== item.key));
        toast("Attachment removed", "success");
      } catch {
        toast("Failed to remove attachment", "error");
      }
      return;
    }
    setItems((prev) => prev.filter((i) => i.key !== item.key));
  }

  async function persistOrder(nextItems: UploadItem[]) {
    const ids = nextItems.filter((i) => i.status === "success" && i.attachment).map((i) => i.attachment!.id);
    try {
      await reorderHealthEducationAttachments(resourceId, ids);
    } catch {
      toast("Failed to save attachment order", "error");
    }
  }

  function move(index: number, direction: -1 | 1) {
    setItems((prev) => {
      const target = index + direction;
      if (target < 0 || target >= prev.length) return prev;
      const next = prev.slice();
      [next[index], next[target]] = [next[target], next[index]];
      void persistOrder(next);
      return next;
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <div
        {...getRootProps()}
        className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-[var(--radius-md)] border-2 border-dashed px-6 py-10 text-center transition ${
          isDragActive ? "border-teal-700 bg-teal-100/40" : "border-line hover:bg-paper-2"
        }`}
      >
        <input {...getInputProps()} />
        <svg width="26" height="26" className="text-ink-soft">
          <use href="#i-attach" />
        </svg>
        <p className="text-[14px] font-semibold text-teal-900">Drag &amp; Drop Files Here</p>
        <p className="text-[13px] text-ink-soft">
          or <span className="font-semibold text-teal-700">Browse Files</span> — PDF, Word, Excel, PowerPoint, images, video, audio, text, ZIP/RAR
        </p>
      </div>

      {items.length > 0 && (
        <ul className="flex flex-col gap-2">
          {items.map((item, index) => {
            const name = item.attachment?.originalFileName ?? item.file?.name ?? "file";
            const ext = item.attachment?.fileExtension ?? name.split(".").pop() ?? "";
            const meta = getFileTypeMeta(ext);
            const size = item.attachment?.fileSize ?? item.file?.size ?? 0;
            return (
              <li key={item.key} className="flex items-center gap-3 rounded-[var(--radius-md)] border border-line bg-white px-4 py-3">
                <svg width="20" height="20" className="flex-shrink-0 text-teal-700">
                  <use href={`#${meta.icon}`} />
                </svg>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13.5px] font-semibold text-ink">{name}</div>
                  <div className="text-[12px] text-ink-soft">
                    {meta.label} • {formatFileSize(size)}
                  </div>
                  {item.status === "uploading" && (
                    <div className="mt-1.5 h-1.5 w-full max-w-[240px] overflow-hidden rounded-full bg-paper-2">
                      <div className="h-full bg-teal-700 transition-all" style={{ width: `${item.progress}%` }} />
                    </div>
                  )}
                  {item.status === "uploading" && <div className="mt-1 text-[11.5px] text-ink-soft">Uploading… {item.progress}%</div>}
                  {item.status === "success" && (
                    <div className="mt-1 flex items-center gap-1 text-[11.5px] font-semibold text-[#1E7A5A]">
                      <svg width="12" height="12"><use href="#i-check" /></svg> Uploaded
                    </div>
                  )}
                  {item.status === "error" && (
                    <div className="mt-1 text-[11.5px] font-semibold text-danger">⚠ {item.errorMessage ?? "Upload failed"}</div>
                  )}
                </div>
                <div className="flex flex-shrink-0 items-center gap-1.5">
                  {item.status === "success" && (
                    <>
                      <button
                        type="button"
                        onClick={() => move(index, -1)}
                        disabled={index === 0}
                        title="Move up"
                        className="flex h-7 w-7 items-center justify-center rounded-full border border-line text-ink-soft hover:bg-paper-2 disabled:opacity-30"
                      >
                        <svg width="12" height="12" className="rotate-90"><use href="#i-back" /></svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => move(index, 1)}
                        disabled={index === items.length - 1}
                        title="Move down"
                        className="flex h-7 w-7 items-center justify-center rounded-full border border-line text-ink-soft hover:bg-paper-2 disabled:opacity-30"
                      >
                        <svg width="12" height="12" className="-rotate-90"><use href="#i-back" /></svg>
                      </button>
                    </>
                  )}
                  {item.status === "error" && (
                    <button
                      type="button"
                      onClick={() => handleRetry(item)}
                      className="rounded-full border-[1.5px] border-teal-700 px-3 py-1 text-[12px] font-semibold text-teal-700 hover:bg-teal-100"
                    >
                      Retry
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => void handleRemove(item)}
                    title="Remove"
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-line text-danger hover:bg-danger/10"
                  >
                    <svg width="13" height="13"><use href="#i-trash" /></svg>
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
