"use client";

import { useEffect, useState } from "react";

import { AppShell } from "@/components/AppShell";
import { Drawer } from "@/components/Drawer";
import { PageLoading } from "@/components/Spinner";
import { useRequireAdmin } from "@/lib/useAdminAuth";
import { useToast } from "@/lib/useToast";
import { PasswordInput } from "@/components/PasswordInput";
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
import { isValidEmail, isStrongPassword } from "@/lib/validation";

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
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string }>({});
  const [drawerOpen, setDrawerOpen] = useState(false);

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

  function validateNewAdmin(): boolean {
    const next: typeof errors = {};
    if (!newAdmin.name.trim()) next.name = "Required";
    if (!newAdmin.email.trim()) next.email = "Required";
    else if (!isValidEmail(newAdmin.email)) next.email = "Enter a valid email address.";
    if (!newAdmin.password) next.password = "Required";
    else if (!isStrongPassword(newAdmin.password)) next.password = "Must be at least 8 characters and include a letter and a number.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleCreateAdmin(e: React.FormEvent) {
    e.preventDefault();
    if (!validateNewAdmin()) {
      toast("Please fix the highlighted fields.", "error");
      return;
    }
    setCreating(true);
    try {
      await createManagedAdmin(newAdmin);
      toast("Admin created", "success");
      setNewAdmin({ name: "", email: "", password: "", role: "MODERATOR" });
      setErrors({});
      setDrawerOpen(false);
      await load();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to create admin", "error");
    } finally {
      setCreating(false);
    }
  }

  function openNewAdmin() {
    setNewAdmin({ name: "", email: "", password: "", role: "MODERATOR" });
    setErrors({});
    setDrawerOpen(true);
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
    <AppShell active="/admin/users" session={{ kind: "admin", admin }}>
      <div className="mb-[22px] flex items-center justify-between">
        <div>
          <h1 className="font-display text-[26px] text-teal-900">Users &amp; Admins</h1>
          <p className="mt-1 text-sm text-ink-soft">Manage app accounts, professional approvals, and the admin team.</p>
        </div>
        <button
          onClick={openNewAdmin}
          className="inline-flex flex-shrink-0 items-center gap-2 rounded-full bg-coral px-4 py-[9px] text-[13px] font-semibold text-white shadow-[0_8px_20px_rgba(232,115,92,0.35)]"
        >
          <svg width="15" height="15"><use href="#i-plus" /></svg>
          Add admin
        </button>
      </div>

      {loading && <PageLoading />}

      {!loading && (
        <>
          <div className="mb-6 rounded-md border border-[rgba(22,48,44,0.05)] bg-white shadow-card">
            <div className="px-5 pb-1.5 pt-[14px] text-base text-teal-900">App users</div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-[13.5px]">
                <thead>
                  <tr>
                    {["Name", "Role", "Approval", "Status", ""].map((h) => (
                      <th key={h} className="border-b border-line px-3.5 pb-2.5 pt-3 text-left font-mono text-[11px] font-medium uppercase tracking-[0.06em] text-ink-soft">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 && (
                    <tr><td colSpan={5} className="px-3.5 py-6 text-center text-ink-soft">No users yet.</td></tr>
                  )}
                  {users.map((u) => (
                    <tr key={u.id} className="border-b border-line last:border-b-0 hover:bg-paper-2">
                      <td className="p-3.5">
                        <div className="text-sm font-semibold text-ink">{u.name}</div>
                        <div className="text-xs text-ink-soft">{u.email}</div>
                      </td>
                      <td className="p-3.5">
                        <span className="rounded-full bg-teal-100 px-2.5 py-1 text-[11px] font-bold text-teal-700">
                          {ROLE_LABEL[u.role] ?? u.role}
                        </span>
                      </td>
                      <td className="p-3.5">
                        {u.healthcareProfessional && (
                          <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${APPROVAL_STYLE[u.healthcareProfessional.approvalStatus]}`}>
                            {u.healthcareProfessional.approvalStatus}
                          </span>
                        )}
                      </td>
                      <td className="p-3.5">
                        <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${u.active ? "bg-teal-100 text-teal-700" : "bg-coral-100 text-coral-dark"}`}>
                          {u.active ? "Active" : "Deactivated"}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <div className="flex flex-wrap justify-end gap-2">
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
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-md border border-[rgba(22,48,44,0.05)] bg-white shadow-card">
            <div className="px-5 pb-1.5 pt-[14px] text-base text-teal-900">Admin team</div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-[13.5px]">
                <thead>
                  <tr>
                    {["Name", "Role", "Status", ""].map((h) => (
                      <th key={h} className="border-b border-line px-3.5 pb-2.5 pt-3 text-left font-mono text-[11px] font-medium uppercase tracking-[0.06em] text-ink-soft">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {admins.map((a) => (
                    <tr key={a.id} className="border-b border-line last:border-b-0 hover:bg-paper-2">
                      <td className="p-3.5">
                        <div className="text-sm font-semibold text-ink">{a.name}</div>
                        <div className="text-xs text-ink-soft">{a.email}</div>
                      </td>
                      <td className="p-3.5">
                        <span className="rounded-full bg-teal-100 px-2.5 py-1 text-[11px] font-bold text-teal-700">{a.role}</span>
                      </td>
                      <td className="p-3.5">
                        <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${a.active ? "bg-teal-100 text-teal-700" : "bg-coral-100 text-coral-dark"}`}>
                          {a.active ? "Active" : "Deactivated"}
                        </span>
                      </td>
                      <td className="p-3.5">
                        {a.id !== admin.id && (
                          <div className="flex justify-end">
                            <button
                              onClick={() => void handleToggleAdminActive(a.id, !a.active)}
                              className="rounded-full border border-line px-3 py-1.5 text-[12px] font-semibold text-ink-soft hover:bg-paper-2"
                            >
                              {a.active ? "Deactivate" : "Activate"}
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="New Admin">
        <form onSubmit={(e) => void handleCreateAdmin(e)} className="flex flex-col gap-1">
          <label className="mb-1 block text-[12.5px] font-bold text-ink-soft">Name</label>
          <input
            className={`w-full rounded-[10px] border bg-white px-3.5 py-3 text-sm ${errors.name ? "border-danger" : "border-line"}`}
            value={newAdmin.name}
            onChange={(e) => setNewAdmin((prev) => ({ ...prev, name: e.target.value }))}
          />
          <p className="mb-2.5 mt-1 min-h-[14px] text-xs font-semibold text-danger">{errors.name}</p>

          <label className="mb-1 block text-[12.5px] font-bold text-ink-soft">Email</label>
          <input
            type="email"
            className={`w-full rounded-[10px] border bg-white px-3.5 py-3 text-sm ${errors.email ? "border-danger" : "border-line"}`}
            value={newAdmin.email}
            onChange={(e) => setNewAdmin((prev) => ({ ...prev, email: e.target.value }))}
          />
          <p className="mb-2.5 mt-1 min-h-[14px] text-xs font-semibold text-danger">{errors.email}</p>

          <label className="mb-1 block text-[12.5px] font-bold text-ink-soft">Temporary password</label>
          <PasswordInput
            className={`w-full rounded-[10px] border bg-white px-3.5 py-3 text-sm ${errors.password ? "border-danger" : "border-line"}`}
            value={newAdmin.password}
            onChange={(e) => setNewAdmin((prev) => ({ ...prev, password: e.target.value }))}
          />
          <p className="mb-2.5 mt-1 min-h-[14px] text-xs font-semibold text-danger">{errors.password}</p>
          <label className="mb-1 block text-[12.5px] font-bold text-ink-soft">Role</label>
          <select
            className="mb-4 w-full rounded-[10px] border border-line bg-white px-3.5 py-3 text-sm"
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
      </Drawer>
    </AppShell>
  );
}
