import { describe, expect, it } from "vitest";
import { getCivicLifecycle, getTestOnlyCivicRecords, isPrimaryLaunchHost } from "./firebaseWorkspacePresentation";

describe("Firebase workspace presentation", () => {
  it("marks exactly one truthful current lifecycle stage", () => {
    const timeline = getCivicLifecycle("in_progress");
    expect(timeline.filter((step) => step.state === "current")).toHaveLength(1);
    expect(timeline.find((step) => step.state === "current")?.key).toBe("in_progress");
    expect(timeline.find((step) => step.key === "resolved")?.state).toBe("pending");
  });

  it("shows synthetic records only in test or local development environments", () => {
    expect(getTestOnlyCivicRecords("production", false)).toEqual([]);
    expect(getTestOnlyCivicRecords("test", false)).toHaveLength(2);
    expect(getTestOnlyCivicRecords("production", true)[0].isSyntheticTestRecord).toBe(true);
  });

  it("uses the launch-facing presentation only on the primary public Vercel host", () => {
    expect(isPrimaryLaunchHost("jananiti-team.vercel.app")).toBe(true);
    expect(isPrimaryLaunchHost("jananiti-fspr6tck.manus.space")).toBe(false);
    expect(isPrimaryLaunchHost("jananiti009.vercel.app")).toBe(false);
  });
});
