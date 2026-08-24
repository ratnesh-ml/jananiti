import { describe, expect, it } from "vitest";
import { firebaseOpenId, parseFirebaseGoogleAccount } from "./firebaseIdentity";

describe("Firebase Google identity boundary", () => {
  it("uses a namespaced Jananiti identity that cannot collide with a legacy account", () => {
    expect(firebaseOpenId("firebase-user-123")).toBe("firebase:firebase-user-123");
  });

  it("accepts only email-verified Google identities", () => {
    expect(
      parseFirebaseGoogleAccount({
        localId: "google-user-123",
        email: "CITIZEN@example.com",
        displayName: "Citizen",
        emailVerified: true,
        providerUserInfo: [{ providerId: "google.com" }],
      })
    ).toEqual({
      localId: "google-user-123",
      email: "citizen@example.com",
      displayName: "Citizen",
    });
  });

  it("rejects unverified or non-Google Firebase accounts", () => {
    expect(() =>
      parseFirebaseGoogleAccount({
        localId: "email-user-123",
        emailVerified: true,
        providerUserInfo: [{ providerId: "password" }],
      })
    ).toThrow(/Google identity/);
  });
});
