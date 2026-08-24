import type { FirebaseOptions } from "firebase/app";

export type FirebaseWebEnvironment = Partial<
  Record<
    | "VITE_FIREBASE_API_KEY"
    | "VITE_FIREBASE_AUTH_DOMAIN"
    | "VITE_FIREBASE_PROJECT_ID"
    | "VITE_FIREBASE_STORAGE_BUCKET"
    | "VITE_FIREBASE_MESSAGING_SENDER_ID"
    | "VITE_FIREBASE_APP_ID",
    string | undefined
  >
>;

const requiredKeys = [
  "VITE_FIREBASE_API_KEY",
  "VITE_FIREBASE_AUTH_DOMAIN",
  "VITE_FIREBASE_PROJECT_ID",
  "VITE_FIREBASE_MESSAGING_SENDER_ID",
  "VITE_FIREBASE_APP_ID",
] as const;

function read(env: FirebaseWebEnvironment, key: keyof FirebaseWebEnvironment) {
  return env[key]?.trim() || undefined;
}

/**
 * Creates a Firebase Web configuration only when all values needed by Auth and
 * Firestore are present. Storage is deliberately optional because media
 * migration is deferred from Jananiti's zero-cost hackathon stage.
 */
export function getFirebaseWebConfig(
  env: FirebaseWebEnvironment
): FirebaseOptions | null {
  if (requiredKeys.some((key) => !read(env, key))) return null;

  return {
    apiKey: read(env, "VITE_FIREBASE_API_KEY")!,
    authDomain: read(env, "VITE_FIREBASE_AUTH_DOMAIN")!,
    projectId: read(env, "VITE_FIREBASE_PROJECT_ID")!,
    messagingSenderId: read(env, "VITE_FIREBASE_MESSAGING_SENDER_ID")!,
    appId: read(env, "VITE_FIREBASE_APP_ID")!,
    ...(read(env, "VITE_FIREBASE_STORAGE_BUCKET")
      ? { storageBucket: read(env, "VITE_FIREBASE_STORAGE_BUCKET") }
      : {}),
  };
}

export const firebaseWebConfig = getFirebaseWebConfig(
  import.meta.env as FirebaseWebEnvironment
);

export const isFirebaseFreeStageConfigured = Boolean(firebaseWebConfig);

