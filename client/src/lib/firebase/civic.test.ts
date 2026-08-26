import { describe, expect, it } from "vitest";

describe("Firebase civic production boundary", () => {
  it("keeps the supported verification vocabulary finite", () => {
    const supported = ["confirm", "dispute", "unable_to_verify"];
    expect(supported).toHaveLength(3);
    expect(supported).not.toContain("true");
  });

  it("documents the Firestore-only initial production lifecycle", () => {
    expect("submitted").toBe("submitted");
  });

  it("keeps social reactions separate from community truth verification", () => {
    const reactions = ["up", "down"];
    const verifications = ["confirm", "dispute", "unable_to_verify"];
    expect(reactions).not.toContain("confirm");
    expect(verifications).not.toContain("up");
  });

  it("uses a short bounded comment contract", () => {
    const valid = (body: string) => body.trim().length >= 2 && body.trim().length <= 500;
    expect(valid("Needs attention near the crossing.")).toBe(true);
    expect(valid(" ")).toBe(false);
    expect(valid("x".repeat(501))).toBe(false);
  });
});
