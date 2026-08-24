import CivicHeader from "@/components/CivicHeader";
import { Bell, CheckCircle2, Compass, MapPinned, ShieldCheck, UsersRound } from "lucide-react";
import { Link } from "wouter";

const steps = [["Report", "Share what you see", "✎"], ["Community validates", "Residents confirm", "◉"], ["Priority review", "Evidence is reviewed", "↗"], ["Authority acts", "Work is assigned", "⌂"], ["Resolved", "Work is completed", "✓"], ["Community verifies", "Citizens can respond", "◌"]] as const;
const actions = [["Report issue", "Capture and share instantly", "#0d9a73"], ["Explore map", "See issues near you", "#e9a617"], ["My Activity", "Track your contributions", "#7751d7"], ["Profile", "Set locality preferences", "#1763d6"]] as const;

function ActionIcon({ title }: { title: string }) {
  if (title === "Report issue") return <MapPinned className="h-5 w-5" />;
  if (title === "Explore map") return <Compass className="h-5 w-5" />;
  if (title === "My Activity") return <Bell className="h-5 w-5" />;
  return <UsersRound className="h-5 w-5" />;
}

export default function Onboarding() {
  return <div className="min-h-screen bg-[#f7f8fa]">
    <CivicHeader />
    <main className="mx-auto max-w-xl space-y-5 px-4 pb-12 pt-5">
      <section className="overflow-hidden rounded-[24px] bg-[linear-gradient(112deg,#eef6ff,#edf9f3)] p-5">
        <h1 className="text-2xl font-black tracking-[-.04em] text-[#172338]">Welcome to JanaNiti</h1>
        <p className="mt-2 max-w-sm text-[16px] leading-6 text-[#32465b]">A community-powered place to report, verify, and follow local civic issues.</p>
        <div className="mt-8 flex items-end justify-between"><span className="text-3xl">🌿</span><div className="h-16 w-2/3 rounded-tl-[100%] bg-[linear-gradient(120deg,#d2ecdf,#9bd4bb)] opacity-70" /></div>
      </section>
      <section className="rounded-[24px] bg-white p-5 shadow-sm"><h2 className="text-xl font-black text-[#172338]">How JanaNiti works</h2><div className="mt-5 grid grid-cols-3 gap-y-6">{steps.map(([title, body, symbol], index) => <div key={title} className="px-1 text-center"><span className="mx-auto grid h-11 w-11 place-items-center rounded-2xl bg-[#f0f5ff] text-lg font-black text-[#0c5ab5]">{symbol}</span><p className="mt-2 text-xs font-black text-[#263646]">{index + 1}. {title}</p><p className="mt-1 text-[10px] leading-4 text-[#718095]">{body}</p></div>)}</div></section>
      <section className="rounded-[24px] bg-white p-5 shadow-sm"><h2 className="text-xl font-black text-[#172338]">What you can do after sign-in</h2><div className="mt-4 grid grid-cols-2 divide-x divide-y divide-[#edf0f3] overflow-hidden rounded-2xl border border-[#edf0f3]">{actions.map(([title, body, color]) => <Link key={title} href="/signin" className="p-4"><span className="grid h-10 w-10 place-items-center rounded-2xl text-white" style={{ backgroundColor: color }}><ActionIcon title={title} /></span><p className="mt-3 text-sm font-black text-[#1c2938]">{title}</p><p className="mt-1 text-xs leading-5 text-[#748195]">{body}</p></Link>)}</div></section>
      <section className="rounded-[24px] bg-white p-5 shadow-sm"><h2 className="text-xl font-black text-[#172338]">Why it matters</h2><div className="mt-4 grid grid-cols-2 gap-3"><div className="rounded-2xl bg-[#eff9f4] p-4"><UsersRound className="h-6 w-6 text-[#0b8a68]" /><p className="mt-2 text-sm font-black">Stronger communities</p><p className="mt-1 text-xs leading-5 text-[#637c73]">Make issues visible without exposing residents.</p></div><div className="rounded-2xl bg-[#eef4ff] p-4"><ShieldCheck className="h-6 w-6 text-[#0859ba]" /><p className="mt-2 text-sm font-black">Accountable governance</p><p className="mt-1 text-xs leading-5 text-[#647898]">Track public status and human review.</p></div></div></section>
      <Link href="/signin" className="flex items-center justify-center gap-2 rounded-2xl bg-[#0d5ebc] p-4 text-sm font-black text-white"><CheckCircle2 className="h-5 w-5" />Continue to secure sign-in</Link>
    </main>
  </div>;
}
