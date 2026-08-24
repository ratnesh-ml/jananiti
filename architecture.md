# Jananiti Architecture and Product Decisions

## Product Boundary

Jananiti is being implemented as a **civic action portal**, not merely a complaint form or an opaque AI dashboard. Citizens can discover local activity, submit a structured issue with a map location, follow public and private updates, and review their personal request history. Authorized coordinators receive a separate operations workspace where they can review, assign, update, and resolve items through an auditable lifecycle.

The architecture deliberately makes the initial web portal compatible with the broader Jananiti vision of multimodal intake, geographic reasoning, and evidence-based prioritization described in the supplied solution document. It implements the practical first layer—web reports, transparent updates, maps, and human coordination—while preserving extension points for voice, image, WhatsApp, IVRS, data fusion, and future constituency intelligence.

## Domain Model

| Domain entity | Responsibility | Important relationships |
|---|---|---|
| `users` | Authenticated identity and authorization role supplied by the application scaffold. | A user can own reports, receive notifications, and act on updates. |
| `citizenProfiles` | Optional persistent locality and contact-preference data for a citizen. | One-to-one with a user. |
| `civicItems` | The canonical civic request or issue, including description, category, current lifecycle state, location, source channel, and visibility. | Owned by one citizen; optionally assigned to a coordinator; has many updates and notifications. |
| `civicItemUpdates` | Immutable audit trail of receipt, public progress note, assignment, status change, and resolution rationale. | Belongs to one civic item and may reference the actor who made the update. |
| `civicNotifications` | In-app status and assignment alerts for citizens and coordinators. | Belongs to a recipient and optionally references a civic item. |
| `triageInsights` | Reviewable AI or rule-assisted category, urgency, summary, and confidence suggestions. | Belongs to one civic item; never supersedes a coordinator decision. |

## Status Lifecycle

| State | Citizen-facing meaning | Coordinator action |
|---|---|---|
| `submitted` | The request has been received. | Review information and confirm routing. |
| `acknowledged` | The issue is visible to the responsible operations team. | Classify, add a progress note, or assign ownership. |
| `assigned` | A coordinator or department has ownership. | Maintain assignment and begin work. |
| `in_progress` | Work or verification is under way. | Post a useful public or private progress update. |
| `resolved` | The team believes the underlying issue has been addressed. | Record the resolution rationale and invite follow-up feedback. |
| `closed` | The record is administratively complete. | Reopen only through a documented new update. |

No lifecycle mutation overwrites history. Each change creates a `civicItemUpdates` record and corresponding in-app notifications. This ensures that the public progress trail and the coordinator audit trail can grow independently without redesigning the core object.

## Modular Node.js and tRPC Design

The application uses the existing React, Express, tRPC, Drizzle, and OAuth scaffold. Domain logic is separated by purpose so that later capabilities can be added without rewriting the citizen-facing system.

| Router/module | Primary procedures | Access model |
|---|---|---|
| `profile` | `getMine`, `updateMine` | Authenticated citizen or coordinator. |
| `civicItems` | `create`, `publicList`, `publicDetail`, `mine`, `mapActivity` | Public reads are privacy-filtered; creation and personal history require authentication. |
| `operations` | `queue`, `assign`, `addUpdate`, `changeStatus`, `resolve` | Coordinator/admin only. |
| `notifications` | `mine`, `markRead` | Authenticated recipient only. |
| `triage` | `suggest`, `review` | Triage runs server-side; final review is coordinator controlled. |
| `analytics` | `overview`, `categoryBreakdown`, `geoActivity` | Public aggregates are privacy-safe; richer operations analysis is role gated. |

The existing FastAPI backend offers useful conceptual counterparts—multimodal submissions, submission history, analytics, rankings, and map views—but the new implementation will expose these capabilities as strongly typed, modular tRPC contracts rather than coupling new UI code to a separate REST surface.

## Google Technology Strategy

The hackathon’s public materials explicitly emphasize AI-powered public infrastructure and governance work using Google Cloud and Google’s latest AI technology.[1][2] Jananiti therefore chooses **visible, defensible, and scoped** Google technology integration rather than a broad set of unverified claims.

