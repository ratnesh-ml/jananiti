# Functional Validation Status

The authenticated environment currently contains one administrator account and no civic records. No civic item, comment, verification, or media record was inserted for testing because Jananiti must not present fabricated community activity as real public participation.

| Workflow | Verified evidence | Status |
|---|---|---|
| Authentication-first entry | App-level authentication gate renders sign-in for unauthenticated sessions; OAuth callback redirects to `/`, the For You route | Implemented; unauthenticated screen requires an isolated signed-out browser verification |
| Citizen report creation | Protected `civicItems.create` validates record fields; supports owner-checked evidence upload; public selected locality persists before creation; persistence creates one receipt | Implemented and covered by policy tests; needs a real citizen submission for live confirmation |
| Community feed | Public community feed returns public records only, includes attachment URLs, signal aggregates, and viewer verification state | Implemented; empty state observed because no records exist |
| Community verification and discussion | Protected routes upsert confirm/dispute/unable responses and create bounded comments/replies only on public records | Implemented; requires a second real authenticated account to validate participation |
| Heat map | Public coordinate-bearing records flow through category, priority, and locality filters into the privacy-safe fallback map | Implemented; empty map state observed because no coordinate-bearing records exist |
| Administrator operations | `adminProcedure` gates queue/detail/update APIs; authenticated administrator workspace showed zero-item queue without leaking private user data | Verified for admin empty state; item operations require a real submitted record |

The currently known external-service limitation remains the Google Maps bootstrap 401. The active CSS/grid map fallback continues to handle public coordinate discovery without claiming live Google Maps functionality.
