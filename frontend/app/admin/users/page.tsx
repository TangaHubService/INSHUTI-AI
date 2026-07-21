"use client";

import { useEffect, useState } from "react";

import { AdminShell } from "@/components/AdminShell";
import { useRequireAdmin } from "@/lib/useAdminAuth";
import { useToast } from "@/lib/useToast";
import {
  createManagedAdmin,
  getManagedAdmins,
  getManagedUsers,
  setProfessionalApproval,
  setUserActive,
  updateManagedAdmin,
  type AdminRole,
  type ApprovalStatus,
  type ManagedAdmin,
  type ManagedUser,
} from "@/lib/adminApiClient";

const ROLE_LABEL: Record<string, string> = {
  TEENAGER: "Teenager / User",
  PARENT_GUARDIAN: "Parent / Guardian",
  HEALTHCARE_PROFESSIONAL: "Healthcare Professional",
  GOVERNMENT_USER: "Government User",
};

const APPROVAL_STYLE: Record<ApprovalStatus, string> = {
  PENDING: "bg-gold-100 text-[#8A5E1E]",
  APPROVED: "bg-teal-100 text-teal-700",
  REJECTED: "bg-coral-100 text-coral-dark",
};

export default function AdminUsersPage() {
  const { admin, loading: authLoading } = useRequireAdmin("SUPER_ADMIN");
  const { toast } = useToast();
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [admins, setAdmins] = useState<ManagedAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [newAdmin, setNewAdmin] = useState({ name: "", email: "", password: "", role: "MODERATOR" as AdminRole });
  const [creating, setCreating] = useState(false);

  async function load() {
    const [u, a] = await Promise.all([getManagedUsers(), getManagedAdmins()]);
    setUsers(u);
    setAdmins(a);
    setLoading(false);
  }

  useEffect(() => {
    if (!admin) return;
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [admin]);

  async function handleToggleActive(userId: string, active: boolean) {
    try {
      await setUserActive(userId, active);
      toast(active ? "Account activated" : "Account deactivated", "success");
      await load();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to update account", "error");
    }
  }

  async function handleApproval(userId: string, approvalStatus: ApprovalStatus) {
    try {
      await setProfessionalApproval(userId, approvalStatus);
      toast(`Professional ${approvalStatus.toLowerCase()}`, "success");
      await load();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to update approval", "error");
    }
  }

  async function handleCreateAdmin(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    try {
      await createManagedAdmin(newAdmin);
      toast("Admin created", "success");
      setNewAdmin({ name: "", email: "", password: "", role: "MODERATOR" });
      await load();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to create admin", "error");
    } finally {
      setCreating(false);
    }
  }

  async function handleToggleAdminActive(id: string, active: boolean) {
    try {
      await updateManagedAdmin(id, { active });
      toast(active ? "Admin activated" : "Admin deactivated", "success");
      await load();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to update admin", "error");
    }
  }

  if (authLoading || !admin) return null;

  return (
    <AdminShell active="/admin/users" admin={admin}>
      <div className="mb-[22px]">
        <h1 className="font-display text-[26px] text-teal-900">Users &amp; Admins</h1>
        <p className="mt-1 text-sm text-ink-soft">Manage app accounts, professional approvals, and the admin team.</p>
      </div>

      {loading && <p className="text-sm text-ink-soft">Loading…</p>}

      {!loading && (
        <>
          <div className="mb-6 rounded-md border border-[rgba(22,48,44,0.05)] bg-white py-1.5 shadow-card">
            <div className="px-5 pb-1.5 pt-[14px] text-base text-teal-900">App users</div>
            {users.length === 0 && <p className="px-5 pb-5 pt-2 text-[13.5px] text-ink-soft">No users yet.</p>}
            {users.map((u) => (
              <div key={u.id} className="flex flex-wrap items-center gap-3 border-b border-line px-5 py-3 last:border-b-0">
                <div className="min-w-[220px] flex-1">
                  <div className="text-sm font-semibold text-ink">{u.name}</div>
                  <div className="text-xs text-ink-soft">{u.email}</div>
                </div>
                <span className="rounded-full bg-teal-100 px-2.5 py-1 text-[11px] font-bold text-teal-700">
                  {ROLE_LABEL[u.role] ?? u.role}
                </span>
                {u.healthcareProfessional && (
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${APPROVAL_STYLE[u.healthcareProfessional.approvalStatus]}`}>
                    {u.healthcareProfessional.approvalStatus}
                  </span>
                )}
                <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${u.active ? "bg-teal-100 text-teal-700" : "bg-coral-100 text-coral-dark"}`}>
                  {u.active ? "Active" : "Deactivated"}
                </span>

                <div className="flex flex-shrink-0 gap-2">
                  {u.healthcareProfessional && u.healthcareProfessional.approvalStatus !== "APPROVED" && (
                    <button
                      onClick={() => void handleApproval(u.id, "APPROVED")}
                      className="rounded-full bg-teal-700 px-3 py-1.5 text-[12px] font-semibold text-white"
                    >
                      Approve
                    </button>
                  )}
                  {u.healthcareProfessional && u.healthcareProfessional.approvalStatus !== "REJECTED" && (
                    <button
                      onClick={() => void handleApproval(u.id, "REJECTED")}
                      className="rounded-full border border-coral-dark px-3 py-1.5 text-[12px] font-semibold text-coral-dark"
                    >
                      Reject
                    </button>
                  )}
                  <button
                    onClick={() => void handleToggleActive(u.id, !u.active)}
                    className="rounded-full border border-line px-3 py-1.5 text-[12px] font-semibold text-ink-soft hover:bg-paper-2"
                  >
                    {u.active ? "Deactivate" : "Activate"}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr]">
            <div className="rounded-md border border-[rgba(22,48,44,0.05)] bg-white py-1.5 shadow-card">
              <div className="px-5 pb-1.5 pt-[14px] text-base text-teal-900">Admin team</div>
              {admins.map((a) => (
                <div key={a.id} className="flex flex-wrap items-center gap-3 border-b border-line px-5 py-3 last:border-b-0">
                  <div className="min-w-[200px] flex-1">
                    <div className="text-sm font-semibold text-ink">{a.name}</div>
                    <div className="text-xs text-ink-soft">{a.email}</div>
                  </div>
                  <span className="rounded-full bg-teal-100 px-2.5 py-1 text-[11px] font-bold text-teal-700">{a.role}</span>
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${a.active ? "bg-teal-100 text-teal-700" : "bg-coral-100 text-coral-dark"}`}>
                    {a.active ? "Active" : "Deactivated"}
                  </span>
                  {a.id !== admin.id && (
                    <button
                      onClick={() => void handleToggleAdminActive(a.id, !a.active)}
                      className="rounded-full border border-line px-3 py-1.5 text-[12px] font-semibold text-ink-soft hover:bg-paper-2"
                    >
                      {a.active ? "Deactivate" : "Activate"}
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div>
              <div className="px-1 pb-2 font-mono text-[11px] uppercase tracking-[0.08em] text-ink-soft">Add an admin</div>
              <form onSubmit={(e) => void handleCreateAdmin(e)} className="rounded-md border border-[rgba(22,48,44,0.05)] bg-white p-5 shadow-card">
                <label className="mb-1 block text-[12.5px] font-bold text-ink-soft">Name</label>
                <input
                  className="mb-3.5 w-full rounded-[10px] border border-line bg-paper-2 px-3.5 py-3 text-sm"
                  value={newAdmin.name}
                  onChange={(e) => setNewAdmin((prev) => ({ ...prev, name: e.target.value }))}
                  required
                />
                <label className="mb-1 block text-[12.5px] font-bold text-ink-soft">Email</label>
                <input
                  type="email"
                  className="mb-3.5 w-full rounded-[10px] border border-line bg-paper-2 px-3.5 py-3 text-sm"
                  value={newAdmin.email}
                  onChange={(e) => setNewAdmin((prev) => ({ ...prev, email: e.target.value }))}
                  required
                />
                <label className="mb-1 block text-[12.5px] font-bold text-ink-soft">Temporary password</label>
                <input
                  type="password"
                  className="mb-3.5 w-full rounded-[10px] border border-line bg-paper-2 px-3.5 py-3 text-sm"
                  value={newAdmin.password}
                  onChange={(e) => setNewAdmin((prev) => ({ ...prev, password: e.target.value }))}
                  minLength={8}
                  required
                />
                <label className="mb-1 block text-[12.5px] font-bold text-ink-soft">Role</label>
                <select
                  className="mb-4 w-full rounded-[10px] border border-line bg-paper-2 px-3.5 py-3 text-sm"
                  value={newAdmin.role}
                  onChange={(e) => setNewAdmin((prev) => ({ ...prev, role: e.target.value as AdminRole }))}
                >
                  <option value="MODERATOR">Moderator</option>
                  <option value="CONTENT_REVIEWER">Content Reviewer</option>
                  <option value="SUPER_ADMIN">Super Admin</option>
                </select>
                <button
                  type="submit"
                  disabled={creating}
                  className="w-full rounded-full bg-coral px-[26px] py-[13px] text-[15px] font-semibold text-white shadow-[0_8px_20px_rgba(232,115,92,0.35)] transition hover:-translate-y-px hover:bg-coral-dark disabled:opacity-50"
                >
                  {creating ? "Creating…" : "Create admin"}
                </button>
              </form>
            </div>
          </div>
        </>
      )}
    </AdminShell>
  );
}
