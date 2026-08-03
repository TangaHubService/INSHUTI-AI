"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { AppShell } from "@/components/AppShell";
import { FullPageLoading, PageLoading } from "@/components/Spinner";
import { getFacilities, type FacilityType, type HealthFacility } from "@/lib/apiClient";
import { getCurrentUser, type UserProfile } from "@/lib/userApiClient";

const FacilityMap = dynamic(() => import("@/components/FacilityMap").then((module) => module.FacilityMap), { ssr: false, loading: () => <PageLoading label="Loading map…" /> });
const TYPE_LABEL: Record<FacilityType, string> = { HOSPITAL: "Hospital", HEALTH_CENTRE: "Health centre", CLINIC: "Clinic", PHARMACY: "Pharmacy" };
const TYPE_COLOR: Record<FacilityType, string> = { HOSPITAL: "#EE5870", HEALTH_CENTRE: "#1A9A69", CLINIC: "#8657E8", PHARMACY: "#F0A01E" };

function distanceKm(from: { latitude: number; longitude: number } | null, facility: HealthFacility) {
  if (!from) return null;
  const rad = Math.PI / 180; const dLat = (facility.latitude - from.latitude) * rad; const dLon = (facility.longitude - from.longitude) * rad;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(from.latitude * rad) * Math.cos(facility.latitude * rad) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function FacilityLocatorPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [facilities, setFacilities] = useState<HealthFacility[]>([]);
  const [types, setTypes] = useState<FacilityType[]>([]);
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [type, setType] = useState<FacilityType | "">("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { void getCurrentUser().then(setUser).finally(() => setAuthChecked(true)); }, []);
  useEffect(() => { let cancelled = false; setLoading(true); void getFacilities({ search: submittedQuery || undefined, type: type || undefined }).then((data) => { if (cancelled) return; setFacilities(data.facilities); setTypes(data.facilityTypes); setSelectedId((current) => data.facilities.some((item) => item.id === current) ? current : data.facilities[0]?.id ?? null); }).finally(() => { if (!cancelled) setLoading(false); }); return () => { cancelled = true; }; }, [submittedQuery, type]);

  function findNearMe() {
    navigator.geolocation?.getCurrentPosition((position) => setLocation({ latitude: position.coords.latitude, longitude: position.coords.longitude }));
  }

  const sorted = useMemo(() => [...facilities].sort((a, b) => (distanceKm(location, a) ?? 0) - (distanceKm(location, b) ?? 0)), [facilities, location]);
  if (!authChecked) return <FullPageLoading />;

  const content = <div className="mx-auto max-w-[1240px] pb-10">
    <header><h1 className="text-[32px] font-bold">Find Care</h1><p className="mt-1 text-sm text-ink-soft">Find nearby health services and support you can trust.</p></header>
    <section className="mt-5 rounded-2xl border border-line bg-white p-3 shadow-sm"><form onSubmit={(event) => { event.preventDefault(); setSubmittedQuery(query.trim()); }} className="grid gap-3 lg:grid-cols-[1fr_190px_170px_100px]"><label className="flex h-11 items-center gap-3 rounded-xl border border-line px-4"><svg width="17" height="17" className="text-teal-700"><use href="#i-search" /></svg><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search for a service, facility, or provider…" className="min-w-0 flex-1 bg-transparent text-xs outline-none" /></label><select value={type} onChange={(event) => setType(event.target.value as FacilityType | "")} className="h-11 rounded-xl border border-line bg-white px-4 text-xs"><option value="">All services</option>{types.map((item) => <option key={item} value={item}>{TYPE_LABEL[item]}</option>)}</select><button type="button" onClick={findNearMe} className="flex h-11 items-center justify-center gap-2 rounded-xl border border-line text-xs"><svg width="16" height="16"><use href="#i-map-pin" /></svg>{location ? "Location enabled" : "Near me"}</button><button className="h-11 rounded-xl bg-teal-700 text-xs font-semibold text-white">Search</button></form><div className="mt-3 flex gap-2 overflow-x-auto border-t border-line pt-3"><button onClick={() => setType("")} className={`rounded-full px-5 py-2 text-[10px] font-semibold ${!type ? "bg-teal-700 text-white" : "border border-line"}`}>All</button>{types.map((item) => <button key={item} onClick={() => setType(item)} className={`whitespace-nowrap rounded-full px-5 py-2 text-[10px] font-semibold ${type === item ? "bg-teal-700 text-white" : "border border-line"}`}>{TYPE_LABEL[item]}</button>)}</div></section>

    <div className="mt-4 grid items-start gap-5 xl:grid-cols-[1fr_310px]">
      <main className="overflow-hidden rounded-2xl border border-line bg-white shadow-sm"><div className="flex h-11 items-center justify-between border-b border-line px-5 text-[11px]"><strong>{sorted.length} {sorted.length === 1 ? "facility" : "facilities"} found</strong><button onClick={findNearMe} className="font-semibold text-teal-700">⌖ Use my current location</button></div>{loading ? <PageLoading /> : sorted.length === 0 ? <div className="flex min-h-[580px] flex-col items-center justify-center px-6 text-center"><span className="flex h-20 w-20 items-center justify-center rounded-full bg-teal-100 text-teal-700"><svg width="34" height="34"><use href="#i-map-pin" /></svg></span><h2 className="mt-5 text-lg font-bold">No matching care found</h2><p className="mt-2 max-w-[390px] text-xs leading-5 text-ink-soft">Try a broader service or facility name. You can also use your current location or ask Inshuti to help find the right care.</p><div className="mt-5 flex gap-3"><button onClick={() => { setQuery(""); setSubmittedQuery(""); setType(""); }} className="rounded-xl border border-teal-700 px-5 py-2.5 text-[11px] font-semibold text-teal-700">Clear filters</button><Link href="/chat" className="rounded-xl bg-teal-700 px-5 py-2.5 text-[11px] font-semibold text-white">Ask Inshuti</Link></div></div> : <div className="grid min-h-[580px] lg:grid-cols-[430px_1fr]"><div className="max-h-[640px] overflow-y-auto divide-y divide-line">{sorted.map((facility) => { const color = TYPE_COLOR[facility.type]; const distance = distanceKm(location, facility); return <button key={facility.id} onClick={() => setSelectedId(facility.id)} className={`flex w-full gap-4 px-5 py-4 text-left hover:bg-paper-2 ${selectedId === facility.id ? "bg-[#F7FCFA]" : ""}`}><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full" style={{ background: `${color}15`, color }}><svg width="21" height="21"><use href="#i-building" /></svg></span><span className="min-w-0 flex-1"><span className="flex items-center gap-2"><strong className="truncate text-xs">{facility.name}</strong><i className="whitespace-nowrap rounded-full px-2 py-1 text-[8px] not-italic" style={{ background: `${color}15`, color }}>{TYPE_LABEL[facility.type]}</i></span><span className="mt-2 block truncate text-[10px] text-ink-soft">{facility.services.join(", ")}</span><span className="mt-2 block text-[9px] text-ink-soft">⌖ {facility.sector}, {facility.district}</span>{facility.contact && <span className="mt-1 block text-[9px] text-ink-soft">☎ {facility.contact}</span>}</span><span className="self-center whitespace-nowrap text-[10px] text-ink-soft">{distance !== null ? `${distance.toFixed(1)} km` : "›"}</span></button>; })}</div><div className="relative min-h-[540px]"><FacilityMap facilities={sorted} selectedId={selectedId} onSelect={setSelectedId} /></div></div>}</main>

      <aside className="space-y-4"><section className="rounded-2xl border border-[#CDE5DF] bg-[#F1FAF7] p-5"><div className="flex gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#DDF3E8] text-success"><svg width="21" height="21"><use href="#i-phone" /></svg></span><div><h2 className="text-sm font-bold">Need immediate help?</h2><p className="mt-2 text-[10px] leading-5 text-ink-soft">If you or someone you know is in immediate danger, please reach out right away.</p></div></div><Link href="/help-resources#crisis" className="mt-4 block rounded-xl bg-white px-4 py-3 text-center text-[10px] font-semibold text-teal-700">View Crisis Resources →</Link></section><section className="rounded-2xl border border-[#DDE3FA] bg-[#F8F9FF] p-5"><h2 className="text-sm font-bold">What is Youth Friendly Care?</h2><p className="mt-4 text-[10px] leading-5 text-ink-soft">Youth friendly services provide respectful, confidential, accessible, and affordable support for young people.</p><Link href="/library" className="mt-4 inline-flex text-[10px] font-semibold text-[#6D51CF]">Learn more →</Link></section><section className="rounded-2xl border border-line bg-white p-5 shadow-sm"><h2 className="text-sm font-bold">Tips for visiting</h2><ul className="mt-4 space-y-4 text-[10px] text-ink-soft"><li>● You have the right to confidential care.</li><li>● You can ask for a youth-friendly provider.</li><li>● Bring a trusted person if it helps you feel safe.</li><li>● Ask about fees before receiving services.</li></ul></section><section className="rounded-2xl border border-[#E2DDF7] bg-[#F9F6FF] p-5"><h2 className="text-sm font-bold">Can&apos;t find what you need?</h2><p className="mt-2 text-[10px] leading-5 text-ink-soft">Talk to Inshuti and we&apos;ll help you find the right care.</p><Link href="/chat" className="mt-4 block rounded-xl bg-white px-4 py-3 text-center text-[10px] font-semibold text-teal-700">Chat with Inshuti →</Link></section></aside>
    </div>
    <section className="mt-5 flex items-center gap-4 rounded-2xl border border-[#E3DDF8] bg-[#F8F5FF] p-5"><span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#EEE7FF] text-[#7653D5]"><svg width="21" height="21"><use href="#i-shield" /></svg></span><div><h2 className="text-xs font-bold">Your health matters. We&apos;re here to help you find care that&apos;s right for you.</h2><p className="mt-1 text-[10px] text-ink-soft">Facility information is supplied by the platform care directory.</p></div></section>
  </div>;

  return user ? <AppShell active="/facility-locator" session={{ kind: "user", user }}>{content}</AppShell> : <main className="min-h-screen bg-paper px-5 py-8">{content}</main>;
}
