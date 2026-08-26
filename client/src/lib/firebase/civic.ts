import {
  addDoc,
  collection,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";
import type { QueryDocumentSnapshot, DocumentData } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import type { User } from "firebase/auth";
import { getFirebaseFirestore, getFirebaseStorage } from "./client";

export type FirebaseCivicStatus = "submitted";
export type FirebaseVerification = "confirm" | "dispute" | "unable_to_verify";
export type FirebaseReaction = "up" | "down";

export type FirebaseEvidence = {
  name: string;
  contentType: string;
  path: string;
  size: number;
  url?: string;
};

export type FirebaseCivicItem = {
  id: string;
  reporterUid: string;
  category: string;
  title: string;
  description: string;
  locationLabel: string;
  locality: string;
  latitude: number | null;
  longitude: number | null;
  visibility: "public" | "private";
  status: FirebaseCivicStatus;
  priority: "standard";
  evidence?: FirebaseEvidence;
  createdAt?: { toDate?: () => Date };
};

export type FirebaseCivicComment = {
  id: string;
  authorUid: string;
  body: string;
  parentCommentId: null;
  createdAt?: { toDate?: () => Date };
};

export type FirebaseSocialSignals = {
  up: number;
  down: number;
  viewerReaction: FirebaseReaction | null;
  comments: FirebaseCivicComment[];
};

export type FirebaseReportInput = Pick<FirebaseCivicItem, "category" | "title" | "description" | "locationLabel" | "locality" | "latitude" | "longitude" | "visibility">;

function civicItems() {
  return collection(getFirebaseFirestore(), "civicItems");
}

export async function ensureFirebaseCitizen(user: User, locality?: string) {
  await setDoc(doc(getFirebaseFirestore(), "citizens", user.uid), {
    uid: user.uid,
    role: "citizen",
    displayName: user.displayName ?? "JanaNiti citizen",
    locality: locality ?? "",
    ward: "",
    district: "",
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

export async function uploadFirebaseEvidence(user: User, file: File): Promise<FirebaseEvidence> {
  if (file.size > 10 * 1024 * 1024) throw new Error("Choose evidence no larger than 10 MB.");
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `civicEvidence/${user.uid}/${crypto.randomUUID()}/${safeName}`;
  const evidenceRef = ref(getFirebaseStorage(), path);
  await uploadBytes(evidenceRef, file, { contentType: file.type || "application/octet-stream" });
  return {
    name: file.name,
    contentType: file.type || "application/octet-stream",
    path,
    size: file.size,
    url: await getDownloadURL(evidenceRef),
  };
}

export async function createFirebaseCivicItem(user: User, input: FirebaseReportInput, file: File | null) {
  const evidence = file ? await uploadFirebaseEvidence(user, file) : undefined;
  const record = await addDoc(civicItems(), {
    reporterUid: user.uid,
    category: input.category,
    title: input.title.trim(),
    description: input.description.trim(),
    locationLabel: input.locationLabel.trim(),
    locality: input.locality.trim(),
    latitude: input.latitude,
    longitude: input.longitude,
    visibility: input.visibility,
    status: "submitted",
    priority: "standard",
    ...(evidence ? { evidence } : {}),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return record.id;
}

function mapItem(snapshot: QueryDocumentSnapshot<DocumentData>) {
  return { id: snapshot.id, ...snapshot.data() } as FirebaseCivicItem;
}

export async function listFirebaseCivicItems(user: User) {
  const [publicRecords, ownRecords] = await Promise.all([
    getDocs(query(civicItems(), where("visibility", "==", "public"), orderBy("createdAt", "desc"), limit(30))),
    getDocs(query(civicItems(), where("reporterUid", "==", user.uid), orderBy("createdAt", "desc"), limit(30))),
  ]);
  const records = new Map<string, FirebaseCivicItem>();
  [...publicRecords.docs, ...ownRecords.docs].forEach((snapshot) => records.set(snapshot.id, mapItem(snapshot)));
  return Array.from(records.values()).sort((a, b) => (b.createdAt?.toDate?.().getTime() ?? 0) - (a.createdAt?.toDate?.().getTime() ?? 0));
}

export async function setFirebaseVerification(issueId: string, user: User, response: FirebaseVerification) {
  await setDoc(doc(getFirebaseFirestore(), "civicItems", issueId, "verifications", user.uid), {
    userUid: user.uid,
    response,
    updatedAt: serverTimestamp(),
  });
}

export async function setFirebaseReaction(issueId: string, user: User, reaction: FirebaseReaction) {
  await setDoc(doc(getFirebaseFirestore(), "civicItems", issueId, "reactions", user.uid), {
    userUid: user.uid,
    reaction,
    updatedAt: serverTimestamp(),
  });
}

export async function addFirebaseComment(issueId: string, user: User, body: string) {
  const trimmedBody = body.trim();
  if (trimmedBody.length < 2 || trimmedBody.length > 500) {
    throw new Error("A civic comment must be between 2 and 500 characters.");
  }
  await addDoc(collection(getFirebaseFirestore(), "civicItems", issueId, "comments"), {
    authorUid: user.uid,
    body: trimmedBody,
    parentCommentId: null,
    createdAt: serverTimestamp(),
  });
}

export async function getFirebaseSocialSignals(issueId: string, user: User): Promise<FirebaseSocialSignals> {
  const [reactionSnapshots, commentSnapshots] = await Promise.all([
    getDocs(collection(getFirebaseFirestore(), "civicItems", issueId, "reactions")),
    getDocs(query(collection(getFirebaseFirestore(), "civicItems", issueId, "comments"), orderBy("createdAt", "asc"), limit(40))),
  ]);
  const reactions = reactionSnapshots.docs.map((snapshot) => snapshot.data() as { userUid: string; reaction: FirebaseReaction });
  return {
    up: reactions.filter((reaction) => reaction.reaction === "up").length,
    down: reactions.filter((reaction) => reaction.reaction === "down").length,
    viewerReaction: reactions.find((reaction) => reaction.userUid === user.uid)?.reaction ?? null,
    comments: commentSnapshots.docs.map((snapshot) => ({ id: snapshot.id, ...snapshot.data() } as FirebaseCivicComment)),
  };
}
