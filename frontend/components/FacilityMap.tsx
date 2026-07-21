"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import type { HealthFacility } from "@/lib/apiClient";

const KIGALI_CENTER: [number, number] = [-1.9536, 30.0606];

const TYPE_ICON: Record<string, string> = {
  HOSPITAL: "i-building",
  HEALTH_CENTRE: "i-map-pin",
  CLINIC: "i-map-pin",
  PHARMACY: "i-pill",
};

function pinIcon(iconId: string, selected: boolean): L.DivIcon {
  const size = selected ? 42 : 34;
  const glyph = selected ? 18 : 15;
  return L.divIcon({
    className: "",
    html: `
      <div style="width:${size}px;height:${size}px;border-radius:50% 50% 50% 0;background:${
        selected ? "#146661" : "#E8735C"
      };transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;box-shadow:0 8px 20px rgba(0,0,0,0.28);">
        <svg width="${glyph}" height="${glyph}" style="transform:rotate(45deg);color:#fff;"><use href="#${iconId}" /></svg>
      </div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  });
}

function RecenterOnSelect({ facilities, selectedId }: { facilities: HealthFacility[]; selectedId: string | null }) {
  const map = useMap();
  useEffect(() => {
    const facility = facilities.find((f) => f.id === selectedId);
    if (facility) map.flyTo([facility.latitude, facility.longitude], 14, { duration: 0.6 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);
  return null;
}

export function FacilityMap({
  facilities,
  selectedId,
  onSelect,
}: {
  facilities: HealthFacility[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const center: [number, number] =
    facilities.length > 0 ? [facilities[0].latitude, facilities[0].longitude] : KIGALI_CENTER;

  return (
    <MapContainer center={center} zoom={12} scrollWheelZoom style={{ height: "100%", width: "100%" }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {facilities.map((facility) => (
        <Marker
          key={facility.id}
          position={[facility.latitude, facility.longitude]}
          icon={pinIcon(TYPE_ICON[facility.type] ?? "i-map-pin", facility.id === selectedId)}
          eventHandlers={{ click: () => onSelect(facility.id) }}
        >
          <Popup>
            <div style={{ fontWeight: 700, fontSize: 13.5 }}>{facility.name}</div>
            <div style={{ fontSize: 12, color: "#5B6B68" }}>
              {facility.district} · {facility.sector}
            </div>
          </Popup>
        </Marker>
      ))}
      <RecenterOnSelect facilities={facilities} selectedId={selectedId} />
    </MapContainer>
  );
}
