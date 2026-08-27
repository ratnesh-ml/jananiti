export type CivicLifecycleStatus = "submitted" | "assigned" | "in_progress" | "resolved" | "closed";

const lifecycleOrder: Array<{ key: CivicLifecycleStatus; label: string; detail: string }> = [
  { key: "submitted", label: "Submitted", detail: "Your report is safely recorded." },
  { key: "assigned", label: "Assigned", detail: "A verified coordinator has accepted it." },
  { key: "in_progress", label: "In progress", detail: "The responsible team is working on it." },
  { key: "resolved", label: "Resolved", detail: "A coordinator has recorded an outcome." },
  { key: "closed", label: "Closed", detail: "The lifecycle is complete." },
];

export function getCivicLifecycle(status: string | undefined) {
  const currentIndex = lifecycleOrder.findIndex((step) => step.key === status);
  const safeIndex = currentIndex >= 0 ? currentIndex : 0;
  return lifecycleOrder.map((step, index) => ({
    ...step,
    state: index < safeIndex ? "complete" as const : index === safeIndex ? "current" as const : "pending" as const,
  }));
}

export type TestOnlyCivicRecord = {
  id: string;
  category: string;
  title: string;
  description: string;
  locality: string;
  status: CivicLifecycleStatus;
  visibility: "public";
  priority: "standard";
  isSyntheticTestRecord: true;
};

const testOnlyCivicRecords: TestOnlyCivicRecord[] = [
  {
    id: "synthetic-test-drain-overflow",
    category: "Waste & sanitation",
    title: "TEST ONLY — blocked drain near the practice market",
    description: "Synthetic record for exercising the report card, social controls, timeline, and responsive layout. It is not a civic complaint and has no verification or engagement data.",
    locality: "Test Ward 12",
    status: "submitted",
    visibility: "public",
    priority: "standard",
    isSyntheticTestRecord: true,
  },
  {
    id: "synthetic-test-water-leak",
    category: "Water",
    title: "TEST ONLY — sample water-leak workflow",
    description: "Synthetic record for testing the community feed. It does not represent a real location, person, or service failure.",
    locality: "Test Ward 12",
    status: "in_progress",
    visibility: "public",
    priority: "standard",
    isSyntheticTestRecord: true,
  },
];

export function getTestOnlyCivicRecords(environment: string, isDevelopment: boolean) {
  return environment === "test" || isDevelopment ? testOnlyCivicRecords : [];
}

export function isPrimaryLaunchHost(hostname: string) {
  return hostname === "jananiti-team.vercel.app";
}
