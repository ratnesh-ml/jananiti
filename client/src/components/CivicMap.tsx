import { MapView } from "@/components/Map";
import { useEffect, useRef } from "react";

export type MapPin = {
  id: string;
  latitude: number;
  longitude: number;
  title: string;
  tone?: "blue" | "teal" | "amber";
};

const INDIA_CENTER = { lat: 20.5937, lng: 78.9629 };

function mapPinSvg(tone: MapPin["tone"] = "blue") {
  const colors = { blue: "#0e5bb7", teal: "#0d9388", amber: "#e58a22" };
  return `<div style="width:32px;height:32px;border-radius:999px;background:${colors[tone]};border:3px solid white;box-shadow:0 4px 12px rgba(20,52,90,.30);display:grid;place-items:center"><div style="width:7px;height:7px;background:white;border-radius:999px"></div></div>`;
}

export function ActivityMap({ pins, className = "" }: { pins: MapPin[]; className?: string }) {
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);

  useEffect(() => {
    if (!mapRef.current || !window.google) return;
    markersRef.current.forEach(marker => { marker.map = null; });
    markersRef.current = pins.map(pin => {
      const element = document.createElement("div");
      element.innerHTML = mapPinSvg(pin.tone);
      return new window.google.maps.marker.AdvancedMarkerElement({
        map: mapRef.current!,
        position: { lat: pin.latitude, lng: pin.longitude },
        title: pin.title,
        content: element,
      });
    });
  }, [pins]);

  return (
    <MapView
      className={`overflow-hidden rounded-2xl border border-[#d9e6f1] ${className}`}
      initialCenter={pins[0] ? { lat: pins[0].latitude, lng: pins[0].longitude } : INDIA_CENTER}
      initialZoom={pins.length ? 11 : 4}
      onMapReady={map => { mapRef.current = map; }}
    />
  );
}

export function LocationPicker({ value, onChange }: {
  value: { latitude: number; longitude: number } | null;
  onChange: (value: { latitude: number; longitude: number }) => void;
}) {
  const mapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null);

  const setMarker = (position: { latitude: number; longitude: number }) => {
    if (!mapRef.current || !window.google) return;
    if (markerRef.current) markerRef.current.map = null;
    const element = document.createElement("div");
    element.innerHTML = mapPinSvg("teal");
    markerRef.current = new window.google.maps.marker.AdvancedMarkerElement({
      map: mapRef.current,
      position: { lat: position.latitude, lng: position.longitude },
      title: "Issue location",
      content: element,
    });
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-[#d9e6f1] bg-[#f6faff]">
      <MapView
        className="h-[320px]"
        initialCenter={value ? { lat: value.latitude, lng: value.longitude } : INDIA_CENTER}
        initialZoom={value ? 14 : 4}
        onMapReady={map => {
          mapRef.current = map;
          if (value) setMarker(value);
          map.addListener("click", (event: google.maps.MapMouseEvent) => {
            if (!event.latLng) return;
            const next = { latitude: event.latLng.lat(), longitude: event.latLng.lng() };
            setMarker(next);
            onChange(next);
          });
        }}
      />
      <div className="flex items-center justify-between gap-4 border-t border-[#d9e6f1] px-4 py-3">
        <p className="text-xs font-medium leading-5 text-[#667d98]">Select the closest public location. Avoid pinpointing a private residence unless essential for safe resolution.</p>
        <span className="shrink-0 rounded-full bg-white px-3 py-1 text-[11px] font-bold text-[#0d9388] shadow-sm">{value ? "Pin selected" : "Tap map"}</span>
      </div>
    </div>
  );
}
