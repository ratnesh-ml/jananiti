import CivicHeader, { CivicFooter } from "@/components/CivicHeader";
import { trpc } from "@/lib/trpc";
import { ArrowRight, CheckCircle2, ClipboardPenLine, MapPinned, ShieldCheck, Waypoints } from "lucide-react";
import { Link } from "wouter";

const pathways = [
  { icon: ClipboardPenLine, title: "Report with context", text: "Describe the issue, choose a category, and add a clear location without navigating a complex government form." },
  { icon: MapPinned, title: "See what is happening", text: "Browse privacy-conscious public updates and understand which types of issues are being raised in an area." },
  { icon: Waypoints, title: "Follow every step", text: "Receive a clear record when your request is received, assigned, updated, or resolved." },
];

export default function Home() {
  const { data: stats } = trpc.civicItems.stats.useQuery();
  return (
    <div className="min-h-screen overflow-hidden bg-[#fbfdff] text-[#17365d]">
      <CivicHeader />
      <main>
        <section className="hero-grid relative border-b border-[#e5eef7]">
          <div className="container grid gap-12 py-16 lg:grid-cols-[1.08fr_.92fr] lg:items-center lg:py-24">
            <div className="relative z-10 max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#cce7e4] bg-[#f0fbfa] px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#087b72]"><span className="h-1.5 w-1.5 rounded-full bg-[#16a394]" /> Civic participation, made visible</span>
              <h1 className="mt-6 text-4xl font-black leading-[1.04] tracking-[-0.055em] text-[#153359] sm:text-5xl lg:text-6xl">Every local concern deserves a <span className="text-[#0d9388]">clear path</span> to action.</h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-[#59718d]">Jananiti helps citizens report issues with context, follow accountable updates, and see how local participation is turning into coordinated work.</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/report" className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#0e5bb7] px-5 text-sm font-extrabold text-white shadow-[0_12px_24px_rgba(14,91,183,.22)] transition-all hover:bg-[#0a4b98] active:scale-[.97]">Report a local issue <ArrowRight className="h-4 w-4" /></Link>
                <Link href="/activity" className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-[#cbdced] bg-white px-5 text-sm font-extrabold text-[#244b75] transition-all hover:border-[#9dbbda] hover:bg-[#f4f9ff]">Explore public activity</Link>
              </div>
              <p className="mt-5 flex items-center gap-2 text-xs font-semibold text-[#6b829d]"><ShieldCheck className="h-4 w-4 text-[#0d9388]" /> Public activity is privacy-conscious. Personal request details remain tied to your account.</p>
            </div>
            <div className="relative mx-auto w-full max-w-[500px]">
              <div className="absolute -inset-8 rounded-[40px] bg-[radial-gradient(circle_at_45%_35%,rgba(127,223,210,.32),transparent_44%),radial-gradient(circle_at_85%_80%,rgba(109,173,238,.22),transparent_36%)] blur-2xl" />
              <div className="relative rounded-[28px] border border-[#d9e8f4] bg-white p-5 shadow-[0_24px_70px_rgba(26,69,109,.14)]">
                <div className="flex items-center justify-between border-b border-[#edf3f8] pb-4"><div><p className="text-xs font-extrabold uppercase tracking-[.13em] text-[#0d9388]">Community action</p><p className="mt-1 text-lg font-black text-[#16385e]">A clearer civic record</p></div><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#eef6ff] text-[#0e5bb7]"><CheckCircle2 className="h-5 w-5" /></span></div>
                <div className="mt-5 grid gap-3">
                  {[
                    ["1", "A citizen gives context", "Category, location, and the details that matter."],
                    ["2", "A coordinator reviews", "Human oversight keeps decisions accountable."],
                    ["3", "Progress becomes visible", "Updates create a traceable path to resolution."],
                  ].map(([number, title, text]) => <div key={number} className="flex gap-3 rounded-2xl bg-[#f7fbff] p-4"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-[#0e5bb7] text-xs font-black text-white">{number}</span><div><p className="text-sm font-extrabold text-[#25496f]">{title}</p><p className="mt-1 text-xs leading-5 text-[#7188a1]">{text}</p></div></div>)}
                </div>
                <div className="mt-5 rounded-2xl bg-[#123b67] px-4 py-3 text-white"><p className="text-[11px] font-bold uppercase tracking-[.12em] text-[#93c8f7]">Open civic record</p><p className="mt-1 text-sm font-semibold">Built for action, not just intake.</p></div>
              </div>
            </div>
          </div>
        </section>
        <section id="how-it-works" className="container py-20">
          <div className="max-w-2xl"><p className="eyebrow">A civic process people can follow</p><h2 className="mt-3 text-3xl font-black tracking-[-.045em] text-[#153359] sm:text-4xl">From the first report to the next visible step.</h2><p className="mt-4 text-base leading-7 text-[#617994]">Jananiti turns a local issue into a shared, structured record without losing the human context behind it.</p></div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">{pathways.map((pathway, index) => <article key={pathway.title} className="group rounded-2xl border border-[#dde9f4] bg-white p-6 shadow-[0_8px_22px_rgba(22,67,108,.045)] transition-transform hover:-translate-y-1"><span className="grid h-11 w-11 place-items-center rounded-xl bg-[#ecf7f6] text-[#0d9388]"><pathway.icon className="h-5 w-5" /></span><p className="mt-5 text-xs font-black uppercase tracking-[.15em] text-[#7a91a8]">0{index + 1}</p><h3 className="mt-2 text-lg font-black text-[#23486f]">{pathway.title}</h3><p className="mt-2 text-sm leading-6 text-[#68809a]">{pathway.text}</p></article>)}</div>
        </section>
        <section className="border-y border-[#dce9f4] bg-[#f1f8ff] py-16"><div className="container grid gap-8 lg:grid-cols-[.8fr_1.2fr] lg:items-center"><div><p className="eyebrow">Participation at a glance</p><h2 className="mt-3 text-3xl font-black tracking-[-.045em] text-[#153359]">Records, not rhetoric.</h2><p className="mt-4 text-sm leading-7 text-[#617994]">These figures are calculated from public Jananiti items. They remain empty until community activity is published.</p></div><div className="grid grid-cols-2 gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-white p-5 shadow-sm"><p className="text-3xl font-black text-[#0e5bb7]">{stats?.total ?? 0}</p><p className="mt-1 text-xs font-bold text-[#667d98]">Public items</p></div><div className="rounded-2xl bg-white p-5 shadow-sm"><p className="text-3xl font-black text-[#0d9388]">{stats?.byStatus?.resolved ?? 0}</p><p className="mt-1 text-xs font-bold text-[#667d98]">Resolved items</p></div><div className="col-span-2 rounded-2xl bg-[#163d67] p-5 text-white sm:col-span-1"><p className="text-sm font-extrabold">Progress is a public good.</p><p className="mt-2 text-xs leading-5 text-[#b9d7ef]">Track updates and explore the activity map as records are shared.</p></div></div></div></section>
        <section className="container py-20"><div className="rounded-[28px] bg-[#0d496f] px-6 py-10 text-center text-white sm:px-12"><p className="text-xs font-black uppercase tracking-[.18em] text-[#a9dfdc]">Start with the issue you know best</p><h2 className="mx-auto mt-3 max-w-2xl text-3xl font-black tracking-[-.045em] sm:text-4xl">Turn a local concern into a record that can be followed.</h2><Link href="/report" className="mt-7 inline-flex h-11 items-center gap-2 rounded-xl bg-white px-5 text-sm font-extrabold text-[#0e5bb7] transition-transform hover:-translate-y-0.5 active:scale-[.97]">Report an issue <ArrowRight className="h-4 w-4" /></Link></div></section>
      </main>
      <CivicFooter />
    </div>
  );
}
