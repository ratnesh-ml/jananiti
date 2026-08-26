import { Bell, CircleUserRound, Compass, House, Plus, type LucideIcon } from "lucide-react";

export type CivicWorkspaceScreen = "home" | "explore" | "report" | "activity" | "profile";

const entries: Array<{ key: CivicWorkspaceScreen; label: string; icon: LucideIcon }> = [
  { key: "home", label: "Home", icon: House },
  { key: "explore", label: "Explore", icon: Compass },
  { key: "report", label: "Report", icon: Plus },
  { key: "activity", label: "Activity", icon: Bell },
  { key: "profile", label: "Profile", icon: CircleUserRound },
];

export default function CivicWorkspaceNav({ active, onSelect }: { active: CivicWorkspaceScreen; onSelect: (screen: CivicWorkspaceScreen) => void }) {
  return <nav aria-label="Civic workspace navigation" className="sticky bottom-3 z-30 mt-5 rounded-[24px] border border-[#e1e6eb] bg-white/95 p-2 shadow-[0_12px_30px_rgba(10,19,23,.14)] backdrop-blur sm:bottom-5"><div className="grid grid-cols-5 gap-1">{entries.map(({ key, label, icon: Icon }) => <button key={key} onClick={() => onSelect(key)} aria-current={active === key ? "page" : undefined} className={`relative flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl text-[10px] font-bold transition ${active === key ? "bg-[#eaf4ff] text-[#0064e0]" : "text-[#5d6c7b] hover:bg-[#f4f7fa]"}`}>{key === "report" ? <span className="-mt-7 grid h-12 w-12 place-items-center rounded-full bg-[#0064e0] text-white shadow-[0_7px_18px_rgba(0,100,224,.28)]"><Icon className="h-6 w-6" /></span> : <Icon className="h-5 w-5" />}{label}</button>)}</div></nav>;
}
