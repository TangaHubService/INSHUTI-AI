"use client";

import type { InputHTMLAttributes } from "react";

export function Input({
  className = "",
  error,
  label,
  helperText,
  ...props
}: {
  className?: string;
  error?: string;
  label?: string;
  helperText?: string;
} & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="w-full">
      {label && (
        <label className="mb-1.5 block text-[13px] font-semibold text-ink-soft">
          {label}
        </label>
      )}
      <input
        className={`w-full rounded-[var(--radius-sm)] border bg-paper-2 px-[14px] py-3 text-[14.5px] transition-all duration-150 placeholder:text-[#9CA8A4] focus:outline-none focus:ring-2 focus:ring-offset-0 ${
          error
            ? "border-danger focus:border-danger focus:ring-danger/20"
            : "border-line focus:border-teal-600 focus:ring-teal-100"
        } ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-1.5 text-[12.5px] font-semibold text-danger">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1.5 text-[12px] text-ink-soft">{helperText}</p>
      )}
    </div>
  );
}
