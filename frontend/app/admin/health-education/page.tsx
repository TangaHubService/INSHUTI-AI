"use client";

import { useEffect, useState } from "react";

import { AppShell } from "@/components/AppShell";
import { Drawer } from "@/components/Drawer";
import { ConfirmModal } from "@/components/Modal";
import { PageLoading } from "@/components/Spinner";
import { ResourceCard } from "@/components/healthEducation/ResourceCard";
import { ResourceEditor } from "@/components/healthEducation/ResourceEditor";
import {
  deleteHealthEducationResource,
  getHealthEducationResources,
  type HealthEducationResource,
} from "@/lib/adminApiClient";
import { useRequireAdmin } from "@/lib/useAdminAuth";
import { useToast } from "@/lib/useToast";

export default function HealthEducationLibraryAdminPage() {
  const { admin, loading: authLoading } = useRequireAdmin("CONTENT_REVIEWER");
  const { toast } = useToast();

  const [resources, setResources] = useState<HealthEducationResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const [total, setTotal] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const data = await getHealthEducationResources({ search: search || undefined, page, limit: 20 });
      setResources(data.resources);
      setPageCount(data.pageCount);
      setTotal(data.total);
    } catch {
      toast("Failed to load resources", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!admin) return;
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [admin, page]);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    void load();
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteHealthEducationResource(deleteTarget.id);
      toast("Resource deleted", "success");
      setDeleteTarget(null);
      void load();
    } catch {
      toast("Failed to delete resource", "error");
    }
  }

  function openNew() {
    setEditingId(null);
    setDrawerOpen(true);
  }

  function openEdit(id: string) {
    setEditingId(id);
    setDrawerOpen(true);
  }

  function closeDrawer() {
    setDrawerOpen(false);
    setEditingId(null);
    void load();
  }

  if (authLoading || !admin) return null;

  return (
    <AppShell active="/admin/health-education" session={{ kind: "admin", admin }}>
      <div className="mb-[22px] flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-[26px] text-teal-900">Health Education Library</h1>
          <p className="mt-1 text-sm text-ink-soft">{total} resource{total === 1 ? "" : "s"} with attachments hosted on Cloudinary.</p>
        </div>
        <button
          onClick={openNew}
          className="inline-flex items-center gap-2 rounded-full bg-coral px-4 py-[9px] text-[13px] font-semibold text-white shadow-btn transition hover:-translate-y-px hover:bg-coral-dark hover:shadow-lg"
        >
          <svg width="15" height="15"><use href="#i-plus" /></svg>
          New Resource
        </button>
      </div>

      <form onSubmit={handleSearchSubmit} className="mb-5 flex max-w-[420px] items-center gap-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search resources…"
          className="w-full rounded-[var(--radius-sm)] border border-line bg-white px-[14px] py-[9px] text-sm"
        />
        <button type="submit" className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[var(--radius-sm)] border border-line hover:bg-paper-2">
          <svg width="15" height="15"><use href="#i-search" /></svg>
        </button>
      </form>

      {loading && <PageLoading />}

      {!loading && resources.length === 0 && (
        <div className="card p-8 text-center text-[14px] text-ink-soft">No resources yet. Create the first one.</div>
      )}

      {!loading && resources.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {resources.map((r) => (
            <ResourceCard
              key={r.id}
              resource={r}
              viewHref={`/resources/${r.id}`}
              isAdmin
              onEdit={() => openEdit(r.id)}
              onDelete={() => setDeleteTarget({ id: r.id, title: r.title })}
            />
          ))}
        </div>
      )}

      <ConfirmModal
        open={deleteTarget !== null}
        title="Delete resource"
        message={`Delete "${deleteTarget?.title}"? This removes all its attachments from Cloudinary and cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={() => void handleDelete()}
        onCancel={() => setDeleteTarget(null)}
      />

      <Drawer open={drawerOpen} onClose={closeDrawer} title={editingId ? "Edit Resource" : "New Resource"}>
        <ResourceEditor resourceId={editingId ?? undefined} onCreated={(id) => setEditingId(id)} onSaved={() => void load()} />
      </Drawer>

      {pageCount > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="rounded-full border border-line px-4 py-2 text-[13px] font-semibold text-ink-soft disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-[13px] text-ink-soft">Page {page} of {pageCount}</span>
          <button
            onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
            disabled={page >= pageCount}
            className="rounded-full border border-line px-4 py-2 text-[13px] font-semibold text-ink-soft disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </AppShell>
  );
}
