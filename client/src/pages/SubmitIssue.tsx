import { useAuth } from "@/_core/hooks/useAuth";
import CivicHeader, { CivicFooter } from "@/components/CivicHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { startLogin } from "@/const";
import { trpc } from "@/lib/trpc";
import { CheckCircle2, CircleAlert, FileAudio, FileText, ImagePlus, LocateFixed, MapPin, Mic, Navigation, RotateCcw, ShieldCheck, Trash2, UploadCloud, Video } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link } from "wouter";

const categories = [["roads", "Roads"], ["water", "Water"], ["sanitation", "Cleanliness"], ["electricity", "Lighting"], ["safety", "Safety"], ["environment", "Environment"], ["other", "Other"]] as const;
const DRAFT_KEY = "jananiti.report.draft.v1";
type Category = (typeof categories)[number][0];
type LocationMode = "auto" | "manual";
type UploadState = "idle" | "uploading" | "failed";

type ReportDraft = {
  title: string;
  description: string;
  category: Category;
  locationLabel: string;
  locationMode: LocationMode;
  latitude: string;
  longitude: string;
  visibility: "public" | "private";
};

function attachmentKind(file: File | null) {
  if (!file) return "";
  if (file.type.startsWith("video/")) return "Short video";
  if (file.type.startsWith("audio/")) return "Voice note";
  if (file.type.startsWith("image/")) return "Photo";
  return "Document";
}

function civicContentType(file: File | null): "text" | "voice" | "image" | "mixed" {
  if (!file) return "text";
  if (file.type.startsWith("audio/")) return "voice";
  if (file.type.startsWith("image/")) return "image";
  return "mixed";
}

