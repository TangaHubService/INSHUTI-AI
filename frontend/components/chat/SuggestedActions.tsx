"use client";

import type { Language } from "@/lib/apiClient";

const SUGGESTED_ACTIONS = [
  { key: "explain", icon: "i-info", labelEn: "Explain further", labelRw: "Sobanura byinshi", labelFr: "Expliquer davantage", labelSw: "Eleza zaidi" },
  { key: "simplify", icon: "i-text", labelEn: "Simplify", labelRw: "Yoroshya", labelFr: "Simplifier", labelSw: "Rahisisha" },
  { key: "summarize", icon: "i-list", labelEn: "Summarize", labelRw: "Mvugurupfu", labelFr: "Résumer", labelSw: "Fanya muhtasari" },
  { key: "translate", icon: "i-globe", labelEn: "Translate to Kinyarwanda", labelRw: "Ihinduze mu Cyongereza", labelFr: "Traduire", labelSw: "Tafsiri" },
];

interface SuggestedActionsProps {
  language: Language;
  onAction: (key: string) => void;
}

export function SuggestedActions({ language, onAction }: SuggestedActionsProps) {
  const labelKey = `label${language === "EN" ? "En" : language === "RW" ? "Rw" : language === "FR" ? "Fr" : "Sw"}` as "labelEn" | "labelRw" | "labelFr" | "labelSw";

  return (
    <div className="mt-3 flex flex-wrap gap-1.5">
      {SUGGESTED_ACTIONS.map((action) => (
        <button
          key={action.key}
          type="button"
          onClick={() => onAction(action.key)}
          className="inline-flex items-center gap-1.5 rounded-full border border-[#D1D5DB] bg-white px-3 py-1.5 text-[11.5px] font-medium text-[#6B7280] transition hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700 dark:border-[#44484C] dark:bg-[#222528] dark:text-[#B0B0A8] dark:hover:border-teal-700 dark:hover:bg-[#1A3835] dark:hover:text-teal-300"
        >
          <svg width="12" height="12">
            <use href={`#${action.icon}`} />
          </svg>
          {action[labelKey]}
        </button>
      ))}
    </div>
  );
}
