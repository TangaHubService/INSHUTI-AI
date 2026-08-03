"use client";

import { motion } from "framer-motion";
import type { Language } from "@/lib/apiClient";

interface FollowUpCTAProps {
  language: Language;
  requestingHelp: boolean;
  onRequest: () => void;
}

export function FollowUpCTA({ language, requestingHelp, onRequest }: FollowUpCTAProps) {
  return (
    <motion.div
      className="mb-6 flex items-center gap-3 rounded-2xl border border-teal-200 bg-gradient-to-r from-teal-50 to-white px-4 py-3 shadow-sm dark:border-[#1A3835] dark:from-[#1A3835]/50 dark:to-[#1A1C1E]"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-100 text-teal-700 dark:bg-[#1A3835] dark:text-[#7DD4CC]">
        <svg width="16" height="16">
          <use href="#i-user-check" />
        </svg>
      </div>
      <span className="flex-1 text-[13px] font-semibold text-[#16302C] dark:text-[#E8E6E1]">
        {language === "RW"
          ? "Wifuza kuvugana n'umukozi w'ubuzima?"
          : language === "FR"
            ? "Vous souhaitez parler à un professionnel de santé ?"
            : language === "SW"
              ? "Ungependa kuzungumza na mtaalamu wa afya?"
              : "Would you like to talk to a health worker?"}
      </span>
      <button
        type="button"
        onClick={onRequest}
        disabled={requestingHelp}
        className="rounded-full bg-teal-700 px-4 py-1.5 text-[12px] font-semibold text-white shadow-sm transition hover:bg-teal-900 disabled:opacity-50"
      >
        {requestingHelp
          ? language === "RW" ? "Birimo…" : language === "FR" ? "En cours…" : language === "SW" ? "Inaomba…" : "Requesting…"
          : language === "RW"
            ? "Kanda"
            : language === "FR"
              ? "Parler"
              : language === "SW"
                ? "Ongea"
                : "Talk"}
      </button>
    </motion.div>
  );
}
