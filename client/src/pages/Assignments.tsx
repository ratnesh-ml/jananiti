import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { ClipboardCheck, LockKeyhole } from "lucide-react";
import { useState } from "react";

export default function Assignments() {
  const { user, loading } = useAuth();
  const queue = trpc.operations.queue.useQuery(undefined, { enabled: user?.role === "admin" });
  const utils = trpc.useUtils();
  const [selected, setSelected] = useState(""); const [message, setMessage] = useState("I have taken ownership of this request and will post the next verified update.");
  const assign = trpc.operations.assign.useMutation({ onSuccess: () => { utils.operations.queue.invalidate(); setSelected(""); } });
  if (!loading && user?.role !== "admin") return <DashboardLayout><div className="grid min-h-[70vh] place-items-center text-center"><div><LockKeyhole className="mx-auto h-8 w-8 text-[#0e5bb7]" /><h1 className="mt-4 text-xl font-black text-[#17365d]">Administrator access required</h1></div></div></DashboardLayout>;
  return <DashboardLayout><div className="mx-auto max-w-3xl py-3"><p className="eyebrow">Coordinator routing</p><h1 className="mt-2 text-3xl font-black tracking-[-.05em] text-[#17365d]">Assign a civic record</h1><p className="mt-3 text-sm leading-6 text-[#6a829b]">Claiming an item assigns it to your coordinator account, moves it into the assigned lifecycle state, and sends a citizen notification.</p><section className="mt-7 rounded-2xl border border-[#dce8f3] bg-white p-6"><label className="text-sm font-bold text-[#315474]">Civic record<select value={selected} onChange={event => setSelected(event.target.value)} className="mt-2 h-11 w-full rounded-lg border border-[#cedeed] bg-[#fbfdff] px-3 text-sm"><option value="">Select an item</option>{queue.data?.map(item => <option key={item.publicId} value={item.publicId}>{item.publicId} · {item.title}</option>)}</select></label><label className="mt-5 block text-sm font-bold text-[#315474]">Citizen-facing assignment note<Textarea value={message} onChange={event => setMessage(event.target.value)} className="mt-2 min-h-28 border-[#cedeed]" /></label><div className="mt-5 flex items-center gap-3"><Button disabled={!selected || message.trim().length < 8 || assign.isPending || !user} onClick={() => user && assign.mutate({ publicId: selected, coordinatorId: user.id, message })} className="bg-[#0e5bb7] font-extrabold"><ClipboardCheck className="mr-2 h-4 w-4" />{assign.isPending ? "Assigning…" : "Assign to me"}</Button>{assign.data && <p className="text-sm font-bold text-[#087b72]">Assignment recorded and citizen notified.</p>}{assign.error && <p className="text-sm font-bold text-[#b1412d]">{assign.error.message}</p>}</div></section></div></DashboardLayout>;
}
