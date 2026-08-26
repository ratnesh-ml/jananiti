import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";
import { firebaseWebConfig } from "./config";

/**
 * Free-stage adapter boundary. It intentionally initializes only Firebase App,
 * Authentication and Firestore. Maps, Vertex AI, Cloud Run, Storage, phone
 * authentication and FCM push are not imported or initialized here.
 */
export function getFirebaseApp(): FirebaseApp {
  if (!firebaseWebConfig) {
    throw new Error(
      "Firebase is not configured. Add the approved Firebase Web App values before enabling Google Sign-In or Firestore."
    );
  }

  return getApps().length ? getApp() : initializeApp(firebaseWebConfig);
}

export function getFirebaseAuth(): Auth {
  return getAuth(getFirebaseApp());
}

export function getFirebaseFirestore(): Firestore {
  return getFirestore(getFirebaseApp());
}

export function getFirebaseStorage(): FirebaseStorage {
  return getStorage(getFirebaseApp());
}

export function createGoogleSignInProvider() {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  return provider;
}
