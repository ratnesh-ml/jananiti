# Jananiti System Boundaries

| Boundary | Primary responsibility | Current implementation |
|---|---|---|
| Citizen interface | Intro, sign-in, reporting, tracking, profile, notifications | `client/src/pages`, shared mobile shell |
| Community interface | Local feed, evidence, verification, discussion, discovery | `Home.tsx`, `PublicActivity.tsx`, `Discussion.tsx`, `Explore.tsx` |
| Administrator interface | Operations, assignment, DRFI priority review | `Operations.tsx`, `Assignments.tsx`, `Priorities.tsx`; backend `adminProcedure` |
| API | Authentication, validation, authorization, typed contracts | `server/routers.ts` with tRPC |
| Database | Structured civic records, updates, attachments, community signals, notifications, profiles | `drizzle/schema.ts`, migrations, `server/db.ts` |
| Object storage | Evidence bytes with ownership checks; database stores references | `server/civicAttachments.ts`, `server/storage.ts` |
| Google adapters | Auth, maps, AI, notifications, security, observability | Documented in `google-first-migration-plan.md`; credentials intentionally absent |

## Publication safety

The Git repository may contain source, migrations, documentation, and tests. It must not contain database URLs, JWT secrets, Firebase Admin keys, service-account files, `.env` files, raw Aadhaar data, or unrestricted Maps keys.
