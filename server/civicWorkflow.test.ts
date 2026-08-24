import { describe, expect, it } from "vitest";
import { canAccessCivicOperations, isCommunityVisible, isMapEligible, receiptNotificationsPerSubmission, shouldDispatchLocalVerification } from "./civicWorkflow";

describe("civic workflow policy", () => {
  it("keeps private issues out of public community surfaces", () => { expect(isCommunityVisible("public")).toBe(true); expect(isCommunityVisible("private")).toBe(false); });
  it("only alerts the same locality for a public report with a saved locality", () => { expect(shouldDispatchLocalVerification("public", "Vijay Nagar")).toBe(true); expect(shouldDispatchLocalVerification("public", null)).toBe(false); expect(shouldDispatchLocalVerification("private", "Vijay Nagar")).toBe(false); });
  it("only exposes public records with finite shared coordinates to the heat map", () => { expect(isMapEligible({ visibility: "public", latitude: 22.72, longitude: 75.86 })).toBe(true); expect(isMapEligible({ visibility: "private", latitude: 22.72, longitude: 75.86 })).toBe(false); expect(isMapEligible({ visibility: "public", latitude: null, longitude: 75.86 })).toBe(false); });
  it("creates one citizen receipt for a successful submission", () => expect(receiptNotificationsPerSubmission()).toBe(1));
  it("gates coordinator operations to administrators", () => { expect(canAccessCivicOperations("admin")).toBe(true); expect(canAccessCivicOperations("user")).toBe(false); expect(canAccessCivicOperations(null)).toBe(false); });
});
