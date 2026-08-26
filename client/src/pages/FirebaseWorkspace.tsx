import EvidencePicker from "@/components/EvidencePicker";
import CivicAiAssist from "@/components/CivicAiAssist";
import { signInWithFirebaseGoogleDirect, signOutFromFirebaseIfPresent, useFirebaseUser } from "@/lib/firebase/auth";
import {
  addFirebaseComment,
  createFirebaseCivicItem,
  ensureFirebaseCitizen,
  getFirebaseSocialSignals,
  listFirebaseCivicItems,
  setFirebaseReaction,
  setFirebaseVerification,
  type FirebaseCivicItem,
  type FirebaseReaction,
  type FirebaseSocialSignals,
  type FirebaseVerification,
} from "@/lib/firebase/civic";
import { getFirebaseEnvironmentLabel, isFirebaseFreeStageConfigured } from "@/lib/firebase/config";
import { calculateDemoDrfi, defaultDemoFactors, drfiFactorDefinitions, type DemoDrfiFactors } from "@/lib/browserLocalDemo";
import { CircleGauge, FilePlus2, LogIn, LogOut, MessageCircle, RefreshCcw, Send, ShieldCheck, ThumbsDown, ThumbsUp, UsersRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const categories = ["Waste & sanitation", "Water", "Road safety", "Streetlight", "Other"];

function createdLabel(item: FirebaseCivicItem) {
  const date = item.createdAt?.toDate?.();
  return date ? date.toLocaleString() : "Just created";
}

export default function FirebaseWorkspace() {
  const { user, loading } = useFirebaseUser();
  const [records, setRecords] = useState<FirebaseCivicItem[]>([]);
  const [socialSignals, setSocialSignals] = useState<Record<string, FirebaseSocialSignals>>({});
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [isLoadingRecords, setIsLoadingRecords] = useState(false);
  const [draft, setDraft] = useState({ title: "", description: "", category: categories[0], locality: "", visibility: "public" as "public" | "private" });
  const [file, setFile] = useState<File | null>(null);
  const [factors, setFactors] = useState<DemoDrfiFactors>(defaultDemoFactors);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [verificationBusy, setVerificationBusy] = useState<string | null>(null);
  const priority = useMemo(() => calculateDemoDrfi(factors), [factors]);
  const firebaseEnvironment = getFirebaseEnvironmentLabel();

  const loadRecords = async () => {
    if (!user) return;
    setIsLoadingRecords(true);
    try {
      const nextRecords = await listFirebaseCivicItems(user);
      setRecords(nextRecords);
      const socialEntries = await Promise.all(nextRecords.filter((record) => record.visibility === "public").map(async (record) => [record.id, await getFirebaseSocialSignals(record.id, user)] as const));
      setSocialSignals(Object.fromEntries(socialEntries));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "JanaNiti could not load Firestore records.");
    } finally {
      setIsLoadingRecords(false);
    }
  };

  useEffect(() => {
    if (!user) {
      setRecords([]);
      return;
    }
    ensureFirebaseCitizen(user).then(loadRecords).catch((cause) => setError(cause instanceof Error ? cause.message : "JanaNiti could not start your Firebase profile."));
  // Firebase user UID is stable for the session; this only refreshes when it changes.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid]);

  const signIn = async () => {
    setError("");
    try {
      await signInWithFirebaseGoogleDirect();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Google Sign-In could not be completed.");
    }
  };

  const createRecord = async () => {
    if (!user) return signIn();
    if (draft.title.trim().length < 8 || draft.description.trim().length < 20 || draft.locality.trim().length < 2) {
      setError("Add a clear title, a short description, and a locality before publishing.");
      return;
    }
    setError("");
    setNotice("");
    setIsSaving(true);
    try {
      await ensureFirebaseCitizen(user, draft.locality.trim());
      await createFirebaseCivicItem(user, {
        title: draft.title,
        description: draft.description,
        category: draft.category,
        locality: draft.locality,
        locationLabel: draft.locality,
        visibility: draft.visibility,
        latitude: null,
        longitude: null,
      }, file);
      setDraft({ title: "", description: "", category: categories[0], locality: "", visibility: "public" });
      setFile(null);
      setNotice("Your civic record was written to Firestore.");
      await loadRecords();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The Firebase record could not be created.");
    } finally {
      setIsSaving(false);
    }
  };

  const verify = async (issueId: string, response: FirebaseVerification) => {
    if (!user) return signIn();
    setVerificationBusy(issueId);
    setError("");
    try {
      await setFirebaseVerification(issueId, user, response);
      setNotice(`Your ${response.replaceAll("_", " ")} response was written to Firestore.`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The verification could not be saved.");
    } finally {
      setVerificationBusy(null);
    }
  };

  const refreshSocial = async (issueId: string) => {
    if (!user) return;
    const nextSignals = await getFirebaseSocialSignals(issueId, user);
    setSocialSignals((current) => ({ ...current, [issueId]: nextSignals }));
  };

  const react = async (issueId: string, reaction: FirebaseReaction) => {
    if (!user) return signIn();
    setError("");
    try {
      await setFirebaseReaction(issueId, user, reaction);
      await refreshSocial(issueId);
      setNotice("Your community reaction was saved. It does not decide whether the report is true.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The reaction could not be saved.");
    }
  };

  const comment = async (issueId: string) => {
    if (!user) return signIn();
    setError("");
    try {
      await addFirebaseComment(issueId, user, commentDrafts[issueId] ?? "");
      setCommentDrafts((current) => ({ ...current, [issueId]: "" }));
      await refreshSocial(issueId);
      setNotice("Your comment was written to Firestore.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The comment could not be saved.");
    }
  };

  if (!isFirebaseFreeStageConfigured) return <main className="grid min-h-screen place-items-center bg-[#f7f8fa] p-6"><section className="max-w-md rounded-3xl border border-[#ead1d6] bg-white p-7 text-center shadow-sm"><h1 className="text-2xl font-bold text-[#0a1317]">Firebase configuration is missing.</h1><p className="mt-3 text-sm leading-6 text-[#5d6c7b]">Add the approved Firebase Web App values in Vercel and redeploy before using the production workspace.</p></section></main>;

  return <main className="min-h-screen bg-[#f7f8fa] px-4 py-5 text-[#0a1317] sm:px-8 sm:py-9"><section className="mx-auto max-w-6xl"><header className="rounded-[30px] bg-[#0a1317] px-5 py-7 text-white shadow-[0_16px_42px_rgba(10,19,23,.15)] sm:px-9"><div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-[#8bc5ff]">JanaNiti · Firebase civic workspace{firebaseEnvironment !== "production" ? ` · ${firebaseEnvironment}` : ""}</p><h1 className="mt-2 max-w-3xl text-3xl font-semibold tracking-[-.045em] sm:text-5xl">Turn a local observation into a public civic record.</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-[#d0d7de]">Google Sign-In identifies each citizen; Firestore stores eligible civic reports and one verification per account. Coordinator-only actions stay protected until an authorised coordinator account is configured.</p></div>{user ? <button onClick={() => signOutFromFirebaseIfPresent()} className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-white/10 px-4 text-sm font-bold transition hover:bg-white/15"><LogOut className="h-4 w-4" />Sign out</button> : <button onClick={signIn} disabled={loading} className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-[#0064e0] px-5 text-sm font-bold transition hover:bg-[#0457cb] disabled:opacity-60"><LogIn className="h-4 w-4" />{loading ? "Checking session…" : "Continue with Google"}</button>}</div></header>

    {(error || notice) && <div className={`mt-4 rounded-2xl border px-4 py-3 text-sm ${error ? "border-[#f2c6cc] bg-[#fff6f7] text-[#a91f34]" : "border-[#cfe8d5] bg-[#f1fbf4] text-[#176838]"}`}>{error || notice}</div>}

    <div className="mt-5 grid gap-5 lg:grid-cols-[1.05fr_.95fr]"><section className="rounded-[28px] border border-[#e1e6eb] bg-white p-4 shadow-[0_1px_4px_rgba(20,22,26,.08)] sm:p-6"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#e8f2ff] text-[#0064e0]"><FilePlus2 className="h-5 w-5" /></span><div><h2 className="font-bold">Create a civic report</h2><p className="text-xs text-[#5d6c7b]">A signed-in citizen can create public or private Firestore records.</p></div></div><div className="mt-5 grid gap-3"><label className="grid gap-1 text-xs font-bold text-[#40505f]">Issue title<input value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} placeholder="e.g., Drain overflow near bus stop" className="h-11 rounded-lg border border-[#ced0d4] px-3 text-sm outline-none ring-[#0064e0] focus:ring-2" /></label><label className="grid gap-1 text-xs font-bold text-[#40505f]">What is happening?<textarea value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} placeholder="Describe the impact and a useful landmark." className="min-h-28 rounded-lg border border-[#ced0d4] px-3 py-2.5 text-sm outline-none ring-[#0064e0] focus:ring-2" /></label><div className="grid gap-3 sm:grid-cols-2"><label className="grid gap-1 text-xs font-bold text-[#40505f]">Category<select value={draft.category} onChange={(event) => setDraft({ ...draft, category: event.target.value })} className="h-11 rounded-lg border border-[#ced0d4] bg-white px-3 text-sm outline-none ring-[#0064e0] focus:ring-2">{categories.map((category) => <option key={category}>{category}</option>)}</select></label><label className="grid gap-1 text-xs font-bold text-[#40505f]">Visibility<select value={draft.visibility} onChange={(event) => setDraft({ ...draft, visibility: event.target.value as "public" | "private" })} className="h-11 rounded-lg border border-[#ced0d4] bg-white px-3 text-sm outline-none ring-[#0064e0] focus:ring-2"><option value="public">Public community record</option><option value="private">Private reporter record</option></select></label></div><label className="grid gap-1 text-xs font-bold text-[#40505f]">Locality or ward<input value={draft.locality} onChange={(event) => setDraft({ ...draft, locality: event.target.value })} placeholder="e.g., Ward 12" className="h-11 rounded-lg border border-[#ced0d4] px-3 text-sm outline-none ring-[#0064e0] focus:ring-2" /></label><CivicAiAssist user={user} title={draft.title} description={draft.description} locality={draft.locality} onApplyCategory={(category) => setDraft((current) => ({ ...current, category }))} /><EvidencePicker file={file} onChoose={setFile} onRemove={() => setFile(null)} maxSizeLabel="10 MB max" /><button disabled={isSaving || loading} onClick={createRecord} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#0064e0] px-5 text-sm font-bold text-white transition hover:bg-[#0457cb] active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transform-none"><Send className="h-4 w-4" />{isSaving ? "Writing to Firestore…" : user ? "Publish civic report" : "Sign in to publish"}</button></div></section>

      <section className="rounded-[28px] border border-[#e1e6eb] bg-white p-4 shadow-[0_1px_4px_rgba(20,22,26,.08)] sm:p-6"><div className="flex items-center justify-between gap-3"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#e8f2ff] text-[#0064e0]"><UsersRound className="h-5 w-5" /></span><div><h2 className="font-bold">Local civic records</h2><p className="text-xs text-[#5d6c7b]">Public records plus reports you submitted.</p></div></div><button onClick={loadRecords} disabled={!user || isLoadingRecords} className="grid h-10 w-10 place-items-center rounded-full border border-[#dfe5eb] text-[#0064e0] hover:bg-[#f3f8ff] disabled:opacity-40" aria-label="Refresh records"><RefreshCcw className={`h-4 w-4 ${isLoadingRecords ? "animate-spin" : ""}`} /></button></div>{!user ? <div className="mt-5 rounded-2xl border border-dashed border-[#cdddea] bg-[#f8fbff] p-6 text-center text-sm leading-6 text-[#5d6c7b]">Sign in with Google to view or create Firestore records.</div> : records.length === 0 ? <div className="mt-5 rounded-2xl border border-dashed border-[#cdddea] bg-[#f8fbff] p-6 text-center text-sm leading-6 text-[#5d6c7b]">No eligible Firestore records yet. Your first published report will appear here.</div> : <div className="mt-5 grid gap-3">{records.map((record) => { const signals = socialSignals[record.id]; return <article key={record.id} className="rounded-[20px] border border-[#e1e6eb] bg-[#fbfcfd] p-4"><div className="flex flex-wrap items-center justify-between gap-2"><span className="rounded-full bg-[#e8f2ff] px-2.5 py-1 text-[11px] font-bold text-[#0064e0]">{record.category}</span><span className="text-[11px] font-bold text-[#5d6c7b]">{record.visibility} · {createdLabel(record)}</span></div><h3 className="mt-3 font-bold text-[#0a1317]">{record.title}</h3><p className="mt-1 text-sm leading-6 text-[#5d6c7b]">{record.description}</p><p className="mt-2 text-xs font-bold text-[#40505f]">{record.locality} · {record.status}</p>{record.evidence?.url && record.evidence.contentType.startsWith("image/") && <img src={record.evidence.url} alt="Civic evidence" className="mt-3 max-h-56 w-full rounded-xl object-cover" />}{record.visibility === "public" && <><div className="mt-3 grid grid-cols-3 gap-2">{(["confirm", "dispute", "unable_to_verify"] as const).map((response) => <button key={response} onClick={() => verify(record.id, response)} disabled={verificationBusy === record.id} className="rounded-xl border border-[#dfe5eb] bg-white px-2 py-2 text-[11px] font-bold text-[#40505f] transition hover:border-[#0064e0] hover:text-[#0064e0] disabled:opacity-50">{response === "unable_to_verify" ? "Unable" : response[0].toUpperCase() + response.slice(1)}</button>)}</div><div className="mt-3 flex flex-wrap gap-2 border-t border-[#e6eaee] pt-3"><button onClick={() => react(record.id, "up")} className={`inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3 text-xs font-bold transition ${signals?.viewerReaction === "up" ? "border-[#0064e0] bg-[#e8f2ff] text-[#0064e0]" : "border-[#dfe5eb] bg-white text-[#40505f] hover:border-[#0064e0]"}`}><ThumbsUp className="h-3.5 w-3.5" />Support {signals?.up ?? 0}</button><button onClick={() => react(record.id, "down")} className={`inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3 text-xs font-bold transition ${signals?.viewerReaction === "down" ? "border-[#a91f34] bg-[#fff6f7] text-[#a91f34]" : "border-[#dfe5eb] bg-white text-[#40505f] hover:border-[#a91f34]"}`}><ThumbsDown className="h-3.5 w-3.5" />Concern {signals?.down ?? 0}</button><span className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-[#f1f4f7] px-3 text-xs font-bold text-[#5d6c7b]"><MessageCircle className="h-3.5 w-3.5" />{signals?.comments.length ?? 0} comments</span></div><div className="mt-3 grid gap-2"><div className="grid gap-2 sm:grid-cols-[1fr_auto]"><input value={commentDrafts[record.id] ?? ""} onChange={(event) => setCommentDrafts((current) => ({ ...current, [record.id]: event.target.value }))} maxLength={500} placeholder="Add a constructive civic comment" className="h-10 rounded-xl border border-[#dfe5eb] bg-white px-3 text-sm outline-none ring-[#0064e0] focus:ring-2" /><button onClick={() => comment(record.id)} className="min-h-10 rounded-xl bg-[#0a1317] px-4 text-xs font-bold text-white transition hover:bg-[#263136]">Comment</button></div>{signals?.comments.map((entry) => <p key={entry.id} className="rounded-xl bg-white px-3 py-2 text-sm leading-5 text-[#40505f]">{entry.body}</p>)}</div></>}</article>})}</div>}</section></div>

    <section className="mt-5 rounded-[28px] border border-[#e1e6eb] bg-white p-4 shadow-[0_1px_4px_rgba(20,22,26,.08)] sm:p-6"><div className="flex flex-wrap items-start justify-between gap-3"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#e8f2ff] text-[#0064e0]"><CircleGauge className="h-5 w-5" /></span><div><h2 className="font-bold">Explainable DRFI</h2><p className="text-xs text-[#5d6c7b]">Eight transparent inputs calculate an indicative civic priority. A protected coordinator reviews final prioritisation.</p></div></div><span className="rounded-full border border-[#dce6f5] bg-[#f4f8ff] px-3 py-2 text-sm font-bold text-[#075eb7]">{priority.score}/100 · {priority.band}</span></div><div className="mt-5 grid gap-x-6 gap-y-4 md:grid-cols-2">{drfiFactorDefinitions.map((factor) => <label key={factor.key} className="grid gap-1.5"><span className="flex items-center justify-between text-xs font-bold text-[#40505f]"><span>{factor.label} <span className="font-normal text-[#718191]">× {factor.weight.toFixed(2)}</span></span><span>{factors[factor.key]}</span></span><input type="range" min="0" max="100" value={factors[factor.key]} onChange={(event) => setFactors({ ...factors, [factor.key]: Number(event.target.value) })} className="accent-[#0064e0]" /></label>)}</div></section>

    <footer className="mt-5 flex items-start gap-3 rounded-[22px] border border-[#d6eadc] bg-[#f2fbf4] p-4 text-sm leading-6 text-[#356a55]"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#31a24c]" /><p><strong>Production safety boundary:</strong> Firestore rules restrict civic records by visibility and reporter identity. Evidence uploads require Firebase Storage and its reviewed rules; protected coordinator status changes remain unavailable until a trusted coordinator-admin integration is configured.</p></footer>
  </section></main>;
}
