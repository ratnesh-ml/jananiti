import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const rules = readFileSync(resolve(process.cwd(), "firestore.rules"), "utf8");

describe("Firestore zero-cost security boundary", () => {
  it("ends in a default-deny rule rather than keeping Firestore test mode open", () => {
    expect(rules).toContain('match /{document=**} {\n      allow read, write: if false;');
    expect(rules).not.toContain("allow read, write: if true");
  });

  it("keeps private civic records limited to the reporter or trusted administrator", () => {
    expect(rules).toContain('resource.data.visibility == "public"');
    expect(rules).toContain("resource.data.reporterUid == request.auth.uid");
    expect(rules).toContain("request.auth.token.admin == true");
  });

  it("prevents client-controlled role escalation and exposes no attachment rule", () => {
    expect(rules).toContain("request.resource.data.role == resource.data.role");
    expect(rules).not.toMatch(/match \/attachments\/[\s\S]*allow (?:read|write): if true/);
  });
});
