"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

import {
  deleteHealthEducationThumbnail,
  uploadHealthEducationThumbnail,
  type HealthEducationResource,
} from "@/lib/adminApiClient";
import { useToast } from "@/lib/useToast";

export function ThumbnailUploader({
  resourceId,
  thumbnailSecureUrl,
  onChange,
}: {
  resourceId: string;
  thumbnailSecureUrl: string | null;
  onChange: (resource: HealthEducationResource) => void;
}) {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const onDrop = useCallback(
    async (accepted: File[]) => {
      const file = accepted[0];
      if (!file) return;
      setUploading(true);
      setProgress(0);
      try {
        const { promise } = uploadHealthEducationThumbnail(resourceId, file, setProgress);
        const { status, body } = await promise;
        if (status >= 200 && status < 300) {
          onChange((body as { resource: HealthEducationResource }).resource);
          toast("Thumbnail uploaded", "success");
        } else {
          const message = (body as { error?: string })?.error ?? "Thumbnail upload failed";
          toast(message, "error");
        }
      } catch {
        toast("Thumbnail upload failed", "error");
      } finally {
        setUploading(false);
      }
    },
    [resourceId, onChange, toast],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: { "image/*": [".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg"] },
  });

  async function handleRemove() {
    try {
      const resource = await deleteHealthEducationThumbnail(resourceId);
      onChange(resource);
      toast("Thumbnail removed", "success");
    } catch {
      toast("Failed to remove thumbnail", "error");
    }
  }

  if (thumbnailSecureUrl && !uploading) {
    return (
      <div className="flex items-center gap-4">
        <img src={thumbnailSecureUrl} alt="Cover thumbnail" className="h-24 w-24 rounded-[var(--radius-md)] object-cover" />
        <div className="flex flex-col gap-2">
          <div {...getRootProps()} className="cursor-pointer text-[13px] font-semibold text-teal-700 hover:underline">
            <input {...getInputProps()} />
            Replace image
          </div>
          <button onClick={() => void handleRemove()} className="text-left text-[13px] font-semibold text-danger hover:underline">
            Remove
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-[var(--radius-md)] border-2 border-dashed px-6 py-8 text-center transition ${
        isDragActive ? "border-teal-700 bg-teal-100/40" : "border-line hover:bg-paper-2"
      }`}
    >
      <input {...getInputProps()} />
      <svg width="24" height="24" className="text-ink-soft">
        <use href="#i-image" />
      </svg>
      {uploading ? (
        <div className="w-full max-w-[200px]">
          <div className="text-[12.5px] text-ink-soft">Uploading… {progress}%</div>
          <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-paper-2">
            <div className="h-full bg-teal-700 transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
      ) : (
        <p className="text-[13px] text-ink-soft">
          Drag &amp; drop a cover image here, or <span className="font-semibold text-teal-700">browse files</span>
        </p>
      )}
    </div>
  );
}
