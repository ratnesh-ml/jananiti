import { useAuth } from "@/_core/hooks/useAuth";
import CivicHeader, { CivicFooter, JananitiMark } from "@/components/CivicHeader";
import { startLogin } from "@/const";
import { ArrowRight, CheckCircle2, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { isFirebaseFreeStageConfigured } from "@/lib/firebase/config";
import { signInWithFirebaseGoogle } from "@/lib/firebase/auth";
import { useState } from "react";
import { Link } from "wouter";

export default function SignIn() {
  const { user, loading } = useAuth();
  const [googlePending, setGooglePending] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);
  const startFirebaseGoogleSignIn = async () => {
    setGoogleError(null);
    setGooglePending(true);
    try {
      await signInWithFirebaseGoogle();
      window.location.assign("/");
    } catch (error) {
      setGoogleError(error instanceof Error ? error.message : "Google Sign-In could not be completed.");
    } finally {
      setGooglePending(false);
    }
  };
  return <div className="min-h-screen bg-[#f7fafc]"><CivicHeader /><main className="container py-10 sm:py-16"><div className="mx-auto grid max-w-5xl overflow-hidden rounded-[34px] border border-[#dce8f3] bg-white shadow-[0_18px_60px_rgba(25,69,107,.1)] lg:grid-cols-[1.05fr_.95fr]"><section className="bg-gradient-to-br from-[#153f69] to-[#0e5bb7] p-7 text-white sm:p-10"><JananitiMark compact /><p className="mt-14 text-xs font-black uppercase tracking-[.17em] text-[#9ee3da]">Your city. Your voice. Real change.</p><h1 className="mt-4 text-4xl font-black tracking-[-.065em] sm:text-5xl">One place for the issues that shape daily life.</h1><p className="mt-5 max-w-md text-sm leading-7 text-[#c9deed]">Report, follow, and respectfully verify public civic records. Your name is never displayed on a public report.</p><div className="mt-10 space-y-3">{["Private identity; public accountability", "Clear status history and community context", "Human-reviewed priority and resolution"].map(point => <p key={point} className="flex items-center gap-2 text-sm font-bold text-[#e4f1f7]"><CheckCircle2 className="h-4 w-4 text-[#9ee3da]" />{point}</p>)}</div></section><section className="p-7 sm:p-10"><p className="eyebrow">Welcome to Jananiti</p><h2 className="mt-3 text-3xl font-black tracking-[-.05em] text-[#17365d]">Sign in to make your local activity count.</h2><p className="mt-3 text-sm leading-6 text-[#6a829a]">Use Google Sign-In to publish reports, receive personal updates, and verify eligible local records.</p>{!loading && user ? <div className="mt-7 rounded-2xl border border-[#cde9e5] bg-[#effaf8] p-5"><p className="text-sm font-black text-[#315474]">You are already signed in.</p><p className="mt-1 text-sm text-[#5f827c]">Continue to your personal civic space or explore the local feed.</p><div className="mt-4 grid gap-3 sm:grid-cols-2"><Link href="/me" className="rounded-xl bg-[#0e5bb7] px-4 py-3 text-center text-sm font-extrabold text-white">My space</Link><Link href="/activity" className="rounded-xl border border-[#bcd7ec] px-4 py-3 text-center text-sm font-extrabold text-[#0e5bb7]">Local feed</Link></div></div> : <><button type="button" disabled={!isFirebaseFreeStageConfigured || googlePending} onClick={startFirebaseGoogleSignIn} className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-[#0e5bb7] px-5 py-3.5 text-sm font-extrabold text-white shadow-[0_10px_22px_rgba(14,91,183,.22)] hover:bg-[#0a4b98] disabled:cursor-not-allowed disabled:opacity-60"><ShieldCheck className="h-4 w-4" />{googlePending ? "Opening Google…" : "Continue with Google"}<ArrowRight className="h-4 w-4" /></button>{googleError && <p role="alert" className="mt-3 rounded-xl border border-[#f3c8c8] bg-[#fff4f4] px-4 py-3 text-xs font-semibold leading-5 text-[#a23d3d]">{googleError}</p>}<button type="button" onClick={startLogin} className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-[#bcd7ec] px-5 py-3 text-sm font-extrabold text-[#0e5bb7] hover:bg-[#f4f9fd]"><LockKeyhole className="h-4 w-4" />Use existing development sign-in</button><div className="mt-4 rounded-2xl border border-[#dbe7f1] bg-[#f8fbfe] p-4"><div className="flex items-start gap-3"><Mail className="mt-0.5 h-4 w-4 shrink-0 text-[#0e5bb7]" /><div><p className="text-sm font-black text-[#315474]">Google identity, same civic account model</p><p className="mt-1 text-xs leading-5 text-[#6d859d]">A verified Firebase Google identity starts a Jananiti session. Firestore remains in its guarded migration stage; no test-mode civic data is exposed.</p></div></div></div></>}</section></div></main><CivicFooter /></div>;
}
