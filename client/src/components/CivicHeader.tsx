import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Bell, ChevronDown, Compass, House, MapPin, Menu, Plus, Search, UserRound } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";

const navigation = [
  { label: "For You", href: "/" }, { label: "Explore", href: "/explore" }, { label: "Action Center", href: "/notifications" },
  { label: "Locality map", href: "/heatmap" }, { label: "Verify nearby", href: "/verify" }, { label: "Track a request", href: "/track" },
];

export function JananitiMark({ compact = false }: { compact?: boolean }) {
  return <Link href="/" className="inline-flex shrink-0 items-center gap-2" aria-label="Jananiti home">
    <span className="relative grid h-10 w-10 place-items-center overflow-hidden rounded-2xl bg-gradient-to-br from-[#0b5fbf] via-[#0f57b7] to-[#0b957a] shadow-[0_7px_16px_rgba(14,91,183,.2)]"><span className="absolute -top-1 h-4 w-4 rounded-full border-2 border-white/80" /><span className="absolute bottom-1.5 left-2 h-5 w-2 rotate-[-30deg] rounded-full bg-white/90" /><span className="absolute bottom-1.5 right-2 h-5 w-2 rotate-[30deg] rounded-full bg-white/90" /><span className="relative pt-3 text-[10px] font-black text-white">J</span></span>
    {!compact && <span className="leading-none"><span className="block text-[26px] font-black tracking-[-.065em] text-[#0c48a0]">Jana<span className="text-[#088469]">Niti</span></span><span className="mt-1 block text-[9px] font-semibold tracking-[-.02em] text-[#3a4a61]">Your City. Your Voice. Real Change.</span></span>}
  </Link>;
}

function LocalityControl({ locality }: { locality?: string | null }) {
  return <Link href="/me" aria-label="Edit locality preference" className="inline-flex max-w-[116px] items-center gap-1 rounded-full bg-[#f4f6f8] px-2.5 py-2 text-xs font-black text-[#121722] hover:bg-[#eaf0f5]"><MapPin className="h-4 w-4 shrink-0" /><span className="truncate">{locality || "Set locality"}</span><ChevronDown className="h-3.5 w-3.5 shrink-0" /></Link>;
}

export default function CivicHeader() {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);
  const { user, loading, logout } = useAuth();
  const notifications = trpc.notifications.mine.useQuery(undefined, { enabled: Boolean(user) });
  const profile = trpc.profile.mine.useQuery(undefined, { enabled: Boolean(user) });
  const unread = notifications.data?.filter(item => !item.readAt).length ?? 0;
  return <header className="sticky top-0 z-50 border-b border-[#edf0f4] bg-white/95 backdrop-blur-xl">
    <div className="container flex h-[78px] items-center justify-between gap-2 sm:h-[82px]">
      <JananitiMark />
      <nav className="hidden items-center gap-1 2xl:flex" aria-label="Primary navigation">{navigation.map(item => <Link key={item.href} href={item.href} className={`rounded-xl px-3 py-2 text-sm font-bold ${location === item.href ? "bg-[#edf4ff] text-[#084ca6]" : "text-[#46566b] hover:bg-[#f5f7fa]"}`}>{item.label}</Link>)}</nav>
      <div className="ml-auto flex items-center gap-1.5 sm:gap-2"><LocalityControl locality={profile.data?.locality} /><Link href="/explore" aria-label="Search civic records" className="grid h-10 w-10 place-items-center rounded-full text-[#121722] hover:bg-[#f4f6f8]"><Search className="h-6 w-6" /></Link><Link href="/notifications" aria-label="Open Action Center" className="relative grid h-10 w-10 place-items-center rounded-full text-[#121722] hover:bg-[#f4f6f8]"><Bell className="h-6 w-6" />{unread > 0 && <span className="absolute right-0 top-0 grid min-h-5 min-w-5 place-items-center rounded-full border-2 border-white bg-[#ef3d38] px-1 text-[10px] font-black text-white">{Math.min(unread, 9)}</span>}</Link>{!loading && user ? <Link href="/me" aria-label="Open profile" className="hidden h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-[#d9e9ec] to-[#c2d8f4] text-xs font-black text-[#103c64] ring-2 ring-white sm:grid">{(user.name ?? "J").slice(0, 1).toUpperCase()}</Link> : <Link href="/signin" className="hidden rounded-xl px-3 py-2 text-sm font-bold text-[#30445d] sm:inline-flex">Sign in</Link>}<button type="button" onClick={() => setOpen(value => !value)} aria-label="Open navigation" aria-expanded={open} className="hidden h-10 w-10 place-items-center rounded-xl text-[#1f3146] hover:bg-[#f4f6f8] sm:grid 2xl:hidden"><Menu className="h-5 w-5" /></button></div>
    </div>
    {open && <div className="border-t border-[#edf0f4] bg-white p-4 2xl:hidden"><nav className="container flex max-w-xl flex-col gap-1" aria-label="Expanded navigation">{navigation.map(item => <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className="rounded-xl px-4 py-3 text-sm font-bold text-[#30455d] hover:bg-[#f4f7fa]">{item.label}</Link>)}{user?.role === "admin" && <Link href="/operations" onClick={() => setOpen(false)} className="rounded-xl px-4 py-3 text-sm font-bold text-[#0a57b7]">Coordinator operations</Link>}{user && <Button variant="outline" onClick={logout} className="mt-2 justify-start border-[#d8e2ea]">Sign out</Button>}<Link href="/report" onClick={() => setOpen(false)} className="mt-2 rounded-xl bg-[#0e5bb7] px-4 py-3 text-center text-sm font-black text-white">Report an issue</Link></nav></div>}
  </header>;
}

