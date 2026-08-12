"use client";

import { useEffect, useState } from "react";

import { getAuditLogs, getDashboard, type AuditLogEntry, type DashboardStats } from "@/lib/adminApiClient";
import { AppShell } from "@/components/AppShell";
import { PageLoading } from "@/components/Spinner";
import { StatCard } from "@/components/ui/StatCard";
import { Panel } from "@/components/layout/Panel";
import { BarChart } from "@/components/charts/BarChart";
import { useRequireAdmin } from "@/lib/useAdminAuth";

function actionLabel(action: string): string {
  return action.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function relativeTime(iso: string): string {
  const minutes = Math.floor((Date.now() - new Date(iso).getTime()) / 60_000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function AdminDashboardPage() {
  const { admin, loading: authLoading } = useRequireAdmin();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState<AuditLogEntry[]>([]);

  useEffect(() => {
    if (!admin) return;
    getDashboard()
      .then(setStats)
      .finally(() => setLoading(false));
    // Audit logs are SUPER_ADMIN-only server-side — only fetch for that role
    // so lower-privileged admins never see a failed request in this panel.
    if (admin.role === "SUPER_ADMIN") {
      getAuditLogs({ limit: 5 }).then((data) => setRecentActivity(data.logs)).catch(() => {});
    }
  }, [admin]);

  if (authLoading || !admin) return null;

  const langSplit = stats?.languageSplit ?? {} as Record<string, number>;
  const totalLanguage = (langSplit.EN ?? 0) + (langSplit.RW ?? 0) + (langSplit.FR ?? 0) + (langSplit.SW ?? 0);
  const enPct = totalLanguage > 0 ? Math.round(((langSplit.EN ?? 0) / totalLanguage) * 100) : 0;
  const rwPct = totalLanguage > 0 ? Math.round(((langSplit.RW ?? 0) / totalLanguage) * 100) : 0;
  const frPct = totalLanguage > 0 ? Math.round(((langSplit.FR ?? 0) / totalLanguage) * 100) : 0;
  const swPct = totalLanguage > 0 ? 100 - enPct - rwPct - frPct : 0;

  return (
    <AppShell active="/admin/dashboard" session={{ kind: "admin", admin }}>
      <div className="mb-[22px] flex items-center justify-between">
        <div>
          <h1 className="font-display text-[26px] text-teal-900">Good morning, {admin.name.split(" ")[0]}</h1>
          <p className="mt-1 text-sm text-ink-soft">Here&apos;s how Inshuti is doing today.</p>
        </div>
      </div>

      {loading && <PageLoading />}

      {!loading && stats && (
        <>
          <div className="mb-[22px] grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard icon="i-chat" value={stats.totalConversations} label="Total conversations" />
            <StatCard icon="i-users" value={stats.totalSessions} label="Anonymous sessions" />
            <StatCard icon="i-droplet" value={stats.mostAskedTopic?.nameEn ?? "—"} label="Most asked topic" />
            <StatCard icon="i-flag" value={stats.flaggedCount} label="Flagged for review" iconColor="#C4523F" />
          </div>

          <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr]">
            <Panel title="Topic engagement" bodyClassName="px-5 pb-5">
              {stats.topicEngagement.length === 0 && (
                <p className="text-sm text-ink-soft">No topic activity yet.</p>
              )}
              <BarChart data={stats.topicEngagement.map((entry) => ({ label: entry.topic.nameEn, value: entry.count }))} />
            </Panel>
            <Panel title="Language split" bodyClassName="px-5 pb-5">
              <div className="flex flex-col gap-3">
                {[
                  { label: "English", pct: enPct, color: "bg-teal-700" },
                  { label: "Kinyarwanda", pct: rwPct, color: "bg-gold" },
                  { label: "French", pct: frPct, color: "bg-coral" },
                  { label: "Kiswahili", pct: swPct, color: "bg-[#EFE9DB]" },
                ].map((lang) => (
                  <div key={lang.label} className="flex items-center gap-2 text-[13px] font-semibold text-ink-soft">
                    <span className={`h-2.5 w-2.5 rounded-[3px] ${lang.color}`} />
                    {lang.label} — {lang.pct}%
                  </div>
                ))}
              </div>
            </Panel>
          </div>

          {admin.role === "SUPER_ADMIN" && (
            <Panel title="Recent activity" action={<a href="/admin/audit-logs" className="text-[11px] font-semibold text-teal-700">View all</a>}>
              {recentActivity.length === 0 ? (
                <p className="px-5 pb-5 text-xs text-ink-soft">No recent admin activity.</p>
              ) : (
                <div className="pb-2">
                  {recentActivity.map((log) => (
                    <div key={log.id} className="flex items-center gap-3 border-t border-line/70 px-4 py-3 first:border-t-0">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-100 text-teal-700">
                        <svg width="14" height="14"><use href="#i-clock" /></svg>
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[11.5px] font-medium text-ink">{actionLabel(log.action)}</span>
                        <span className="mt-0.5 block text-[10px] text-ink-soft">{log.adminEmail ?? "System"} · {relativeTime(log.createdAt)}</span>
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </Panel>
          )}

        </>
      )}
    </AppShell>
  );
}
