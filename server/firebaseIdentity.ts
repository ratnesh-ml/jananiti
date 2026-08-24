export type FirebaseGoogleIdentity = {
  localId: string;
  displayName: string | null;
  email: string | null;
};

type FirebaseLookupAccount = {
  localId?: unknown;
  displayName?: unknown;
  email?: unknown;
  emailVerified?: unknown;
  providerUserInfo?: Array<{ providerId?: unknown }>;
};

export function firebaseOpenId(localId: string) {
  return `firebase:${localId}`;
}

export function parseFirebaseGoogleAccount(
  account: FirebaseLookupAccount | undefined
): FirebaseGoogleIdentity {
  const localId = typeof account?.localId === "string" ? account.localId : "";
  const hasGoogleProvider = account?.providerUserInfo?.some(
    provider => provider?.providerId === "google.com"
  );

  if (!localId || !hasGoogleProvider || account?.emailVerified !== true) {
    throw new Error("Firebase account is not an email-verified Google identity");
  }

  return {
    localId,
    displayName:
      typeof account.displayName === "string" && account.displayName.trim()
        ? account.displayName.trim()
        : null,
    email:
      typeof account.email === "string" && account.email.trim()
        ? account.email.trim().toLowerCase()
        : null,
  };
}

export async function verifyFirebaseGoogleIdToken(idToken: string) {
  const apiKey = process.env.VITE_FIREBASE_API_KEY;
  if (!apiKey) throw new Error("Firebase browser configuration is unavailable");
  if (!idToken || idToken.length < 32) throw new Error("Firebase ID token is required");

  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ idToken }),
    }
  );
  const payload = (await response.json().catch(() => null)) as {
    users?: FirebaseLookupAccount[];
  } | null;

  if (!response.ok) throw new Error("Firebase ID token verification failed");
  return parseFirebaseGoogleAccount(payload?.users?.[0]);
}
