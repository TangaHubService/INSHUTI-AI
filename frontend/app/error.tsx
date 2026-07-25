"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-paper px-5 text-center">
      <div className="mx-auto max-w-md">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-coral-100">
          <svg width="36" height="36" className="text-coral-dark">
            <use href="#i-alert" />
          </svg>
        </div>
        <h1 className="font-display text-[32px] font-bold text-teal-900">Something went wrong</h1>
        <p className="mt-4 text-[15px] leading-relaxed text-ink-soft">
          An unexpected error occurred. Please try again.
        </p>
        <button
          onClick={reset}
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-coral px-[26px] py-[13px] text-[15px] font-semibold text-white shadow-[0_8px_20px_rgba(232,115,92,0.35)] transition-all duration-150 hover:-translate-y-px hover:bg-coral-dark"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
