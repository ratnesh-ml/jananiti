import type { Express, Request, Response } from "express";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import * as db from "../server/db";
import { getSessionCookieOptions } from "./_core/cookies";
import { firebaseOpenId, verifyFirebaseGoogleIdToken } from "./firebaseIdentity";
import { sdk } from "./_core/sdk";

function firebaseIdTokenFrom(request: Request) {
  const value = request.body?.idToken;
  return typeof value === "string" ? value : "";
}

export function registerFirebaseSessionRoutes(app: Express) {
  app.post("/api/auth/firebase/session", async (req: Request, res: Response) => {
    try {
      const identity = await verifyFirebaseGoogleIdToken(firebaseIdTokenFrom(req));
      const openId = firebaseOpenId(identity.localId);

      await db.upsertUser({
        openId,
        name: identity.displayName,
        email: identity.email,
        loginMethod: "firebase_google",
        lastSignedIn: new Date(),
      });

      const token = await sdk.signSession(
        { openId, appId: "jananiti-firebase", name: identity.displayName || "Jananiti citizen" },
        { expiresInMs: ONE_YEAR_MS }
      );
      res.cookie(COOKIE_NAME, token, {
        ...getSessionCookieOptions(req),
        maxAge: ONE_YEAR_MS,
      });
      res.status(204).end();
    } catch (error) {
      console.warn("[FirebaseAuth] Google Sign-In session exchange denied", error);
      res.status(401).json({ error: "Firebase Google Sign-In could not be verified" });
    }
  });
}
