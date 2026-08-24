import { describe, expect, it } from "vitest";
import { calculateDrfi } from "./drfiMath";

describe("calculateDrfi", () => {
  it("applies the documented factor weights", () => {
    expect(calculateDrfi({ demand: 100, populationImpact: 100, infrastructureGap: 100, serviceAccess: 100, budgetFeasibility: 100, geospatialReality: 100, trendGrowth: 100, riskUrgency: 100 })).toEqual({ score: 100, priority: "urgent" });
  });

  it("maps score thresholds to review priorities", () => {
    expect(calculateDrfi({ demand: 0, populationImpact: 0, infrastructureGap: 0, serviceAccess: 0, budgetFeasibility: 0, geospatialReality: 0, trendGrowth: 0, riskUrgency: 0 }).priority).toBe("low");
    expect(calculateDrfi({ demand: 50, populationImpact: 50, infrastructureGap: 50, serviceAccess: 50, budgetFeasibility: 50, geospatialReality: 50, trendGrowth: 50, riskUrgency: 50 })).toEqual({ score: 50, priority: "standard" });
  });
});
