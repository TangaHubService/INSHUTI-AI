"use client";

import { useEffect, useState } from "react";

import { AppShell } from "@/components/AppShell";
import { useRequireAdmin } from "@/lib/useAdminAuth";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

interface AuditLogEntry {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  adminId: string | null;
  adminEmail: string | null;
  details: Record<string, unknown>;
  createdAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

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
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/api/audit-logs?page=${page}&limit=30`, { credentials: "include" });
        if (!res.ok) throw new Error("Failed to load audit logs");
        const data = await res.json();
        if (!cancelled) {
          setLogs(data.logs);
          setPagination(data.pagination);
        }
      } catch {
        // silent
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => { cancelled = true; };
  }, [page]);

  if (authLoading || !admin) return null;

  return (
    <AppShell active="/admin/audit-logs" session={{ kind: "admin", admin }}>
      <div className="flex items-center justify-between">
        <h1 className="mb-6 font-display text-[28px] text-teal-900">Audit Logs</h1>
      </div>
      <p className="mb-8 max-w-[600px] text-[14.5px] leading-[1.6] text-ink-soft">
        Chronological record of all administrative actions. Logs are retained indefinitely and cannot be deleted.
      </p>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-200 border-t-teal-700" />
        </div>
      ) : logs.length === 0 ? (
        <div className="rounded-xl bg-teal-100 p-8 text-center text-[15px] font-semibold text-teal-700">
          No audit logs yet. Actions will appear here as admins perform them.
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-md border border-line">
            <table className="w-full text-left text-[13.5px]">
              <thead>
                <tr className="border-b border-line bg-paper-2">
                  <th className="px-4 py-3 font-bold text-ink-soft">Action</th>
                  <th className="px-4 py-3 font-bold text-ink-soft">Entity</th>
                  <th className="px-4 py-3 font-bold text-ink-soft">Admin</th>
                  <th className="px-4 py-3 font-bold text-ink-soft">Details</th>
                  <th className="px-4 py-3 font-bold text-ink-soft">Date</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b border-line last:border-b-0 hover:bg-paper-2">
                    <td className="px-4 py-3">
                      <span className="font-semibold text-teal-900">{actionLabel(log.action)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold ${entityColor(log.entityType)}`}>
                        {log.entityType.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-ink-soft">{log.adminEmail ?? "—"}</td>
                    <td className="max-w-[200px] truncate px-4 py-3 text-ink-soft">
                      {Object.keys(log.details).length > 0 ? JSON.stringify(log.details) : "—"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-ink-soft">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-full border border-line px-4 py-2 text-[13px] font-semibold text-teal-700 disabled:opacity-30"
              >
                Previous
              </button>
              <span className="px-3 text-[13px] text-ink-soft">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                className="rounded-full border border-line px-4 py-2 text-[13px] font-semibold text-teal-700 disabled:opacity-30"
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
