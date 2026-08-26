import { calculateDemoDrfi, drfiFactorDefinitions, type DemoDrfiFactors } from "./browserLocalDemo";

export function getDrfiAdminRecommendation(factors: DemoDrfiFactors) {
  const priority = calculateDemoDrfi(factors);
  const strongestFactors = [...drfiFactorDefinitions]
    .sort((left, right) => factors[right.key] - factors[left.key])
    .slice(0, 2)
    .map((factor) => factor.label.toLowerCase());
  const queue = priority.band === "Urgent" ? "Immediate human safety review" : priority.band === "High" ? "Priority queue review" : priority.band === "Standard" ? "Standard service queue" : "Monitor and verify evidence";
  const nextAction = priority.band === "Urgent" ? "Check risk evidence and assign an accountable coordinator after review." : "Review the two strongest DRFI inputs and confirm the evidence before routing.";
  return { ...priority, queue, strongestFactors, nextAction };
}
