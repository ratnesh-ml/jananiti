# JanaNiti — Visible Civic Action

> **A privacy-aware civic social platform for reporting local problems, choosing public or private visibility, enabling structured community input, and following an explainable civic lifecycle.**

JanaNiti is a Code for Communities hackathon project that turns a local observation into a structured civic record. It separates social support from truth verification, keeps prioritisation deterministic, and avoids presenting unavailable services as if they were live.

| Submission resource | Link | Purpose |
|---|---|---|
| **Live Firebase workspace** | [jananiti-team.vercel.app](https://jananiti-team.vercel.app) | Primary Vercel teammate workspace with Firebase Google Sign-In. |
| **Public judge walkthrough** | [jananiti009.vercel.app](https://jananiti009.vercel.app) | Separate browser-local evaluator walkthrough; it clears on refresh and is not live civic data. |
| **Public source** | [github.com/ratnesh-ml/jananiti](https://github.com/ratnesh-ml/jananiti) | Source code, Firebase policies, tests, and implementation evidence. |
| **Hackathon context** | [Code for Communities](https://hack2skill.com/event/codeforcommunities2/registration) | Official event page. |

## Why JanaNiti

Residents experience waste dumping, water disruption, road hazards, streetlight failure, and environmental concerns but rarely see what happens after reporting. JanaNiti gives a resident a clear choice—**publish to the community** or **keep the report private**—then makes the permitted next steps understandable.

The product uses four distinct signals. A reaction is not a truth vote. A verification response is not popularity. An AI draft is not a civic decision. The deterministic **DRFI** is not an authority assignment.

## Resident experience

The live workspace is an original responsive civic-social experience. Mobile uses a five-action navigation dock; desktop adds a civic context rail with working shortcuts and only real account-accessible record context.

| Flow | Implemented behavior |
|---|---|
| **Home** | Shows public records the account may access and the resident’s own private records. It exposes social actions separately from verification. |
| **Report** | Collects title, description, category, locality, public/private visibility, and progresses through an editable review-and-confirm stage before a Firestore write. |
| **Community post** | A resident explicitly chooses public community publishing or private reporting. Public records may receive bounded comments, a Support/Concern reaction, and one validation response per account. |
| **Issue detail** | Shows a privacy-safe lifecycle, public discussion, verification controls, and deterministic DRFI context for the selected record. |
| **Explore** | Uses a free Leaflet/OpenStreetMap map with eligible civic-record markers and a locality-first location fallback. |
| **Activity and profile** | Provide session-aware activity, profile navigation, accessible-record context, and truthful unavailable-state feedback. |
| **Onboarding** | Explains reporting, community validation, priority review, authority action, resolution, and community review without claiming a stage happened before authorised data exists. |

## Community safeguards

| Action | Meaning | Protection |
|---|---|---|
| **Support / Concern** | A lightweight public social signal. | One account-scoped reaction; it never decides truth. |
| **Confirm / Dispute / Unable to verify** | Structured community validation of a public record. | One response per authenticated account. |
| **Comment** | Constructive public discussion. | Bounded top-level public comments. |
| **DRFI** | Explainable priority context. | Separate from likes, comments, and AI output. |

Firestore is configured around a default-deny policy, then grants narrow public, owner, and account-scoped social permissions. Firebase Security Rules evaluate every client request against the current authentication and document context. [1] [2]

### Privacy boundary

JanaNiti does **not** ask for Aadhaar, VID, OTPs, biometrics, raw identity documents, or exact home addresses. A resident chooses public/private visibility, and a public report only reveals the wording and locality that resident intentionally provides.

> Never place phone numbers, passwords, Aadhaar identifiers, government IDs, or sensitive documents in a report or public comment.

### Honest evidence behavior

The report UI displays Photo, Record audio, Record video, and Upload file options. In the current no-cost live configuration, those controls are visibly unavailable because Firebase Storage has not been provisioned and its billing/retention terms have not been approved. Text-and-locality reports remain available; JanaNiti does not claim file evidence was stored when it was not.

## Explainable DRFI

The **Deterministic Report Focus Index** is explicitly independent of AI and social engagement.

| Factor | Weight |
|---|---:|
| Community demand | 0.20 |
| Population impact | 0.15 |
| Infrastructure gap | 0.15 |
| Service access gap | 0.10 |
| Budget feasibility | 0.10 |
| Geospatial reality | 0.10 |
| Trend growth | 0.10 |
| Risk urgency | 0.10 |

| Score | Band |
|---:|---|
| `< 30` | Low |
| `30–54` | Standard |
| `55–74` | High |
| `≥ 75` | Urgent |

The workspace displays the eight factors, score, band, and a deterministic administrator-routing recommendation. It assists protected human review only; it cannot assign a department, change a lifecycle state, or create a final priority decision.

## Architecture

```text
Resident browser
  └─ Firebase Authentication — Google Sign-In
       └─ Firebase Firestore
            ├─ civicItems — public/private reports
            ├─ reactions — account-scoped social signals
            ├─ comments — bounded public discussion
            └─ verifications — one structured response per account

Vercel
  ├─ React + TypeScript + Vite civic workspace
  ├─ optional authenticated AI-drafting boundary
  └─ Git-linked deployment from this public repository

Open civic mapping
  └─ Leaflet + OpenStreetMap tiles
```

Firebase Authentication supplies identity-provider sign-in and Firestore Security Rules protect browser-originated document access. [2] [3] Leaflet is an open-source JavaScript map library; JanaNiti uses it with OpenStreetMap rather than enabling a paid Google Maps dependency. [4] [5]

## Google technology and AI boundary

JanaNiti’s production path is Firebase-first: Google Sign-In, Firestore, and deployed client security policies are the active foundation. The repository also includes a constrained Gemma-oriented drafting and serving scaffold.

That model is intentionally **not active** until there are consented labelled examples, independent evaluation, a reviewed licence, and trusted hosting. If approved later, it may suggest a report category or missing detail for a human to edit. It cannot modify DRFI, verify an issue, publish a post, assign an authority, or change a lifecycle state.

## Current implementation status

| Capability | Status | Notes |
|---|---|---|
| Firebase Google Sign-In | **Configured** | `jananiti-team.vercel.app` is an authorised Firebase Authentication domain. |
| Firestore civic client and rules | **Implemented** | Default-deny policy, civic subcollections, and feed index configuration are present. |
| Public/private reports | **Implemented** | Visibility is selected before review and enforced by the client and Firestore rules. |
| Reactions, comments, verification | **Implemented** | Client contracts and Emulator-rule tests cover account-scoped and bounded behavior. |
| Free interactive map | **Implemented** | Leaflet/OpenStreetMap map renders only eligible records. |
| File evidence storage | **Not enabled** | Requires Firebase Storage provisioning, approved rules, retention policy, and billing decision. |
| Coordinator administration | **Not enabled** | Requires trusted Admin SDK / Cloud Run / Functions role provisioning and audit controls. |
| Local model inference | **Not enabled** | A safe scaffold exists; no unreviewed model output is shown as live. |
| FCM, SMS, paid Maps Platform, Vertex AI | **Deferred** | Each requires separate security, privacy, billing, and evaluation approval. |

## Judge and teammate walkthrough

1. Open the **[live Firebase workspace](https://jananiti-team.vercel.app)** and select Google Sign-In.
2. Choose **Report** and enter an issue title, impact, category, locality, and visibility.
3. Select **Publish to community** or **Keep it private**, then inspect the editable review screen before confirming a real write.
4. For a consented public report, inspect the distinct Support/Concern, comment, and one-response verification controls.
5. Open **Explore** to see the free map; open **Activity** and **Profile** to inspect authenticated context.
6. Adjust the eight DRFI inputs to inspect the transparent score and recommendation. No AI output can change the score.

For a no-account demo, use [jananiti009.vercel.app](https://jananiti009.vercel.app). It is intentionally browser-local, resets on refresh, and never represents Firebase persistence.

## Local development and validation

Install Node.js 22+ and pnpm, then run:

```bash
pnpm install
pnpm check
pnpm test
pnpm build
pnpm dev
```

The current suite checks TypeScript, deterministic DRFI, civic lifecycle contracts, Firestore policy artifacts, Firebase Emulator-rule scenarios, Firebase social-client behavior, evidence controls, map-marker eligibility, and the production build. The latest local run completed **56 passing tests with 4 explicitly skipped Emulator-dependent cases**. No test seeds public civic data.

### Firebase configuration names

The Vercel project stores the values securely. These names are shown only to document the setup; no values belong in the repository.

| Variable | Purpose |
|---|---|
| `VITE_FIREBASE_API_KEY` | Firebase web configuration key. |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase Authentication domain. |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project identifier. |
| `VITE_FIREBASE_STORAGE_BUCKET` | Optional Storage bucket configuration. |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender identifier. |
| `VITE_FIREBASE_APP_ID` | Firebase web app identifier. |
| `VITE_JANANITI_EVIDENCE_UPLOADS_ENABLED` | Explicit evidence gate; keep false until Storage is approved. |

## Public repository safety

The repository excludes environment files, service-account JSON, private keys, model artifacts, raw training data, identity documents, and internal credential notes. Public pushes are audited for common credential signatures. Do not commit a Firebase admin credential, generated user token, Aadhaar identifier, or model-training dataset.

## Responsible roadmap

The next milestones are a separate Firebase test project, a participant-created end-to-end report test, approved Firebase Storage with retention controls, trusted coordinator administration, optional App Check, and an independently evaluated draft-only model deployment. Each must preserve the separation between public discussion, structured verification, deterministic priority context, and authorised civic action.

## Integrity statement

JanaNiti does not claim that synthetic layout cards, browser-local demo state, unprovisioned Storage, untrained model scaffolding, coordinator assignments, resolution events, or uncreated Firestore records are real civic outcomes. The project exposes its working controls and production gates so judges, teammates, and residents can evaluate it fairly.

## References

[1]: https://firebase.google.com/docs/firestore/security/rules-structure "Cloud Firestore Security Rules structure"

[2]: https://firebase.google.com/docs/auth "Firebase Authentication documentation"

[3]: https://firebase.google.com/docs/firestore/security/get-started "Get started with Cloud Firestore Security Rules"

[4]: https://leafletjs.com/ "Leaflet"

[5]: https://www.openstreetmap.org/copyright "OpenStreetMap copyright and tile usage"
