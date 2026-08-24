# Jananiti Google-Native Migration and Credential Inventory

## Decision summary

Jananiti can move away from Manus-specific production dependencies while retaining its current React, Express, tRPC, and DRFI domain model during the migration. The recommended Google-native production stack is **Firebase Authentication + Firestore + Cloud Storage + Cloud Run + Cloud Functions + Firebase Cloud Messaging + Google Maps Platform + Firebase App Check + Google Cloud Secret Manager + Cloud Logging/Analytics**, with **Vertex AI or Firebase AI Logic** used only for reviewable drafts.

## DRFI verification

> **DRFI works without AI.** `server/drfiMath.ts` calculates a deterministic, explainable weighted score from eight factors: demand (20%), population impact (15%), infrastructure gap (15%), service access (10%), budget feasibility (10%), geospatial reality (10%), trend growth (10%), and risk urgency (10%). Scores map to `low` (<30), `standard` (30–54), `high` (55–74), or `urgent` (75+).

The function has unit coverage and must remain the authoritative priority calculation. No model is permitted to make an unreviewed final prioritization decision. Vertex AI can propose a category, concise issue summary, and a list of missing evidence; a citizen or coordinator must confirm or edit it before persistence.

## Production replacement map

| Current dependency | Google-native production replacement | Migration note |
|---|---|---|
| Manus OAuth | Firebase Authentication with Google Sign-In | Link Firebase UID to the canonical citizen record; do not silently replace identities. |
| MySQL/TiDB civic data | Cloud Firestore | Migrate schema intentionally; security rules enforce user/admin access. |
| Manus/S3 storage helpers | Cloud Storage for Firebase | Store media bytes in Storage, metadata and access controls in Firestore. |
| Express server in Manus hosting | Cloud Run | Verify Firebase ID tokens server-side; run tRPC/Express or gradually split to Functions. |
| In-app owner notifications | FCM + Firestore notification records | Retain in-app Action Center; add opt-in device push later. |
| Current CSS map fallback | Maps JavaScript API + Places API | Keep fallback until a restricted browser key is deployed. |
| Manus LLM proxy | Vertex AI on Cloud Run or Firebase AI Logic | Use structured, reviewable drafts with App Check and rate limits. |
| Manus injected secrets | Secret Manager + Cloud Run/Functions service identity | Do not place privileged JSON keys in source, browser code, or Vercel client variables. |

## What you need to create and provide

### A. Required for the first real Google migration

| Item | Where to obtain it | Secure variable / information to provide | Notes |
|---|---|---|---|
| Firebase project | [Firebase Console](https://console.firebase.google.com/) → Create project | Firebase **project ID** | Choose a permanent project ID, such as `jananiti-prod`; it cannot later be renamed. |
| Firebase Web App | Firebase Console → Project settings → Your apps → `</>` | `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID` | Web config is client configuration, not an admin key. |
| Google Sign-In provider | Firebase Console → Authentication → Sign-in method → Google | Confirmation that Google provider is enabled; authorized domains | Add `jananiti009.vercel.app`, `jananiti-fspr6tck.manus.space`, and the final custom domain. |
| Firestore | Firebase Console → Build → Firestore Database | Confirmation that Firestore is created in chosen region | Start in production mode; rules will be supplied with migration. |
| Cloud Storage | Firebase Console → Build → Storage | Confirmation that Storage bucket is created | Use matching/nearby region where possible. |
| Billing account | Google Cloud Console → Billing | Billing enabled for the project | Required before some Maps and Cloud Run capabilities can be used. |

### B. Required for the deployed backend after the migration

| Item | Where to obtain it | Provide | Important restriction |
|---|---|---|---|
| Cloud Run service identity | Google Cloud Console → IAM & Admin → Service Accounts | Service account email and permission confirmation | Prefer Cloud Run’s attached identity and Application Default Credentials. Do **not** send a JSON private key if Cloud Run is used. |
| Secret Manager | Google Cloud Console → Security → Secret Manager | Confirmation it is enabled | Store server-only secrets such as OAuth/session values and third-party credentials there. |
| Vercel deployment values (temporary only) | Vercel → Settings → Environment Variables | Google client config plus server variables when Vercel hosts backend | Vercel needs a server credential only if it is directly calling Google server APIs. Cloud Run avoids that key-transfer path. |

### C. Required when enabling live Google Maps

| Item | Where to obtain it | Provide | Safe configuration |
|---|---|---|---|
| Restricted Maps browser key | Google Cloud Console → APIs & Services → Credentials → Create API key | `VITE_GOOGLE_MAPS_API_KEY` | Restrict by HTTP referrer to Jananiti domains and restrict APIs to Maps JavaScript API (and Places API only if used). |
| Maps APIs | APIs & Services → Library | Confirmation Maps JavaScript API is enabled | Enable Places only for actual place search/autocomplete use. |

### D. Required when enabling AI triage

| Item | Where to obtain it | Provide | Safe configuration |
|---|---|---|---|
| Vertex AI | Google Cloud Console → Vertex AI | Confirmation Vertex AI API is enabled and model region | Cloud Run identity receives the least-privilege Vertex AI role. No browser API key. |
| Firebase AI Logic alternative | Firebase Console → AI Logic | Confirmation chosen provider is configured | Use Firebase App Check; no direct Gemini key in browser code. |
| App Check | Firebase Console → App Check | Site key / provider configuration as applicable | Enforce after testing to protect Auth, Storage, Firestore, and AI endpoints from abuse. |

### E. Optional production services

| Service | Console path | Why it is optional now |
|---|---|---|
| Firebase Cloud Messaging | Firebase Console → Cloud Messaging | Device push notifications; Action Center can work without it. |
| Google Analytics | Firebase Console → Project settings → Integrations | Product analytics; publish privacy notice first. |
| Cloud Logging / Error Reporting | Google Cloud Console → Observability | Operations monitoring and incident diagnosis. |
| Identity Platform | Firebase Authentication → Settings | Optional advanced audit logging, MFA, and enterprise identity features. |

## Beginner setup order

1. Create one Firebase project and enable billing in its linked Google Cloud project.
2. Add the Firebase Web App and save the six public Web configuration values.
3. Enable Firebase Authentication → Google provider and add the three Jananiti domains as authorized domains.
4. Create Firestore in production mode and Cloud Storage.
5. Create or choose Cloud Run as the backend deployment target; use its service identity rather than downloading a private key.
6. Enable Maps JavaScript API only when ready to replace the fallback and create a referrer-restricted browser key.
7. Enable Vertex AI only when ready for draft triage; assign least privilege to the Cloud Run service identity.
8. Configure Firebase App Check, then enable FCM/Analytics/Logging after privacy and notification UX are approved.

## Do not provide

Never provide raw Aadhaar, VID, OTP, biometrics, e-KYC payloads, an unrestricted Maps API key, a service-account JSON file in chat, or a Firebase Admin private key in browser variables. Use secure project secrets for any server-only value.

## Official sources

[1]: https://firebase.google.com/docs/auth "Firebase Authentication"
[2]: https://firebase.google.com/docs/admin/setup "Firebase Admin SDK setup"
[3]: https://firebase.google.com/docs/ai-logic "Firebase AI Logic"
[4]: https://developers.google.com/maps/api-security-best-practices "Google Maps API security best practices"
[5]: https://firebase.google.com/docs/app-check "Firebase App Check"
