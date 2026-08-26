import CivicAiAssist from "@/components/CivicAiAssist";
import CivicLifecycleTimeline from "@/components/CivicLifecycleTimeline";
import CivicWorkspaceNav, { type CivicWorkspaceScreen } from "@/components/CivicWorkspaceNav";
import { CivicActivityScreen, CivicDetailScreen, CivicExploreScreen, CivicProfileScreen, type CivicWorkspaceRecord } from "@/components/CivicWorkspaceSupplement";
import DrfiAdminRecommendation from "@/components/DrfiAdminRecommendation";
import EvidencePicker from "@/components/EvidencePicker";
import FirebaseEntryScreen from "@/components/FirebaseEntryScreen";
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
import { getTestOnlyCivicRecords } from "@/lib/firebaseWorkspacePresentation";
import { calculateDemoDrfi, defaultDemoFactors, drfiFactorDefinitions, type DemoDrfiFactors } from "@/lib/browserLocalDemo";
import { CircleGauge, FilePlus2, LogOut, MessageCircle, RefreshCcw, Send, ShieldCheck, ThumbsDown, ThumbsUp, UsersRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const categories = ["Waste & sanitation", "Water", "Road safety", "Streetlight", "Other"];
type DisplayCivicRecord = Omit<FirebaseCivicItem, "status"> & { status: string; isSyntheticTestRecord?: true };

function createdLabel(item: DisplayCivicRecord) {
  if (item.isSyntheticTestRecord) return "Synthetic test record";
  const date = item.createdAt?.toDate?.();
  return date ? date.toLocaleString() : "Just created";
}

function FirebaseLoadingScreen() {
  return <main className="grid min-h-[100dvh] place-items-center bg-[#f6f8fb] px-6 text-center"><div><div className="mx-auto grid h-14 w-14 place-items-center rounded-[22px] bg-[#0064e0] shadow-[0_12px_28px_rgba(0,100,224,.26)]"><div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" /></div><h1 className="mt-5 text-lg font-bold text-[#0a1317]">Preparing your civic space</h1><p className="mt-2 max-w-xs text-sm leading-6 text-[#5d6c7b]">Checking your secure Google session and your community workspace.</p></div></main>;
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
  const [reviewOpen, setReviewOpen] = useState(false);
  const [verificationBusy, setVerificationBusy] = useState<string | null>(null);
  const [activeScreen, setActiveScreen] = useState<CivicWorkspaceScreen>("home");
  const [selectedRecord, setSelectedRecord] = useState<CivicWorkspaceRecord | null>(null);
  const [feedView, setFeedView] = useState("For you");
  const priority = useMemo(() => calculateDemoDrfi(factors), [factors]);
  const firebaseEnvironment = getFirebaseEnvironmentLabel();
  const visualPreview = import.meta.env.DEV && new URLSearchParams(window.location.search).get("preview") === "workspace";
  const testOnlyRecords = useMemo(() => getTestOnlyCivicRecords(firebaseEnvironment, import.meta.env.DEV).map((record) => ({
    ...record,
    reporterUid: "test-only",
    locationLabel: record.locality,
    latitude: null,
    longitude: null,
  })), [firebaseEnvironment]);
  const visibleRecords: DisplayCivicRecord[] = [...records, ...testOnlyRecords];
  const testMode = testOnlyRecords.length > 0;

  const moveTo = (id: string) => window.setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
  const navigateWorkspace = (screen: CivicWorkspaceScreen) => {
    setActiveScreen(screen);
    setSelectedRecord(null);
    if (screen === "home") return window.scrollTo({ top: 0, behavior: "smooth" });
    moveTo(screen === "report" ? "report-composer" : `workspace-${screen}`);
  };
  const openRecord = (record: CivicWorkspaceRecord) => {
    setSelectedRecord(record);
    moveTo("workspace-detail");
  };

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
      setSocialSignals({});
      return;
    }
    ensureFirebaseCitizen(user).then(loadRecords).catch((cause) => setError(cause instanceof Error ? cause.message : "JanaNiti could not start your Firebase profile."));
    // Firebase user UID is stable for the session; this refreshes only on sign-in change.
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
    if (!reviewOpen) return beginReview();
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
      setReviewOpen(false);
      setNotice(draft.visibility === "public" ? "Your report was written to Firestore and published to the community feed." : "Your report was written to Firestore as a private reporter record.");
      await loadRecords();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The Firebase record could not be created.");
    } finally {
      setIsSaving(false);
    }
  };

  const beginReview = () => {
    if (!user) return signIn();
    if (draft.title.trim().length < 8 || draft.description.trim().length < 20 || draft.locality.trim().length < 2) {
      setError("Add a clear title, a short description, and a locality before reviewing.");
      return;
    }
    setError("");
    setNotice("");
    setReviewOpen(true);
    moveTo("report-review");
  };

  const refreshSocial = async (issueId: string) => {
    if (!user) return;
    const nextSignals = await getFirebaseSocialSignals(issueId, user);
    setSocialSignals((current) => ({ ...current, [issueId]: nextSignals }));
  };

  const verify = async (issueId: string, response: FirebaseVerification) => {
    if (!user) return signIn();
    setVerificationBusy(issueId);
    setError("");
    try {
      await setFirebaseVerification(issueId, user, response);
      setNotice(`Your ${response.replaceAll("_", " ")} response was written to Firestore. It is separate from reactions.`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The verification could not be saved.");
    } finally {
      setVerificationBusy(null);
    }
  };

  const react = async (issueId: string, reaction: FirebaseReaction) => {
    if (!user) return signIn();
    setError("");
    try {
      await setFirebaseReaction(issueId, user, reaction);
      await refreshSocial(issueId);
      setNotice("Your community reaction was saved. It does not decide whether a report is true.");
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

  if (!isFirebaseFreeStageConfigured) return <main className="grid min-h-[100dvh] place-items-center bg-[#f7f8fa] p-6"><section className="max-w-md rounded-3xl border border-[#ead1d6] bg-white p-7 text-center shadow-sm"><h1 className="text-2xl font-bold text-[#0a1317]">Firebase configuration is missing.</h1><p className="mt-3 text-sm leading-6 text-[#5d6c7b]">Add the approved Firebase Web App values in Vercel and redeploy before using the production workspace.</p></section></main>;
  if (loading && !user) return <FirebaseLoadingScreen />;
  if (!user && !visualPreview) return <FirebaseEntryScreen onSignIn={signIn} loading={loading} testMode={firebaseEnvironment === "test" || firebaseEnvironment === "preview"} />;

  return <main className="min-h-[100dvh] overflow-x-hidden bg-[#f7f8fa] pb-8 text-[#0a1317]"><section className="mx-auto max-w-6xl px-3 py-3 sm:px-6 sm:py-6 lg:px-8"><header className="overflow-hidden rounded-[26px] bg-[#0a1317] px-4 py-5 text-white shadow-[0_16px_42px_rgba(10,19,23,.15)] sm:rounded-[30px] sm:px-8 sm:py-7"><div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between"><div className="min-w-0"><p className="text-[10px] font-bold uppercase tracking-[.17em] text-[#8bc5ff] sm:text-xs">JanaNiti · Firebase civic workspace{firebaseEnvironment !== "production" ? ` · ${firebaseEnvironment}` : ""}{visualPreview ? " · visual preview" : ""}</p><h1 className="mt-2 max-w-3xl text-3xl font-semibold tracking-[-.045em] sm:text-5xl">A civic feed that keeps the real work visible.</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-[#d0d7de]">Choose private reporting or a community post, keep reactions separate from truth verification, and follow the real complaint timeline.</p></div>{user ? <button onClick={() => signOutFromFirebaseIfPresent()} className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 self-start rounded-full bg-white/10 px-4 text-sm font-bold transition hover:bg-white/15"><LogOut className="h-4 w-4" />Sign out</button> : <button onClick={signIn} className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 self-start rounded-full bg-white/10 px-4 text-sm font-bold transition hover:bg-white/15">Sign in to test</button>}</div></header>

    {(error || notice) && <div role={error ? "alert" : "status"} className={`mt-3 rounded-2xl border px-4 py-3 text-sm ${error ? "border-[#f2c6cc] bg-[#fff6f7] text-[#a91f34]" : "border-[#cfe8d5] bg-[#f1fbf4] text-[#176838]"}`}>{error || notice}</div>}
    {testMode && <aside className="mt-3 rounded-2xl border border-[#f1d796] bg-[#fff9e6] px-4 py-3 text-sm leading-6 text-[#795b11]"><strong>Test-only feed:</strong> the cards marked “Synthetic test record” exist only for layout and interaction testing. They are not real complaints and cannot receive stored reactions, comments, or verification.</aside>}
    <section className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-[#e1e6eb] bg-white p-2 shadow-sm"><button onClick={() => { navigateWorkspace("explore"); setNotice("Explore shows records currently available to your account. Locality filtering will activate after a protected profile locality setting is published."); }} className="min-h-10 rounded-xl px-3 text-xs font-bold text-[#40505f] hover:bg-[#f5f8fb]">Locality · Explore</button><button onClick={() => navigateWorkspace("activity")} className="min-h-10 rounded-xl px-3 text-xs font-bold text-[#40505f] hover:bg-[#f5f8fb]">Updates</button><button onClick={() => navigateWorkspace("profile")} className="min-h-10 rounded-xl px-3 text-xs font-bold text-[#40505f] hover:bg-[#f5f8fb]">Profile</button></section>
    {activeScreen === "home" && <section className="mt-3 overflow-x-auto rounded-2xl border border-[#e1e6eb] bg-white p-2 shadow-sm" aria-label="Community feed views"><div className="flex min-w-max gap-1" role="tablist">{["For you", "My locality", "Trending", "Following"].map((view) => <button key={view} role="tab" aria-selected={feedView === view} onClick={() => { setFeedView(view); setNotice(view === "For you" ? "Showing records available to your account." : `${view} filtering will show matching Firestore records when its privacy-safe query is enabled.`); }} className={`min-h-10 rounded-xl px-4 text-xs font-bold transition ${feedView === view ? "bg-[#0064e0] text-white" : "text-[#627283] hover:bg-[#f3f6f9]"}`}>{view}</button>)}</div></section>}

    <div className="mt-3 grid gap-4 lg:grid-cols-[1.02fr_.98fr] lg:gap-5"><section id="report-composer" className="rounded-[24px] border border-[#e1e6eb] bg-white p-4 shadow-[0_1px_4px_rgba(20,22,26,.08)] sm:rounded-[28px] sm:p-6"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#e8f2ff] text-[#0064e0]"><FilePlus2 className="h-5 w-5" /></span><div><h2 className="font-bold">Report an issue</h2><p className="text-xs text-[#5d6c7b]">Draft first, then choose who can see it.</p></div></div><div className="mt-5 grid gap-3"><label className="grid gap-1 text-xs font-bold text-[#40505f]">Issue title<input value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} placeholder="e.g., Drain overflow near bus stop" className="h-11 min-w-0 rounded-xl border border-[#ced0d4] px-3 text-sm outline-none ring-[#0064e0] focus:ring-2" /></label><label className="grid gap-1 text-xs font-bold text-[#40505f]">What is happening?<textarea value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} placeholder="Describe the impact and a useful landmark." className="min-h-28 rounded-xl border border-[#ced0d4] px-3 py-2.5 text-sm outline-none ring-[#0064e0] focus:ring-2" /></label><div className="grid gap-3 sm:grid-cols-2"><label className="grid gap-1 text-xs font-bold text-[#40505f]">Category<select value={draft.category} onChange={(event) => setDraft({ ...draft, category: event.target.value })} className="h-11 rounded-xl border border-[#ced0d4] bg-white px-3 text-sm outline-none ring-[#0064e0] focus:ring-2">{categories.map((category) => <option key={category}>{category}</option>)}</select></label><label className="grid gap-1 text-xs font-bold text-[#40505f]">Locality or ward<input value={draft.locality} onChange={(event) => setDraft({ ...draft, locality: event.target.value })} placeholder="e.g., Ward 12" className="h-11 min-w-0 rounded-xl border border-[#ced0d4] px-3 text-sm outline-none ring-[#0064e0] focus:ring-2" /></label></div><fieldset className="grid gap-2"><legend className="text-xs font-bold text-[#40505f]">Where should this appear?</legend><div className="grid gap-2 sm:grid-cols-2"><button type="button" onClick={() => setDraft((current) => ({ ...current, visibility: "public" }))} className={`min-h-16 rounded-2xl border p-3 text-left transition ${draft.visibility === "public" ? "border-[#0064e0] bg-[#eef6ff] shadow-[0_4px_14px_rgba(0,100,224,.12)]" : "border-[#dfe5eb] bg-white hover:border-[#9cc9f5]"}`}><span className="block text-sm font-bold text-[#0a1317]">Publish to community</span><span className="mt-1 block text-xs leading-4 text-[#5d6c7b]">People can see the post, react, comment, and verify it.</span></button><button type="button" onClick={() => setDraft((current) => ({ ...current, visibility: "private" }))} className={`min-h-16 rounded-2xl border p-3 text-left transition ${draft.visibility === "private" ? "border-[#0064e0] bg-[#eef6ff] shadow-[0_4px_14px_rgba(0,100,224,.12)]" : "border-[#dfe5eb] bg-white hover:border-[#9cc9f5]"}`}><span className="block text-sm font-bold text-[#0a1317]">Keep it private</span><span className="mt-1 block text-xs leading-4 text-[#5d6c7b]">Only you and authorised coordinators can access it.</span></button></div></fieldset><CivicAiAssist user={user} title={draft.title} description={draft.description} locality={draft.locality} onApplyCategory={(category) => setDraft((current) => ({ ...current, category }))} /><EvidencePicker file={file} onChoose={setFile} onRemove={() => setFile(null)} maxSizeLabel="10 MB max" /><button disabled={isSaving} onClick={createRecord} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#0064e0] px-5 text-sm font-bold text-white transition hover:bg-[#0457cb] active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-60"><Send className="h-4 w-4" />{isSaving ? "Writing to Firestore…" : draft.visibility === "public" ? "Publish community post" : "Save private report"}</button></div></section>

      <section className="rounded-[24px] border border-[#e1e6eb] bg-white p-4 shadow-[0_1px_4px_rgba(20,22,26,.08)] sm:rounded-[28px] sm:p-6"><div className="flex items-center justify-between gap-3"><div className="flex min-w-0 items-center gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-[#e8f2ff] text-[#0064e0]"><UsersRound className="h-5 w-5" /></span><div className="min-w-0"><h2 className="font-bold">Community feed</h2><p className="truncate text-xs text-[#5d6c7b]">Public posts and your private reports.</p></div></div><button onClick={() => user ? loadRecords() : setNotice("Sign in with Google to refresh Firestore records.")} disabled={isLoadingRecords} className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[#dfe5eb] text-[#0064e0] transition hover:bg-[#f3f8ff] disabled:opacity-40" aria-label="Refresh records"><RefreshCcw className={`h-4 w-4 ${isLoadingRecords ? "animate-spin" : ""}`} /></button></div>{visibleRecords.length === 0 ? <div className="mt-5 rounded-2xl border border-dashed border-[#cdddea] bg-[#f8fbff] p-6 text-center text-sm leading-6 text-[#5d6c7b]">No eligible records yet. Your first published report will appear here.</div> : <div className="mt-4 grid gap-3">{visibleRecords.map((record) => { const signals = socialSignals[record.id]; const isSynthetic = record.isSyntheticTestRecord === true; return <article key={record.id} className={`overflow-hidden rounded-[20px] border p-4 ${isSynthetic ? "border-[#efd58e] bg-[#fffdf5]" : "border-[#e1e6eb] bg-[#fbfcfd]"}`}><div className="flex flex-wrap items-center justify-between gap-2"><span className="rounded-full bg-[#e8f2ff] px-2.5 py-1 text-[11px] font-bold text-[#0064e0]">{record.category}</span><span className="text-[11px] font-bold text-[#5d6c7b]">{record.visibility} · {createdLabel(record)}</span></div><h3 className="mt-3 text-base font-bold text-[#0a1317]">{record.title}</h3><p className="mt-1 text-sm leading-6 text-[#5d6c7b]">{record.description}</p><p className="mt-2 text-xs font-bold text-[#40505f]">{record.locality} · {record.status.replaceAll("_", " ")}</p>{record.evidence?.url && record.evidence.contentType.startsWith("image/") && <img src={record.evidence.url} alt="Civic evidence" className="mt-3 max-h-56 w-full rounded-xl object-cover" />}<CivicLifecycleTimeline status={record.status} />{isSynthetic ? <p className="mt-3 rounded-xl border border-[#f1d796] bg-[#fff9e6] px-3 py-2 text-xs leading-5 text-[#795b11]">Synthetic test record. Social actions are disabled to prevent creating misleading civic data.</p> : record.visibility === "public" && <><div className="mt-3 grid grid-cols-3 gap-2">{(["confirm", "dispute", "unable_to_verify"] as const).map((response) => <button key={response} onClick={() => verify(record.id, response)} disabled={verificationBusy === record.id} className="min-h-10 rounded-xl border border-[#dfe5eb] bg-white px-1.5 py-2 text-[10px] font-bold text-[#40505f] transition hover:border-[#0064e0] hover:text-[#0064e0] disabled:opacity-50 sm:text-[11px]">{response === "unable_to_verify" ? "Unable" : response[0].toUpperCase() + response.slice(1)}</button>)}</div><div className="mt-3 flex flex-wrap gap-2 border-t border-[#e6eaee] pt-3"><button onClick={() => react(record.id, "up")} className={`inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3 text-xs font-bold transition ${signals?.viewerReaction === "up" ? "border-[#0064e0] bg-[#e8f2ff] text-[#0064e0]" : "border-[#dfe5eb] bg-white text-[#40505f] hover:border-[#0064e0]"}`}><ThumbsUp className="h-3.5 w-3.5" />Support {signals?.up ?? 0}</button><button onClick={() => react(record.id, "down")} className={`inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3 text-xs font-bold transition ${signals?.viewerReaction === "down" ? "border-[#a91f34] bg-[#fff6f7] text-[#a91f34]" : "border-[#dfe5eb] bg-white text-[#40505f] hover:border-[#a91f34]"}`}><ThumbsDown className="h-3.5 w-3.5" />Concern {signals?.down ?? 0}</button><span className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-[#f1f4f7] px-3 text-xs font-bold text-[#5d6c7b]"><MessageCircle className="h-3.5 w-3.5" />{signals?.comments.length ?? 0} comments</span></div><div className="mt-3 grid gap-2"><div className="grid gap-2 sm:grid-cols-[1fr_auto]"><input value={commentDrafts[record.id] ?? ""} onChange={(event) => setCommentDrafts((current) => ({ ...current, [record.id]: event.target.value }))} maxLength={500} placeholder="Add a constructive civic comment" className="h-10 min-w-0 rounded-xl border border-[#dfe5eb] bg-white px-3 text-sm outline-none ring-[#0064e0] focus:ring-2" /><button onClick={() => comment(record.id)} className="min-h-10 rounded-xl bg-[#0a1317] px-4 text-xs font-bold text-white transition hover:bg-[#263136]">Comment</button></div>{signals?.comments.map((entry) => <p key={entry.id} className="rounded-xl bg-white px-3 py-2 text-sm leading-5 text-[#40505f]">{entry.body}</p>)}</div></>}<button onClick={() => openRecord(record)} className="mt-3 min-h-10 rounded-xl border border-[#0064e0] px-3 text-xs font-bold text-[#0064e0] hover:bg-[#eaf4ff]">View full issue</button></article>})}</div>}</section></div>

    <section className="mt-4 rounded-[24px] border border-[#e1e6eb] bg-white p-4 shadow-[0_1px_4px_rgba(20,22,26,.08)] sm:rounded-[28px] sm:p-6"><div className="flex flex-wrap items-start justify-between gap-3"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#e8f2ff] text-[#0064e0]"><CircleGauge className="h-5 w-5" /></span><div><h2 className="font-bold">Explainable DRFI</h2><p className="text-xs text-[#5d6c7b]">Eight transparent inputs calculate an indicative civic priority. A protected coordinator reviews final prioritisation.</p></div></div><span className="rounded-full border border-[#dce6f5] bg-[#f4f8ff] px-3 py-2 text-sm font-bold text-[#075eb7]">{priority.score}/100 · {priority.band}</span></div><div className="mt-5 grid gap-x-6 gap-y-4 md:grid-cols-2">{drfiFactorDefinitions.map((factor) => <label key={factor.key} className="grid gap-1.5"><span className="flex items-center justify-between text-xs font-bold text-[#40505f]"><span>{factor.label} <span className="font-normal text-[#718191]">× {factor.weight.toFixed(2)}</span></span><span>{factors[factor.key]}</span></span><input type="range" min="0" max="100" value={factors[factor.key]} onChange={(event) => setFactors({ ...factors, [factor.key]: Number(event.target.value) })} className="accent-[#0064e0]" /></label>)}</div><DrfiAdminRecommendation factors={factors} /></section>
    <footer className="mt-4 flex items-start gap-3 rounded-[22px] border border-[#d6eadc] bg-[#f2fbf4] p-4 text-sm leading-6 text-[#356a55]"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#31a24c]" /><p><strong>Production safety boundary:</strong> Firestore rules restrict civic records by visibility and reporter identity. Evidence uploads require Firebase Storage and its reviewed rules; protected coordinator status changes remain unavailable until a trusted coordinator-admin integration is configured.</p></footer>
    {reviewOpen && <section id="report-review" className="mt-4 rounded-[24px] border border-[#b9d6f8] bg-[#f7fbff] p-4 shadow-sm sm:p-6" aria-label="Review report before submission"><p className="text-xs font-bold uppercase tracking-[.14em] text-[#0064e0]">Step 2 of 2 · Review and confirm</p><h2 className="mt-1 text-xl font-bold text-[#0a1317]">Check every detail before it is stored.</h2><p className="mt-2 text-sm leading-6 text-[#5d6c7b]">You can still edit every field. Optional AI suggestions remain drafts and never choose priority.</p><dl className="mt-4 grid gap-2 sm:grid-cols-3"><div className="rounded-xl bg-white p-3"><dt className="text-xs font-bold text-[#718191]">Issue</dt><dd className="mt-1 text-sm font-semibold text-[#0a1317]">{draft.title}</dd></div><div className="rounded-xl bg-white p-3"><dt className="text-xs font-bold text-[#718191]">Category · locality</dt><dd className="mt-1 text-sm font-semibold text-[#0a1317]">{draft.category} · {draft.locality}</dd></div><div className="rounded-xl bg-white p-3"><dt className="text-xs font-bold text-[#718191]">Visibility</dt><dd className="mt-1 text-sm font-semibold text-[#0a1317]">{draft.visibility === "public" ? "Community post" : "Private report"}</dd></div></dl><div className="mt-4 grid gap-2 sm:grid-cols-2"><button type="button" onClick={() => { setReviewOpen(false); moveTo("report-composer"); }} className="min-h-11 rounded-xl border border-[#0064e0] px-4 text-sm font-bold text-[#0064e0] hover:bg-white">Edit report</button><button disabled={isSaving} onClick={createRecord} className="min-h-11 rounded-xl bg-[#0064e0] px-4 text-sm font-bold text-white hover:bg-[#0457cb] disabled:opacity-60">{isSaving ? "Submitting…" : "Confirm and submit"}</button></div></section>}
    <div id="workspace-detail">{selectedRecord && <CivicDetailScreen record={selectedRecord} onBack={() => navigateWorkspace("home")} onDiscuss={() => navigateWorkspace("home")} />}</div>
    <div id="workspace-explore">{activeScreen === "explore" && <CivicExploreScreen records={visibleRecords} onOpen={openRecord} onNotice={setNotice} />}</div>
    <div id="workspace-activity">{activeScreen === "activity" && <CivicActivityScreen notice={notice} records={visibleRecords} onOpen={openRecord} />}</div>
    <div id="workspace-profile">{activeScreen === "profile" && <CivicProfileScreen userName={user?.displayName || user?.email || "Citizen"} records={visibleRecords} onNotice={setNotice} />}</div>
    <CivicWorkspaceNav active={activeScreen} onSelect={navigateWorkspace} />
  </section></main>;
}
