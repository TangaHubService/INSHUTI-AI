"use client";

import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const PICKER_ICON = L.divIcon({
  className: "",
  html: `
    <div style="width:38px;height:38px;border-radius:50% 50% 50% 0;background:#146661;transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;box-shadow:0 8px 20px rgba(0,0,0,0.28);">
      <svg width="16" height="16" viewBox="0 0 24 24" style="transform:rotate(45deg);"><use href="#i-map-pin" style="color:#fff;" /></svg>
    </div>`,
  iconSize: [38, 38],
  iconAnchor: [19, 38],
});

function ClickToPlace({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export function LocationPicker({
  latitude,
  longitude,
  onChange,
}: {
  latitude: number;
  longitude: number;
  onChange: (lat: number, lng: number) => void;
}) {
  return (
    <MapContainer
      center={[latitude, longitude]}
      zoom={13}
      scrollWheelZoom
      style={{ height: "240px", width: "100%", borderRadius: "12px" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker
        position={[latitude, longitude]}
        icon={PICKER_ICON}
        draggable
        eventHandlers={{
          dragend: (e) => {
            const pos = (e.target as L.Marker).getLatLng();
            onChange(pos.lat, pos.lng);
          },
        }}
      />
      <ClickToPlace onPick={onChange} />
    </MapContainer>
  );
}
