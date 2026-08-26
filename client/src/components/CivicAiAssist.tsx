import { requestCivicAiAssist, type CivicAiAssistResult } from "@/lib/civicAiAssist";
import type { User } from "firebase/auth";
import { Sparkles } from "lucide-react";
import { useState } from "react";

type Props = {
  user: User | null;
  title: string;
  description: string;
  locality: string;
  onApplyCategory: (category: CivicAiAssistResult["category"]) => void;
};

export default function CivicAiAssist({ user, title, description, locality, onApplyCategory }: Props) {
  const [result, setResult] = useState<CivicAiAssistResult | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const runAssist = async () => {
    if (!user) {
      setError("Sign in before requesting an optional drafting suggestion.");
      return;
    }
    if (title.trim().length < 8 || description.trim().length < 20 || locality.trim().length < 2) {
      setError("Add a title, description, and locality before requesting a drafting suggestion.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      setResult(await requestCivicAiAssist({ token: await user.getIdToken(), title, description, locality }));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "AI Assist is unavailable.");
    } finally {
      setLoading(false);
    }
  };

  return <aside className="rounded-2xl border border-[#dbe8f8] bg-[#f7fbff] p-3 text-sm"><div className="flex items-start gap-2"><Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-[#0064e0]" /><div><p className="font-bold text-[#183a63]">Optional AI drafting assist</p><p className="mt-0.5 text-xs leading-5 text-[#5d6c7b]">Suggests a category and missing details only. It never publishes, verifies, prioritises, or changes DRFI.</p></div></div><button type="button" onClick={runAssist} disabled={loading} className="mt-3 min-h-10 rounded-xl border border-[#b9d6f8] bg-white px-3 text-xs font-bold text-[#0064e0] transition hover:bg-[#eaf4ff] disabled:opacity-60">{loading ? "Checking draft…" : "Improve this draft"}</button>{error && <p className="mt-2 text-xs leading-5 text-[#a91f34]">{error}</p>}{result && <div className="mt-3 rounded-xl border border-[#d9e8f8] bg-white p-3 text-xs leading-5 text-[#40505f]"><p><strong>Suggested category:</strong> {result.category} <span className="text-[#718191]">({result.confidence} confidence)</span></p>{result.summary && <p className="mt-1"><strong>Draft summary:</strong> {result.summary}</p>}{result.missingFields.length > 0 && <p className="mt-1"><strong>Consider adding:</strong> {result.missingFields.join(", ")}</p>}<div className="mt-2 flex flex-wrap items-center gap-2"><button type="button" onClick={() => onApplyCategory(result.category)} className="rounded-lg bg-[#0a1317] px-2.5 py-1.5 text-xs font-bold text-white">Use category</button><span className="text-[#718191]">{result.notice}</span></div></div>}</aside>;
}
