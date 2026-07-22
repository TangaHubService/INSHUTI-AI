"use client";

import { useEffect, useState } from "react";

import { AppShell } from "@/components/AppShell";
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
  const [newResource, setNewResource] = useState({ name: "", contact: "", region: "" });
  const [newResourceErrors, setNewResourceErrors] = useState<{ name?: boolean; contact?: boolean; region?: boolean }>({});
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

  async function handleAddResource() {
    const errs = {
      name: !newResource.name.trim(),
      contact: !newResource.contact.trim(),
      region: !newResource.region.trim(),
    };
    setNewResourceErrors(errs);
    if (errs.name || errs.contact || errs.region) {
      toast("Fill in all fields", "error");
      return;
    }
    try {
      const resource = await createCrisisResource({ ...newResource, order: resources.length + 1 });
      setResources((prev) => [...prev, resource]);
      setNewResource({ name: "", contact: "", region: "" });
      setNewResourceErrors({});
      toast("Resource added", "success");
    } catch {
      toast("Failed to add resource", "error");
    }
  }

  async function handleUpdateResource(id: string, field: "name" | "contact" | "region", value: string) {
    setResources((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
    try {
      await updateCrisisResource(id, { [field]: value });
    } catch {
      toast("Failed to update resource", "error");
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
            <h3 className="mb-1 text-base text-teal-900">Crisis resources</h3>
            <p className="mb-4 text-[12.5px] text-ink-soft">
              Shown to users when crisis language is detected. Keep contact numbers verified.
            </p>

            {resources.map((resource) => (
              <div key={resource.id} className="mb-2.5 flex items-center gap-2.5 rounded-[10px] border border-line p-3">
                <input
                  className="flex-1 rounded-lg border border-line bg-paper-2 px-3 py-2 text-[13px]"
                  value={resource.name}
                  onChange={(e) => void handleUpdateResource(resource.id, "name", e.target.value)}
                />
                <input
                  className="flex-1 rounded-lg border border-line bg-paper-2 px-3 py-2 text-[13px]"
                  value={resource.contact}
                  onChange={(e) => void handleUpdateResource(resource.id, "contact", e.target.value)}
                />
                <input
                  className="w-[120px] rounded-lg border border-line bg-paper-2 px-3 py-2 text-[13px]"
                  value={resource.region}
                  onChange={(e) => void handleUpdateResource(resource.id, "region", e.target.value)}
                />
                <button onClick={() => setDeleteTarget(resource)} title="Delete">
                  <svg width="16" height="16" className="cursor-pointer text-coral-dark">
                    <use href="#i-trash" />
                  </svg>
                </button>
              </div>
            ))}

            <div className="mt-3 flex items-center gap-2.5">
              <input
                className={`flex-1 rounded-lg border bg-paper-2 px-3 py-2 text-[13px] ${newResourceErrors.name ? "border-danger" : "border-line"}`}
                placeholder="Name"
                value={newResource.name}
                onChange={(e) => setNewResource({ ...newResource, name: e.target.value })}
              />
              <input
                className={`flex-1 rounded-lg border bg-paper-2 px-3 py-2 text-[13px] ${newResourceErrors.contact ? "border-danger" : "border-line"}`}
                placeholder="Contact"
                value={newResource.contact}
                onChange={(e) => setNewResource({ ...newResource, contact: e.target.value })}
              />
              <input
                className={`w-[120px] rounded-lg border bg-paper-2 px-3 py-2 text-[13px] ${newResourceErrors.region ? "border-danger" : "border-line"}`}
                placeholder="Region"
                value={newResource.region}
                onChange={(e) => setNewResource({ ...newResource, region: e.target.value })}
              />
              <button
                onClick={() => void handleAddResource()}
                className="rounded-full border-[1.5px] border-teal-700 px-4 py-2 text-[13px] font-semibold text-teal-700"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
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
