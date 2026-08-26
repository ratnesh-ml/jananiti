import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { assertFails, assertSucceeds, initializeTestEnvironment, type RulesTestEnvironment } from "@firebase/rules-unit-testing";
import { addDoc, collection, doc, getDoc, setDoc } from "firebase/firestore";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const firestoreHost = process.env.FIRESTORE_EMULATOR_HOST;
const runWithEmulator = Boolean(firestoreHost);
let testEnv: RulesTestEnvironment;

const publicIssue = {
  reporterUid: "alice",
  category: "Waste & sanitation",
  title: "Overflowing bins near market entrance",
  description: "Waste has accumulated near the market entrance and blocks pedestrians.",
  locationLabel: "Ward 12 market",
  locality: "Ward 12",
  latitude: null,
  longitude: null,
  visibility: "public",
  status: "submitted",
  priority: "standard",
  createdAt: new Date(),
  updatedAt: new Date(),
};

const privateIssue = { ...publicIssue, reporterUid: "alice", visibility: "private", title: "Private safety follow-up for the same lane" };

describe.skipIf(!runWithEmulator)("Firestore production rules in the Emulator Suite", () => {
  beforeAll(async () => {
    const [host, port = "8080"] = firestoreHost!.split(":");
    testEnv = await initializeTestEnvironment({
      projectId: "jananiti-rules-test",
      firestore: {
        host,
        port: Number(port),
        rules: readFileSync(resolve(process.cwd(), "firestore.rules"), "utf8"),
      },
    });
  });

  beforeEach(async () => {
    await testEnv.clearFirestore();
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), "civicItems", "public-issue"), publicIssue);
      await setDoc(doc(context.firestore(), "civicItems", "private-issue"), privateIssue);
    });
  });

  afterAll(async () => {
    await testEnv.cleanup();
  });

  it("protects private reports while allowing public civic discovery", async () => {
    const bob = testEnv.authenticatedContext("bob").firestore();
    await assertSucceeds(getDoc(doc(bob, "civicItems", "public-issue")));
    await assertFails(getDoc(doc(bob, "civicItems", "private-issue")));
  });

  it("allows a citizen to create only their own standard submitted report", async () => {
    const alice = testEnv.authenticatedContext("alice").firestore();
    await assertSucceeds(setDoc(doc(alice, "civicItems", "alice-report"), publicIssue));
    const bob = testEnv.authenticatedContext("bob").firestore();
    await assertFails(setDoc(doc(bob, "civicItems", "impersonated-report"), publicIssue));
  });

  it("enforces account-scoped reactions and bounded constructive comments", async () => {
    const bob = testEnv.authenticatedContext("bob").firestore();
    await assertSucceeds(setDoc(doc(bob, "civicItems", "public-issue", "reactions", "bob"), {
      userUid: "bob", reaction: "up", updatedAt: new Date(),
    }));
    await assertFails(setDoc(doc(bob, "civicItems", "public-issue", "reactions", "alice"), {
      userUid: "alice", reaction: "down", updatedAt: new Date(),
    }));
    await assertSucceeds(addDoc(collection(bob, "civicItems", "public-issue", "comments"), {
      authorUid: "bob", body: "The route is blocked every morning.", parentCommentId: null, createdAt: new Date(),
    }));
    await assertFails(addDoc(collection(bob, "civicItems", "public-issue", "comments"), {
      authorUid: "bob", body: "x", parentCommentId: null, createdAt: new Date(),
    }));
  });

  it("keeps truth verification as a separate one-response document per account", async () => {
    const bob = testEnv.authenticatedContext("bob").firestore();
    await assertSucceeds(setDoc(doc(bob, "civicItems", "public-issue", "verifications", "bob"), {
      userUid: "bob", response: "confirm", updatedAt: new Date(),
    }));
    await assertFails(setDoc(doc(bob, "civicItems", "public-issue", "verifications", "alice"), {
      userUid: "alice", response: "confirm", updatedAt: new Date(),
    }));
  });
});

describe.skipIf(runWithEmulator)("Firestore Emulator Suite prerequisite", () => {
  it("skips rule integration tests unless the dedicated emulator command supplies FIRESTORE_EMULATOR_HOST", () => {
    expect(firestoreHost).toBeUndefined();
  });
});
