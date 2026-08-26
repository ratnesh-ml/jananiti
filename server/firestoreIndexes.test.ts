import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const indexes = JSON.parse(readFileSync(resolve(process.cwd(), "firestore.indexes.json"), "utf8")) as {
  indexes: Array<{ fields: Array<{ fieldPath: string; order: string }> }>;
};

describe("Firestore civic-feed indexes", () => {
  it("supports newest-first public and reporter-owned feed queries", () => {
    const keysets = indexes.indexes.map((entry) => entry.fields.map((field) => `${field.fieldPath}:${field.order}`).join(","));
    expect(keysets).toContain("visibility:ASCENDING,createdAt:DESCENDING");
    expect(keysets).toContain("reporterUid:ASCENDING,createdAt:DESCENDING");
  });
});
