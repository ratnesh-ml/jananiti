import { describe, expect, it } from "vitest";
import { getFirebaseWebConfig } from "./config";

const completeEnvironment = {
  VITE_FIREBASE_API_KEY: "web-api-key",
  VITE_FIREBASE_AUTH_DOMAIN: "jananiti.firebaseapp.com",
  VITE_FIREBASE_PROJECT_ID: "jananiti-demo",
  VITE_FIREBASE_MESSAGING_SENDER_ID: "1234567890",
  VITE_FIREBASE_APP_ID: "1:1234567890:web:example",
};

describe("Firebase free-stage configuration", () => {
  it("returns null until every Auth and Firestore value is supplied", () => {
    expect(
      getFirebaseWebConfig({
        ...completeEnvironment,
        VITE_FIREBASE_APP_ID: " ",
      })
    ).toBeNull();
  });

  it("accepts the minimum Google Sign-In and Firestore web configuration", () => {
    expect(getFirebaseWebConfig(completeEnvironment)).toMatchObject({
      apiKey: "web-api-key",
      authDomain: "jananiti.firebaseapp.com",
      projectId: "jananiti-demo",
      appId: "1:1234567890:web:example",
    });
  });

  it("does not require Firebase Storage in the zero-cost stage", () => {
    expect(getFirebaseWebConfig(completeEnvironment)?.storageBucket).toBeUndefined();
  });
});
