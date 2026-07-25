export default function AdminLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0D2B29]">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-teal-700/30 border-t-coral" />
        <p className="text-sm font-semibold text-[#9FC3BD]">Loading…</p>
      </div>
    </div>
  );
}
