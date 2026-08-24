import { useAuth } from "@/_core/hooks/useAuth";
import CivicHeader, { CivicFooter } from "@/components/CivicHeader";
import { LocationPicker } from "@/components/CivicMap";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { startLogin } from "@/const";
import { trpc } from "@/lib/trpc";
import { CheckCircle2, CircleAlert, FileText, MapPin, Paperclip, ShieldCheck } from "lucide-react";
import { FormEvent, useState } from "react";
import { Link } from "wouter";

const categories = [
  ["roads", "Roads & public paths"], ["water", "Water supply"], ["sanitation", "Sanitation & waste"], ["electricity", "Electricity & lighting"], ["health", "Health services"], ["education", "Education"], ["safety", "Public safety"], ["environment", "Environment"], ["other", "Other civic concern"],
] as const;

export default function SubmitIssue() {
  const { user, loading } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<(typeof categories)[number][0]>("roads");
  const [locationLabel, setLocationLabel] = useState("");
  const [visibility, setVisibility] = useState<"public" | "private">("public");
  const [point, setPoint] = useState<{ latitude: number; longitude: number } | null>(null);
  const [manualLatitude, setManualLatitude] = useState("");
  const [manualLongitude, setManualLongitude] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<string | null>(null);
  const create = trpc.civicItems.create.useMutation({
    onSuccess: async result => {
      if (!attachment) { setSubmitted(result.publicId); return; }
      try {
        setUploadError(null);
        const response = await fetch(`/api/civic-items/${result.publicId}/attachments`, {
          method: "POST",
          headers: { "Content-Type": attachment.type, "x-file-name": encodeURIComponent(attachment.name) },
          body: attachment,
        });
        if (!response.ok) {
          const payload = await response.json().catch(() => null);
          throw new Error(payload?.message ?? "The supporting file could not be uploaded.");
        }
        setSubmitted(result.publicId);
      } catch (error) {
        setUploadError(error instanceof Error ? error.message : "The supporting file could not be uploaded.");
      }
    },
  });

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!user) { startLogin(); return; }
    const latitude = point?.latitude ?? (manualLatitude.trim() ? Number(manualLatitude) : null);
    const longitude = point?.longitude ?? (manualLongitude.trim() ? Number(manualLongitude) : null);
    if ((latitude !== null && !Number.isFinite(latitude)) || (longitude !== null && !Number.isFinite(longitude))) { setUploadError("Coordinates must be valid decimal values."); return; }
    create.mutate({ title, description, category, locationLabel, visibility, latitude, longitude });
  };

  if (submitted) {
    return <div className="min-h-screen bg-[#fbfdff]"><CivicHeader /><main className="container py-16 sm:py-24"><div className="mx-auto max-w-xl rounded-[28px] border border-[#cfe8dd] bg-white p-8 text-center shadow-[0_18px_50px_rgba(30,100,74,.12)]"><span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#e9f7ef] text-[#218148]"><CheckCircle2 className="h-7 w-7" /></span><p className="mt-6 text-xs font-black uppercase tracking-[.17em] text-[#218148]">Request received</p><h1 className="mt-2 text-3xl font-black tracking-[-.05em] text-[#17365d]">Your local concern is now on record.</h1><p className="mt-4 text-sm leading-6 text-[#68809a]">Keep your request reference for future tracking. We will create an in-app notification whenever its status or assignment changes.</p><div className="mx-auto mt-6 rounded-xl bg-[#f1f8ff] px-4 py-3 text-lg font-black tracking-[.08em] text-[#0e5bb7]">{submitted}</div><div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center"><Link href={`/track?ref=${submitted}`} className="inline-flex h-11 items-center justify-center rounded-xl bg-[#0e5bb7] px-5 text-sm font-extrabold text-white">Track this request</Link><Link href="/activity" className="inline-flex h-11 items-center justify-center rounded-xl border border-[#cbdced] px-5 text-sm font-extrabold text-[#365674]">Explore public activity</Link></div></div></main><CivicFooter /></div>;
  }

  return (
    <div className="min-h-screen bg-[#fbfdff]"><CivicHeader /><main className="container py-10 sm:py-14"><div className="mx-auto max-w-4xl"><div className="max-w-2xl"><p className="eyebrow">New civic request</p><h1 className="mt-3 text-3xl font-black tracking-[-.05em] text-[#153359] sm:text-4xl">Tell us what needs attention.</h1><p className="mt-4 text-base leading-7 text-[#617994]">A clear description and an approximate location help coordinators understand the issue. You can follow every status change from your personal Jananiti space.</p></div>{!loading && !user && <div className="mt-7 flex gap-3 rounded-2xl border border-[#cddff0] bg-[#f0f7ff] p-4"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#0e5bb7]" /><p className="text-sm leading-6 text-[#466784]">You will be asked to sign in before submitting, so your request can have a private follow-up record. <button onClick={() => startLogin()} className="font-extrabold text-[#0e5bb7] underline-offset-4 hover:underline">Sign in now</button>.</p></div>}
    <form onSubmit={submit} className="mt-8 grid gap-6 lg:grid-cols-[1fr_.82fr]"><section className="rounded-[24px] border border-[#dce8f3] bg-white p-5 shadow-[0_10px_30px_rgba(32,76,117,.05)] sm:p-7"><div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-xl bg-[#edf5ff] text-[#0e5bb7]"><FileText className="h-4 w-4" /></span><div><h2 className="font-black text-[#23486f]">Describe the concern</h2><p className="text-xs text-[#7890ad]">Share what people need to understand first.</p></div></div><div className="mt-6 space-y-5"><div className="space-y-2"><Label htmlFor="issue-title" className="text-sm font-bold text-[#365674]">Short title</Label><Input id="issue-title" required minLength={8} maxLength={160} value={title} onChange={event => setTitle(event.target.value)} placeholder="For example: Streetlight has been out for several nights" className="h-11 border-[#cbdceb] bg-[#fbfdff]" /></div><div className="space-y-2"><Label htmlFor="issue-category" className="text-sm font-bold text-[#365674]">Category</Label><select id="issue-category" value={category} onChange={event => setCategory(event.target.value as typeof category)} className="flex h-11 w-full rounded-md border border-[#cbdceb] bg-[#fbfdff] px-3 text-sm text-[#25496f] outline-none focus:ring-2 focus:ring-[#0e5bb7]/20">{categories.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div><div className="space-y-2"><Label htmlFor="issue-description" className="text-sm font-bold text-[#365674]">What is happening?</Label><Textarea id="issue-description" required minLength={20} maxLength={3000} value={description} onChange={event => setDescription(event.target.value)} placeholder="Include the impact, how long it has been happening, and any safe landmark that can help the right team find the location." className="min-h-36 border-[#cbdceb] bg-[#fbfdff] leading-6" /><p className="text-right text-xs font-medium text-[#8196ac]">{description.length}/3000</p></div><div className="space-y-2"><Label htmlFor="issue-attachment" className="text-sm font-bold text-[#365674]">Supporting evidence <span className="font-medium text-[#8096ab]">(optional)</span></Label><label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-dashed border-[#bcd3e7] bg-[#f8fbfe] px-4 py-3 transition-colors hover:border-[#0e5bb7]" htmlFor="issue-attachment"><span className="flex items-center gap-3"><Paperclip className="h-4 w-4 text-[#0e5bb7]" /><span><span className="block text-sm font-bold text-[#365674]">{attachment ? attachment.name : "Add a photo, voice note, PDF, or text file"}</span><span className="mt-0.5 block text-xs text-[#7890ad]">Maximum 10 MB. Media analysis is added only after coordinator review.</span></span></span><span className="rounded-lg bg-white px-3 py-1.5 text-xs font-extrabold text-[#0e5bb7] shadow-sm">Browse</span></label><input id="issue-attachment" type="file" accept="image/*,audio/*,application/pdf,text/plain" className="sr-only" onChange={event => { const file = event.target.files?.[0] ?? null; if (file && file.size > 10 * 1024 * 1024) { setAttachment(null); setUploadError("Attachments must be 10 MB or smaller."); } else { setAttachment(file); setUploadError(null); } }} /></div></div></section>
    <section className="space-y-6"><div className="rounded-[24px] border border-[#dce8f3] bg-white p-5 shadow-[0_10px_30px_rgba(32,76,117,.05)] sm:p-6"><div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-xl bg-[#ecf8f6] text-[#0d9388]"><MapPin className="h-4 w-4" /></span><div><h2 className="font-black text-[#23486f]">Add the location</h2><p className="text-xs text-[#7890ad]">Use a landmark, then a map pin or manual coordinates.</p></div></div><div className="mt-5 space-y-4"><div className="space-y-2"><Label htmlFor="location-label" className="text-sm font-bold text-[#365674]">Location or landmark</Label><Input id="location-label" required minLength={3} maxLength={240} value={locationLabel} onChange={event => setLocationLabel(event.target.value)} placeholder="For example: Near the community library entrance" className="h-11 border-[#cbdceb] bg-[#fbfdff]" /></div><LocationPicker value={point} onChange={setPoint} /><div className="grid grid-cols-2 gap-3"><div><Label className="text-xs font-bold text-[#5b7490]">Latitude fallback</Label><Input type="number" step="any" min="-90" max="90" value={manualLatitude} onChange={event => setManualLatitude(event.target.value)} placeholder="e.g. 22.7196" className="mt-1 h-10 border-[#d4e1ed]" /></div><div><Label className="text-xs font-bold text-[#5b7490]">Longitude fallback</Label><Input type="number" step="any" min="-180" max="180" value={manualLongitude} onChange={event => setManualLongitude(event.target.value)} placeholder="e.g. 75.8577" className="mt-1 h-10 border-[#d4e1ed]" /></div></div></div></div><div className="rounded-[24px] border border-[#dce8f3] bg-white p-5 shadow-[0_10px_30px_rgba(32,76,117,.05)]"><h2 className="font-black text-[#23486f]">Choose public visibility</h2><p className="mt-1 text-xs leading-5 text-[#7890ad]">Your identity stays private in either case. Public items can appear in a generalized community activity view.</p><div className="mt-4 grid gap-2"><label className={`flex cursor-pointer gap-3 rounded-xl border p-3 ${visibility === "public" ? "border-[#8ccdc6] bg-[#f0fbfa]" : "border-[#dce8f3]"}`}><input type="radio" checked={visibility === "public"} onChange={() => setVisibility("public")} className="mt-1 accent-[#0d9388]" /><span><span className="block text-sm font-extrabold text-[#315474]">Show as public community activity</span><span className="mt-0.5 block text-xs leading-5 text-[#7188a1]">Share the issue and status, not your personal identity.</span></span></label><label className={`flex cursor-pointer gap-3 rounded-xl border p-3 ${visibility === "private" ? "border-[#8ccdc6] bg-[#f0fbfa]" : "border-[#dce8f3]"}`}><input type="radio" checked={visibility === "private"} onChange={() => setVisibility("private")} className="mt-1 accent-[#0d9388]" /><span><span className="block text-sm font-extrabold text-[#315474]">Keep this request private</span><span className="mt-0.5 block text-xs leading-5 text-[#7188a1]">Only you and authorized coordinators can see the details.</span></span></label></div><Button type="submit" disabled={create.isPending} className="mt-5 h-11 w-full bg-[#0e5bb7] font-extrabold text-white hover:bg-[#0a4b98]">{create.isPending ? "Submitting…" : user ? "Submit civic request" : "Sign in and submit"}</Button>{(create.error || uploadError) && <p className="mt-3 flex gap-2 text-xs font-semibold text-[#b1412d]"><CircleAlert className="h-4 w-4" />{create.error?.message ?? uploadError}</p>}</div></section></form></div></main><CivicFooter /></div>
  );
}
