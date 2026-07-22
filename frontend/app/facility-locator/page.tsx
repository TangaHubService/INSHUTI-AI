"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useState } from "react";

import { getFacilities, type FacilityType, type HealthFacility } from "@/lib/apiClient";
import { AppShell } from "@/components/AppShell";
import { getCurrentUser, type UserProfile } from "@/lib/userApiClient";

const FacilityMap = dynamic(() => import("@/components/FacilityMap").then((m) => m.FacilityMap), {
  ssr: false,
  loading: () => <div className="flex h-full items-center justify-center text-sm text-ink-soft">Loading map…</div>,
});

const TYPE_LABEL: Record<FacilityType, string> = {
  HOSPITAL: "Hospital",
  HEALTH_CENTRE: "Health centre",
  CLINIC: "Clinic",
  PHARMACY: "Pharmacy",
};

const TYPE_PILL: Record<FacilityType, string> = {
  HOSPITAL: "bg-coral-100 text-coral-dark",
  HEALTH_CENTRE: "bg-teal-100 text-teal-700",
  CLINIC: "bg-gold-100 text-[#8A5E1E]",
  PHARMACY: "border border-line text-ink-soft",
};

function directionsUrl(facility: HealthFacility): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${facility.latitude},${facility.longitude}`;
}

export default function FacilityLocatorPage() {
  const [facilities, setFacilities] = useState<HealthFacility[]>([]);
  const [types, setTypes] = useState<FacilityType[]>([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<FacilityType | "">("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    void getCurrentUser().then(setUser);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const timeout = setTimeout(() => {
      void getFacilities({ search: search.trim() || undefined, type: typeFilter || undefined }).then((data) => {
        if (cancelled) return;
        setFacilities(data.facilities);
        setTypes(data.facilityTypes);
        setLoading(false);
        if (data.facilities.length > 0 && !data.facilities.some((f) => f.id === selectedId)) {
          setSelectedId(data.facilities[0].id);
        }
      });
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, typeFilter]);

  const page = (
    <div className="flex h-screen flex-col md:flex-row">
      <div className="flex w-full flex-shrink-0 flex-col overflow-y-auto border-r border-line bg-white p-[18px] md:w-[380px]">
        {!user && (
          <Link
            href="/"
            className="mb-3.5 flex h-9 w-9 items-center justify-center rounded-full border border-line bg-white"
          >
            <svg width="16" height="16">
              <use href="#i-back" />
            </svg>
          </Link>
        )}

        <span className="font-mono text-[12.5px] font-medium uppercase tracking-[0.12em] text-coral-dark">
          Find Care
        </span>
        <h1 className="mt-2 font-display text-2xl text-teal-900">Health facilities near you</h1>

        <div className="mt-4 flex gap-2">
          <div className="flex flex-1 items-center gap-2 rounded-[10px] bg-paper-2 px-3.5 py-2.5 text-[13.5px] text-ink-soft">
            <svg width="16" height="16">
              <use href="#i-search" />
            </svg>
            <input
              className="w-full bg-transparent outline-none placeholder:text-ink-soft"
              placeholder="Search facilities…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          <button
            onClick={() => setTypeFilter("")}
            className={`rounded-full px-3 py-1.5 text-[12.5px] font-semibold ${
              typeFilter === "" ? "bg-teal-700 text-white" : "border border-line text-ink-soft"
            }`}
          >
            All
          </button>
          {types.map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t === typeFilter ? "" : t)}
              className={`rounded-full px-3 py-1.5 text-[12.5px] font-semibold ${
                typeFilter === t ? "bg-teal-700 text-white" : "border border-line text-ink-soft"
              }`}
            >
              {TYPE_LABEL[t]}
            </button>
          ))}
        </div>

        <div className="mt-4 flex flex-col gap-3">
          {loading && <p className="text-sm text-ink-soft">Loading…</p>}
          {!loading && facilities.length === 0 && (
            <p className="text-sm text-ink-soft">No facilities match your search.</p>
          )}
          {facilities.map((facility) => (
            <div
              key={facility.id}
              onClick={() => setSelectedId(facility.id)}
              className={`cursor-pointer rounded-[14px] border p-4 transition ${
                selectedId === facility.id ? "border-teal-700" : "border-line hover:border-teal-700"
              }`}
            >
              <div className="text-[14.5px] font-bold text-teal-900">{facility.name}</div>
              <div className="mt-1 flex items-center gap-1.5 text-xs text-ink-soft">
                <svg width="13" height="13">
                  <use href="#i-map-pin" />
                </svg>
                {facility.district} District · {facility.sector}
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${TYPE_PILL[facility.type]}`}>
                  {TYPE_LABEL[facility.type]}
                </span>
                {facility.services.slice(0, 2).map((s) => (
                  <span key={s} className="rounded-full bg-teal-100 px-2.5 py-1 text-[11px] font-semibold text-teal-700">
                    {s}
                  </span>
                ))}
              </div>
              <div className="mt-2.5 flex items-center gap-3">
                {facility.contact && (
                  <span className="flex items-center gap-1 text-[12px] text-ink-soft">
                    <svg width="12" height="12">
                      <use href="#i-phone" />
                    </svg>
                    {facility.contact}
                  </span>
                )}
                <a
                  href={directionsUrl(facility)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="ml-auto flex items-center gap-1 text-[12px] font-bold text-teal-700"
                >
                  Directions
                  <svg width="11" height="11">
                    <use href="#i-arrow" />
                  </svg>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="min-h-[320px] flex-1">
        <FacilityMap facilities={facilities} selectedId={selectedId} onSelect={setSelectedId} />
      </div>
    </div>
  );

  if (user) {
    return (
      <AppShell active="/facility-locator" session={{ kind: "user", user }} flush>
        {page}
      </AppShell>
    );
  }

  return page;
}
