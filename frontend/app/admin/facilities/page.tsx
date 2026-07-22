"use client";

import { useEffect, useState } from "react";

import { AppShell } from "@/components/AppShell";
import { Drawer } from "@/components/Drawer";
import { ConfirmModal } from "@/components/Modal";
import { useRequireAdmin } from "@/lib/useAdminAuth";
import { useToast } from "@/lib/useToast";
import {
  createFacility,
  deleteFacility,
  getAdminFacilities,
  updateFacility,
  type FacilityInput,
  type FacilityType,
  type HealthFacility,
} from "@/lib/adminApiClient";
import { isValidLatitude, isValidLongitude } from "@/lib/validation";

const FACILITY_TYPES: FacilityType[] = ["HOSPITAL", "HEALTH_CENTRE", "CLINIC", "PHARMACY"];
const TYPE_LABEL: Record<FacilityType, string> = {
  HOSPITAL: "Hospital",
  HEALTH_CENTRE: "Health centre",
  CLINIC: "Clinic",
  PHARMACY: "Pharmacy",
};

const EMPTY_FORM: FacilityInput = {
  name: "",
  type: "HEALTH_CENTRE",
  latitude: -1.9536,
  longitude: 30.0606,
  district: "",
  sector: "",
  services: [],
  contact: "",
};

