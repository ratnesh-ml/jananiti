import { useAuth } from "@/_core/hooks/useAuth";
import CivicHeader, { CivicFooter } from "@/components/CivicHeader";
import { ActivityMap, type MapPin as ActivityPin } from "@/components/CivicMap";
import StatusPill from "@/components/StatusPill";
import { trpc } from "@/lib/trpc";
import {
  BadgeCheck,
  CircleCheck,
  Compass,
  FileAudio,
  FileText,
  Map,
  MapPin,
  MessageCircleQuestion,
  Search,
  Share2,
  ThumbsDown,
  ThumbsUp,
  Waves,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "wouter";

const categories = ["All activity", "Roads", "Water", "Safety", "Sanitation", "Environment"] as const;

type Evidence = {
  id: number;
  kind: string;
  originalName: string;
  mimeType: string;
  url: string;
};

function categoryTone(category: string) {
  if (category === "water") return "from-sky-100 via-cyan-50 to-white text-sky-700";
  if (category === "environment") return "from-emerald-100 via-teal-50 to-white text-emerald-700";
  if (category === "safety") return "from-amber-100 via-orange-50 to-white text-amber-700";
  return "from-blue-100 via-indigo-50 to-white text-blue-700";
}

function EvidencePanel({ attachments }: { attachments: Evidence[] }) {
  const image = attachments.find(attachment => attachment.kind === "image");
  const video = attachments.find(attachment => attachment.kind === "video");
  const audio = attachments.find(attachment => attachment.kind === "audio");
  const document = attachments.find(attachment => attachment.kind === "document");

  if (image) {
    return <div className="relative h-48 bg-[#e9f2f8] sm:h-64">
      <img src={image.url} alt={`Evidence for civic report: ${image.originalName}`} className="h-full w-full object-cover" />
      <span className="absolute right-4 top-4 rounded-full bg-slate-950/70 px-3 py-1 text-[10px] font-black uppercase tracking-[.12em] text-white">Photo evidence</span>
    </div>;
  }
  if (video) {
    return <div className="relative bg-slate-950">
      <video src={video.url} controls className="h-48 w-full object-cover sm:h-64" />
      <span className="absolute right-4 top-4 rounded-full bg-slate-950/70 px-3 py-1 text-[10px] font-black uppercase tracking-[.12em] text-white">Video evidence</span>
    </div>;
  }
  if (audio) {
    return <div className="flex min-h-36 items-center gap-4 bg-gradient-to-br from-[#edf8f7] to-[#eef6ff] p-5">
      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white text-[#0d9388] shadow-sm"><FileAudio className="h-5 w-5" /></span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-black text-[#315474]">Voice evidence</p>
        <p className="mt-1 text-xs text-[#6e879f]">{audio.originalName}</p>
        <audio controls src={audio.url} className="mt-3 h-8 w-full" />
      </div>
    </div>;
  }
  if (document) {
    return <div className="flex min-h-36 items-center gap-4 bg-gradient-to-br from-[#f4f8fb] to-white p-5">
      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white text-[#0e5bb7] shadow-sm"><FileText className="h-5 w-5" /></span>
      <div className="min-w-0">
        <p className="text-sm font-black text-[#315474]">Document evidence attached</p>
        <p className="mt-1 truncate text-xs text-[#6e879f]">{document.originalName}</p>
        <a href={document.url} target="_blank" rel="noreferrer" className="mt-3 inline-block text-xs font-extrabold text-[#0e5bb7] hover:underline">Open evidence</a>
      </div>
    </div>;
  }
  return null;
}

export default function PublicActivity() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<(typeof categories)[number]>("All activity");
  const feed = trpc.community.feed.useQuery({ limit: 36 });
  const map = trpc.civicItems.mapActivity.useQuery();
  const badges = trpc.community.badges.useQuery(undefined, { enabled: Boolean(user) });
  const utils = trpc.useUtils();
  const react = trpc.community.react.useMutation({ onSuccess: () => utils.community.feed.invalidate() });
  const verify = trpc.community.verify.useMutation({
    onSuccess: () => {
      utils.community.feed.invalidate();
      utils.community.badges.invalidate();
    },
  });
  const pins: ActivityPin[] = (map.data ?? []).map(item => ({
    id: item.publicId,
    latitude: Number(item.latitude),
    longitude: Number(item.longitude),
    title: item.title,
    tone: item.status === "resolved" ? "teal" : item.priority === "urgent" ? "amber" : "blue",
  }));
  const items = useMemo(() => (feed.data ?? []).filter(item => {
    const query = search.trim().toLowerCase();
    const matchesQuery = !query || `${item.title} ${item.description} ${item.locationLabel}`.toLowerCase().includes(query);
    const matchesCategory = category === "All activity" || item.category === category.toLowerCase();
    return matchesQuery && matchesCategory;
  }), [feed.data, search, category]);

  return <div className="min-h-screen bg-[#f7fafc]">
    <CivicHeader />
    <main className="container pb-14 pt-7 sm:pt-10">
      <div className="grid gap-7 lg:grid-cols-[1fr_300px]">
        <section>
          <div className="rounded-[30px] bg-[#153f69] px-6 py-7 text-white shadow-[0_18px_50px_rgba(21,63,105,.2)] sm:px-8">
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <div>
                <p className="text-xs font-black uppercase tracking-[.18em] text-[#9ee3da]">Your neighbourhood, in motion</p>
                <h1 className="mt-3 max-w-xl text-3xl font-black tracking-[-.055em] sm:text-4xl">Local issues people can see, verify, and move forward.</h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-[#c5dcec]">A social local feed for civic action. Public records show the issue and progress—not who reported it.</p>
              </div>
              <Link href="/report" className="inline-flex h-11 shrink-0 items-center justify-center rounded-xl bg-white px-5 text-sm font-extrabold text-[#0e5bb7] shadow-sm">Report nearby issue</Link>
            </div>
            <div className="mt-6 flex items-center rounded-2xl bg-white/12 p-2 ring-1 ring-white/15">
              <Search className="ml-3 h-4 w-4 text-[#b9d5e5]" />
              <input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search issues, streets, landmarks…" className="h-10 w-full bg-transparent px-3 text-sm font-medium text-white placeholder:text-[#b9d5e5] outline-none" />
            </div>
          </div>

          <div className="mt-6 overflow-x-auto pb-1"><div className="flex w-max gap-3">
            {categories.map(entry => <button type="button" key={entry} onClick={() => setCategory(entry)} className={`rounded-full px-4 py-2 text-sm font-extrabold transition ${category === entry ? "bg-[#0e5bb7] text-white shadow-md" : "border border-[#dce7f0] bg-white text-[#54708d] hover:border-[#8fb9dd]"}`}>{entry}</button>)}
          </div></div>

          <div className="mt-6 flex items-center gap-3 overflow-x-auto pb-2">
            <div className="shrink-0 text-xs font-black uppercase tracking-[.14em] text-[#7690a7]">Near you</div>
            {["Fresh reports", "Needs verification", "Resolved", "High priority"].map((label, index) => <button type="button" key={label} className="group flex shrink-0 items-center gap-2 rounded-2xl border border-[#dce8f3] bg-white px-3 py-2.5 text-left shadow-sm">
              <span className={`grid h-8 w-8 place-items-center rounded-full border-2 border-white bg-gradient-to-br ${["from-pink-400 to-orange-300", "from-amber-400 to-orange-300", "from-teal-400 to-sky-400", "from-violet-400 to-fuchsia-400"][index]} text-white`}><Waves className="h-3.5 w-3.5" /></span>
              <span className="text-xs font-extrabold text-[#355674]">{label}</span>
            </button>)}
          </div>

          <div className="mt-6 space-y-5">
            {feed.isLoading && <div className="h-72 animate-pulse rounded-[28px] bg-[#eaf2f8]" />}
            {!feed.isLoading && items.map(item => <article key={item.publicId} className="overflow-hidden rounded-[28px] border border-[#dce8f3] bg-white shadow-[0_12px_30px_rgba(31,77,116,.06)]">
              <EvidencePanel attachments={item.attachments as Evidence[]} />
              {!item.attachments.length && <div className={`relative h-44 bg-gradient-to-br ${categoryTone(item.category)} p-5 sm:h-52`}>
                <div className="absolute right-5 top-5 rounded-full bg-white/80 px-3 py-1 text-[10px] font-black uppercase tracking-[.14em] shadow-sm">{item.category.replace("_", " ")}</div>
                <div className="absolute bottom-5 left-5">
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[.15em] opacity-80"><MapPin className="h-3.5 w-3.5" />{item.locationLabel}</div>
                  <h2 className="mt-2 max-w-xl text-2xl font-black tracking-[-.04em] text-[#17365d]">{item.title}</h2>
                </div>
              </div>}
              <div className="p-5 sm:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-full bg-[#ecf5ff] text-sm font-black text-[#0e5bb7]">J</span><div><p className="text-sm font-black text-[#315474]">Jananiti community record</p><p className="text-xs text-[#7b93a9]">{new Date(item.createdAt).toLocaleDateString()} · {item.publicId}</p></div></div>
                  <StatusPill status={item.status} />
                </div>
                {item.attachments.length > 0 && <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-bold text-[#6d869f]"><span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-[#0d9388]" />{item.locationLabel}</span><span className="rounded-full bg-[#f1f6fa] px-2 py-1">{item.category.replace("_", " ")}</span>{item.attachmentCount > 1 && <span className="rounded-full bg-[#f1f6fa] px-2 py-1">{item.attachmentCount} evidence files</span>}</div>}
                <h2 className="mt-4 text-xl font-black tracking-[-.04em] text-[#17365d]">{item.title}</h2>
                <p className="mt-3 text-sm leading-6 text-[#5f7891]">{item.description}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <button type="button" disabled={!user || react.isPending} onClick={() => react.mutate({ publicId: item.publicId, reaction: "up" })} className={`inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-extrabold ${item.signals.viewerReaction === "up" ? "bg-[#e7f5ee] text-[#087b72]" : "bg-[#f1f6fa] text-[#5c7893] hover:bg-[#e7f0f7]"}`}><ThumbsUp className="h-3.5 w-3.5" />Helpful {item.signals.up}</button>
                  <button type="button" disabled={!user || react.isPending} onClick={() => react.mutate({ publicId: item.publicId, reaction: "down" })} className={`inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-extrabold ${item.signals.viewerReaction === "down" ? "bg-[#fff0eb] text-[#b85a38]" : "bg-[#f1f6fa] text-[#5c7893] hover:bg-[#e7f0f7]"}`}><ThumbsDown className="h-3.5 w-3.5" />Not helpful {item.signals.down}</button>
                  <button type="button" disabled={!user || verify.isPending} onClick={() => verify.mutate({ publicId: item.publicId, response: "confirm" })} className={`inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-extrabold ${item.signals.viewerVerification === "confirm" ? "bg-[#e8f7f2] text-[#087b72]" : "bg-[#eff9f8] text-[#087b72] hover:bg-[#e0f4f1]"}`}><BadgeCheck className="h-3.5 w-3.5" />Verify {item.signals.confirm}</button>
                  <button type="button" disabled={!user || verify.isPending} onClick={() => verify.mutate({ publicId: item.publicId, response: "unable_to_verify" })} className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#fff7e7] px-3 text-xs font-extrabold text-[#9c6917]"><MessageCircleQuestion className="h-3.5 w-3.5" />Can’t verify</button>
                  <Link href={`/track?ref=${item.publicId}`} className="inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-extrabold text-[#58738e] hover:bg-[#f1f6fa]"><Share2 className="h-3.5 w-3.5" />Open record</Link>
                  <Link href={`/discussion?ref=${item.publicId}`} className="inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-extrabold text-[#58738e] hover:bg-[#f1f6fa]"><MessageCircleQuestion className="h-3.5 w-3.5" />Discuss</Link>
                </div>
                <div className="mt-5 flex items-center justify-between border-t border-[#edf3f7] pt-4 text-xs font-bold text-[#6b879f]"><span className="flex items-center gap-1.5"><CircleCheck className="h-3.5 w-3.5 text-[#0d9388]" />{item.signals.confirm} community confirmations · {item.signals.dispute} disputes</span><span>Signals inform review, not truth.</span></div>
              </div>
            </article>)}
            {!feed.isLoading && items.length === 0 && <div className="rounded-[28px] border border-dashed border-[#cbdced] bg-white p-10 text-center"><Compass className="mx-auto h-8 w-8 text-[#0e5bb7]" /><h2 className="mt-4 text-lg font-black text-[#315474]">No matching local records yet.</h2><p className="mt-2 text-sm text-[#7790a7]">Try another search, category, or share the first report for your area.</p></div>}
          </div>
        </section>

        <aside className="space-y-5">
          <section className="rounded-[24px] border border-[#dce8f3] bg-white p-5 shadow-sm"><div className="flex items-center gap-2"><Map className="h-5 w-5 text-[#0e5bb7]" /><div><p className="text-sm font-black text-[#315474]">Local discovery</p><p className="text-xs text-[#7890ad]">Privacy-safe activity by area</p></div></div><div className="mt-4"><ActivityMap pins={pins} className="h-56" /></div><p className="mt-3 text-xs leading-5 text-[#7189a0]">Public pins show only shared points. Use area filters and landmarks—not home addresses.</p></section>
          <section className="rounded-[24px] bg-[#eff9f8] p-5 ring-1 ring-[#cde9e5]"><p className="text-xs font-black uppercase tracking-[.15em] text-[#0b8a80]">Your civic standing</p>{user ? <><div className="mt-3 flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-full bg-white text-[#0d9388] shadow-sm"><BadgeCheck className="h-5 w-5" /></span><p className="text-sm font-black text-[#315474]">{badges.data?.length ?? 0} earned badge{(badges.data?.length ?? 0) === 1 ? "" : "s"}</p></div><div className="mt-4 flex flex-wrap gap-2">{badges.data?.map(badge => <span key={badge.id} className="rounded-full bg-white px-3 py-1.5 text-[11px] font-extrabold text-[#087b72]">{badge.badge.replaceAll("_", " ")}</span>)}</div></> : <p className="mt-3 text-sm leading-6 text-[#5d8180]">Sign in to verify local issues, earn civic badges, and receive nearby check-in prompts.</p>}</section>
        </aside>
      </div>
    </main>
    <CivicFooter />
  </div>;
}
