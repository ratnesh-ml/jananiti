import { Link } from "wouter";
import { ArrowRight, CheckCircle2, CircleGauge, FilePlus2, MapPinned, ShieldCheck, UsersRound } from "lucide-react";

const steps = [
  { icon: FilePlus2, title: "1. Report in under a minute", body: "Capture text, photo, short video, voice, or document evidence; choose automatic or manual locality; then review before submitting.", href: "/report", label: "Open reporter" },
  { icon: UsersRound, title: "2. Let the locality validate", body: "Public reports enter the local community feed, where nearby citizens can confirm, dispute, or discuss the record without exposing exact resident location.", href: "/", label: "Open community feed" },
  { icon: CircleGauge, title: "3. Show transparent priority", body: "DRFI combines eight documented civic factors into a deterministic priority band. It is explainable and remains subject to human review.", href: "/priorities", label: "Open DRFI workspace" },
  { icon: MapPinned, title: "4. Find patterns without overexposure", body: "The locality map uses intentionally shared public coordinates and a privacy-safe fallback until a restricted Google Maps key is configured.", href: "/heatmap", label: "Open locality map" },
  { icon: ShieldCheck, title: "5. Move from signal to action", body: "Role-gated coordinators can assign, update, and resolve civic records through valid lifecycle guardrails.", href: "/operations", label: "Open coordinator view" },
];

export default function JudgeDemo() {
  return (
    <main className="min-h-screen bg-[#f6f8fb] px-4 py-8 text-[#102a43] sm:px-8">
      <section className="mx-auto max-w-4xl">
        <div className="rounded-[2rem] bg-[#0c3f78] px-6 py-9 text-white shadow-xl sm:px-10">
          <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-[#a9daf9]">Code for Communities 2 · Judge walkthrough</p>
          <h1 className="mt-3 max-w-2xl text-3xl font-black leading-tight sm:text-5xl">From a local observation to accountable civic action.</h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-[#d6ecff] sm:text-base">JanaNiti connects citizens, community verification, explainable DRFI priority, locality discovery, and coordinator action in one mobile-first civic flow.</p>
          <div className="mt-6 flex flex-wrap gap-3 text-xs font-bold">
            <span className="rounded-full bg-white/15 px-3 py-2">Evidence-led reporting</span>
            <span className="rounded-full bg-white/15 px-3 py-2">Community validation</span>
            <span className="rounded-full bg-white/15 px-3 py-2">Explainable DRFI</span>
            <span className="rounded-full bg-white/15 px-3 py-2">Google-native roadmap</span>
          </div>
        </div>

        <div className="mt-7 rounded-[1.6rem] border border-[#d5e3f0] bg-white p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#15935d]" />
            <div>
              <h2 className="font-black">How to judge the prototype</h2>
              <p className="mt-1 text-sm leading-6 text-[#55708a]">Use the sequence below. Public discovery pages can be viewed first; reporting and coordinator operations use the secure sign-in path. The app does not invent community activity or claim unconfigured Google services as live.</p>
            </div>
          </div>
        </div>

        <div className="mt-7 grid gap-4">
          {steps.map(({ icon: Icon, title, body, href, label }) => (
            <article key={title} className="flex flex-col gap-4 rounded-[1.5rem] border border-[#dce7f1] bg-white p-5 shadow-sm sm:flex-row sm:items-center">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#e9f3ff] text-[#075eb7]"><Icon className="h-6 w-6" /></div>
              <div className="min-w-0 flex-1"><h2 className="font-black text-[#102a43]">{title}</h2><p className="mt-1 text-sm leading-6 text-[#58728a]">{body}</p></div>
              <Link href={href} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#075eb7] px-4 py-3 text-sm font-extrabold text-white transition hover:bg-[#064f9d] active:scale-[.98]">{label}<ArrowRight className="h-4 w-4" /></Link>
            </article>
          ))}
        </div>

        <section className="mt-7 rounded-[1.6rem] border border-[#d3ede1] bg-[#f1fbf6] p-5">
          <h2 className="font-black text-[#0d6040]">Responsible Google technology plan</h2>
          <p className="mt-2 text-sm leading-6 text-[#356a55]">Firebase Authentication, Firestore, Cloud Storage, Cloud Run, FCM, Maps Platform, App Check, Cloud Logging, and Vertex AI are the target production stack. Vertex AI is limited to editable draft triage; deterministic DRFI and coordinator review remain authoritative.</p>
        </section>
      </section>
    </main>
  );
}
