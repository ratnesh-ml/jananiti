import { describe, expect, it } from "vitest";
import { canTransitionCivicStatus, statusNotificationTitle } from "./civicLifecycle";

describe("civic lifecycle safeguards", () => {
  it("allows a coordinator to progress a submitted item through review", () => {
    expect(canTransitionCivicStatus("submitted", "acknowledged")).toBe(true);
    expect(canTransitionCivicStatus("acknowledged", "assigned")).toBe(true);
    expect(canTransitionCivicStatus("assigned", "in_progress")).toBe(true);
  });

  it("rejects a status jump that bypasses the review lifecycle", () => {
    expect(canTransitionCivicStatus("submitted", "resolved")).toBe(false);
    expect(canTransitionCivicStatus("closed", "submitted")).toBe(false);
  });

  it("uses a distinct citizen message when a request is resolved", () => {
    expect(statusNotificationTitle("resolved")).toBe("Your civic request has been resolved");
    expect(statusNotificationTitle("assigned")).toBe("Request status: Assigned");
  });
});
