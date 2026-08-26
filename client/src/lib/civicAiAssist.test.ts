import { describe, expect, it } from "vitest";
import { normaliseCivicAiAssistResult } from "./civicAiAssist";

describe("civic AI assist response guard", () => {
  it("keeps suggestions inside JanaNiti's allowed report categories", () => {
    expect(normaliseCivicAiAssistResult({ category: "Water", summary: "Leak at standpost", missingFields: [], confidence: "high" }).category).toBe("Water");
    expect(normaliseCivicAiAssistResult({ category: "Urgent", summary: "", missingFields: [], confidence: "high" }).category).toBe("Other");
  });

  it("does not accept an unbounded model response", () => {
    const result = normaliseCivicAiAssistResult({ category: "Other", summary: "x".repeat(700), missingFields: ["landmark", 7], confidence: "invalid" });
    expect(result.summary).toHaveLength(500);
    expect(result.missingFields).toEqual(["landmark"]);
    expect(result.confidence).toBe("low");
  });
});
