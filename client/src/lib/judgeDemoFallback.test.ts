import { describe, expect, it } from "vitest";
import { shouldRenderStaticJudgeDemo } from "./judgeDemoFallback";

describe("Vercel judge-demo fallback", () => {
  it("makes the approved Vercel host immediately judge-readable", () => {
    expect(shouldRenderStaticJudgeDemo("jananiti009.vercel.app", "/")).toBe(true);
  });

  it("keeps the explicit judge route public on every host", () => {
    expect(shouldRenderStaticJudgeDemo("localhost", "/judge-demo")).toBe(true);
  });

  it("does not replace ordinary routes on other hosts", () => {
    expect(shouldRenderStaticJudgeDemo("localhost", "/signin")).toBe(false);
  });
});
