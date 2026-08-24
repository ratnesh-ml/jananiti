import { describe, expect, it } from "vitest";
import { calculateDemoDrfi, nextDemoStatus, type DemoDrfiFactors } from "./browserLocalDemo";

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
});
