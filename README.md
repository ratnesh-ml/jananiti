# JanaNiti — Code for Communities 2

> **Community-powered civic action: report, validate, prioritize, and close the loop.**

JanaNiti is a mobile-first civic participation platform for **Code for Communities 2**. It helps citizens turn a local observation into a structured civic report, enables privacy-preserving community validation, and gives coordinators an explainable path from evidence to action.

## Direct judge links

| Resource | Verified link | Purpose |
|---|---|---|
| **Vercel judge walkthrough** | [jananiti009.vercel.app](https://jananiti009.vercel.app/) | Public, no-sign-in submission walkthrough. This is the only judge-facing live URL. |
| **Public source repository** | [github.com/ratnesh-ml/jananiti](https://github.com/ratnesh-ml/jananiti) | Source, architecture boundaries, automated tests, and implementation evidence. |
| **Hackathon event** | [Code for Communities 2](https://hack2skill.com/event/codeforcommunities2/registration) | Official registration and submission context. |

> The Vercel deployment intentionally opens the public judge walkthrough first. It does not depend on the legacy server API or a third-party account session, so evaluators can read the civic flow immediately.

## The problem

Residents report roads, waste, water, safety, and environmental problems through disconnected channels. They rarely see whether a report is credible, whether it is being acted upon, or why another issue has been prioritized. Civic teams meanwhile need structured evidence, locality context, and a defensible way to organize work.

## The JanaNiti response

| Participant | Implemented civic capability |
|---|---|
| **Citizen** | Intro-first entry, structured issue reporting, text/image/audio/video/document evidence selection, automatic or manual locality, local draft handling, review-and-confirm flow, and issue tracking contracts. |
| **Community** | Evidence-led feed design, one-response verification model, privacy-preserving discussion model, locality discovery, activity signals, and transparent badges. |
| **Coordinator** | Role-gated operations model, assignment, guarded lifecycle changes, evidence review, and explainable priority review. |

## What is distinctive

### Community validation without anonymous noise

Each eligible person can confirm, dispute, or mark a public civic record as unavailable to verify. This is separate from simple reactions and is designed so public discussion does not expose a resident’s exact location or identity.

### Explainable DRFI priority

The **DRFI** score is deterministic and human-reviewable. It weighs demand, population impact, infrastructure gap, service access, budget feasibility, geospatial reality, trend growth, and risk urgency. The score maps to clear priority bands, while the final decision remains with a human coordinator.

### Privacy by design

Public/private visibility is explicit, public mapping uses intentionally shared coordinates only, and civic reports do not display the reporter’s identity. JanaNiti does not collect Aadhaar, VID, OTPs, biometrics, or e-KYC payloads.

## Judge walkthrough

Open the [Vercel judge walkthrough](https://jananiti009.vercel.app/) and evaluate the sequence below. The public Vercel page describes the complete evidence-to-action flow without asking for a login.

1. **Report:** capture evidence, select an automatic or manual locality, and review before publication.
2. **Validate:** show how nearby residents can add a confirm/dispute signal to a public record.
3. **Prioritize:** explain the eight DRFI factors, deterministic score, and human-review boundary.
4. **Discover:** show locality-level patterns using the privacy-safe geographic fallback.
5. **Act:** show how a coordinator can move an issue through assignment and guarded status changes.

## Verified implementation status

| Area | Current, honest status |
|---|---|
| Vercel submission route | **Verified public and no-sign-in.** It serves the judge walkthrough without invoking the prior crashing serverless API. |
| Automated validation | **31 tests pass** across lifecycle, DRFI mathematics, presentation policy, visibility, authorization, Firebase configuration/identity boundaries, Firestore rules artifact, and Vercel fallback routing. |
| Deterministic DRFI | **Implemented and tested.** It does not depend on AI. |
| Firebase Google Sign-In | Client and session-bridge code is implemented; Firebase configuration and Google-provider path are validated. A full public Vercel sign-in E2E test remains intentionally pending while the Vercel submission route stays static. |
| Firestore | Default database is created. Civic data has not been migrated, and test-mode rules have not been replaced in the Firebase Console; no Firestore civic data is presented as live. |
| Maps, Vertex AI, Cloud Run, media storage, SMS, FCM push | Deferred from the zero-cost stage. The app shows only transparent fallbacks and no false live-service claims. |

## Google technology approach

The zero-cost hackathon stage uses a Firebase-ready browser foundation and Firebase Google Sign-In/Firestore boundaries. The production roadmap keeps Firebase Authentication, Firestore, App Check, Cloud Storage, Cloud Run, FCM, Maps Platform, Cloud Logging, and optional Vertex AI behind explicit security, billing, and validation gates.

Vertex AI is limited to editable draft triage—for example, a category suggestion or missing-evidence prompt. It never determines DRFI priority or replaces human evidence review.

## Architecture

```text
Vercel public judge walkthrough
        │
        ├─ report → community validation → deterministic DRFI → coordinator action
        │
        └─ public GitHub repository → tested civic contracts and implementation evidence

Firebase-ready boundary:
Google Sign-In → validated app session bridge → future Firestore migration
```

## Run and verify locally

```bash
pnpm install
pnpm check
pnpm test
pnpm build
pnpm dev
```

The repository intentionally excludes environment files, service-account credentials, private keys, raw identity documents, and internal credential setup notes.

## Integrity statement

JanaNiti does not claim that unconfigured Google services, live multi-citizen records, satellite data, WhatsApp, Aadhaar verification, or Firestore civic-data migration are operational. The submission distinguishes tested implementation, public walkthrough behavior, and deferred production integration so judges can evaluate it fairly.
