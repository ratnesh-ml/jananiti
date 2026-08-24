export type CivicVisibility = "public" | "private";
export function isCommunityVisible(visibility: CivicVisibility) { return visibility === "public"; }
export function shouldDispatchLocalVerification(visibility: CivicVisibility, locality?: string | null) { return visibility === "public" && Boolean(locality?.trim()); }
export function isMapEligible(input: { visibility: CivicVisibility; latitude?: number | null; longitude?: number | null }) { return input.visibility === "public" && Number.isFinite(input.latitude) && Number.isFinite(input.longitude); }
export function receiptNotificationsPerSubmission() { return 1; }
export function canAccessCivicOperations(role?: "admin" | "user" | null) { return role === "admin"; }
