"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "outline" | "ghost";
type Size = "sm" | "md" | "lg";

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-coral text-white shadow-[0_8px_20px_rgba(232,115,92,0.35)] hover:bg-coral-dark hover:-translate-y-px",
  outline:
    "border-[1.5px] border-teal-700 text-teal-700 hover:bg-teal-100 hover:-translate-y-px",
  ghost:
    "text-ink-soft hover:text-teal-700 hover:bg-teal-100/50",
};

const sizeClasses: Record<Size, string> = {
  sm: "px-4 py-[9px] text-[13px]",
  md: "px-[26px] py-[13px] text-[15px]",
  lg: "px-8 py-4 text-[16px]",
};

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}: {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-150 ease-out disabled:opacity-50 disabled:cursor-not-allowed ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
