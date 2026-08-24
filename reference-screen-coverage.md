# JanaNiti Reference-Screen Coverage Matrix

## Interpretation boundary

The supplied ten screenshots define an interaction and visual-direction benchmark. They are **not** embedded in JanaNiti, and their photography, people, counts, agencies, badges, locations, and claims are not treated as application data. This matrix records the original Jananiti route or component that covers each workflow and the remaining work needed to make it genuine.

| Ref. | Reference intent | Current Jananiti route and supporting files | Working today | Required completion work |
|---|---|---|---|---|
| 1 | Home / social feed | `/activity` — `PublicActivity.tsx`, `CivicHeader.tsx`, `CivicMobileNav` | Locality-aware public query, category filters, reaction and verification controls, empty state, map failure state | Rename/navigation alignment for **For You / My locality / Trending**, render evidence media safely, add comments, save/share, pagination, misinformation reporting, and verified priority chip. |
| 2 | Issue detail | `/track` — `TrackIssue.tsx`, `routers.ts`, `db.ts` | Status timeline and human-reviewed DRFI explanation for actual civic records | Add route-bound record detail, media carousel, public comments, independent-report count, community validation ratio, affected-area context, resolution-verification action, and saved/share state. |
| 3 | Report an issue | `/report` — `SubmitIssue.tsx`, `civicAttachments.ts` | Short text form, category selection, image/audio/video/document selection, 10 MB validation, browser location and manual coordinate path | Add visible recorder/camera capability state, upload progress/retry/delete, media previews, local draft restore/clear, location correction, and stronger progressive-step affordance. |
| 4 | AI review and confirm | Current reporter plus operations triage — `SubmitIssue.tsx`, `Operations.tsx`, `routers.ts` | Optional server-side Gemini output remains a human-review draft where configured | Create a dedicated review-before-submit screen using a deterministic development suggestion adapter and a later Vertex Gemini adapter; citizen must be able to edit or confirm every suggested field. |
| 5 | Locality map | `/heatmap` — `Heatmap.tsx`, `CivicMap.tsx`, `mapsScriptProxy.ts` | Privacy-safe CSS/grid fallback and manually shared coordinates | Build mock map controls, local issue selection, clusters, category/priority/locality filters, and a production `GoogleMapsService`; do not claim live Maps while the current proxy returns 401. |
| 6 | Action center / activity | Notifications in `/me`; activity discovery in `/activity` — `CitizenProfile.tsx`, `PublicActivity.tsx` | Persistent in-app civic notification records, notification preferences, profile activity | Add a standalone in-app action center with unread count, filter chips, mark-read/mark-all-read, deep links, verification and resolution prompts, and visibly development-only notification simulation. |
| 7 | Citizen profile | `/me` and `/profile` — `CitizenProfile.tsx`, `db.ts`, `routers.ts` | Profile/locality preferences, consent wording, personal requests, notifications | Add editable avatar and account settings, earned metrics only from live records, achievements list, recent activity cards, and a development profile mode that does not imitate production statistics. |
| 8 | Explore / search | Partial search on `/activity`; no dedicated explore route | Feed query/category filtering, CSS heat-map entry | Add an original Google-inspired `/explore` route for issues, localities, categories, departments, popular searches, near-you discovery, and transparent suggestion sources. |
| 9 | First-time introduction | `/` — `Home.tsx`, `CivicHeader.tsx` | Original hero, explanation, report/feed CTAs, privacy reassurance | Add returning-user redirect decision, complete report-to-community-to-resolution walkthrough, quick actions, notification opt-in state, and a clearly optional invite flow. |
| 10 | Sign-in | Manus OAuth entry through current `useAuth` scaffolding | Session-aware protected citizen/admin screens and sign-out | Build original dedicated sign-in/up/error/loading UI with an explicit development-auth adapter; replace with Firebase Google/email flows only after owned Firebase configuration, authorized domains, account-linking, and migration tests are ready. |

## Cross-screen interaction coverage

| Workflow | Current status | Evidence source | Next implementation step |
|---|---|---|---|
| One verification response per citizen per civic item | Implemented in data model/mutation; not end-to-end validated with two eligible accounts | `schema.ts`, `db.ts`, `routers.ts`, `VerifyNearby.tsx` | Add mutation tests and real-account acceptance test. |
| Status and coordinator audit history | Implemented with lifecycle guards and immutable updates | `drfiMath.ts`, `db.ts`, `routers.ts`, `Operations.tsx` | Add assignment-to-resolution integration coverage and detail rendering. |
| Media evidence | Secure ownership-checked upload path implemented | `civicAttachments.ts`, attachments schema, `SubmitIssue.tsx` | Surface previews/playback in reporter, detail, and feed; test failure/retry paths. |
| Locality discovery and notifications | Profile locality filters feed and local verification alerts | `CitizenProfile.tsx`, `PublicActivity.tsx`, `db.ts`, `routers.ts` | Exercise with genuine same-locality test accounts and make locality selection clearer in reporting. |
| DRFI priority | Deterministic server calculation and human-reviewed factors exist | `drfiMath.ts`, `Priorities.tsx`, `TrackIssue.tsx` | Add community-evidence propagation tests and public priority chip. |
| Google production services | Not configured | `google-first-migration-plan.md`, `firebase-integration.md` | Build contracts/fallbacks now; request final configuration only after the full development application is validated. |

## Implementation order

The next cohesive release should first close Screen 3 and Screen 1 evidence/draft gaps, then create Screen 2 issue detail and Screen 4 review-confirm flow. This sequence makes reporting, reviewing, publishing, seeing, and validating a civic record demonstrable with real controlled data before broadening to Explore, Action Center, and the Firebase cutover.