| Technology | Status in this build | Civic value | Constraint and safeguard |
|---|---|---|---|
| Google Maps JavaScript API | **Implemented through the scaffold’s supported maps integration.** | Citizens can drop a precise pin; the public and coordinator views can browse activity by area. | A map click is explicit user input. Public views show generalized activity rather than a reporter’s personal details. |
| Gemini Flash via the server-side model proxy | **Planned as the AI triage adapter, with live model discovery before invocation.** | Produces a structured, reviewable suggestion for title, category, urgency, and concise summary from a citizen’s text. | The system minimizes input, requests structured output, records it as a suggestion, and requires human coordinator review. |
| Vertex AI / Google Cloud Run / Cloud SQL | **Deployment path only; not represented as live integration in the present app.** | Provides a credible route to production-scale, region-aware processing and model governance. | Requires a configured Google Cloud project, billing, service identities, data-retention policy, and security review before adoption. |
| Google Earth Engine | **Future data-fusion module.** | Could support climate, land, and change signals for later demand-reality analysis. | It is deliberately excluded from the core hackathon flow until there is a specific, validated use case and permitted data source. |

> **Decision:** The demo will use Google Maps as a working, user-visible capability and present Gemini-assisted triage as a transparent human-in-the-loop feature. It will not claim live satellite intelligence, performance scoring, or government data fusion without actual validated sources.

## Privacy, Safety, and Trust Decisions

| Risk | Product response |
|---|---|
| Location exposes a citizen or sensitive site. | Store location for authorized operations; display public activity at an appropriate level of precision and never attach a reporter’s identity to the public feed. |
| AI produces a wrong or biased classification. | Treat AI as a draft triage insight; maintain source text, human-editable category/status, and a visible “review required” state. |
| Public updates become vague or misleading. | Require a status change or resolution to carry a structured update note and timestamp. |
| Coordinator access is too broad. | Use the existing server-side `adminProcedure` boundary for coordinator operations. |
| Future channels add data without a unified model. | Preserve `sourceChannel`, `contentType`, and optional raw-content reference fields on every civic item. |

## Near-Term Modules Beyond the Framework

The first release deliberately does not simulate external WhatsApp, voice, IVRS, satellite, or administrative datasets. The next modules should add these capabilities only behind service adapters and documented privacy controls: a channel-ingestion adapter, a multilingual transcription adapter, a semantic grouping service, an external-indicator data service, and a priority-ranking service. This sequence mirrors the provided solution’s phased roadmap while keeping the MVP operationally useful from day one.

## References

[1]: https://konfhub.com/code-for-communities-2nd-edition "Code for Communities 2.0 event listing"
[2]: https://gdg.community.dev/events/details/google-gdg-bhubaneswar-presents-build-with-ai-code-for-communities/cohost-gdg-bhubaneswar/ "GDG Bhubaneswar Build with AI: Code for Communities"

## Complete Slide-Deck Coverage Matrix

The supplied decks describe the **full Jananiti platform direction**. The table below makes each major capability explicit and prevents the application from making unsupported claims.

| Deck capability | Product/data requirement | Delivery classification |
|---|---|---|
| Citizen reports by text | Authenticated record, category, narrative, location label, visibility, source channel, and status history. | **Implemented core.** |
| Voice, photo, video, WhatsApp, SMS, IVRS, email, social, portal, and field-worker intake | A normalized raw-input envelope with source channel, modality, origin reference, consent, content reference, language, and processing state. | **Configurable framework / external-channel adapters.** Web text is active; media and external channels require their own secure adapters. |
| Multilingual understanding, speech recognition, OCR, image understanding, embeddings, RAG | A server-side intelligence job accepts the normalized input, writes a reviewable result, and never silently changes the civic record. | **Adapter architecture.** Gemini text triage is the first optional implementation; other services require configured providers and content consent. |
| Classification, geo-tagging, maps, insight generation, recommendations | Structured category, coordinates, locality, human review status, `triageInsights`, and `civicItemUpdates`. | **Partially implemented.** Structured classification/locations are active; live interactive-map bootstrap remains dependent on a valid platform map credential. |
| Priority dashboard, heatmap, issues, reports, analytics, settings | Public-safe aggregates plus role-gated operations, factor evidence, priority results, configuration, and audit history. | **Implemented foundation; DRFI/admin analytics are next build items.** |
| Demand-Reality Fusion Index | Factor definitions, weights, evidence sources, normalized values, computed score, explanation, reviewer, and calculation timestamp. | **To be implemented as an explainable calculation engine.** |
| Knowledge graph | Entities for locations, services, assets, schemes, evidence, requests, and relations. | **Future service/module.** Relational identifiers are preserved now for later graph projection. |
| Satellite validation, GIS, IoT, predictive insights | Trusted upstream source, data license, spatial/time coverage, data freshness, and human validation. | **Deferred external-data integrations.** No simulated validation is shown. |
| Firebase, Cloud Run, Vertex AI, BigQuery, Cloud Storage, Cloud Monitoring | Cloud project, billing, security identities, retention policy, secrets, observability, and deployment controls. | **Production reference architecture.** Not claimed as active in the current managed project. |
| Transparent outcomes and feedback loop | Resolution evidence, citizen follow-up, feedback, reopen flow, and outcome metrics derived from real records. | **Core status history is active; feedback/outcome module is next build.** |

