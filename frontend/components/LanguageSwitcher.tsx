"use client";

import { useEffect, useRef, useState } from "react";
import type { Language } from "@/lib/apiClient";

const LANGUAGES: Language[] = ["EN", "RW", "FR", "SW"];

const LANGUAGE_LABEL: Record<Language, string> = {
  EN: "English",
  RW: "Kinyarwanda",
  FR: "Français",
  SW: "Kiswahili",
};

export function LanguageSwitcher({ value, onChange }: { value: Language; onChange: (lang: Language) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex items-center gap-1.5 rounded-full border border-line bg-white px-3 py-[7px] text-[12.5px] font-bold text-teal-700 transition hover:bg-teal-100"
      >
        {value}
        <svg width="12" height="12" className={`transition-transform ${open ? "rotate-180" : ""}`}>
          <use href="#i-chevron-down" />
        </svg>
      </button>
      {open && (
        <div
          role="listbox"
          className="absolute right-0 z-30 mt-1.5 w-44 overflow-hidden rounded-[12px] border border-line bg-white py-1 shadow-card"
        >
          {LANGUAGES.map((lang) => (
            <button
              key={lang}
              type="button"
              role="option"
              aria-selected={value === lang}
              onClick={() => {
                onChange(lang);
                setOpen(false);
              }}
              className={`flex w-full items-center justify-between px-3.5 py-2 text-left text-[13px] font-semibold transition hover:bg-paper-2 ${
                value === lang ? "text-teal-700" : "text-ink"
              }`}
            >
              {LANGUAGE_LABEL[lang]}
              {value === lang && (
                <svg width="14" height="14">
                  <use href="#i-check" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
