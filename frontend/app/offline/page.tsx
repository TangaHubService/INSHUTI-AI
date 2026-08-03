import Link from "next/link";

export default function OfflinePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center px-6 text-center">
      <h1 className="font-display text-3xl text-teal-900">You’re offline</h1>
      <p className="mt-3 text-ink-soft">Previously opened health resources may still be available. Reconnect before sending private messages or requesting urgent help.</p>
      <Link href="/library" className="mt-6 rounded-full bg-teal-700 px-5 py-3 font-semibold text-white">Open saved resources</Link>
    </main>
  );
}
