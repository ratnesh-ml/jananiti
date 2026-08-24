# Supplied JanaNiti Mobile Specification — Implementation Blueprint

The supplied mobile screens are the visual and interaction specification for the next Jananiti build. They are **not copied as image assets or external branded UI**. The application will reproduce their information hierarchy with original React components, Jananiti’s civic data model, and clear development fallbacks where a requested production integration remains unavailable.

| Screen | Target route | Required visual and functional construction | Data / fallback boundary | Test coverage |
|---|---|---|---|---|
| For You feed | `/` | JanaNiti top row, locality selector, search and alerts, four contextual tabs, evidence-first issue cards, validation ring, action bar, progress footer, five-item dock | Public civic feed, reactions, verification, attachments, status updates; anonymous civic record labels instead of fake people | Filter state, reaction switching, verification mutation input, evidence state rendering |
| Civic record | `/track?ref=` | Back/header actions, evidence gallery, labels, validation panel, score/stat summary, description, authority/status timeline, discussion preview | Public record, safe evidence metadata, signals, DRFI, updates, comments; missing metrics show “not yet assessed” rather than fabricated values | Public-id parsing, details states, comments/reply input, verification action states |
| Report | `/report` | Four-stage visual stepper; voice/photo/video/text controls; concise composer; location card; privacy statement; fixed mobile submit action | Browser file, media and geolocation APIs; no speech transcription or camera capture is claimed unless configured | Draft persistence, upload file validation, media type state, location validation |
| Review and confirm | `/report` review state | Stage two review surface, evidence preview, editable structured facts, clearly labeled deterministic development summary, confirm action | Existing report fields; Vertex/Gemini only when securely configured. No false AI diagnosis, severity, or extraction claims | Review transition, edit return, publish input, error/retry state |
| Locality map | `/heatmap` | Search/filter controls, category chips, locality map fallback, selected issue panel, category totals, nearby list, map dock state | Privacy-safe coordinate records; CSS/grid fallback active; Google Maps adapter disabled until valid configuration | Category/priority/locality filtering, cluster grouping, selected record state |
| Action Center | `/notifications` | Alert header, activity tabs, in-app update cards, community validation and resolution actions, no fabricated credits | Persistent in-app notifications only; Firebase Messaging is a future service | Notification filtering, unread state, mark-read mutation, no-service disclosure |
| Profile | `/me` | Identity-safe profile hero, account locality, real report/verification counts, earned badges, activity record list, editable preferences | Current profile, badges, items, notifications; impact measures are omitted until real calculation source exists | Auth gate, profile save, activity empty/loading state, preferences mutation |
| Explore | `/explore` | Search-first surface, popular real categories, nearby cards, category/locality sections, honest department placeholder | Public item data, actual category/locality aggregation; department routing is future model work | Query filtering, category selection, empty search state |
| Onboarding | `/onboarding` | Welcome explainer, six-step civic path, quick routes, notification permission disclosure | Static explanation paired with actual feature routes; push permission not claimed while FCM is absent | Navigation targets and accessibility landmarks |
| Sign in | `/signin` | Secure entry with account explanation and future Google sign-in disclosure | Existing session flow is live; Firebase Google provider stays visibly unavailable until credentials are supplied | Signed-out/signed-in states and login handler invocation |

## Mobile shell contract

The mobile shell will use one visual vocabulary: near-white canvas, deep cobalt as primary action, civic green as validation/positive state, red as dispute/urgent context, restrained rounded surfaces, compact dividers, and an elevated five-destination dock. The exact dock contract is **Home**, **Explore**, **Report**, **Activity**, and **Profile**. The report destination is the raised primary action.

The global top row will surface locality context, search, notification access, and account access without exposing exact user coordinates or identities. Route-specific tabs will remain client-side filter state unless they correspond to a server-backed operation.

## Data integrity rules

Every visible count must originate from a real aggregate or be omitted. No fake user profiles, comments, reports, validation percentages, response times, credits, impact measures, or government departments will be seeded into production. Example layouts can remain in empty-state copy, but never masquerade as real civic activity.

Community validation is an evidence signal. It does not automatically establish truth, alter a public record, set DRFI priority, or resolve an issue. AI suggestions are only selectable review aids; citizens and authorized coordinators retain control.

## Automated test matrix

The self-authored suite will cover deterministic civic workflow behavior: lifecycle guards; DRFI thresholds; report draft serialization; attachment type/size classification; review-stage validation; map filters and cluster derivation; comment parent integrity; reaction and verification request shape; notification filtering; authenticated versus anonymous action affordances; and safe fallback disclosure for Maps, Firebase, FCM, and Vertex AI. Browser screenshots validate visual layout; unit tests validate the states and data transformations behind it.
