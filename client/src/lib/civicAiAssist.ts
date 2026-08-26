export const civicAiCategories = ["Waste & sanitation", "Water", "Road safety", "Streetlight", "Other"] as const;
export type CivicAiCategory = (typeof civicAiCategories)[number];

export type CivicAiAssistResult = {
  category: CivicAiCategory;
  summary: string;
  missingFields: string[];
  confidence: "low" | "medium" | "high";
  notice: string;
};

export function normaliseCivicAiAssistResult(value: unknown): CivicAiAssistResult {
  if (!value || typeof value !== "object") throw new Error("AI Assist returned an invalid response.");
  const record = value as Record<string, unknown>;
  const category = civicAiCategories.includes(record.category as CivicAiCategory) ? record.category as CivicAiCategory : "Other";
  const summary = typeof record.summary === "string" ? record.summary.trim().slice(0, 500) : "";
  const missingFields = Array.isArray(record.missingFields) ? record.missingFields.filter((field): field is string => typeof field === "string").slice(0, 5) : [];
  const confidence = record.confidence === "high" || record.confidence === "medium" ? record.confidence : "low";
  const notice = typeof record.notice === "string" ? record.notice : "AI suggestions are optional and never change priority or report status.";
  return { category, summary, missingFields, confidence, notice };
}

export async function requestCivicAiAssist(input: { token: string; title: string; description: string; locality: string }) {
  const response = await fetch("/api/civic-ai-assist", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${input.token}` },
    body: JSON.stringify({ title: input.title.trim(), description: input.description.trim(), locality: input.locality.trim() }),
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) throw new Error(typeof payload?.error === "string" ? payload.error : "AI Assist is unavailable.");
  return normaliseCivicAiAssistResult(payload);
}
