"use client";

import { motion } from "framer-motion";
import type { Language } from "@/lib/apiClient";

interface TypingIndicatorProps {
  status: "thinking" | "generating" | "idle";
  language: Language;
}

const statusMessages = {
  thinking: {
    EN: "Thinking…",
    RW: "Iritekereza…",
    FR: "Réfléchit…",
    SW: "Inafikiria…",
  },
  generating: {
    EN: "Generating…",
    RW: "Irimo gusubiza…",
    FR: "Génère…",
    SW: "Inazalisha…",
  },
  idle: {
    EN: "Working…",
    RW: "Ariko arimo…",
    FR: "En cours…",
    SW: "Inaendelea…",
  },
};

export function TypingIndicator({ status, language }: TypingIndicatorProps) {
  const dots = [0, 1, 2];

  return (
    <motion.div
      className="mb-5 flex items-start gap-3"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-teal-700 shadow-sm">
        <svg width="14" height="14" className="text-white">
          <use href="#i-bot" />
        </svg>
      </div>
      <div className="flex items-center gap-3 rounded-2xl rounded-bl-[4px] bg-[#F1EEE6] px-4 py-3 shadow-sm dark:bg-[#222528]">
        <div className="flex gap-1.5">
          {dots.map((i) => (
            <motion.span
              key={i}
              className="h-2 w-2 rounded-full bg-teal-600"
              animate={{ y: [0, -4, 0] }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                delay: i * 0.15,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
        <span className="text-[12.5px] text-[#4B615D] dark:text-[#B0B0A8]">
          {statusMessages[status][language]}
        </span>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="ml-1 flex h-6 w-6 items-center justify-center rounded-lg bg-white/80 text-[#4B615D] transition hover:bg-coral-100 hover:text-coral-dark dark:bg-[#1A1C1E]/80 dark:text-[#B0B0A8] dark:hover:bg-[#3D221C] dark:hover:text-[#F0907A]"
          aria-label="Stop generation"
          title="Stop"
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
            <rect x="4" y="4" width="16" height="16" rx="2" />
          </svg>
        </button>
      </div>
    </motion.div>
  );
}
