import type { CivicStatus } from "../../../drizzle/schema";

const styles: Record<CivicStatus, string> = {
  submitted: "bg-[#edf5ff] text-[#2364a9] ring-[#cfe2f7]",
  acknowledged: "bg-[#f4f2ff] text-[#6649a4] ring-[#ddd5f4]",
  assigned: "bg-[#fff6e9] text-[#a86112] ring-[#f5dfbb]",
  in_progress: "bg-[#eaf8f5] text-[#08766d] ring-[#c4ebe4]",
  resolved: "bg-[#e8f6e8] text-[#337a38] ring-[#c8e8ca]",
  closed: "bg-[#eff2f4] text-[#5d6a78] ring-[#d9e0e6]",
};

export function statusLabel(status: CivicStatus) {
  return status.replace("_", " ").replace(/\b\w/g, value => value.toUpperCase());
}

export default function StatusPill({ status }: { status: CivicStatus }) {
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-extrabold capitalize ring-1 ring-inset ${styles[status]}`}>{statusLabel(status)}</span>;
}