## Correct Inputs and Data Boundaries

> **Rule:** A civic report is an evidence-backed record. Inputs must be explicit about source, authority, freshness, and whether they were supplied by a citizen, a coordinator, or an external data provider.

| Input group | Required or optional fields | Source of truth | Use in the platform |
|---|---|---|---|
| Citizen report | Reporter account, title, description, category, location label, optional coordinates, visibility choice, source channel, content type, submitted time. | Citizen and authenticated application session. | Intake, routing, status tracking, duplicate candidate detection. |
| Attachments | Storage key, original filename, MIME type, size, capture consent, upload time, extraction status. | Secure object storage; never database BLOBs. | Future voice/photo/document analysis and human review. |
| Locality context | Constituency/city, ward/block, locality/landmark, geographic point or approved boundary reference. | Citizen input plus authorized coordinator correction. | Map, locality grouping, public aggregation, DRFI geography. |
| Issue operations | Current status, assignment, update note, public/private flag, resolution evidence, actor, timestamp. | Authorized coordinator action. | Citizen communication, audit, operational accountability. |
| Demand evidence | Count of similar verified requests, geographic spread, recency, urgency assessment, duplicate-cluster confidence. | Calculated from Jananiti records and reviewed by coordinators. | DRFI demand factor; workload and priority dashboard. |
| Population impact | Affected population estimate, coverage area, vulnerable-group context where lawful and policy-approved. | Official/statistical sources or manually cited administrative evidence. | DRFI impact factor. Never inferred from sensitive identity data without authorization. |
| Infrastructure/service reality | Asset/service identifier, availability, capacity, condition, access distance, inspection or source reference, observation date. | Verified government, field, or permitted external data. | DRFI infrastructure, service-access, and geospatial factors. |
| Budget feasibility | Cost estimate, funding source, budget availability, maintenance implication, confidence level. | Authorized administrative/budget input. | DRFI feasibility factor; recommendation context. |
| Risk and urgency | Hazard type, affected people, time sensitivity, severity, verification note, reviewer. | Coordinator or authorized field-team evidence. | DRFI urgency factor and escalation policy. |

## Explainable DRFI Model

The DRFI should not be a black-box score. Jananiti will calculate it only from declared, dated, reviewable factor records and will show both the aggregate score and the factors that produced it.

| Factor | Suggested default weight | Correct evidence input | Guardrail |
|---|---:|---|---|
| Citizen demand | 20% | Verified request count, recency, geographic breadth, clustered duplicate count. | Remove suspected duplicates and retain the review trail. |
| Population impact | 15% | Affected-population estimate tied to a defined area and cited source. | Do not infer sensitive demographic traits from Aadhaar or casual text. |
| Infrastructure gap | 15% | Asset condition, capacity shortfall, inspection record, or authoritative dataset. | Mark unverified values as provisional. |
| Service access | 10% | Distance, availability, operating hours, coverage, or service-level evidence. | Do not use an assumed service map as fact. |
| Budget feasibility | 10% | Cost, funds, resource availability, and policy/plan alignment. | A low cost must not override a safety-critical risk. |
| Geospatial reality | 10% | Approved spatial data, field validation, permitted imagery, or map-supported evidence. | Keep source/date and coordinate precision. |
| Trend and growth | 10% | Time series of verified requests or reliable local indicators. | Do not calculate a trend from a single observation. |
| Risk and urgency | 10% | Human-reviewed safety, health, climate, or time-critical assessment. | Escalation policies can override the aggregate score for immediate hazards. |