export default function AdminFacilitiesPage() {
  const { admin, loading: authLoading } = useRequireAdmin("CONTENT_REVIEWER");
  const { toast } = useToast();
  const [facilities, setFacilities] = useState<HealthFacility[]>([]);
  const [loading, setLoading] = useState(true);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FacilityInput>(EMPTY_FORM);
  const [servicesInput, setServicesInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<HealthFacility | null>(null);
  const [errors, setErrors] = useState<{ name?: string; district?: string; sector?: string; latitude?: string; longitude?: string }>({});

  async function loadAll() {
    setLoading(true);
    try {
      setFacilities(await getAdminFacilities());
    } catch {
      toast("Failed to load facilities", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!admin) return;
    void loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [admin]);

  function openNew() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setServicesInput("");
    setErrors({});
    setDrawerOpen(true);
  }

  function openEdit(facility: HealthFacility) {
    setEditingId(facility.id);
    setForm({
      name: facility.name,
      type: facility.type,
      latitude: facility.latitude,
      longitude: facility.longitude,
      district: facility.district,
      sector: facility.sector,
      services: facility.services,
      contact: facility.contact ?? "",
    });
    setServicesInput(facility.services.join(", "));
    setErrors({});
    setDrawerOpen(true);
  }

  function validate(): boolean {
    const next: typeof errors = {};
    if (!form.name.trim()) next.name = "Name is required.";
    if (!form.district.trim()) next.district = "District is required.";
    if (!form.sector.trim()) next.sector = "Sector is required.";
    if (!isValidLatitude(form.latitude)) next.latitude = "Latitude must be between -90 and 90.";
    if (!isValidLongitude(form.longitude)) next.longitude = "Longitude must be between -180 and 180.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSave() {
    if (!validate()) {
      toast("Please fix the highlighted fields.", "error");
      return;
    }
    setSaving(true);
    const services = servicesInput.split(",").map((s) => s.trim()).filter(Boolean);
    try {
      if (editingId) {
        await updateFacility(editingId, { ...form, services });
        toast("Facility updated", "success");
      } else {
        await createFacility({ ...form, services });
        toast("Facility added", "success");
      }
      setDrawerOpen(false);
      await loadAll();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to save facility", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteFacility(deleteTarget.id);
      toast("Facility removed", "success");
      setDeleteTarget(null);
      await loadAll();
    } catch {
      toast("Failed to remove facility", "error");
    }
  }

  if (authLoading || !admin) return null;

  return (
    <AppShell active="/admin/facilities" session={{ kind: "admin", admin }}>
      <div className="mb-[22px] flex items-center justify-between">
        <div>
          <h1 className="font-display text-[26px] text-teal-900">Health Facilities</h1>
          <p className="mt-1 text-sm text-ink-soft">Manage the locations shown in the Find Care locator.</p>
        </div>
        <button
          onClick={openNew}
          className="inline-flex items-center gap-2 rounded-full bg-coral px-4 py-[9px] text-[13px] font-semibold text-white shadow-[0_8px_20px_rgba(232,115,92,0.35)]"
        >
          <svg width="15" height="15"><use href="#i-plus" /></svg>
          New facility
        </button>
      </div>

      {loading && <p className="text-sm text-ink-soft">Loading…</p>}

      {!loading && (
        <div className="overflow-x-auto rounded-md border border-[rgba(22,48,44,0.05)] bg-white shadow-card">
          <table className="w-full border-collapse text-[13.5px]">
            <thead>
              <tr>
                {["Name", "Type", "Location", "Contact", ""].map((h) => (
                  <th key={h} className="border-b border-line px-3.5 pb-2.5 pt-3 text-left font-mono text-[11px] font-medium uppercase tracking-[0.06em] text-ink-soft">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {facilities.length === 0 && (
                <tr><td colSpan={5} className="px-3.5 py-6 text-center text-ink-soft">No facilities yet.</td></tr>
              )}
              {facilities.map((facility) => (
                <tr key={facility.id} className="border-b border-line last:border-b-0 hover:bg-paper-2">
                  <td className="p-3.5 font-semibold text-ink">{facility.name}</td>
                  <td className="p-3.5">{TYPE_LABEL[facility.type]}</td>
                  <td className="p-3.5">{facility.district} District, {facility.sector} Sector</td>
                  <td className="p-3.5">{facility.contact || "—"}</td>
                  <td className="p-3.5">
                    <div className="flex items-center justify-end gap-3">
                      <button onClick={() => openEdit(facility)} className="flex h-8 w-8 items-center justify-center rounded-full border border-line text-teal-700">
                        <svg width="14" height="14"><use href="#i-edit" /></svg>
                      </button>
                      <button onClick={() => setDeleteTarget(facility)} className="flex h-8 w-8 items-center justify-center rounded-full border border-coral-dark text-coral-dark">
                        <svg width="14" height="14"><use href="#i-trash" /></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title={editingId ? "Edit Facility" : "New Facility"}>
        <div className="flex flex-col gap-4">
          <label className="text-[12.5px] font-bold text-ink-soft">Name</label>
          <input className={`rounded-[10px] border bg-white px-[14px] py-3 text-sm ${errors.name ? "border-danger" : "border-line"}`} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          {errors.name && <p className="-mt-2 text-xs font-semibold text-danger">{errors.name}</p>}

          <label className="text-[12.5px] font-bold text-ink-soft">Type</label>
          <select className="rounded-[10px] border border-line bg-white px-[14px] py-3 text-sm" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as FacilityType })}>
            {FACILITY_TYPES.map((t) => <option key={t} value={t}>{TYPE_LABEL[t]}</option>)}
          </select>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[12.5px] font-bold text-ink-soft">Latitude</label>
              <input
                type="number"
                step="any"
                className={`mt-1 w-full rounded-[10px] border bg-white px-[14px] py-3 text-sm ${errors.latitude ? "border-danger" : "border-line"}`}
                value={form.latitude}
                onChange={(e) => setForm({ ...form, latitude: Number(e.target.value) })}
              />
              {errors.latitude && <p className="mt-1 text-xs font-semibold text-danger">{errors.latitude}</p>}
            </div>
            <div>
              <label className="text-[12.5px] font-bold text-ink-soft">Longitude</label>
              <input
                type="number"
                step="any"
                className={`mt-1 w-full rounded-[10px] border bg-white px-[14px] py-3 text-sm ${errors.longitude ? "border-danger" : "border-line"}`}
                value={form.longitude}
                onChange={(e) => setForm({ ...form, longitude: Number(e.target.value) })}
              />
              {errors.longitude && <p className="mt-1 text-xs font-semibold text-danger">{errors.longitude}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[12.5px] font-bold text-ink-soft">District</label>
              <input className={`mt-1 w-full rounded-[10px] border bg-white px-[14px] py-3 text-sm ${errors.district ? "border-danger" : "border-line"}`} value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} />
              {errors.district && <p className="mt-1 text-xs font-semibold text-danger">{errors.district}</p>}
            </div>
            <div>
              <label className="text-[12.5px] font-bold text-ink-soft">Sector</label>
              <input className={`mt-1 w-full rounded-[10px] border bg-white px-[14px] py-3 text-sm ${errors.sector ? "border-danger" : "border-line"}`} value={form.sector} onChange={(e) => setForm({ ...form, sector: e.target.value })} />
              {errors.sector && <p className="mt-1 text-xs font-semibold text-danger">{errors.sector}</p>}
            </div>
          </div>

          <label className="text-[12.5px] font-bold text-ink-soft">Services (comma-separated)</label>
          <input className="rounded-[10px] border border-line bg-white px-[14px] py-3 text-sm" value={servicesInput} onChange={(e) => setServicesInput(e.target.value)} placeholder="Family Planning, HIV Testing" />

          <label className="text-[12.5px] font-bold text-ink-soft">Contact (optional)</label>
          <input className="rounded-[10px] border border-line bg-white px-[14px] py-3 text-sm" value={form.contact ?? ""} onChange={(e) => setForm({ ...form, contact: e.target.value })} />

          <button
            onClick={() => void handleSave()}
            disabled={saving}
            className="mt-2 w-full rounded-full bg-coral px-[26px] py-[13px] text-[15px] font-semibold text-white shadow-[0_8px_20px_rgba(232,115,92,0.35)] disabled:opacity-50"
          >
            {saving ? "Saving…" : editingId ? "Save changes" : "Add facility"}
          </button>
        </div>
      </Drawer>

      <ConfirmModal
        open={deleteTarget !== null}
        title="Remove facility"
        message={`Are you sure you want to remove "${deleteTarget?.name}"? This can't be undone.`}
        confirmLabel="Remove"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={() => void handleDelete()}
        onCancel={() => setDeleteTarget(null)}
      />
    </AppShell>
  );
}
