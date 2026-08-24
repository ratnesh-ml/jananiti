# JanaNiti — Community-Powered Civic Action

> **Your city. Your voice. Real change.** JanaNiti turns a local observation into a structured civic record that residents can verify and coordinators can act upon.

JanaNiti is prepared for the [Code for Communities 2](https://hack2skill.com/event/codeforcommunities2/registration) hackathon as a mobile-first civic platform. It connects citizens, local communities, and civic coordinators in a single accountable flow: **report → validate → prioritize → act → close the loop**.

## The problem

Local civic complaints are often fragmented, difficult to validate, and hard to track after submission. Residents lack a trustworthy local feed, administrators lack a structured evidence queue, and issue priority is rarely explained.

## The Jananiti solution

| Participant | What they can do now |
|---|---|
| **Citizen** | Start with a short introduction, securely sign in, submit text/image/audio/video evidence, choose automatic or manual location, save a local draft, track a report, and receive in-app updates. |
| **Community** | Discover public local records, react, confirm or dispute an issue, contribute privacy-preserving discussion, and inspect the public locality fallback map. |
| **Coordinator / admin** | Access role-gated queues, review records and public evidence, assign work, change valid status transitions, and set explainable DRFI priority factors. |

## Current architecture

```text
client/                 React + TypeScript + Tailwind mobile experience
  pages/                citizen, community, map, and coordinator screens
  components/           shared shell, header, navigation, map wrapper
server/                 Express + tRPC application boundary
  routers.ts            typed protected/public/admin API contracts
  db.ts                 persistence helpers and query composition
drizzle/                MySQL/TiDB schema and ordered migrations
server/storage.ts       secure object-storage references; no media BLOBs
docs/                   architecture, privacy, research, Firebase strategy
```

The production target is Google-first: Firebase Authentication, Firestore/Cloud Storage where adopted, Cloud Functions, FCM, Maps Platform, Vertex AI, App Check, Analytics, Logging, and Secret Manager. These services are **documented adapters, not falsely claimed live integrations** until project-owned configuration is supplied.

## Entry and demo flow

1. A first-time visitor sees the JanaNiti introduction.
2. The visitor proceeds to secure sign-in.
3. An authenticated citizen reaches the **For You** civic feed.
4. The citizen creates a report, confirms the review step, and receives one in-app receipt.
5. A public report uses the selected locality for local discovery and nearby verification eligibility.
6. A coordinator views the role-gated operational queue, assignment controls, status workflow, and DRFI workspace.

## Honest feature status

| Capability | Status |
|---|---|
| Secure account session and protected actions | Implemented with the current Manus OAuth scaffold; Firebase account linking is a planned migration. |
| Civic records, lifecycle, public/private visibility, evidence references | Implemented. |
| Community feed, reactions, verification, discussion, badges | Implemented; real community content is not seeded or fabricated. |
| DRFI explainable priority factors | Implemented with deterministic scoring and human-reviewed inputs. |
| Locality filtering and CSS/grid map fallback | Implemented for public coordinate-bearing records. |
| Live Google Maps | Not live: the current platform bootstrap returns a documented 401. The fallback remains active. |
| Firebase Google sign-in, FCM, Vertex AI | Not live until project-owned credentials are supplied and authorized domains are configured. |

## Local development

```bash
pnpm install
pnpm check
pnpm test
pnpm dev
```

The project expects its managed database, storage, OAuth, and environment variables from the active development platform. Do not commit `.env` files, service-account JSON, Firebase Admin keys, or unrestricted Maps keys.

## Quality checks

```bash
pnpm check       # TypeScript compilation
pnpm test        # Vitest: current suite has 17 tests
```

The suite covers authentication logout, civic lifecycle guards, DRFI logic, visibility and locality policy, map eligibility, admin access policy, and civic presentation calculations. See `functional-validation-status.md` for the non-fabricated live-validation boundary.

## Privacy and safety commitments

JanaNiti does not collect Aadhaar, VID, OTPs, biometrics, Aadhaar scans, or e-KYC payloads. Public reporting exposes only the information a citizen intentionally provides; exact resident location is not published. Future duplicate prevention must use authorized, consented, legally compliant systems with a non-Aadhaar alternative.

## Credential handoff

Read [`credentials-setup-guide.md`](./credentials-setup-guide.md) before enabling Firebase, Maps, Vertex AI, FCM, or production security services. It explains what is needed, when it is needed, and how a beginner can obtain it safely.

## Deployment

The current managed deployment is live at `https://jananiti-fspr6tck.manus.space`. A Vercel path requires GitHub authorization plus a compatible server deployment configuration and environment-variable handoff; it must not be published until those are validated.

## Team handoff checklist

- [ ] Enable the GitHub connector and select repository owner/name.
- [ ] Enable the Vercel connector or provide a Vercel team/project authorization.
- [ ] Confirm whether Vercel will host the Express API and which database/storage endpoints it can access.
- [ ] Supply Firebase Web App configuration only when Firebase Auth is ready to be activated.
- [ ] Supply a restricted Google Maps browser key only when live Maps is ready to replace the fallback.
- [ ] Keep all privileged keys in managed secrets, never source control.
