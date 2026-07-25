export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-paper">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-teal-100 border-t-teal-700" />
        <p className="text-sm font-semibold text-ink-soft">Loading…</p>
      </div>
    </div>
  );
}
