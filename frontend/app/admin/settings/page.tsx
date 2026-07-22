"use client";

import { useEffect, useState } from "react";

import { AppShell } from "@/components/AppShell";
import { Drawer } from "@/components/Drawer";
import { ConfirmModal } from "@/components/Modal";
import {
  createCrisisResource,
  deleteCrisisResource,
  getCrisisResources,
  getSettings,
  updateCrisisResource,
  updateSettings,
  type AppSettings,
  type CrisisResource,
} from "@/lib/adminApiClient";
import { useRequireAdmin } from "@/lib/useAdminAuth";
import { useToast } from "@/lib/useToast";

function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative h-6 w-[42px] flex-shrink-0 rounded-full transition-colors ${on ? "bg-teal-700" : "bg-line"}`}
    >
      <span
        className={`absolute top-[3px] h-[18px] w-[18px] rounded-full bg-white transition-all ${on ? "left-[21px]" : "left-[3px]"}`}
      />
    </button>
  );
}

export default function AdminSettingsPage() {
  const { admin, loading: authLoading } = useRequireAdmin("SUPER_ADMIN");
  const { toast } = useToast();
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [resources, setResources] = useState<CrisisResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<CrisisResource | null>(null);
  const [resourceForm, setResourceForm] = useState({ name: "", contact: "", region: "" });
  const [resourceErrors, setResourceErrors] = useState<{ name?: boolean; contact?: boolean; region?: boolean }>({});
  const [savingResource, setSavingResource] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<CrisisResource | null>(null);

  useEffect(() => {
    if (!admin) return;
    Promise.all([getSettings(), getCrisisResources()]).then(([s, r]) => {
      setSettings(s);
      setResources(r);
      setLoading(false);
    });
  }, [admin]);

  async function saveSettings(patch: Partial<AppSettings>) {
    if (!settings) return;
    setSaving(true);
    try {
      const updated = await updateSettings(patch);
      setSettings(updated);
      toast("Settings saved", "success");
    } catch {
      toast("Failed to save settings", "error");
    } finally {
      setSaving(false);
    }
  }

  function openNewResource() {
    setEditingResource(null);
    setResourceForm({ name: "", contact: "", region: "" });
    setResourceErrors({});
    setDrawerOpen(true);
  }

  function openEditResource(resource: CrisisResource) {
    setEditingResource(resource);
    setResourceForm({ name: resource.name, contact: resource.contact, region: resource.region });
    setResourceErrors({});
    setDrawerOpen(true);
  }

  async function handleSaveResource() {
    const errs = {
      name: !resourceForm.name.trim(),
      contact: !resourceForm.contact.trim(),
      region: !resourceForm.region.trim(),
    };
    setResourceErrors(errs);
    if (errs.name || errs.contact || errs.region) {
      toast("Fill in all fields", "error");
      return;
    }
    setSavingResource(true);
    try {
      if (editingResource) {
        const updated = await updateCrisisResource(editingResource.id, resourceForm);
        setResources((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
        toast("Resource updated", "success");
      } else {
        const resource = await createCrisisResource({ ...resourceForm, order: resources.length + 1 });
        setResources((prev) => [...prev, resource]);
        toast("Resource added", "success");
      }
      setDrawerOpen(false);
    } catch {
      toast(editingResource ? "Failed to update resource" : "Failed to add resource", "error");
    } finally {
      setSavingResource(false);
    }
  }

  async function handleDeleteResource(id: string) {
    setDeleteTarget(null);
    try {
      await deleteCrisisResource(id);
      setResources((prev) => prev.filter((r) => r.id !== id));
      toast("Resource deleted", "success");
    } catch {
      toast("Failed to delete resource", "error");
    }
  }

  if (authLoading || !admin) return null;

  return (
    <AppShell active="/admin/settings" session={{ kind: "admin", admin }}>
      <div className="mb-[22px]">
        <h1 className="font-display text-[26px] text-teal-900">Settings</h1>
        <p className="mt-1 text-sm text-ink-soft">AI behavior and crisis-support resources.</p>
      </div>

      {loading && <p className="text-sm text-ink-soft">Loading…</p>}

      {!loading && settings && (
        <div className="flex flex-col gap-4">
          <div className="rounded-md border border-[rgba(22,48,44,0.05)] bg-white p-6 shadow-card">
            <h3 className="mb-4 text-base text-teal-900">AI behavior</h3>

            <label className="mb-1.5 block text-[12.5px] font-bold text-ink-soft">AI provider</label>
            <input
              className="mb-4 w-full max-w-[320px] rounded-[10px] border border-line bg-paper-2 px-[14px] py-3 text-sm"
              value={settings.aiProvider}
              onChange={(e) => setSettings({ ...settings, aiProvider: e.target.value })}
              onBlur={() => void saveSettings({ aiProvider: settings.aiProvider })}
            />

            <label className="mb-1.5 block text-[12.5px] font-bold text-ink-soft">AI model</label>
            <input
              className="mb-4 w-full max-w-[320px] rounded-[10px] border border-line bg-paper-2 px-[14px] py-3 text-sm"
              value={settings.aiModel}
              onChange={(e) => setSettings({ ...settings, aiModel: e.target.value })}
              onBlur={() => void saveSettings({ aiModel: settings.aiModel })}
            />

            <label className="mb-1.5 block text-[12.5px] font-bold text-ink-soft">Response style note</label>
            <textarea
              className="mb-5 w-full resize-y rounded-[10px] border border-line bg-paper-2 px-[14px] py-3 text-sm"
              rows={3}
              value={settings.responseStyleNote}
              onChange={(e) => setSettings({ ...settings, responseStyleNote: e.target.value })}
              onBlur={() => void saveSettings({ responseStyleNote: settings.responseStyleNote })}
            />

            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-ink">Restrict to knowledge base</div>
                  <div className="text-[12.5px] text-ink-soft">
                    When on, the AI must say it lacks reviewed information rather than answering from
                    general knowledge when nothing is retrieved.
                  </div>
                </div>
                <Toggle
                  on={settings.restrictToKnowledgeBase}
                  onClick={() => void saveSettings({ restrictToKnowledgeBase: !settings.restrictToKnowledgeBase })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-ink">Auto-flag crisis language</div>
                  <div className="text-[12.5px] text-ink-soft">
                    Automatically create a moderator flag when crisis language is detected. The
                    safety response itself is never optional.
                  </div>
                </div>
                <Toggle
                  on={settings.autoFlagCrisisLanguage}
                  onClick={() => void saveSettings({ autoFlagCrisisLanguage: !settings.autoFlagCrisisLanguage })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-ink">Auto-detect language</div>
                  <div className="text-[12.5px] text-ink-soft">
                    Override the UI language toggle when a message looks clearly EN or RW.
                  </div>
                </div>
                <Toggle
                  on={settings.autoDetectLanguage}
                  onClick={() => void saveSettings({ autoDetectLanguage: !settings.autoDetectLanguage })}
                />
              </div>
            </div>
            {saving && <p className="mt-3 text-[12.5px] text-ink-soft">Saving…</p>}
          </div>

          <div className="rounded-md border border-[rgba(22,48,44,0.05)] bg-white p-6 shadow-card">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-base text-teal-900">Crisis resources</h3>
                <p className="mt-1 text-[12.5px] text-ink-soft">
                  Shown to users when crisis language is detected. Keep contact numbers verified.
                </p>
              </div>
              <button
                onClick={openNewResource}
                className="inline-flex flex-shrink-0 items-center gap-2 rounded-full bg-coral px-4 py-[9px] text-[13px] font-semibold text-white shadow-[0_8px_20px_rgba(232,115,92,0.35)]"
              >
                <svg width="15" height="15"><use href="#i-plus" /></svg>
                Add resource
              </button>
            </div>

            <div className="overflow-x-auto rounded-md border border-line">
              <table className="w-full border-collapse text-[13.5px]">
                <thead>
                  <tr>
                    {["Name", "Contact", "Region", ""].map((h) => (
                      <th key={h} className="border-b border-line px-3.5 pb-2.5 pt-3 text-left font-mono text-[11px] font-medium uppercase tracking-[0.06em] text-ink-soft">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {resources.length === 0 && (
                    <tr><td colSpan={4} className="px-3.5 py-6 text-center text-ink-soft">No crisis resources yet.</td></tr>
                  )}
                  {resources.map((resource) => (
                    <tr key={resource.id} className="border-b border-line last:border-b-0 hover:bg-paper-2">
                      <td className="p-3.5 font-semibold text-ink">{resource.name}</td>
                      <td className="p-3.5">{resource.contact}</td>
                      <td className="p-3.5">{resource.region}</td>
                      <td className="p-3.5">
                        <div className="flex items-center justify-end gap-3">
                          <button onClick={() => openEditResource(resource)} className="flex h-8 w-8 items-center justify-center rounded-full border border-line text-teal-700">
                            <svg width="14" height="14"><use href="#i-edit" /></svg>
                          </button>
                          <button onClick={() => setDeleteTarget(resource)} className="flex h-8 w-8 items-center justify-center rounded-full border border-coral-dark text-coral-dark">
                            <svg width="14" height="14"><use href="#i-trash" /></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title={editingResource ? "Edit Crisis Resource" : "New Crisis Resource"}>
        <div className="flex flex-col gap-4">
          <label className="text-[12.5px] font-bold text-ink-soft">Name</label>
          <input
            className={`rounded-[10px] border bg-white px-[14px] py-3 text-sm ${resourceErrors.name ? "border-danger" : "border-line"}`}
            value={resourceForm.name}
            onChange={(e) => setResourceForm({ ...resourceForm, name: e.target.value })}
          />

          <label className="text-[12.5px] font-bold text-ink-soft">Contact</label>
          <input
            className={`rounded-[10px] border bg-white px-[14px] py-3 text-sm ${resourceErrors.contact ? "border-danger" : "border-line"}`}
            value={resourceForm.contact}
            onChange={(e) => setResourceForm({ ...resourceForm, contact: e.target.value })}
          />

          <label className="text-[12.5px] font-bold text-ink-soft">Region</label>
          <input
            className={`rounded-[10px] border bg-white px-[14px] py-3 text-sm ${resourceErrors.region ? "border-danger" : "border-line"}`}
            value={resourceForm.region}
            onChange={(e) => setResourceForm({ ...resourceForm, region: e.target.value })}
          />

          <button
            onClick={() => void handleSaveResource()}
            disabled={savingResource}
            className="mt-2 w-full rounded-full bg-coral px-[26px] py-[13px] text-[15px] font-semibold text-white shadow-[0_8px_20px_rgba(232,115,92,0.35)] disabled:opacity-50"
          >
            {savingResource ? "Saving…" : editingResource ? "Save changes" : "Add resource"}
          </button>
        </div>
      </Drawer>
      <ConfirmModal
        open={!!deleteTarget}
        title="Delete resource"
        message={`Remove "${deleteTarget?.name ?? ""}" from crisis resources?`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={() => deleteTarget && void handleDeleteResource(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
      />
    </AppShell>
  );
}
