# Community Participation and Privacy Boundaries

## Design Principle

Jananiti’s local feed is a **civic verification space**, not a popularity contest. Citizens may support, dispute, or abstain from verifying a nearby issue; coordinators retain responsibility for classification, action, resolution, and escalation. Community signals inform transparency and DRFI demand evidence, but they never replace safety thresholds, source evidence, or human review.

| Capability | Public experience | Privacy and integrity rule |
|---|---|---|
| Local feed | A chronological, locality-aware stream of public civic records, updates, and verified community signals. | A report author’s identity, exact home/work location, contact information, and private requests never appear in the feed. |
| Reactions | One supportive or disputing reaction per signed-in account for a given civic record. | A reaction can be changed but not multiplied; visible counters are aggregate only. |
| Nearby verification | Eligible citizens receive a notification asking whether an issue is true, disputed, or not verifiable. | Eligibility is calculated from privacy-preserving locality/area matching. Exact user coordinates are not exposed to other users. |
| Badges | Earned badges recognize useful, verified participation such as thoughtful reports or reliable confirmations. | Badges are not purchased, do not grant administrative power, and can be withheld for abuse or coordinated manipulation. |
| Heat maps | Activity and priority patterns appear as area-level intensity, never as a list of residents. | Use report locations only at suitable public precision; private records are excluded. |
| DRFI signal | Verified support, disputes, and recency may contribute to the demand evidence factor. | Demand is capped and shown as one factor among infrastructure, population, service access, feasibility, spatial evidence, trend, and risk. |

## Verification States

| Citizen response | Meaning | Operational effect |
|---|---|---|
| `confirm` | The citizen can independently corroborate the issue. | Increases the reviewed community-evidence counter. |
| `dispute` | The citizen believes the description is inaccurate or no longer current. | Creates a visible review signal; it does not remove the report. |
| `unable_to_verify` | The citizen cannot reliably assess the issue. | Helps measure outreach without altering truth or priority. |

## Proximity and Abuse Controls

The first implementation will use a citizen’s opted-in locality, ward, or district—not continuous location tracking—to determine nearby-alert eligibility. A future coordinate-radius service must require explicit consent, limit retention, and provide a clear opt-out. Rate limits, one response per record/version, server-side authorization, and moderator/coordinator audit trails are mandatory. The platform must not gamify harassment, doxxing, or voting brigades.

> **A citizen’s report must remain actionable even when it receives few confirmations.** Remote locations, low-connectivity communities, and minority concerns must not be penalized by lack of social engagement.

## Visual Interaction Direction

Jananiti will use **familiar interaction patterns**, rather than copying a consumer platform’s visual identity. The community feed will feel immediate and human through large evidence media, compact action rows, local-area chips, update stories, profile rings for earned civic badges, and gesture-friendly cards. Local discovery will use clear search, location context, map/area cards, category chips, and grounded information hierarchy.

| Familiar interaction pattern | Jananiti adaptation | Deliberate distinction |
|---|---|---|
| Image-first feed card | A civic record with evidence, locality, status, public update, reactions, and verification state. | Uses civic category/status colors, traceable reference IDs, and non-promotional copy. |
| Story/update strip | A “what changed nearby” strip for new reports, verified updates, and resolved issues. | Stories link to auditable records; they do not disappear or encourage vanity engagement. |
| Reaction bar | Support/dispute actions plus a “verify this issue” entry point. | Counters are civic evidence indicators, not social popularity scores. |
| Local search and chips | Search by locality, issue type, status, and priority; quick area/category filters. | Results prioritise public safety, current status, and data provenance. |
| Map-result card | Area, category, recency, community evidence, and a public-safe point/cluster. | Never reproduces proprietary map styles, logos, tiles, screenshots, or branded UI. |
