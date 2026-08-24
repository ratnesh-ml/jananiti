import type { CivicStatus } from "../drizzle/schema";

export const civicStatusLabels: Record<CivicStatus, string> = {
  submitted: "Submitted",
  acknowledged: "Acknowledged",
  assigned: "Assigned",
  in_progress: "In progress",
  resolved: "Resolved",
  closed: "Closed",
};

const allowedTransitions: Record<CivicStatus, CivicStatus[]> = {
  submitted: ["acknowledged", "assigned", "closed"],
  acknowledged: ["assigned", "in_progress", "closed"],
  assigned: ["in_progress", "resolved", "closed"],
  in_progress: ["resolved", "assigned", "closed"],
  resolved: ["closed", "in_progress"],
  closed: ["in_progress"],
};

export function canTransitionCivicStatus(
  from: CivicStatus,
  to: CivicStatus
): boolean {
  return from === to || allowedTransitions[from].includes(to);
}

export function statusNotificationTitle(status: CivicStatus): string {
  if (status === "resolved") return "Your civic request has been resolved";
  return `Request status: ${civicStatusLabels[status]}`;
}