const mobileDestinations = [{ label: "Home", href: "/", icon: House }, { label: "Explore", href: "/explore", icon: Compass }, { label: "Report", href: "/report", icon: Plus }, { label: "Activity", href: "/notifications", icon: Bell }, { label: "Profile", href: "/me", icon: UserRound }];
export function CivicMobileNav() { const [location] = useLocation(); const { user } = useAuth(); const notifications = trpc.notifications.mine.useQuery(undefined, { enabled: Boolean(user) }); const unread = notifications.data?.filter(item => !item.readAt).length ?? 0; return <nav aria-label="Mobile civic navigation" className="fixed inset-x-0 bottom-0 z-50 bg-transparent px-2 pb-[max(.5rem,env(safe-area-inset-bottom))] sm:hidden"><div className="mx-auto flex max-w-md items-end justify-between rounded-[27px] border border-white/80 bg-white/95 px-2 pt-2 shadow-[0_-7px_28px_rgba(20,43,70,.12)] backdrop-blur-xl">{mobileDestinations.map(item => { const Icon = item.icon; const active = location === item.href; const report = item.href === "/report"; const activity = item.href === "/notifications"; return <Link key={item.href} href={item.href} className={`relative flex min-w-[55px] flex-col items-center gap-1 rounded-2xl px-2 pb-2 pt-1 text-[11px] font-bold ${active ? "text-[#084fb4]" : "text-[#4e5562]"}`}>{report ? <span className="-mt-7 grid h-[58px] w-[58px] place-items-center rounded-full border-[6px] border-[#edf2fe] bg-[#084fb4] text-white shadow-[0_8px_18px_rgba(8,79,180,.32)]"><Icon className="h-7 w-7" /></span> : <span className="relative grid h-7 place-items-center"><Icon className={`h-6 w-6 ${active ? "stroke-[2.7]" : ""}`} />{activity && unread > 0 && <span className="absolute -right-3 -top-2 grid h-4 min-w-4 place-items-center rounded-full border border-white bg-[#ef3d38] px-0.5 text-[9px] font-black text-white">{Math.min(unread, 9)}</span>}</span>}<span>{item.label}</span></Link>; })}</div></nav>; }
export function CivicFooter() { return <footer className="hidden border-t border-[#e4ebf1] bg-[#f7fbfe] sm:block"><div className="container flex items-center justify-between gap-5 py-10"><JananitiMark /><p className="text-xs font-medium text-[#7890ad]">Transparent records, respectful participation, and human-reviewed civic decisions.</p></div></footer>; }