export default function SubmitIssue() {
  const { user, loading } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<Category>("roads");
  const [locationLabel, setLocationLabel] = useState("");
  const [locationMode, setLocationMode] = useState<LocationMode>("auto");
  const [point, setPoint] = useState<{ latitude: number; longitude: number } | null>(null);
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [visibility, setVisibility] = useState<"public" | "private">("public");
  const [attachment, setAttachment] = useState<File | null>(null);
  const [attachmentPreview, setAttachmentPreview] = useState<string | null>(null);
  const [locationError, setLocationError] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [createdPublicId, setCreatedPublicId] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [hasSavedDraft, setHasSavedDraft] = useState(false);
  const attachmentLabel = useMemo(() => attachmentKind(attachment), [attachment]);
  const create = trpc.civicItems.create.useMutation();

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(DRAFT_KEY);
      if (saved) {
        const draft = JSON.parse(saved) as Partial<ReportDraft>;
        setTitle(draft.title ?? "");
        setDescription(draft.description ?? "");
        setCategory(draft.category ?? "roads");
        setLocationLabel(draft.locationLabel ?? "");
        setLocationMode(draft.locationMode ?? "auto");
        setLatitude(draft.latitude ?? "");
        setLongitude(draft.longitude ?? "");
        setVisibility(draft.visibility ?? "public");
        setHasSavedDraft(Boolean(draft.title || draft.description || draft.locationLabel));
      }
    } catch {
      window.localStorage.removeItem(DRAFT_KEY);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated || submitted) return;
    const draft: ReportDraft = { title, description, category, locationLabel, locationMode, latitude, longitude, visibility };
    const hasContent = Boolean(title || description || locationLabel || latitude || longitude);
    if (hasContent) {
      window.localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
      setHasSavedDraft(true);
    }
  }, [category, description, hydrated, latitude, locationLabel, locationMode, longitude, submitted, title, visibility]);

  useEffect(() => {
    if (!attachment || !/^(image|audio|video)\//.test(attachment.type)) {
      setAttachmentPreview(null);
      return;
    }
    const url = URL.createObjectURL(attachment);
    setAttachmentPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [attachment]);

  const clearDraft = () => {
    window.localStorage.removeItem(DRAFT_KEY);
    setHasSavedDraft(false);
  };

  const useCurrentLocation = () => {
    setLocationError("");
    if (!navigator.geolocation) return setLocationError("This browser cannot provide automatic location. Use manual location instead.");
    navigator.geolocation.getCurrentPosition(
      position => {
        const next = { latitude: position.coords.latitude, longitude: position.coords.longitude };
        setPoint(next);
        setLatitude(next.latitude.toFixed(6));
        setLongitude(next.longitude.toFixed(6));
        setLocationLabel(`Current location · ${next.latitude.toFixed(5)}, ${next.longitude.toFixed(5)}`);
      },
      () => setLocationError("Location permission was not granted. You can enter a landmark or coordinates manually."),
      { enableHighAccuracy: false, timeout: 10000 },
    );
  };

  const uploadEvidence = (publicId: string, file: File) => new Promise<void>((resolve, reject) => {
    setUploadState("uploading");
    setUploadProgress(0);
    const request = new XMLHttpRequest();
    request.open("POST", `/api/civic-items/${publicId}/attachments`);
    request.setRequestHeader("Content-Type", file.type || "application/octet-stream");
    request.setRequestHeader("x-file-name", encodeURIComponent(file.name));
    request.upload.onprogress = event => {
      if (event.lengthComputable) setUploadProgress(Math.round((event.loaded / event.total) * 100));
    };
    request.onerror = () => reject(new Error("Evidence upload could not be completed. Check your connection and retry."));
    request.onload = () => {
      if (request.status >= 200 && request.status < 300) return resolve();
      try {
        const response = JSON.parse(request.responseText) as { message?: string };
        reject(new Error(response.message ?? "Evidence upload could not be completed."));
      } catch {
        reject(new Error("Evidence upload could not be completed."));
      }
    };
    request.send(file);
  });

  const completeUpload = async (publicId: string, file: File) => {
    try {
      await uploadEvidence(publicId, file);
      setUploadState("idle");
      setUploadProgress(100);
      clearDraft();
      setSubmitted(publicId);
    } catch (error) {
      setUploadState("failed");
      setUploadError(error instanceof Error ? error.message : "Evidence upload could not be completed.");
    }
  };

  const selectAttachment = (file: File | null) => {
    if (file && file.size > 10 * 1024 * 1024) {
      setAttachment(null);
      setUploadError("Choose a file no larger than 10 MB.");
      return;
    }
    setAttachment(file);
    setUploadError("");
    setUploadState("idle");
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setUploadError("");
    if (!user) return startLogin();
    const lat = point?.latitude ?? (latitude ? Number(latitude) : null);
    const lng = point?.longitude ?? (longitude ? Number(longitude) : null);
    if (!locationLabel.trim()) return setUploadError("Add a locality, landmark, or automatic location before publishing.");
    if ((lat !== null && !Number.isFinite(lat)) || (lng !== null && !Number.isFinite(lng))) return setUploadError("Use valid decimal coordinates.");
    try {
      const result = await create.mutateAsync({ title, description, category, locationLabel, visibility, latitude: lat, longitude: lng, contentType: civicContentType(attachment) });
      setCreatedPublicId(result.publicId);
      if (attachment) await completeUpload(result.publicId, attachment);
      else {
        clearDraft();
        setSubmitted(result.publicId);
      }
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "The civic update could not be published.");
    }
  };

  if (submitted) return <div className="min-h-screen bg-[#f6f8fb]"><CivicHeader /><main className="container py-20"><div className="mx-auto max-w-lg rounded-[32px] bg-white p-9 text-center shadow-[0_20px_60px_rgba(22,59,97,.12)]"><CheckCircle2 className="mx-auto h-14 w-14 text-[#0d9388]" /><p className="mt-5 text-xs font-black uppercase tracking-[.16em] text-[#0d9388]">Published to the civic record</p><h1 className="mt-2 text-3xl font-black tracking-[-.05em] text-[#17365d]">Your update has a clear path forward.</h1><p className="mt-4 text-sm leading-6 text-[#6b829b]">Your identity remains private. Follow the progress and community context from your personal record.</p><p className="mt-6 rounded-2xl bg-[#eef6ff] py-3 font-black tracking-[.12em] text-[#0e5bb7]">{submitted}</p><div className="mt-7 grid gap-3 sm:grid-cols-2"><Link href={`/track?ref=${submitted}`} className="rounded-xl bg-[#0e5bb7] px-4 py-3 text-sm font-extrabold text-white">Track update</Link><Link href="/activity" className="rounded-xl border border-[#cbdced] px-4 py-3 text-sm font-extrabold text-[#315474]">See local feed</Link></div></div></main><CivicFooter /></div>;

  return <div className="min-h-screen bg-[#f6f8fb]"><CivicHeader /><main className="container py-8 sm:py-12"><div className="mx-auto max-w-3xl"><div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="eyebrow">Create local update</p><h1 className="mt-2 text-3xl font-black tracking-[-.055em] text-[#17365d] sm:text-4xl">What needs attention near you?</h1><p className="mt-2 max-w-xl text-sm leading-6 text-[#68809a]">Start with a short note. Add supporting media or a location only when it helps people act.</p></div><Link href="/activity" className="text-sm font-extrabold text-[#0e5bb7]">Back to local feed</Link></div>{!loading && !user && <button type="button" onClick={startLogin} className="mt-6 flex w-full items-center gap-3 rounded-2xl border border-[#cfe0ee] bg-white p-4 text-left text-sm text-[#466784]"><ShieldCheck className="h-5 w-5 shrink-0 text-[#0d9388]" /><span><b>Sign in to publish.</b> Your post will be linked to a private status record.</span></button>}{hasSavedDraft && <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#cfe6e1] bg-[#effaf8] px-4 py-3 text-sm text-[#315f5b]"><span className="flex items-center gap-2"><RotateCcw className="h-4 w-4 text-[#0d9388]" /><b>Local-only draft saved.</b> Evidence files are never stored in the browser draft.</span><button type="button" onClick={clearDraft} className="text-xs font-extrabold text-[#087b72] hover:underline">Clear saved copy</button></div>}<form onSubmit={submit} className="mt-7 space-y-5"><section className="rounded-[28px] bg-white p-5 shadow-[0_12px_40px_rgba(28,74,116,.08)] sm:p-7"><div className="flex flex-wrap gap-2">{categories.map(([value, label]) => <button type="button" key={value} onClick={() => setCategory(value)} className={`rounded-full px-4 py-2 text-xs font-extrabold transition ${category === value ? "bg-[#173f6b] text-white" : "bg-[#f0f5f9] text-[#5e7894] hover:bg-[#e4eef7]"}`}>{label}</button>)}</div><Input required minLength={8} maxLength={160} value={title} onChange={event => setTitle(event.target.value)} placeholder="Give this issue a simple title" className="mt-6 h-12 border-0 border-b border-[#dce8f3] px-0 text-xl font-black shadow-none focus-visible:ring-0" /><Textarea required minLength={20} maxLength={3000} value={description} onChange={event => setDescription(event.target.value)} placeholder="What is happening? Mention impact, timing, and a helpful landmark." className="mt-4 min-h-32 resize-none border-0 bg-transparent px-0 text-base leading-7 shadow-none focus-visible:ring-0" /><div className="mt-4 flex items-center justify-between border-t border-[#edf2f6] pt-4"><label className="flex cursor-pointer items-center gap-2 text-sm font-extrabold text-[#315474]"><span className="grid h-9 w-9 place-items-center rounded-xl bg-[#eef6ff] text-[#0e5bb7]">{attachment?.type.startsWith("video/") ? <Video className="h-4 w-4" /> : attachment?.type.startsWith("audio/") ? <Mic className="h-4 w-4" /> : attachment?.type.startsWith("image/") ? <ImagePlus className="h-4 w-4" /> : <FileText className="h-4 w-4" />}</span>{attachment ? `${attachmentLabel}: ${attachment.name}` : "Add photo, voice, video, or file"}<input type="file" accept="image/*,audio/*,video/*,application/pdf,text/plain" className="sr-only" onChange={event => selectAttachment(event.target.files?.[0] ?? null)} /></label><span className="text-xs text-[#8096ab]">10 MB max</span></div>{attachment && <div className="mt-4 overflow-hidden rounded-2xl border border-[#e0e9f2] bg-[#f8fbfe] p-3"><div className="flex items-center justify-between gap-3"><div className="min-w-0"><p className="truncate text-sm font-black text-[#315474]">{attachment.name}</p><p className="mt-1 text-xs text-[#7890ad]">{attachmentLabel} · {(attachment.size / 1024 / 1024).toFixed(1)} MB</p></div><button type="button" onClick={() => selectAttachment(null)} className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2 text-xs font-extrabold text-[#a84936] hover:bg-[#fff0eb]"><Trash2 className="h-3.5 w-3.5" />Remove</button></div>{attachment.type.startsWith("image/") && attachmentPreview && <img src={attachmentPreview} alt="Selected evidence preview" className="mt-3 max-h-64 w-full rounded-xl object-cover" />}{attachment.type.startsWith("video/") && attachmentPreview && <video src={attachmentPreview} controls className="mt-3 max-h-64 w-full rounded-xl bg-slate-950" />}{attachment.type.startsWith("audio/") && attachmentPreview && <div className="mt-3 flex items-center gap-3 rounded-xl bg-white p-3"><FileAudio className="h-5 w-5 text-[#0e5bb7]" /><audio controls src={attachmentPreview} className="h-8 w-full" /></div>}{!attachmentPreview && <div className="mt-3 flex items-center gap-2 rounded-xl bg-white p-3 text-xs text-[#687f96]"><FileText className="h-4 w-4 text-[#0e5bb7]" />Document evidence will be attached to the civic record after publishing.</div>}</div>}</section><section className="rounded-[28px] bg-white p-5 shadow-[0_12px_40px_rgba(28,74,116,.08)] sm:p-7"><div className="flex items-center justify-between"><div><p className="text-sm font-black text-[#315474]">Where is this happening?</p><p className="mt-1 text-xs text-[#7890ad]">Choose automatic location or enter it yourself. You can always correct the label.</p></div><MapPin className="h-5 w-5 text-[#0d9388]" /></div><div className="mt-5 grid grid-cols-2 gap-2"><button type="button" onClick={() => setLocationMode("auto")} className={`rounded-2xl border p-4 text-left ${locationMode === "auto" ? "border-[#8ccdc6] bg-[#effaf8]" : "border-[#dce8f3]"}`}><LocateFixed className="h-4 w-4 text-[#0d9388]" /><b className="mt-2 block text-sm text-[#315474]">Use my location</b><span className="mt-1 block text-xs text-[#6d869f]">You control permission</span></button><button type="button" onClick={() => setLocationMode("manual")} className={`rounded-2xl border p-4 text-left ${locationMode === "manual" ? "border-[#9fc8ea] bg-[#f0f7ff]" : "border-[#dce8f3]"}`}><Navigation className="h-4 w-4 text-[#0e5bb7]" /><b className="mt-2 block text-sm text-[#315474]">Enter manually</b><span className="mt-1 block text-xs text-[#6d869f]">Landmark or coordinates</span></button></div>{locationMode === "auto" && <div className="mt-4 rounded-2xl bg-[#f5fafb] p-4"><Button type="button" variant="outline" onClick={useCurrentLocation} className="border-[#a9d9d2] text-[#087b72]"><LocateFixed className="mr-2 h-4 w-4" />Capture current location</Button><p className="mt-2 text-xs leading-5 text-[#72899f]">Only approximate coordinates are saved for routing. Your exact identity is never placed on a public post.</p></div>}<div className="mt-4 space-y-3"><Input value={locationLabel} onChange={event => setLocationLabel(event.target.value)} placeholder="Locality, street, or nearby landmark" className="h-11 border-[#d4e1ed]" /><div className="grid grid-cols-2 gap-3"><Input type="number" step="any" value={latitude} onChange={event => { setLatitude(event.target.value); setPoint(null); }} placeholder="Latitude (optional)" /><Input type="number" step="any" value={longitude} onChange={event => { setLongitude(event.target.value); setPoint(null); }} placeholder="Longitude (optional)" /></div></div>{locationMode === "auto" && locationLabel && <p className="mt-3 text-xs font-bold text-[#087b72]">Location ready: {locationLabel}</p>}{locationError && <p className="mt-3 text-xs font-bold text-[#b1412d]">{locationError}</p>}</section><section className="flex flex-col gap-4 rounded-[28px] bg-[#173f6b] p-5 text-white sm:flex-row sm:items-center sm:justify-between sm:p-6"><div><p className="font-black">Share with your neighbourhood?</p><p className="mt-1 text-xs leading-5 text-[#c7d9ea]">Your identity stays private. Public updates show a generalized location.</p><button type="button" onClick={() => setVisibility(visibility === "public" ? "private" : "public")} className="mt-3 rounded-full bg-white/12 px-3 py-1.5 text-xs font-extrabold">{visibility === "public" ? "Public community update" : "Private request"}</button></div><Button type="submit" disabled={create.isPending || uploadState === "uploading"} className="h-12 bg-white px-6 font-black text-[#173f6b] hover:bg-[#eaf5ff]">{create.isPending ? "Creating record…" : uploadState === "uploading" ? `Uploading ${uploadProgress}%` : user ? "Publish civic update" : "Sign in to publish"}</Button></section>{uploadState === "uploading" && <div className="rounded-2xl border border-[#c9e2ef] bg-white p-4"><div className="flex items-center gap-2 text-sm font-extrabold text-[#315474]"><UploadCloud className="h-4 w-4 text-[#0e5bb7]" />Uploading evidence to your civic record</div><div className="mt-3 h-2 overflow-hidden rounded-full bg-[#e7f0f7]"><div className="h-full rounded-full bg-[#0e5bb7] transition-[width] duration-200" style={{ width: `${uploadProgress}%` }} /></div></div>}{uploadState === "failed" && createdPublicId && attachment && <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#f0d1cb] bg-[#fff7f6] p-4"><p className="text-sm font-bold text-[#9e3c2c]">The report <b>{createdPublicId}</b> was created, but its evidence did not upload.</p><button type="button" onClick={() => completeUpload(createdPublicId, attachment)} className="rounded-lg bg-[#a84936] px-3 py-2 text-xs font-extrabold text-white">Retry evidence upload</button></div>}{(uploadError || create.error) && <p className="flex items-center gap-2 text-sm font-bold text-[#b1412d]"><CircleAlert className="h-4 w-4" />{uploadError || create.error?.message}</p>}</form></div></main><CivicFooter /></div>;
}
