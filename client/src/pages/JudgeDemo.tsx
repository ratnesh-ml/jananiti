import { useMemo, useState } from "react";
import {
  BadgeCheck,
  CheckCircle2,
  ChevronRight,
  CircleGauge,
  FilePlus2,
  MapPinned,
  RefreshCcw,
  Send,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import {
  calculateDemoDrfi,
  defaultDemoFactors,
  demoStatusLabels,
  drfiFactorDefinitions,
  nextDemoStatus,
  type DemoDrfiFactors,
  type DemoStatus,
} from "@/lib/browserLocalDemo";
import EvidencePicker from "@/components/EvidencePicker";

type DemoIssue = {
  title: string;
  category: string;
  locality: string;
  visibility: "public" | "private";
  status: DemoStatus;
  evidenceName?: string;
};

type VerificationChoice = "confirm" | "dispute" | "unable_to_verify" | null;

const categoryOptions = ["Waste & sanitation", "Water", "Road safety", "Streetlight", "Other"];

function scoreTone(tone: ReturnType<typeof calculateDemoDrfi>["tone"]) {
  return {
    slate: "border-slate-200 bg-slate-50 text-slate-700",
    blue: "border-blue-200 bg-blue-50 text-blue-700",
    amber: "border-amber-200 bg-amber-50 text-amber-700",
    red: "border-red-200 bg-red-50 text-red-700",
  }[tone];
}

export default function JudgeDemo({ variant = "judge" }: { variant?: "judge" | "team" }) {
  const isTeamWorkspace = variant === "team";
  const [draft, setDraft] = useState<{ title: string; category: string; locality: string; visibility: "public" | "private" }>({ title: "", category: categoryOptions[0], locality: "", visibility: "public" });
  const [issue, setIssue] = useState<DemoIssue | null>(null);
  const [choice, setChoice] = useState<VerificationChoice>(null);
  const [evidence, setEvidence] = useState<File | null>(null);
  const [factors, setFactors] = useState<DemoDrfiFactors>(defaultDemoFactors);
  const priority = useMemo(() => calculateDemoDrfi(factors), [factors]);
  const canCreate = draft.title.trim().length >= 8 && draft.locality.trim().length >= 2;
  const followingStatus = issue ? nextDemoStatus(issue.status) : null;

  const reset = () => {
    setDraft({ title: "", category: categoryOptions[0], locality: "", visibility: "public" });
    setIssue(null);
    setChoice(null);
    setEvidence(null);
    setFactors(defaultDemoFactors);
  };

  return (
    <main className="min-h-screen bg-[#f6f8fb] px-4 py-6 text-[#102a43] sm:px-8 sm:py-10">
      <section className="mx-auto max-w-5xl">
        <div className="rounded-[2rem] bg-[#0c3f78] px-6 py-9 text-white shadow-xl sm:px-10">
          <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-[#a9daf9]">{isTeamWorkspace ? "JanaNiti · Team workspace" : "Code for Communities 2 · Interactive judge demo"}</p>
          <h1 className="mt-3 max-w-3xl text-3xl font-black leading-tight sm:text-5xl">{isTeamWorkspace ? "A shareable civic workspace your team can use together." : "From a local observation to accountable civic action."}</h1>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-[#d6ecff] sm:text-base">{isTeamWorkspace ? "Use the working report, community validation, deterministic DRFI, and coordinator workflow sandbox to explain the full JanaNiti product journey to teammates." : "Create one browser-local civic record, validate it, tune all eight explainable DRFI inputs, and move it through an accountable coordinator flow."}</p>
          <div className="mt-6 flex flex-wrap gap-3 text-xs font-bold">
            <span className="rounded-full bg-white/15 px-3 py-2">{isTeamWorkspace ? "Team-ready sandbox" : "No sign-in"}</span>
            <span className="rounded-full bg-white/15 px-3 py-2">No server calls</span>
            <span className="rounded-full bg-white/15 px-3 py-2">Resets on refresh</span>
            <span className="rounded-full bg-white/15 px-3 py-2">Explainable DRFI</span>
          </div>
        </div>

        <div className="mt-6 rounded-[1.4rem] border border-[#d5e3f0] bg-white p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#15935d]" />
            <p className="text-sm leading-6 text-[#55708a]"><strong className="text-[#173a59]">Judge-safe local demo.</strong> This is an interactive browser-local demonstration, not a live government service. It does not store submissions, show fabricated residents, or claim a live Firestore, Maps, AI, or coordinator integration.</p>
          </div>
        </div>

        <div className="mt-7 grid gap-5 lg:grid-cols-[1fr_1.15fr]">
          <section className="rounded-[1.6rem] border border-[#dce7f1] bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#e9f3ff] text-[#075eb7]"><FilePlus2 className="h-5 w-5" /></span><div><h2 className="font-black">1. Create a civic report</h2><p className="text-xs text-[#58728a]">The record exists only in this browser tab.</p></div></div>
            <div className="mt-5 grid gap-3">
              <label className="grid gap-1 text-xs font-bold text-[#3f5f7d]">Issue title
                <input value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} placeholder="e.g., Drain overflow near bus stop" className="rounded-xl border border-[#cdddea] bg-white px-3 py-2.5 text-sm outline-none ring-[#075eb7] focus:ring-2" />
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="grid gap-1 text-xs font-bold text-[#3f5f7d]">Category
                  <select value={draft.category} onChange={(event) => setDraft({ ...draft, category: event.target.value })} className="rounded-xl border border-[#cdddea] bg-white px-3 py-2.5 text-sm outline-none ring-[#075eb7] focus:ring-2">
                    {categoryOptions.map((option) => <option key={option}>{option}</option>)}
                  </select>
                </label>
                <label className="grid gap-1 text-xs font-bold text-[#3f5f7d]">Visibility
                  <select value={draft.visibility} onChange={(event) => setDraft({ ...draft, visibility: event.target.value as "public" | "private" })} className="rounded-xl border border-[#cdddea] bg-white px-3 py-2.5 text-sm outline-none ring-[#075eb7] focus:ring-2">
                    <option value="public">Public community record</option>
                    <option value="private">Private reporter record</option>
                  </select>
                </label>
              </div>
              <label className="grid gap-1 text-xs font-bold text-[#3f5f7d]">Locality or ward
                <input value={draft.locality} onChange={(event) => setDraft({ ...draft, locality: event.target.value })} placeholder="e.g., Ward 12" className="rounded-xl border border-[#cdddea] bg-white px-3 py-2.5 text-sm outline-none ring-[#075eb7] focus:ring-2" />
              </label>
              <EvidencePicker file={evidence} onChoose={setEvidence} onRemove={() => setEvidence(null)} maxSizeLabel="Local only" />
              <button disabled={!canCreate} onClick={() => { setIssue({ ...draft, title: draft.title.trim(), locality: draft.locality.trim(), status: "submitted", evidenceName: evidence?.name }); setChoice(null); }} className="mt-1 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#0064e0] px-4 py-3 text-sm font-extrabold text-white transition hover:bg-[#0457cb] active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-40 motion-reduce:transform-none"><Send className="h-4 w-4" />Create local demo record</button>
            </div>
          </section>

          <section className="rounded-[1.6rem] border border-[#dce7f1] bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#e9f3ff] text-[#075eb7]"><UsersRound className="h-5 w-5" /></span><div><h2 className="font-black">2. Community and coordinator flow</h2><p className="text-xs text-[#58728a]">Available after creating a browser-local record.</p></div></div>
            {!issue ? <div className="mt-6 rounded-2xl border border-dashed border-[#cdddea] bg-[#f8fbff] p-6 text-center text-sm text-[#627f98]">Create a record to unlock one local verification response and the lifecycle demonstration.</div> : <div className="mt-5">
              <div className="rounded-2xl bg-[#f8fbff] p-4">
                <div className="flex flex-wrap items-center justify-between gap-2"><span className="rounded-full bg-[#e5f2ff] px-2.5 py-1 text-xs font-extrabold text-[#075eb7]">{issue.category}</span><span className="rounded-full bg-white px-2.5 py-1 text-xs font-bold text-[#496882]">{issue.visibility === "public" ? "Public" : "Private"} · {issue.locality}</span></div>
                <h3 className="mt-3 font-black text-[#163956]">{issue.title}</h3>
                <p className="mt-1 text-sm text-[#55708a]">Current state: <strong>{demoStatusLabels[issue.status]}</strong></p>
                {issue.evidenceName && <p className="mt-2 rounded-xl bg-white px-2.5 py-2 text-xs font-bold text-[#496882]">Evidence selected locally: {issue.evidenceName}</p>}
              </div>
              <div className="mt-4"><p className="text-xs font-extrabold uppercase tracking-wide text-[#58728a]">Your one browser-local verification</p><div className="mt-2 grid gap-2 sm:grid-cols-3">
                {(["confirm", "dispute", "unable_to_verify"] as const).map((response) => <button key={response} disabled={choice !== null} onClick={() => setChoice(response)} className={`rounded-xl border px-3 py-2.5 text-xs font-extrabold transition ${choice === response ? "border-[#075eb7] bg-[#e9f3ff] text-[#075eb7]" : "border-[#cdddea] bg-white text-[#486780] hover:border-[#75aee5]"} disabled:cursor-not-allowed disabled:opacity-70`}>{response === "confirm" ? "Confirm" : response === "dispute" ? "Dispute" : "Unable to verify"}</button>)}
              </div>{choice && <p className="mt-2 text-xs font-bold text-[#15935d]">One response recorded for this browser session: {choice.replaceAll("_", " ")}.</p>}</div>
              <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-[#d7e6f3] p-3"><div><p className="text-xs font-extrabold uppercase tracking-wide text-[#58728a]">Coordinator lifecycle</p><p className="text-sm font-bold text-[#173a59]">{demoStatusLabels[issue.status]}</p></div>{followingStatus ? <button onClick={() => setIssue({ ...issue, status: followingStatus })} className="inline-flex items-center gap-1 rounded-xl bg-[#173a59] px-3 py-2 text-xs font-extrabold text-white">Advance to {demoStatusLabels[followingStatus]}<ChevronRight className="h-4 w-4" /></button> : <span className="inline-flex items-center gap-1 text-xs font-extrabold text-[#15935d]"><BadgeCheck className="h-4 w-4" />Resolved</span>}</div>
            </div>}
          </section>
        </div>

        <section className="mt-7 rounded-[1.6rem] border border-[#dce7f1] bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#e9f3ff] text-[#075eb7]"><CircleGauge className="h-5 w-5" /></span><div><h2 className="font-black">3. Tune explainable DRFI inputs</h2><p className="text-xs text-[#58728a]">Eight editable inputs use the documented deterministic weights. This is a demonstration calculation, not a live civic decision.</p></div></div><span className={`rounded-full border px-3 py-2 text-sm font-black ${scoreTone(priority.tone)}`}>{priority.score}/100 · {priority.band}</span></div>
          <div className="mt-5 grid gap-x-6 gap-y-4 md:grid-cols-2">
            {drfiFactorDefinitions.map((factor) => <label key={factor.key} className="grid gap-1.5"><span className="flex items-center justify-between text-xs font-bold text-[#3f5f7d]"><span>{factor.label} <span className="font-normal text-[#6c859c]">× {factor.weight.toFixed(2)}</span></span><span>{factors[factor.key]}</span></span><input type="range" min="0" max="100" value={factors[factor.key]} onChange={(event) => setFactors({ ...factors, [factor.key]: Number(event.target.value) })} className="accent-[#075eb7]" /></label>)}
          </div>
        </section>

        <section className="mt-7 flex flex-col gap-4 rounded-[1.6rem] border border-[#d3ede1] bg-[#f1fbf6] p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3"><MapPinned className="mt-0.5 h-5 w-5 shrink-0 text-[#0d6040]" /><p className="text-sm leading-6 text-[#356a55]"><strong>Privacy boundary:</strong> this Vercel demo does not request a device location, render a real map, notify people, or save any data. Refreshing the page clears the browser-local record.</p></div>
          <button onClick={reset} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-[#a9dcca] bg-white px-4 py-3 text-sm font-extrabold text-[#0d6040] hover:bg-[#e7f8ef]"><RefreshCcw className="h-4 w-4" />Reset demo</button>
        </section>
        <div className="mt-6 flex items-center justify-center gap-2 text-xs font-bold text-[#69839a]"><CheckCircle2 className="h-4 w-4 text-[#15935d]" />Built for public evaluation without a login or private data.</div>
      </section>
    </main>
  );
}
