"use client";

import Link from "next/link";
import type { Language } from "@/lib/apiClient";
import type { UserProfile } from "@/lib/userApiClient";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

interface ChatHeaderProps {
  onToggleSidebar: () => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  user: UserProfile | null;
  anonymousMode: boolean;
  onToggleAnonymous: () => void;
}

export function ChatHeader({
  onToggleSidebar,
  language,
  onLanguageChange,
  user,
  anonymousMode,
  onToggleAnonymous,
}: ChatHeaderProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-[#E1DACB] bg-white/90 backdrop-blur-lg supports-[backdrop-filter]:bg-white/80 dark:border-[#33363A] dark:bg-[#1A1C1E]/90">
      <div className="mx-auto flex h-14 max-w-[860px] items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-[#4B615D] transition hover:bg-[#F1EEE6] dark:text-[#B0B0A8] dark:hover:bg-[#222528]"
            aria-label="Toggle history sidebar"
          >
            <svg width="18" height="18">
              <use href="#i-menu" />
            </svg>
          </button>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-700 shadow-sm">
            <svg width="18" height="18" className="text-white">
              <use href="#i-bot" />
            </svg>
          </div>
          <div>
            <div className="text-[14px] font-bold text-[#16302C] dark:text-[#E8E6E1]">
              Inshuti Assistant
            </div>
            <div className="text-[11px] text-[#4B615D] dark:text-[#B0B0A8]">
              {user && !anonymousMode ? `Signed in as ${user.name}` : "Anonymous \u00B7 Private"}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {user && (
            <button
              type="button"
              onClick={onToggleAnonymous}
              className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition ${
                anonymousMode
                  ? "bg-teal-100 text-teal-700 dark:bg-[#1A3835] dark:text-[#7DD4CC]"
                  : "bg-gold-100 text-[#8A5E1E] dark:bg-[#3D3018] dark:text-[#E3A857]"
              }`}
            >
              {anonymousMode ? "Anonymous" : "Identified"}
            </button>
          )}
          {!user && <LanguageSwitcher value={language} onChange={onLanguageChange} />}
          <Link
            href="/"
            className="rounded-full px-3 py-1.5 text-[12px] font-semibold text-[#4B615D] transition hover:bg-[#F1EEE6] dark:text-[#B0B0A8] dark:hover:bg-[#222528]"
          >
            Home
          </Link>
        </div>
      </div>
    </header>
  );
}
