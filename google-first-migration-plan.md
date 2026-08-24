# JanaNiti Google-First Target and Migration Plan

## Purpose and source of truth

This document translates the user-provided **23-phase product specification** into an executable target architecture. The supplied mobile screens are treated as visual reference only: JanaNiti must implement original, functional interfaces rather than embedding or reproducing the screenshots.

> **Product direction:** JanaNiti should combine familiar media-first community reporting with clear, trustworthy civic records. It must not present mock responses, synthetic public metrics, or unavailable Google services as production functionality.

## Current implementation boundary

The active Jananiti project is currently a **React 19 + Vite + TypeScript + Express/tRPC + Drizzle + MySQL/TiDB** application. It uses Manus OAuth for sessions and controlled server-side storage for uploaded evidence. Its relational civic records, immutable status history, community reactions, verification responses, DRFI scoring, and coordinator operations are real application features; Google Maps bootstrap is currently unavailable and shown as a degraded fallback.

The pasted specification asks for an **Angular + Firebase/Google Cloud** product. That is a material replatforming request, not a configuration toggle. Until an Angular application and owned Firebase project are built and configured, this deployed app must be described accurately as a working development implementation—not as an Angular/Firebase production deployment.

| Layer | Current active implementation | Requested production target | Migration guardrail |
|---|---|---|---|
| Web client | React/Vite/TypeScript | Angular/TypeScript with Material/CDK/RxJS | Build features through stable UI contracts, then port into an Angular feature structure rather than copying screenshots or forcing an unsafe framework swap. |
| Identity | Manus OAuth session | Firebase Authentication with Google and optional email/password | Link a Firebase UID to one canonical citizen identity before switching any sign-in path. |
| Civic system of record | MySQL/TiDB via Drizzle and tRPC | Cloud Firestore | Do not dual-write civic mutations. Design import, validation, cutover, and rollback before Firestore becomes authoritative. |
| Evidence media | Authenticated server endpoint and managed storage | Firebase Storage | Keep owner-bound metadata and enforce path, MIME type, and size policies before migration. |
| Trusted mutations | Express/tRPC procedures | Cloud Functions for Firebase; Cloud Run only for justified heavy work | Move priority, aggregation, roles, moderation, and notifications server-side—not into the client. |
| AI review | Optional server-side Gemini draft with human review | Vertex AI/Gemini through Google Cloud | Preserve the citizen-confirm/edit step; AI suggestions must never silently change a report. |
| Maps | CSS heat-map/manual coordinates; Maps proxy currently fails | Google Maps Platform | Keep a usable development map adapter until a project-owned Maps setup is configured. |
| Notifications | Database notification records | Firestore records plus Firebase Cloud Messaging | Persist an in-app record first; use FCM only after enrollment and permissions are configured. |

## Google-first production architecture

The target is a modular Angular application in which components depend on interfaces rather than directly on Firebase. The Firebase Web SDK is configured with public web-app configuration only. Google provider enablement, authorized domains, and the identity link flow are required before live sign-in. Firebase supports both popup and redirect flows; the redirect flow is generally preferred for mobile devices.[1]

| Capability | Development adapter without credentials | Google production adapter | Truthful UI requirement |
|---|---|---|---|
| Authentication | `DevelopmentAuthService` with a visible development-mode label | `FirebaseAuthService`, Google provider, server-verified identity link | Never call development identity a Google account. |
| Civic data | Local development repository or the current controlled backend during transition | `FirestoreIssueRepository` | Never show Firestore as connected until configuration and rules are deployed. |
| Media | Browser-selected file preview plus locally controlled upload simulation | `FirebaseStorageMediaService` | Show actual upload progress, failure, retry, and delete state. |
| AI review | Deterministic rules-based review marked **Development suggestion** | `VertexGeminiAnalysisService` through a trusted backend | Keep suggestions editable and distinguish them from authority decisions. |
| Maps | `MockMapService` with labeled locality grid, issue points, and filters | `GoogleMapsService` with location, geocoding, markers, and clusters | Never draw third-party map tiles or claim live geocoding in fallback mode. |
| Notifications | Persisted/in-app development notification records | `FirebaseMessagingService` plus notification records | Respect device permission and offer a non-push inbox. |
| Search | Local/mock index or current backend query adapter | Firestore query/search adapter | State when search only covers loaded/local development data. |

### Supporting Google platform controls

