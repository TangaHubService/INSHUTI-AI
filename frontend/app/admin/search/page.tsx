"use client";

import { useState } from "react";

import { AppShell } from "@/components/AppShell";
import { useRequireAdmin } from "@/lib/useAdminAuth";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
type Results = Record<string, Array<Record<string, unknown>>>;

export default function AdminSearchPage() {
  const { admin, loading } = useRequireAdmin();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Results | null>(null);
  const [searching, setSearching] = useState(false);

  async function search() {
    if (query.trim().length < 2) return;
    setSearching(true);
    const response = await fetch(`${API_URL}/api/search/admin?q=${encodeURIComponent(query.trim())}`, { credentials: "include" });
    setResults(response.ok ? await response.json() : null);
    setSearching(false);
  }

  if (loading || !admin) return null;
  return (
    <AppShell active="/admin/search" session={{ kind: "admin", admin }}>
      <h1 className="font-display text-3xl text-teal-900">Secure platform search</h1>
      <p className="mt-2 text-sm text-ink-soft">Search users, professionals, facilities, multilingual articles, and consultation references.</p>
      <form className="mt-6 flex max-w-2xl gap-2" onSubmit={(event) => { event.preventDefault(); void search(); }}>
        <input value={query} onChange={(event) => setQuery(event.target.value)} minLength={2} className="flex-1 rounded-xl border border-line px-4 py-3" placeholder="Enter at least 2 characters" />
        <button disabled={searching} className="rounded-full bg-coral px-5 font-semibold text-white">{searching ? "Searching…" : "Search"}</button>
      </form>
      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        {results && Object.entries(results).map(([group, items]) => (
          <section key={group} className="card p-5">
            <h2 className="mb-3 font-display text-xl capitalize text-teal-900">{group} ({items.length})</h2>
            {items.length === 0 ? <p className="text-sm text-ink-soft">No matches.</p> : items.map((item, index) => (
              <div key={String(item.id ?? index)} className="border-b border-line py-2 text-xs last:border-0">
                {Object.entries(item).filter(([, value]) => typeof value !== "object").map(([key, value]) => <div key={key}><strong>{key}:</strong> {String(value ?? "")}</div>)}
              </div>
            ))}
          </section>
        ))}
      </div>
    </AppShell>
  );
}
