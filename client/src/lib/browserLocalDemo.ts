export type DemoStatus = "submitted" | "acknowledged" | "assigned" | "in_progress" | "resolved";

export type DemoDrfiFactors = {
  demand: number;
  populationImpact: number;
  infrastructureGap: number;
  serviceAccess: number;
  budgetFeasibility: number;
  geospatialReality: number;
  trendGrowth: number;
  riskUrgency: number;
};

export const defaultDemoFactors: DemoDrfiFactors = {
  demand: 50,
  populationImpact: 50,
  infrastructureGap: 50,
  serviceAccess: 50,
  budgetFeasibility: 50,
  geospatialReality: 50,
  trendGrowth: 50,
  riskUrgency: 50,
};

export const drfiFactorDefinitions: Array<{
  key: keyof DemoDrfiFactors;
  label: string;
  weight: number;
}> = [
  { key: "demand", label: "Community demand", weight: 0.2 },
  { key: "populationImpact", label: "Population impact", weight: 0.15 },
  { key: "infrastructureGap", label: "Infrastructure gap", weight: 0.15 },
  { key: "serviceAccess", label: "Service access gap", weight: 0.1 },
  { key: "budgetFeasibility", label: "Budget feasibility", weight: 0.1 },
  { key: "geospatialReality", label: "Geospatial reality", weight: 0.1 },
  { key: "trendGrowth", label: "Trend growth", weight: 0.1 },
  { key: "riskUrgency", label: "Risk urgency", weight: 0.1 },
];

export function calculateDemoDrfi(factors: DemoDrfiFactors) {
  const score = drfiFactorDefinitions.reduce((total, factor) => total + factors[factor.key] * factor.weight, 0);
  const roundedScore = Math.round(score);
  if (roundedScore < 30) return { score: roundedScore, band: "Low" as const, tone: "slate" as const };
  if (roundedScore < 55) return { score: roundedScore, band: "Standard" as const, tone: "blue" as const };
  if (roundedScore < 75) return { score: roundedScore, band: "High" as const, tone: "amber" as const };
  return { score: roundedScore, band: "Urgent" as const, tone: "red" as const };
}

export const demoStatusLabels: Record<DemoStatus, string> = {
  submitted: "Submitted",
  acknowledged: "Acknowledged",
  assigned: "Assigned",
  in_progress: "In progress",
  resolved: "Resolved",
};

export function nextDemoStatus(status: DemoStatus): DemoStatus | null {
  const sequence: DemoStatus[] = ["submitted", "acknowledged", "assigned", "in_progress", "resolved"];
  const index = sequence.indexOf(status);
  return index === sequence.length - 1 ? null : sequence[index + 1];
}
