"use client";

import { useEffect, useState } from "react";

import { AppShell } from "@/components/AppShell";
import { PageLoading } from "@/components/Spinner";
import { DataTable, type DataTableColumn } from "@/components/tables/DataTable";
import { getAuditLogs, type AuditLogEntry, type AuditLogPagination } from "@/lib/adminApiClient";
import { useRequireAdmin } from "@/lib/useAdminAuth";

function actionLabel(action: string): string {
  return action.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function entityColor(entityType: string): string {
  switch (entityType) {
    case "flagged_item": return "text-coral-dark bg-coral-100";
    case "user": return "text-teal-700 bg-teal-100";
    case "admin_user": return "text-[#8A5E1E] bg-gold-100";
    case "article": return "text-teal-700 bg-teal-100";
    case "app_settings": return "text-[#8A5E1E] bg-gold-100";
    case "crisis_resource": return "text-coral-dark bg-coral-100";
    case "healthcare_professional": return "text-teal-700 bg-teal-100";
    default: return "text-ink-soft bg-paper-2";
  }
}

export default function AdminAuditLogsPage() {
  const { admin, loading: authLoading } = useRequireAdmin();
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [pagination, setPagination] = useState<AuditLogPagination | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getAuditLogs({ page, limit: 30 })
      .then((data) => {
        if (cancelled) return;
        setLogs(data.logs);
        setPagination(data.pagination);
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [page]);

  if (authLoading || !admin) return null;

  const columns: DataTableColumn<AuditLogEntry>[] = [
    { key: "action", label: "Action", render: (log) => <span className="font-semibold text-teal-900">{actionLabel(log.action)}</span> },
    {
      key: "entity",
      label: "Entity",
      render: (log) => (
        <span className={`inline-block rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold ${entityColor(log.entityType)}`}>
          {log.entityType.replace(/_/g, " ")}
        </span>
      ),
    },
    { key: "admin", label: "Admin", render: (log) => log.adminEmail ?? "—" },
    { key: "details", label: "Details", render: (log) => (Object.keys(log.details).length > 0 ? JSON.stringify(log.details) : "—") },
    { key: "date", label: "Date", render: (log) => new Date(log.createdAt).toLocaleString() },
  ];

  return (
    <AppShell active="/admin/audit-logs" session={{ kind: "admin", admin }}>
      <div className="flex items-center justify-between">
        <h1 className="mb-6 font-display text-[28px] text-teal-900">Audit Logs</h1>
      </div>
      <p className="mb-8 max-w-[600px] text-[14.5px] leading-[1.6] text-ink-soft">
        Chronological record of all administrative actions. Logs are retained indefinitely and cannot be deleted.
      </p>

      {loading ? (
        <PageLoading />
      ) : logs.length === 0 ? (
        <div className="card p-8 text-center text-[15px] text-ink-soft">
          No audit logs yet. Actions will appear here as admins perform them.
        </div>
      ) : (
        <>
          <DataTable columns={columns} rows={logs} keyField="id" />

          {pagination && pagination.totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-full border border-line px-4 py-2 text-[13px] font-semibold text-teal-700 transition hover:bg-teal-100 disabled:opacity-30"
              >
                Previous
              </button>
              <span className="px-3 text-[13px] text-ink-soft">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                className="rounded-full border border-line px-4 py-2 text-[13px] font-semibold text-teal-700 transition hover:bg-teal-100 disabled:opacity-30"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </AppShell>
  );
}
