import type { IncomingMessage, ServerResponse } from "node:http";
import { verifyFirebaseGoogleIdToken } from "../server/firebaseIdentity";

const categories = ["Waste & sanitation", "Water", "Road safety", "Streetlight", "Other"] as const;
type Category = (typeof categories)[number];

function json(response: ServerResponse, status: number, payload: object) {
  response.statusCode = status;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.setHeader("Cache-Control", "no-store");
  response.end(JSON.stringify(payload));
}

async function readJson(request: IncomingMessage) {
  const chunks: Buffer[] = [];
  for await (const chunk of request) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  const raw = Buffer.concat(chunks).toString("utf8");
  return JSON.parse(raw || "{}");
}

function boundedText(value: unknown, minimum: number, maximum: number) {
  return typeof value === "string" && value.trim().length >= minimum && value.trim().length <= maximum ? value.trim() : null;
}

function safeModelResult(value: unknown) {
  const result = value && typeof value === "object" ? value as Record<string, unknown> : {};
  const category = categories.includes(result.category as Category) ? result.category as Category : "Other";
  const summary = typeof result.summary === "string" ? result.summary.trim().slice(0, 500) : "";
  const missingFields = Array.isArray(result.missingFields) ? result.missingFields.filter((field): field is string => typeof field === "string").slice(0, 5) : [];
  const confidence = result.confidence === "high" || result.confidence === "medium" ? result.confidence : "low";
  return { category, summary, missingFields, confidence, notice: "Optional editable drafting suggestion only; DRFI and civic decisions remain deterministic and human-reviewed." };
}

export default async function handler(request: IncomingMessage, response: ServerResponse) {
  if (request.method !== "POST") return json(response, 405, { error: "Use POST for civic drafting assistance." });
  const authHeader = request.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) return json(response, 401, { error: "Firebase authentication is required." });
  const endpoint = process.env.CIVIC_AI_ENDPOINT;
  if (!endpoint) return json(response, 503, { error: "AI Assist is not configured. Civic reporting remains fully available without it." });
  try {
    await verifyFirebaseGoogleIdToken(authHeader.slice("Bearer ".length));
    const body = await readJson(request);
    const title = boundedText(body.title, 8, 160);
    const description = boundedText(body.description, 20, 2_000);
    const locality = boundedText(body.locality, 2, 120);
    if (!title || !description || !locality) return json(response, 400, { error: "Provide a concise title, description, and locality." });
    const modelResponse = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(process.env.CIVIC_AI_API_KEY ? { Authorization: `Bearer ${process.env.CIVIC_AI_API_KEY}` } : {}) },
      body: JSON.stringify({
        model: process.env.CIVIC_AI_MODEL ?? "gemma-3-270m-it",
        task: "civic_draft_assist",
        constraints: { categories, noPriorityDecision: true, noStatusChange: true, output: "json" },
        report: { title, description, locality },
      }),
    });
    if (!modelResponse.ok) return json(response, 502, { error: "AI Assist did not return a usable drafting suggestion." });
    return json(response, 200, safeModelResult(await modelResponse.json()));
  } catch {
    return json(response, 503, { error: "AI Assist is temporarily unavailable. Your report is unchanged." });
  }
}
