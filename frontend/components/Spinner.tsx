export function Spinner({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`animate-spin text-teal-700 ${className}`}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" opacity="0.2" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

export function PageLoading({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex items-center gap-2.5 py-10 text-sm text-ink-soft">
      <Spinner />
      {label}
    </div>
  );
}
