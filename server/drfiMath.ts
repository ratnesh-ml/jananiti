import type { CivicPriority } from "../drizzle/schema";

export type DrfiFactors = {
  demand: number; populationImpact: number; infrastructureGap: number; serviceAccess: number;
  budgetFeasibility: number; geospatialReality: number; trendGrowth: number; riskUrgency: number;
};

export function calculateDrfi(factors: DrfiFactors): { score: number; priority: CivicPriority } {
  const score = Math.round(factors.demand * .20 + factors.populationImpact * .15 + factors.infrastructureGap * .15 + factors.serviceAccess * .10 + factors.budgetFeasibility * .10 + factors.geospatialReality * .10 + factors.trendGrowth * .10 + factors.riskUrgency * .10);
  const priority: CivicPriority = score >= 75 ? "urgent" : score >= 55 ? "high" : score >= 30 ? "standard" : "low";
  return { score, priority };
}
