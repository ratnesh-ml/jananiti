import CivicHeader from "@/components/CivicHeader";
import { trpc } from "@/lib/trpc";
import { Cloud, Droplets, Leaf, MapPin, Mic, Search, Sparkles, TreePine, Trash2, Waves } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "wouter";

const categories = [
  ["environment", "Air", Cloud, "#ef5350"], ["water", "Water", Droplets, "#1665d8"], ["sanitation", "Waste", Trash2, "#f58625"],
  ["safety", "Noise", Mic, "#8a49e4"], ["roads", "Roads", Waves, "#0d8fbd"], ["electricity", "Green", TreePine, "#12855a"],
] as const;

function priorityTone(priority: string) { return priority === "urgent" || priority === "high" ? "bg-[#fff0ef] text-[#df4338]" : "bg-[#fff8e8] text-[#bd7918]"; }

export default function Explore() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const { data: records = [], isLoading } = trpc.civicItems.publicList.useQuery({ limit: 60 });
  const { data: stats } = trpc.civicItems.stats.useQuery();
  const matches = useMemo(() => records.filter(record => {
    const text = `${record.title} ${record.description} ${record.locationLabel}`.toLowerCase();
    return (!query.trim() || text.includes(query.toLowerCase().trim())) && (!selected || record.category === selected);
  }), [query, records, selected]);
  const places = useMemo(() => Array.from(new Set(records.map(record => record.locationLabel).filter(Boolean))).slice(0, 8), [records]);
  const popular = categories.slice(0, 6);
  return <div className="min-h-screen bg-[#fbfbfc]"><CivicHeader /><main className="mx-auto max-w-xl px-4 pb-28 pt-5">
    <label className="flex h-14 items-center gap-3 rounded-2xl border border-[#d9dee5] bg-white px-4 shadow-sm"><Search className="h-6 w-6 text-[#263547]" /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search issues, places, departments…" className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-[#263547] outline-none placeholder:text-[#7b8490]" /><Mic className="h-5 w-5 text-[#5d6a7a]" /></label>
    <section className="mt-7"><div className="flex items-center justify-between"><h1 className="text-xl font-black text-[#151a24]">Popular Searches</h1><button type="button" onClick={() => { setSelected(null); setQuery(""); }} className="text-sm font-black text-[#064bac]">See all</button></div><div className="mt-4 flex flex-wrap gap-2">{popular.map(([id, label, Icon, color]) => <button type="button" key={id} onClick={() => setSelected(selected === id ? null : id)} className={`inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-xs font-black ${selected === id ? "bg-[#e8f1ff] text-[#074fac]" : "bg-[#f6f7fa] text-[#303946]"}`}><Icon className="h-4 w-4" style={{ color }} />{label}</button>)}</div></section>
    <section className="mt-8"><div className="flex items-end justify-between"><div><h2 className="text-xl font-black text-[#151a24]">Near You</h2><p className="mt-1 text-sm text-[#657182]">Public issues around your selected locality</p></div><Link href="/heatmap" className="text-sm font-black text-[#064bac]">See all</Link></div>{isLoading ? <div className="mt-4 h-48 animate-pulse rounded-2xl bg-[#eef2f6]" /> : matches.length ? <div className="mt-4 flex gap-3 overflow-x-auto pb-2">{matches.slice(0, 8).map(record => <Link key={record.publicId} href={`/track?ref=${record.publicId}`} className="w-44 shrink-0 overflow-hidden rounded-2xl border border-[#e5e9ee] bg-white"><div className="grid h-28 place-items-center bg-[linear-gradient(130deg,#eaf2fb,#eaf8f1)]"><MapPin className="h-7 w-7 text-[#0d5ebc]" /></div><div className="p-3"><span className={`rounded-full px-2 py-1 text-[10px] font-black ${priorityTone(record.priority)}`}>{record.priority} priority</span><p className="mt-2 line-clamp-2 text-sm font-black leading-5 text-[#1f2938]">{record.title}</p><p className="mt-2 truncate text-xs text-[#6c7a8a]">{record.locationLabel}</p></div></Link>)}</div> : <div className="mt-4 rounded-2xl border border-dashed border-[#dbe3eb] bg-white p-6 text-center"><MapPin className="mx-auto h-6 w-6 text-[#0e5bb7]" /><p className="mt-2 text-sm font-black text-[#27394d]">No nearby public records yet.</p><Link href="/report" className="mt-3 inline-block text-sm font-black text-[#064bac]">Report the first issue</Link></div>}</section>
    <section className="mt-8"><h2 className="text-xl font-black text-[#151a24]">Explore by Category</h2><div className="mt-4 grid grid-cols-3 gap-3">{categories.map(([id, label, Icon, color]) => <button type="button" key={id} onClick={() => setSelected(selected === id ? null : id)} className={`rounded-2xl p-4 text-center ${selected === id ? "ring-2 ring-[#0a55b5]" : "bg-[#f6f8fb]"}`}><Icon className="mx-auto h-7 w-7" style={{ color }} /><p className="mt-2 text-sm font-black text-[#1e2938]">{label}</p><p className="mt-1 text-xs text-[#687789]">{stats?.byCategory?.[id] ?? 0} issues</p></button>)}</div></section>
    <section className="mt-8"><div className="flex items-center justify-between"><h2 className="text-xl font-black text-[#151a24]">Places & Localities</h2><button type="button" onClick={() => setQuery("")} className="text-sm font-black text-[#064bac]">See all</button></div><div className="mt-4 flex gap-2 overflow-x-auto pb-1">{places.length ? places.map(place => <button type="button" key={place} onClick={() => setQuery(place)} className="shrink-0 rounded-2xl border border-[#e1e6ec] bg-white px-4 py-3 text-left"><p className="max-w-32 truncate text-xs font-black text-[#2b3747]">{place}</p><p className="mt-1 text-[11px] text-[#788595]">Filter this locality</p></button>) : <p className="rounded-2xl bg-[#f6f8fb] p-4 text-sm text-[#718094]">Locality cards will appear with real public reports.</p>}</div></section>
    <section className="mt-8 rounded-2xl border border-[#e2e7ed] bg-white p-4"><div className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-[#0b9372]" /><h2 className="font-black text-[#253648]">Smart Suggestions</h2></div><div className="mt-4 grid gap-3 sm:grid-cols-2"><Link href="/report" className="rounded-xl bg-[#f0faf5] p-3"><Leaf className="h-5 w-5 text-[#0b9372]" /><p className="mt-2 text-sm font-black text-[#253648]">Report to improve your locality</p><p className="mt-1 text-xs text-[#687d79]">Your civic record can help start local action.</p></Link><Link href="/verify" className="rounded-xl bg-[#eef5ff] p-3"><UsersRound className="h-5 w-5 text-[#0859ba]" /><p className="mt-2 text-sm font-black text-[#253648]">Verify nearby records</p><p className="mt-1 text-xs text-[#687d79]">Community signals remain human-reviewed.</p></Link></div></section>
  </main></div>;
}

function UsersRound(props: { className?: string }) { return <span className={props.className}>◉</span>; }
