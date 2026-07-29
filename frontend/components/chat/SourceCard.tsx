"use client";

import type { ChatSource, Language } from "@/lib/apiClient";

interface SourceCardProps {
  source: ChatSource;
  language: Language;
  index: number;
}

export function SourceCard({ source, language, index }: SourceCardProps) {
  return (
    <div className="group rounded-xl border border-[#E1DACB] bg-white p-3.5 shadow-xs transition hover:shadow-sm dark:border-[#33363A] dark:bg-[#222528]">
      <div className="flex items-start gap-3">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-teal-100 text-teal-700 dark:bg-[#1A3835] dark:text-[#7DD4CC]">
          <span className="text-[11px] font-bold">{index + 1}</span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[13px] font-semibold text-[#16302C] leading-snug dark:text-[#E8E6E1]">
            {language === "RW" ? source.titleRw : source.titleEn}
          </div>
          {source.bodySnippet && (
            <div className="mt-1 text-[12px] leading-[1.5] text-[#4B615D] line-clamp-2 dark:text-[#B0B0A8]">
              {source.bodySnippet}
            </div>
          )}
          {source.externalUrl && (
            <a
              href={source.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-semibold text-teal-700 hover:text-teal-900 dark:text-[#7DD4CC] dark:hover:text-[#B7D6D1]"
            >
              {language === "RW" ? "Reba inkomoko" : language === "FR" ? "Voir la source" : language === "SW" ? "Ona chanzo" : "View source"}
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
