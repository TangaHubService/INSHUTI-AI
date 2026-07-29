"use client";

import { motion, AnimatePresence } from "framer-motion";

interface ScrollToBottomProps {
  show: boolean;
  onClick: () => void;
}

export function ScrollToBottom({ show, onClick }: ScrollToBottomProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.button
          type="button"
          onClick={onClick}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="sticky bottom-4 left-1/2 z-10 mx-auto flex h-9 w-9 -translate-x-1/2 items-center justify-center rounded-full bg-white shadow-lg ring-1 ring-gray-200 transition hover:bg-gray-50 dark:bg-[#222528] dark:ring-[#33363A] dark:hover:bg-[#1A1C1E]"
          aria-label="Scroll to bottom"
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
