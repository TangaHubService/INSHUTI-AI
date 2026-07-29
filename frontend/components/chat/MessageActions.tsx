"use client";

import { useState } from "react";
import { cn } from "@/components/ui/cn";

interface MessageActionsProps {
  content: string;
  onRegenerate?: () => void;
  onFeedback?: (type: "helpful" | "not-helpful") => void;
  onShare?: () => void;
}

export function MessageActions({
  content,
  onRegenerate,
  onFeedback,
  onShare,
}: MessageActionsProps) {
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<"helpful" | "not-helpful" | null>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="flex items-center gap-0.5">
      <button
        type="button"
        onClick={handleCopy}
        className={cn(
          "flex h-7 w-7 items-center justify-center rounded-lg text-[#9CA3AF] transition",
          "hover:bg-[#F1EEE6] hover:text-[#16302C]",
          "dark:hover:bg-[#33363A] dark:hover:text-[#E8E6E1]"
        )}
        aria-label="Copy message"
      >
        {copied ? (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
        )}
      </button>

      {onFeedback && (
        <>
          <button
            type="button"
            onClick={() => {
              const val = feedback === "helpful" ? null : "helpful";
              setFeedback(val);
              onFeedback(val ?? "helpful");
            }}
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-lg transition",
              feedback === "helpful"
                ? "bg-teal-100 text-teal-700"
                : "text-[#9CA3AF] hover:bg-[#F1EEE6] hover:text-[#16302C] dark:hover:bg-[#33363A] dark:hover:text-[#E8E6E1]"
            )}
            aria-label="Helpful"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill={feedback === "helpful" ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => {
              const val = feedback === "not-helpful" ? null : "not-helpful";
              setFeedback(val);
              onFeedback(val ?? "not-helpful");
            }}
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-lg transition",
              feedback === "not-helpful"
                ? "bg-coral-100 text-coral-dark"
                : "text-[#9CA3AF] hover:bg-[#F1EEE6] hover:text-[#16302C] dark:hover:bg-[#33363A] dark:hover:text-[#E8E6E1]"
            )}
            aria-label="Not helpful"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill={feedback === "not-helpful" ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3H10zM17 2h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3" />
            </svg>
          </button>
        </>
      )}

      {onRegenerate && (
        <button
          type="button"
          onClick={onRegenerate}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-[#9CA3AF] transition hover:bg-[#F1EEE6] hover:text-[#16302C] dark:hover:bg-[#33363A] dark:hover:text-[#E8E6E1]"
          aria-label="Regenerate"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="1 4 1 10 7 10" />
            <path d="M3.5 14.5A9 9 0 1 0 12 3" />
          </svg>
        </button>
      )}

      {onShare && (
        <button
          type="button"
          onClick={onShare}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-[#9CA3AF] transition hover:bg-[#F1EEE6] hover:text-[#16302C] dark:hover:bg-[#33363A] dark:hover:text-[#E8E6E1]"
          aria-label="Share"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
        </button>
      )}
    </div>
  );
}
