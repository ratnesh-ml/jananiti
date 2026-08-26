import { MapPin as MapPinIcon, Navigation } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";

export type MapPin = {
  id: string;
  latitude: number;
  longitude: number;
  title: string;
  tone?: "blue" | "teal" | "amber";
};

const INDIA_CENTER: [number, number] = [22.9734, 78.6569];

type CivicMapRecord = {
  id: string;
  title: string;
  locality: string;
  latitude?: number | null;
  longitude?: number | null;
};

export function mappableCivicRecords<T extends CivicMapRecord>(records: T[]) {
  return records.filter((record) => Number.isFinite(record.latitude) && Number.isFinite(record.longitude));
}

function useLatest<T>(value: T) {
  const ref = useRef(value);
  useEffect(() => { ref.current = value; }, [value]);
  return ref;
}

export default function CivicMap({ records, onOpen, onNotice }: { records: CivicMapRecord[]; onOpen: (record: CivicMapRecord) => void; onNotice: (message: string) => void }) {
  const host = useRef<HTMLDivElement | null>(null);
  const [mapError, setMapError] = useState(false);
  const [pickedPoint, setPickedPoint] = useState<[number, number] | null>(null);
  const mappedRecords = useMemo(() => mappableCivicRecords(records), [records]);
  const recordRef = useLatest(mappedRecords);
  const openRef = useLatest(onOpen);
  const noticeRef = useLatest(onNotice);
  const recordKey = mappedRecords.map((record) => `${record.id}:${record.latitude}:${record.longitude}`).join("|");

  useEffect(() => {
    if (!host.current) return;
    let disposed = false;
    let map: import("leaflet").Map | undefined;
    void import("leaflet").then((L) => {
      if (disposed || !host.current) return;
      map = L.map(host.current, { scrollWheelZoom: false, zoomControl: true }).setView(INDIA_CENTER, 4);
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "© OpenStreetMap contributors",
      }).addTo(map);
      const points = recordRef.current.map((record) => {
        const marker = L.circleMarker([record.latitude!, record.longitude!], { radius: 8, color: "#0064e0", fillColor: "#0064e0", fillOpacity: 0.72, weight: 2 }).addTo(map!);
        marker.bindTooltip(record.title, { direction: "top", opacity: 0.95 });
        marker.on("click", () => openRef.current(record));
        return marker;
      });
      if (points.length) map.fitBounds(L.featureGroup(points).getBounds().pad(0.25));
      map.on("click", (event) => {
        const next: [number, number] = [Number(event.latlng.lat.toFixed(4)), Number(event.latlng.lng.toFixed(4))];
        setPickedPoint(next);
        noticeRef.current(`Map point selected for orientation: ${next[0]}, ${next[1]}. It is not saved or published; use the locality field when submitting a report.`);
      });
    }).catch(() => setMapError(true));
    return () => { disposed = true; map?.remove(); };
  }, [openRef, noticeRef, recordKey, recordRef]);

  return <section className="civic-card civic-route-enter mt-4 overflow-hidden rounded-[22px] border border-[#dbe6f2] bg-[#f8fbff] p-3 sm:p-4" aria-label="Free civic map"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[.14em] text-[#0064e0]">Free civic map</p><h3 className="mt-1 text-base font-bold text-[#0a1317]">Browse reported locations</h3><p className="mt-1 max-w-xl text-xs leading-5 text-[#5d6c7b]">Interactive OpenStreetMap tiles, no Google Maps API or billing. Only records with voluntarily stored coordinates appear as points.</p></div><span className="inline-flex min-h-8 items-center gap-1 rounded-full bg-white px-2.5 text-[11px] font-bold text-[#40505f] ring-1 ring-[#dfe8f2]"><Navigation className="h-3.5 w-3.5 text-[#0064e0]" />{mappedRecords.length} mapped</span></div>{mapError ? <div className="mt-3 rounded-xl border border-dashed border-[#bad1e8] bg-white p-4 text-sm leading-6 text-[#526171]">The interactive base map could not load. You can still use locality labels and open available civic records without sharing an exact address.</div> : <div ref={host} className="mt-3 h-64 overflow-hidden rounded-2xl border border-[#c9dae9] bg-[#eaf2f9] sm:h-80" />}<div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[11px] leading-5 text-[#5d6c7b]"><span><MapPinIcon className="mr-1 inline h-3.5 w-3.5 text-[#0064e0]" />Tap the map to orient yourself; taps are never submitted automatically.</span>{pickedPoint && <span className="rounded-full bg-white px-2 py-1 font-bold text-[#40505f]">Orientation point: {pickedPoint[0]}, {pickedPoint[1]}</span>}</div></section>;
}

export function ActivityMap({ pins, className = "" }: { pins: MapPin[]; className?: string }) {
  return <div className={className}><CivicMap records={pins.map((pin) => ({ ...pin, locality: "Mapped locality" }))} onOpen={() => undefined} onNotice={() => undefined} /></div>;
}

export function LocationPicker({ value, onChange }: {
  value: { latitude: number; longitude: number } | null;
  onChange: (value: { latitude: number; longitude: number }) => void;
}) {
  const records = value ? [{ id: "selected", title: "Selected public location", locality: "Manual location", latitude: value.latitude, longitude: value.longitude }] : [];
  return <CivicMap records={records} onOpen={() => undefined} onNotice={(message) => { const match = message.match(/([-\d.]+), ([-\d.]+)/); if (match) onChange({ latitude: Number(match[1]), longitude: Number(match[2]) }); }} />;
}