| Control | Development fallback | Production cutover | Security boundary |
|---|---|---|---|
| Firebase App Check | Explicitly disabled development adapter that labels integrity enforcement as unavailable | Enable an appropriate web provider, register the deployed app, monitor traffic, then enforce per service after a staged rollout | App Check reduces abuse signals; it does not replace Firebase Authentication, Security Rules, server validation, or rate limits. |
| Analytics | No tracking or a local development event logger with no external transmission | Firebase/Google Analytics event schema for consented product events such as `report_started`, `report_submitted`, and `issue_opened` | Do not collect raw descriptions, exact user coordinates, evidence URLs, Aadhaar-related data, or civic-health inferences as analytics event parameters. |
| Logging and monitoring | Development console and test logs only | Cloud Logging/Cloud Monitoring dashboards, error reporting, alert policies, and retention configuration | Redact authentication tokens, raw evidence metadata, exact locations, and personally identifying fields before log export. |
| Secret Manager | No secret is stored locally in code or browser configuration | Store server-only production secrets such as service-account credentials and Vertex/Cloud Run configuration in Secret Manager; bind workload identities with least privilege | Firebase web configuration can be public; private keys, service-account files, signing keys, and privileged API credentials must never reach the browser. |

These controls are intentionally represented as platform adapters rather than simulated production switches. Firebase App Check is introduced only when a Firebase project exists; analytics has an explicit consent and minimization gate; monitoring uses redacted structured logs; and Secret Manager configuration begins only during the deployment cutover.

### Trusted server responsibilities

Cloud Functions should own issue intake processing, validation aggregation, DRFI recalculation, notification creation, status transitions, resolution verification, moderation, and AI orchestration. Cloud Functions can run TypeScript backend code in response to HTTP calls and Firebase or Google Cloud events, keeping mutable civic logic off the client.[2]

The priority engine remains a server-side calculation. Its inputs include severity, independent reports, confirmed/disputed community evidence, affected population, geographic concentration, recurrence, environmental impact, and time unresolved. The client receives the calculated score, level, factors, and a plain-language explanation; it must never submit its own authoritative score.

## Firestore target model

The target collections are `users`, `profiles`, `issues`, `issueMedia`, `issueValidations`, `issueComments`, `issueStatusHistory`, `issueAssignments`, `departments`, `notifications`, `userActivity`, `civicCredits`, `achievements`, `userAchievements`, `localities`, `categories`, `aiAnalyses`, `savedIssues`, `reports`, and `adminActions`.

An `issues/{issueId}` document will contain descriptive and denormalized display data only. Authoritative counters, priority score, department assignment, status, and credits are written by trusted functions. Validation, comments, media metadata, history, and assignments use user- and issue-scoped documents or subcollections with explicit document ownership.

## Security and privacy boundary

Firebase Security Rules must start deny-by-default, restrict citizens to their own permitted documents, and reserve priority, role, assignment, status, aggregate counts, and credits for trusted server execution. Firebase notes that mobile/web client requests are evaluated against Security Rules, but server client libraries bypass those rules and therefore require carefully scoped IAM.[3]

Firebase Storage Rules should enforce authenticated ownership, path isolation, content type, and size before accepting evidence. Firebase Storage Rules can validate both metadata and upload size at the path level.[4] Raw Aadhaar numbers, VID, OTPs, biometrics, and e-KYC payloads remain out of scope. A future lawful duplicate-prevention adapter may only be added after authorized-relying-party, consent, legal, and security requirements are approved.

## Delivery sequence

| Order | Deliverable | Completion evidence |
|---|---|---|
| 1 | Reference-screen coverage matrix and a single mobile design system | All ten screen intents map to original routes/components and responsive states. |
| 2 | Screen flows with development adapters | Feed, detail, reporting, review, map, activity, profile, explore, onboarding, and sign-in are usable without credentials and visibly labeled where simulated. |
| 3 | Social, civic, media, and admin workflows | Tests cover vote switching, comments, save/share, upload validation, notification states, status changes, DRFI recalculation, roles, and resolution verification. |
| 4 | Angular/Firebase migration package | Angular feature structure, Firestore schema/indexes, Functions, rules, Storage rules, emulator tests, data migration plan, and rollback runbook are ready. |
| 5 | Credentials supplied last | Create the credential checklist, configure the owned Google project through secure channels, deploy rules/functions, then run real end-to-end acceptance tests. |

## Current configuration finding

No Firebase connector or project configuration is available in the current session. Google Gemini and Google Maps connectors are present but disabled; they do not constitute a Firebase project, Firebase Authentication configuration, or a usable Google Maps JavaScript API setup. No credential request will be made during the development-fallback build.

## References

[1]: https://firebase.google.com/docs/auth/web/google-signin "Authenticate Using Google with JavaScript — Firebase"

[2]: https://firebase.google.com/docs/functions "Cloud Functions for Firebase"

[3]: https://firebase.google.com/docs/firestore/security/get-started "Get started with Cloud Firestore Security Rules — Firebase"

[4]: https://firebase.google.com/docs/storage/security "Understand Firebase Security Rules for Cloud Storage — Firebase"
