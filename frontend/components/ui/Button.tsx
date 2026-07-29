"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-coral text-white shadow-btn hover:bg-coral-dark hover:-translate-y-px active:translate-y-0",
  secondary:
    "bg-teal-700 text-white shadow-md hover:bg-teal-900 hover:-translate-y-px active:translate-y-0",
  outline:
    "border-[1.5px] border-teal-700 text-teal-700 hover:bg-teal-100 hover:-translate-y-px active:translate-y-0",
  ghost:
    "text-ink-soft hover:text-teal-700 hover:bg-teal-100/50",
  danger:
    "bg-coral-dark text-white shadow-btn hover:bg-danger hover:-translate-y-px active:translate-y-0",
};

const sizeClasses: Record<Size, string> = {
  sm: "px-4 py-[9px] text-[13px] gap-1.5",
  md: "px-[26px] py-[13px] text-[15px] gap-2",
  lg: "px-8 py-4 text-[16px] gap-2.5",
};

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  loading,
  ...props
}: {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
  loading?: boolean;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-full font-semibold transition-all duration-150 ease-out disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      disabled={props.disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" opacity="0.2" />
          <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      )}
      {children}
    </button>
  );
}
