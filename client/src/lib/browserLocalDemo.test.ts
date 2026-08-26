import { describe, expect, it } from "vitest";
import {
  appendDemoComment,
  buildQaWalkthroughIssue,
  calculateDemoDrfi,
  createDemoIssue,
  nextDemoStatus,
  recordDemoVerification,
  toggleDemoReaction,
  type DemoDrfiFactors,
} from "./browserLocalDemo";

const factors = (value: number): DemoDrfiFactors => ({
  demand: value,
  populationImpact: value,
  infrastructureGap: value,
  serviceAccess: value,
  budgetFeasibility: value,
  geospatialReality: value,
  trendGrowth: value,
  riskUrgency: value,
});

describe("browser-local civic demo", () => {
  it("uses all eight visible factors in a deterministic DRFI score", () => {
    expect(calculateDemoDrfi(factors(50))).toMatchObject({ score: 50, band: "Standard" });
  });

  it("maps high input values to the published urgent threshold", () => {
    expect(calculateDemoDrfi(factors(80))).toMatchObject({ score: 80, band: "Urgent" });
  });

  it("only permits forward browser-local lifecycle movement", () => {
    expect(nextDemoStatus("submitted")).toBe("acknowledged");
    expect(nextDemoStatus("resolved")).toBeNull();
  });

  it("creates a clearly labelled browser-local QA walkthrough without coordinates", () => {
    const issue = buildQaWalkthroughIssue(42);
    expect(issue.id).toBe("local-42");
    expect(issue.title).toContain("no civic claim");
    expect(issue.visibility).toBe("public");
    expect(issue.latitude).toBeNull();
    expect(issue.longitude).toBeNull();
  });

  it("keeps local social and verification actions bounded per demo item", () => {
    const issue = createDemoIssue({ title: "Demo road note", description: "A browser-local demonstration record only.", category: "Other", locality: "Demo ward", visibility: "public" }, 7);
    const supported = toggleDemoReaction(issue, "support");
    const confirmed = recordDemoVerification(supported, "confirm");
    const unchangedVerification = recordDemoVerification(confirmed, "dispute");
    const commented = appendDemoComment(unchangedVerification, "Constructive local QA note.");

    expect(supported.reaction).toBe("support");
    expect(confirmed.verification).toBe("confirm");
    expect(unchangedVerification.verification).toBe("confirm");
    expect(commented.comments).toEqual(["Constructive local QA note."]);
  });
});
