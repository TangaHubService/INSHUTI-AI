"use client";

import { useEffect } from "react";

export default function AdminError({
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
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0D2B29] px-5 text-center">
      <div className="mx-auto max-w-md">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#123934] shadow-sm">
          <svg width="36" height="36" className="text-coral">
            <use href="#i-alert" />
          </svg>
        </div>
        <h1 className="font-display text-[32px] font-bold text-white">Something went wrong</h1>
        <p className="mt-4 text-[15px] leading-relaxed text-[#9FC3BD]">
          An unexpected error occurred in the admin area.
        </p>
        <button
          onClick={reset}
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-coral px-[26px] py-[13px] text-[15px] font-semibold text-white shadow-btn transition-all duration-150 hover:-translate-y-px hover:bg-coral-dark"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
