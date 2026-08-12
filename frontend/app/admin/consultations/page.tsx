"use client";

import { useEffect, useState } from "react";

import { AppShell } from "@/components/AppShell";
import { PageLoading } from "@/components/Spinner";
import { DataTable, type DataTableColumn } from "@/components/tables/DataTable";
import {
  escalateConsultation,
  getAdminConsultations,
  getConsultationProfessionals,
  reassignConsultation,
  type AdminConsultationSummary,
  type ReassignableProfessional,
} from "@/lib/adminApiClient";
import { useRequireAdmin } from "@/lib/useAdminAuth";
import { useToast } from "@/lib/useToast";

const STATUS_OPTIONS = ["PENDING", "ASSIGNED", "IN_PROGRESS", "RESOLVED"];

const STATUS_STYLE: Record<string, string> = {
  PENDING: "bg-gold-100 text-[#8A5E1E]",
  ASSIGNED: "bg-teal-100 text-teal-700",
  IN_PROGRESS: "bg-teal-100 text-teal-700",
  RESOLVED: "bg-teal-100 text-[#1E7A5A]",
};

export default function AdminConsultationsPage() {
  const { admin, loading: authLoading } = useRequireAdmin("MODERATOR");
  const { toast } = useToast();

  const [consultations, setConsultations] = useState<AdminConsultationSummary[]>([]);
  const [professionals, setProfessionals] = useState<ReassignableProfessional[]>([]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const [total, setTotal] = useState(0);

  async function load() {
    setLoading(true);
    try {
      const [data, profs] = await Promise.all([
        getAdminConsultations({ status: status || undefined, page, limit: 25 }),
        getConsultationProfessionals(),
      ]);
      setConsultations(data.consultations);
      setPageCount(data.pageCount);
      setTotal(data.total);
      setProfessionals(profs);
    } catch {
      toast("Failed to load consultations", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!admin) return;
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [admin, status, page]);

  async function handleReassign(consultationId: string, professionalId: string) {
    if (!professionalId) return;
    try {
      await reassignConsultation(consultationId, professionalId);
      toast("Consultation reassigned", "success");
      void load();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to reassign", "error");
    }
  }

  async function handleEscalate(consultationId: string) {
    try {
      await escalateConsultation(consultationId);
      toast("Consultation escalated", "success");
      void load();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to escalate", "error");
    }
  }

  if (authLoading || !admin) return null;

  const columns: DataTableColumn<AdminConsultationSummary>[] = [
    { key: "user", label: "User", render: (c) => <span className="font-semibold text-ink">{c.userName}</span> },
    { key: "professional", label: "Assigned to", render: (c) => c.professionalName ?? "— Unassigned" },
    {
      key: "status",
      label: "Status",
      render: (c) => <span className={`badge ${STATUS_STYLE[c.status] ?? "bg-paper-2 text-ink-soft"}`}>{c.status}</span>,
    },
    { key: "priority", label: "Priority", render: (c) => c.priority },
    { key: "updated", label: "Updated", render: (c) => new Date(c.updatedAt).toLocaleString() },
    {
      key: "actions",
      label: "",
      align: "right",
      render: (c) => (
        <div className="flex flex-wrap items-center justify-end gap-2">
          <select
            defaultValue=""
            onChange={(e) => void handleReassign(c.id, e.target.value)}
            className="rounded-lg border border-line bg-white px-2.5 py-1.5 text-[12px]"
          >
            <option value="" disabled>Reassign to…</option>
            {professionals.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <button
            onClick={() => void handleEscalate(c.id)}
            className="rounded-full border border-line px-3 py-1.5 text-[12px] font-semibold text-ink-soft transition hover:bg-paper-2"
          >
            Escalate
          </button>
        </div>
      ),
    },
  ];

  return (
    <AppShell active="/admin/consultations" session={{ kind: "admin", admin }}>
      <div className="mb-[22px] flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-[26px] text-teal-900">Consultation Oversight</h1>
          <p className="mt-1 text-sm text-ink-soft">{total} consultation{total === 1 ? "" : "s"}. Reassign or escalate — message content stays private to the participants.</p>
        </div>
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="rounded-lg border border-line bg-white px-3 py-2 text-[13px] font-semibold text-ink-soft"
        >
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {loading && <PageLoading />}

      {!loading && (
        <DataTable columns={columns} rows={consultations} keyField="id" emptyMessage="No consultations found." />
      )}

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
