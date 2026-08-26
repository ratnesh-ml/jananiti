import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const rules = readFileSync(resolve(process.cwd(), "storage.rules"), "utf8");

describe("Firebase Storage rules", () => {
  it("limits civic uploads to their reporter-owned path and supported evidence", () => {
    expect(rules).toContain("request.auth.uid == userId");
    expect(rules).toContain("request.resource.size <= 10 * 1024 * 1024");
    expect(rules).toContain("(image|audio|video)/.*|application/pdf|text/plain");
  });

  it("defaults all unspecified object access to deny", () => {
    expect(rules).toContain("allow read, write: if false;");
  });
});
