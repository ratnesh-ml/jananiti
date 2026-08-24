# JanaNiti

> **Community-powered civic action: report, validate, prioritize, and close the loop.**

JanaNiti is a mobile-first civic governance platform built for **Code for Communities 2**. It gives citizens a simple way to report local problems, lets nearby residents add accountable community validation, and gives coordinators an explainable operational view of what needs attention first.

## The challenge

Residents often report road, waste, water, safety, and environmental problems through disconnected channels. They cannot see whether a report is credible, whether anyone has acted, or why one issue is prioritized over another. Civic teams, meanwhile, receive incomplete evidence and lack a transparent, locality-aware queue.

## The JanaNiti response

| Civic participant | Judge-demo capability |
|---|---|
| **Citizen** | Intro-first entry, secure account path, short evidence-led issue reporting, automatic/manual location, local draft, review-and-confirm step, and issue tracking. |
| **Community** | Public local feed, evidence cards, true/not-true verification, privacy-preserving discussion, locality discovery, badges, and in-app activity. |
| **Coordinator** | Role-gated operations queue, assignment, valid lifecycle changes, evidence review, and explainable priority review. |

## What makes it different

### 1. Community validation, not anonymous noise

Residents can confirm, dispute, or decline to verify a public record. The community layer is separate from simple reactions and uses a single response per user per civic record. Public reports can also prompt locality-aware verification outreach without exposing a resident’s exact location.

### 2. Explainable DRFI priority

The **DRFI** score is deterministic and human-reviewable. It weights demand, population impact, infrastructure gap, service access, budget feasibility, geospatial reality, trend growth, and risk urgency. Its score maps to transparent priority bands, while the final operational decision remains with a coordinator.

### 3. Human-centred evidence and privacy

The reporting flow supports text, images, audio, short video, documents, and automatic or manual location. Public/private visibility is explicit. JanaNiti does not collect Aadhaar, VID, OTPs, biometrics, or e-KYC payloads.

### 4. A Google-native production roadmap

The current prototype demonstrates the civic workflows and is prepared for migration to **Firebase Authentication, Firestore, Cloud Storage, Cloud Run, Firebase Cloud Messaging, Google Maps Platform, Firebase App Check, Cloud Logging, and Vertex AI**. Vertex AI is planned only for editable triage drafts such as category suggestions and missing-evidence prompts; it does not replace DRFI or human review.

## Judge demo route

1. Open JanaNiti and show the intro-first journey into secure sign-in.
2. Open the **For You** feed to show evidence-led local records, community signals, and status context.
3. Select **Report** and demonstrate audio/photo/video/text evidence, location choice, draft persistence, and review confirmation.
4. Open an issue to explain the validation breakdown, discussion, updates, and the DRFI priority rationale.
5. Open **Explore / Locality Map** to show privacy-safe geographic discovery and filtering.
6. Open the **Coordinator** workspace to show assignment, lifecycle guardrails, and explainable priority factors.
7. Close with the Google-native deployment path and the guardrail that AI drafts are always reviewable.

## Architecture at a glance

```text
React mobile client → typed API → civic workflow layer → structured data + evidence metadata
        │                   │
        ├─ citizen/community routes
        └─ role-gated coordinator routes

Google production target:
Firebase Auth + Firestore + Cloud Storage + Cloud Run + FCM + Maps + App Check + Vertex AI
```

## Run locally

```bash
pnpm install
pnpm check
pnpm test
pnpm dev
```

The current suite contains automated checks for lifecycle guards, DRFI priority calculation, public/private visibility policy, locality routing, map eligibility, verification mapping, administrator access policy, and civic presentation rules.

## Submission links

| Resource | Link |
|---|---|
| Live managed preview | https://jananiti-fspr6tck.manus.space |
| Source repository | https://github.com/ratnesh-ml/jananiti |
| Hackathon event | https://hack2skill.com/event/codeforcommunities2/registration |

## Integrity statement

JanaNiti does not claim a production Google Maps, Firebase, FCM, satellite, WhatsApp, or Aadhaar integration before it is configured and tested. The prototype keeps fallbacks visible and names its service boundaries honestly.
