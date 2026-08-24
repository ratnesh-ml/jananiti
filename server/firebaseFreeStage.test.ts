import { describe, expect, it } from "vitest";

const projectId = process.env.VITE_FIREBASE_PROJECT_ID;
const apiKey = process.env.VITE_FIREBASE_API_KEY;

describe("Firebase free-stage credentials", () => {
  it("accepts the configured browser key without reading or writing civic data", async () => {
    expect(projectId).toBeTruthy();
    expect(apiKey).toBeTruthy();

    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithIdp?key=${encodeURIComponent(apiKey!)}`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        // The deliberately incomplete request must fail validation before any
        // account is created or read. A valid Firebase browser key receives a
        // Firebase Auth request-validation error, not an invalid-key error.
        body: JSON.stringify({}),
      }
    );
    const payload = (await response.json()) as {
      error?: { status?: string; message?: string };
    };
    const errorText = `${payload.error?.status ?? ""} ${payload.error?.message ?? ""}`;

    expect(response.status).toBe(400);
    expect(errorText).toMatch(/missing_request_uri|missing_req_type/i);
    expect(errorText).not.toMatch(/api key not valid|invalid api key|consumer is invalid|project.*not found/i);
  });
});