With normalized factor values `fᵢ` between 0 and 100 and policy-configured weights `wᵢ` that sum to 1, the initial score is `DRFI = Σ(wᵢ × fᵢ)`. Every calculation needs a factor snapshot, weight version, evidence references, review status, and timestamp. The administration workspace will allow authorized reviewers to inspect and correct inputs before a score is used for a decision.

## Future Identity and Duplicate-Prevention Design

Jananiti will **not collect, transmit, hash, or persist a raw Aadhaar number, Aadhaar scan, Virtual ID, OTP, biometric, or e-KYC payload in this application**. UIDAI states that authentication is performed through authorized requesting entities, requires consent, and that identity information is only used for submission to CIDR for authentication.[3] UIDAI/PIB guidance also calls for informed consent, limited log retention, and prohibits ordinary storage of Aadhaar without masking/redaction and authorization.[4]

| Design decision | Jananiti rule |
|---|---|
| Current account creation | Use the existing OAuth identity and verified session. It creates a stable application user without creating a sensitive-government-ID store. |
| Duplicate prevention now | Combine same-account repeat detection, similarity of title/description, category, time window, approximate location, and coordinator review. A candidate duplicate is a review signal, not an automatic rejection. |
| Future Aadhaar verification | Use only through a legally authorized Requesting Entity and a formally approved provider integration after privacy, security, retention, alternate-ID, grievance, and audit requirements are complete. |
| Future stored value | If a lawful provider returns a provider-specific, non-reversible reference or verification outcome, retain only the minimal allowed reference, verification purpose, consent receipt, status, and expiry/retention metadata. |
| Alternate path | Always provide viable non-Aadhaar identity and reporting paths. Aadhaar must not become a hidden prerequisite for raising a civic concern. |
| Prohibited implementation | No raw Aadhaar form field, no image upload for Aadhaar as a general intake attachment, no biometric collection, no 1:N identity lookup, and no denial of civic-service access based solely on a duplicate candidate. |

## Connected Platform Modules

| Module | Backend responsibility | Frontend surface | Role boundary |
|---|---|---|---|
| Account and consent | Profile, contact preferences, consent receipts, account activity, future verification state. | Citizen profile and account setup. | Individual user; administrators view only authorized operational metadata. |
| Intake and media | Civic item, normalized channel metadata, secure attachment metadata, duplicate candidates. | Text-first reporter with staged media/channel extensions. | Citizen submits; coordinator reviews. |
| Intelligence | Triage drafts, language/extraction jobs, similarity candidates, insight review state. | Coordinator-side explainable draft panels. | Human approval required before operational use. |
| DRFI and evidence | Factor values, weights, evidence links, calculation snapshots, rankings. | Priority dashboard and factor editor. | Administrator/coordinator only. |
| Operations | Assignment, status lifecycle, public/internal updates, notifications, resolution evidence. | Coordinator workspace. | Coordinator/admin only. |
| Analytics and transparency | Privacy-safe aggregate counts, category/time trends, geographic aggregations, outcome metrics. | Public activity and administrator analytics. | Public aggregates; privileged details role gated. |
| Governance and audit | Roles, configuration versions, consent records, immutable updates, access-sensitive event logging. | Admin control centre. | Admin only. |

## Delivery Roadmap

| Horizon | Delivered scope | External dependencies intentionally deferred |
|---|---|---|
| Hackathon MVP | Authenticated citizen accounts, structured web intake, lifecycle history, in-app notifications, role-gated coordinator workspace, transparent triage, privacy-safe public activity, database/tRPC boundaries, initial DRFI data model and admin review. | Live Aadhaar verification, external channels, voice/image/OCR, official datasets, GIS/IoT/satellite, production Google Cloud services. |
| Next platform build | Secure media storage, source-channel adapters, language/attachment processing jobs, duplicate-candidate review, DRFI evidence forms, calculation history, roles/users administration, feedback/reopen flow, analytics. | Only providers approved by security, compliance, budget, and data-licensing review. |
| Production scale | Lawful identity-verification provider, authorized datasets, governed cloud project, observability, retention tooling, warehouse/graph projections, locality tenancy, field-team and department integrations. | National scale claims and automated action execution until pilot validation demonstrates reliability and accountability. |

[3]: https://uidai.gov.in/en/ecosystem/authentication-ecosystem.html "UIDAI Authentication Ecosystem"
[4]: https://www.pib.gov.in/PressReleasePage.aspx?PRID=1892991 "UIDAI informed-consent guidance for Requesting Entities"
