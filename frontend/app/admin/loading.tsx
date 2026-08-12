export default function AdminLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0D2B29]">
      <div className="flex flex-col items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-[var(--radius-md)] bg-[#123934] shadow-sm">
          <svg className="animate-spin h-6 w-6 text-coral" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" opacity="0.2" />
            <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </div>
        <p className="text-sm font-semibold text-[#9FC3BD]">Loading…</p>
      </div>
    </div>
  );
}
