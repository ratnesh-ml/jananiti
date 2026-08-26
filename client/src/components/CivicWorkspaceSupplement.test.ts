import { describe, expect, it } from "vitest";
import { filterCivicWorkspaceRecords, type CivicWorkspaceRecord } from "./CivicWorkspaceSupplement";

const records: CivicWorkspaceRecord[] = [
  {
    id: "public-water",
    title: "Water supply QA walkthrough",
    description: "A clearly labelled test record for safe workspace search.",
    category: "Water",
    locality: "Demo Ward",
    status: "submitted",
  },
  {
    id: "private-road",
    title: "Private road note",
    description: "A private account-visible report.",
    category: "Road safety",
    locality: "North Ward",
    status: "in_progress",
  },
];

describe("accessible civic-record search", () => {
  it("matches title, description, locality, category, and stored status without case sensitivity", () => {
    expect(filterCivicWorkspaceRecords(records, "water")).toHaveLength(1);
    expect(filterCivicWorkspaceRecords(records, "DEMO ward")[0]?.id).toBe("public-water");
    expect(filterCivicWorkspaceRecords(records, "in progress")[0]?.id).toBe("private-road");
  });

  it("preserves all accessible records for a blank query and returns an explicit empty result for no matches", () => {
    expect(filterCivicWorkspaceRecords(records, "   ")).toHaveLength(2);
    expect(filterCivicWorkspaceRecords(records, "unmatched locality")).toEqual([]);
  });
});
