import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { Button } from "@/components/ui/button";
import { Bell, ChevronRight, Compass, House, Map, Menu, Plus, ShieldCheck, UserRound } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";

const navigation = [
  { label: "Explore activity", href: "/activity" },
  { label: "Heat map", href: "/heatmap" },
  { label: "Verify nearby", href: "/verify" },
  { label: "Track a request", href: "/track" },
  { label: "How it works", href: "/#how-it-works" },
];

export function JananitiMark({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="inline-flex items-center gap-3 shrink-0">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#0e5bb7] text-sm font-black text-white shadow-[0_8px_18px_rgba(14,91,183,0.22)]">J</span>
      {!compact && (
        <span className="leading-none">
          <span className="block text-[15px] font-extrabold tracking-[-0.04em] text-[#17365d]">Jana<span className="text-[#0d9388]">niti</span></span>
          <span className="mt-1 block text-[9px] font-bold uppercase tracking-[0.16em] text-[#7890ad]">People’s policy</span>
        </span>
      )}
    </Link>
  );
}

export default function CivicHeader() {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);
  const { user, loading, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-[#dce8f3]/80 bg-white/90 backdrop-blur-xl">
      <div className="container flex h-[72px] items-center justify-between gap-4">
        <JananitiMark />
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary navigation">
          {navigation.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${location === item.href ? "bg-[#eef6ff] text-[#0e5bb7]" : "text-[#546983] hover:bg-[#f4f8fb] hover:text-[#17365d]"}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-2 sm:flex">
          {!loading && user ? (
            <>
              <Link href="/me" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold text-[#345371] hover:bg-[#f3f7fb]">
                <Bell className="h-4 w-4" />
                My space
              </Link>
              {user.role === "admin" && (
                <Link href="/operations" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold text-[#0e5bb7] hover:bg-[#eef6ff]">
                  <ShieldCheck className="h-4 w-4" />
                  Operations
                </Link>
              )}
              <Button variant="outline" size="sm" onClick={logout} className="border-[#c9d9e9] bg-white text-[#345371]">Sign out</Button>
            </>
          ) : (
            <Button variant="ghost" onClick={() => startLogin()} className="font-bold text-[#345371]">Sign in</Button>
          )}
          <Link href="/report" className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg bg-[#0e5bb7] px-4 text-sm font-bold text-white shadow-[0_8px_18px_rgba(14,91,183,0.18)] transition-all hover:bg-[#0a4b98] active:scale-[0.97]">
            Report an issue <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        <button
          onClick={() => setOpen(value => !value)}
          className="grid h-10 w-10 place-items-center rounded-lg text-[#17365d] hover:bg-[#f3f7fb] sm:hidden"
          aria-label="Toggle navigation"
          aria-expanded={open}
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>
      {open && (
        <div className="border-t border-[#e5edf5] bg-white px-4 py-4 sm:hidden">
          <div className="mx-auto flex max-w-xl flex-col gap-1">
            {navigation.map(item => <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className="rounded-lg px-3 py-3 text-sm font-bold text-[#345371] hover:bg-[#f4f8fb]">{item.label}</Link>)}
            {user?.role === "admin" && <Link href="/operations" onClick={() => setOpen(false)} className="rounded-lg px-3 py-3 text-sm font-bold text-[#0e5bb7] hover:bg-[#eef6ff]">Coordinator operations</Link>}
            <Link href="/report" onClick={() => setOpen(false)} className="mt-2 rounded-lg bg-[#0e5bb7] px-3 py-3 text-center text-sm font-bold text-white">Report an issue</Link>
          </div>
        </div>
      )}
    </header>
  );
}

const mobileDestinations = [
  { label: "Home", href: "/", icon: House },
  { label: "Local", href: "/activity", icon: Compass },
  { label: "Report", href: "/report", icon: Plus },
  { label: "Map", href: "/heatmap", icon: Map },
  { label: "Me", href: "/me", icon: UserRound },
];

export function CivicMobileNav() {
  const [location] = useLocation();
  return <nav aria-label="Mobile civic navigation" className="fixed inset-x-0 bottom-0 z-50 border-t border-[#dce8f3] bg-white/95 px-2 pb-[max(.45rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-10px_28px_rgba(24,64,102,.1)] backdrop-blur-xl sm:hidden"><div className="mx-auto flex max-w-md items-end justify-between">{mobileDestinations.map(item => { const Icon = item.icon; const active = location === item.href; return <Link key={item.href} href={item.href} className={`flex min-w-[54px] flex-col items-center gap-1 rounded-xl px-2 py-1.5 text-[10px] font-extrabold ${active ? "text-[#086ccc]" : "text-[#7088a1]"}`}>{item.href === "/report" ? <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#086ccc] text-white shadow-[0_8px_18px_rgba(8,108,204,.26)]"><Icon className="h-5 w-5" /></span> : <Icon className={`h-5 w-5 ${active ? "fill-[#e8f3ff]" : ""}`} />}<span>{item.label}</span></Link>; })}</div></nav>;
}

export function CivicFooter() {
  return (
    <footer className="border-t border-[#dce8f3] bg-[#f6faff]">
      <div className="container flex flex-col gap-5 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div><JananitiMark /><p className="mt-3 max-w-md text-sm leading-6 text-[#667d98]">A civic participation framework designed to make local issues visible, trackable, and actionable.</p></div>
        <p className="text-xs font-medium text-[#7890ad]">Built around transparent records, human review, and respectful public participation.</p>
      </div>
    </footer>
  );
}
