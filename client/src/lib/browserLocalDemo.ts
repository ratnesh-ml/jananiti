export type DemoStatus = "submitted" | "acknowledged" | "assigned" | "in_progress" | "resolved";

export type DemoVisibility = "public" | "private";
export type DemoReaction = "support" | "concern" | null;
export type DemoVerification = "confirm" | "dispute" | "unable_to_verify" | null;

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

export type DemoIssue = {
  id: string;
  title: string;
  description: string;
  category: string;
  locality: string;
  visibility: DemoVisibility;
  status: DemoStatus;
  createdAt: number;
  evidenceName?: string;
  reaction: DemoReaction;
  verification: DemoVerification;
  comments: string[];
  latitude: null;
  longitude: null;
};

export type DemoIssueDraft = Pick<DemoIssue, "title" | "description" | "category" | "locality" | "visibility"> & {
  evidenceName?: string;
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

export const demoStatusSequence: DemoStatus[] = ["submitted", "acknowledged", "assigned", "in_progress", "resolved"];

export function nextDemoStatus(status: DemoStatus): DemoStatus | null {
  const index = demoStatusSequence.indexOf(status);
  return index === demoStatusSequence.length - 1 ? null : demoStatusSequence[index + 1];
}

export function createDemoIssue(draft: DemoIssueDraft, timestamp = Date.now()): DemoIssue {
  return {
    id: `local-${timestamp}`,
    title: draft.title.trim(),
    description: draft.description.trim(),
    category: draft.category,
    locality: draft.locality.trim(),
    visibility: draft.visibility,
    status: "submitted",
    createdAt: timestamp,
    evidenceName: draft.evidenceName,
    reaction: null,
    verification: null,
    comments: [],
    latitude: null,
    longitude: null,
  };
}

export function buildQaWalkthroughIssue(timestamp = Date.now()): DemoIssue {
  return createDemoIssue({
    title: "Browser-local QA walkthrough — no civic claim",
    description: "This carefully labelled browser-local walkthrough item demonstrates the report, discussion, verification, timeline, and privacy controls. It is not a report of a real civic condition.",
    category: "Other",
    locality: "Demo locality (non-geographic)",
    visibility: "public",
  }, timestamp);
}

export function toggleDemoReaction(issue: DemoIssue, reaction: Exclude<DemoReaction, null>): DemoIssue {
  return { ...issue, reaction: issue.reaction === reaction ? null : reaction };
}

export function recordDemoVerification(issue: DemoIssue, verification: Exclude<DemoVerification, null>): DemoIssue {
  return issue.verification ? issue : { ...issue, verification };
}

export function appendDemoComment(issue: DemoIssue, comment: string): DemoIssue {
  const trimmed = comment.trim().slice(0, 280);
  return trimmed ? { ...issue, comments: [...issue.comments, trimmed] } : issue;
}

export function canMapDemoIssue(issue: Pick<DemoIssue, "latitude" | "longitude">) {
  return Number.isFinite(issue.latitude) && Number.isFinite(issue.longitude);
}
