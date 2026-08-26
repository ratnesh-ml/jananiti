import { describe, expect, it } from "vitest";
import { defaultDemoFactors } from "./browserLocalDemo";
import { getDrfiAdminRecommendation } from "./drfiTriage";

describe("deterministic DRFI administrator recommendation", () => {
  it("routes urgent scores to human safety review without changing the score", () => {
    const result = getDrfiAdminRecommendation({ ...defaultDemoFactors, demand: 100, populationImpact: 100, infrastructureGap: 100, riskUrgency: 100 });
    expect(result.band).toBe("Urgent");
    expect(result.queue).toBe("Immediate human safety review");
    expect(result.strongestFactors).toContain("community demand");
  });

  it("routes lower scores to evidence monitoring", () => {
    const result = getDrfiAdminRecommendation({ ...defaultDemoFactors, demand: 0, populationImpact: 0, infrastructureGap: 0, serviceAccess: 0, budgetFeasibility: 0, geospatialReality: 0, trendGrowth: 0, riskUrgency: 0 });
    expect(result.band).toBe("Low");
    expect(result.queue).toBe("Monitor and verify evidence");
  });
});
