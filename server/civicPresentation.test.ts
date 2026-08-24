import { describe, expect, it } from "vitest";
import { clusterMapRecords, filterMapRecords, sortByCivicEngagement, truthActionToVerification, validationPercent } from "../client/src/lib/civicPresentation";

const records = [
  { publicId: "JN-ONE", category: "water", priority: "urgent", locality: "Ward A", latitude: 22.72, longitude: 75.86, signals: { confirm: 7, dispute: 1, up: 3, down: 0 } },
  { publicId: "JN-TWO", category: "roads", priority: "high", locality: "Ward B", latitude: 22.78, longitude: 75.88, signals: { confirm: 2, dispute: 0, up: 1, down: 0 } },
  { publicId: "JN-THREE", category: "water", priority: "urgent", locality: "Ward A", latitude: 22.721, longitude: 75.861, signals: { confirm: 5, dispute: 4, up: 0, down: 1 } },
];

describe("civic presentation derivations", () => {
  it("returns zero validation when nobody has provided a true/not-true signal", () => expect(validationPercent(0, 0)).toBe(0));
  it("calculates a rounded true percentage from real community signals", () => expect(validationPercent(7, 1)).toBe(88));
  it("maps each visible truth-validation action to the stored verification response", () => {
    expect(truthActionToVerification("true")).toBe("confirm");
    expect(truthActionToVerification("not_true")).toBe("dispute");
    expect(truthActionToVerification("unable_to_verify")).toBe("unable_to_verify");
  });
  it("orders trending records by positive civic engagement without mutating input", () => { const ordered = sortByCivicEngagement(records); expect(ordered.map(item => item.publicId)).toEqual(["JN-ONE", "JN-THREE", "JN-TWO"]); expect(records[0].publicId).toBe("JN-ONE"); });
  it("applies category, priority, and locality filters together", () => expect(filterMapRecords(records, { category: "water", priority: "urgent", locality: "Ward A" }).map(item => item.publicId)).toEqual(["JN-ONE", "JN-THREE"]));
  it("groups nearby public points without returning exact-coordinate identifiers", () => { const clusters = clusterMapRecords(records); expect(clusters[0]).toMatchObject({ locality: "Ward A", count: 2, urgent: 2 }); expect(clusters[0].key).not.toContain("22.721"); });
});
