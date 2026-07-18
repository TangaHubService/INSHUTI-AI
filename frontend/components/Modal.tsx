"use client";

import { useEffect } from "react";

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

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/30" onClick={onCancel} />
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2">
        <div className="rounded-xl border border-line bg-white p-6 shadow-soft">
          <h3 className="font-display text-lg text-teal-900">{title}</h3>
          <p className="mt-2 text-sm leading-[1.6] text-ink-soft">{message}</p>
          <div className="mt-6 flex justify-end gap-2.5">
            <button
              onClick={onCancel}
              className="rounded-full border-[1.5px] border-line px-4 py-[9px] text-[13px] font-semibold text-ink-soft"
            >
              {cancelLabel ?? "Cancel"}
            </button>
            <button
              onClick={onConfirm}
              className={`rounded-full px-4 py-[9px] text-[13px] font-semibold text-white shadow-[0_8px_20px_rgba(232,115,92,0.35)] ${
                variant === "danger" ? "bg-coral hover:bg-coral-dark" : "bg-teal-700 hover:bg-teal-900"
              }`}
            >
              {confirmLabel ?? "Confirm"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
