"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function ConfirmModal({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel,
  variant,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "default";
  onConfirm: () => void;
  onCancel: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onCancel]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onCancel}
          />
          <motion.div
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <div className="rounded-[var(--radius-lg)] border border-line bg-white p-6 shadow-xl">
              <h3 className="font-display text-lg text-teal-900">{title}</h3>
              <p className="mt-2 text-sm leading-[1.6] text-ink-soft">{message}</p>
              <div className="mt-6 flex justify-end gap-2.5">
                <button
                  onClick={onCancel}
                  className="rounded-full border-[1.5px] border-line px-4 py-[9px] text-[13px] font-semibold text-ink-soft transition hover:bg-paper-2"
                >
                  {cancelLabel ?? "Cancel"}
                </button>
                <button
                  onClick={onConfirm}
                  className={`rounded-full px-4 py-[9px] text-[13px] font-semibold text-white shadow-btn transition hover:-translate-y-px ${
                    variant === "danger" ? "bg-coral hover:bg-coral-dark" : "bg-teal-700 hover:bg-teal-900"
                  }`}
                >
                  {confirmLabel ?? "Confirm"}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
