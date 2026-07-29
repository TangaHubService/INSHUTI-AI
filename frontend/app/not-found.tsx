import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-paper px-5 text-center">
      <div className="mx-auto max-w-md">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-teal-100 shadow-sm">
          <svg width="36" height="36" className="text-teal-700">
            <use href="#i-map-pin" />
          </svg>
        </div>
        <h1 className="font-display text-[52px] font-bold text-teal-900">404</h1>
        <p className="mt-4 text-[17px] leading-relaxed text-ink-soft">
          This page doesn&apos;t exist. It might have moved or been removed.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-coral px-[26px] py-[13px] text-[15px] font-semibold text-white shadow-btn transition-all duration-150 hover:-translate-y-px hover:bg-coral-dark"
        >
          <svg width="16" height="16">
            <use href="#i-arrow" />
          </svg>
          Go Home
        </Link>
      </div>
    </div>
  );
}
