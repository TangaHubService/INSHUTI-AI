"use client";

import type { InputHTMLAttributes } from "react";

export function Input({
  className = "",
  error,
  ...props
}: {
  className?: string;
  error?: string;
} & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <input
        className={`w-full rounded-[10px] border bg-paper-2 px-[14px] py-3 text-sm transition-colors duration-150 focus:outline-none focus:ring-2 ${
          error
            ? "border-danger focus:border-danger focus:ring-danger/20"
            : "border-line focus:border-teal-600 focus:ring-teal-100"
        } ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs font-semibold text-danger">{error}</p>}
    </div>
  );
}
