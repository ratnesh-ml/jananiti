import { onAuthStateChanged, signInWithPopup, signOut, type User } from "firebase/auth";
import { useEffect, useState } from "react";
import { isFirebaseFreeStageConfigured } from "./config";
import { createGoogleSignInProvider, getFirebaseAuth } from "./client";

export async function signInWithFirebaseGoogle() {
  const auth = getFirebaseAuth();
  const result = await signInWithPopup(auth, createGoogleSignInProvider());
  const idToken = await result.user.getIdToken();
  const response = await fetch("/api/auth/firebase/session", {
    method: "POST",
    credentials: "include",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ idToken }),
  });

  if (!response.ok) {
    await signOut(auth);
    throw new Error("Google Sign-In was verified by Firebase but Jananiti could not start a civic session.");
  }
}

/** Direct Firebase session used by the Vercel Firebase application. */
export async function signInWithFirebaseGoogleDirect() {
  return signInWithPopup(getFirebaseAuth(), createGoogleSignInProvider());
}

export function useFirebaseUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => onAuthStateChanged(getFirebaseAuth(), (nextUser) => {
    setUser(nextUser);
    setLoading(false);
  }), []);

  return { user, loading };
}

export async function signOutFromFirebaseIfPresent() {
  if (!isFirebaseFreeStageConfigured) return;
  const auth = getFirebaseAuth();
  if (auth.currentUser) await signOut(auth);
}
