# Jananiti Landing and Civic-Gap Notes

## Mobile Landing Reference

The supplied mobile screenshot establishes a very specific composition target for the unauthenticated Jananiti entry page. The structure is minimal and vertically spacious rather than dashboard-dense. The top bar is light, sparse, and product-like, with a compact logo lockup on the left and two restrained actions on the right. The hero is centered deep in the viewport with a small capsule label, a short, emphatic headline, a one-paragraph explanatory subheading, and a compact action row. The overall effect is calm, premium, and mobile-first, with white space doing most of the visual work.

The strongest transferable characteristics are the **discipline of spacing**, the **small governance badge treatment**, the **single clear hero statement**, and the **simple blue-primary / blue-outline action pairing**. Jananiti should adopt those compositional principles while keeping its own identity, copy, and civic motifs.

## Government Portal Gap Findings

The reviewed documents repeatedly identify five structural problem classes that Jananiti should address in product design and messaging.

| Gap | What is broken today | Jananiti implication |
|---|---|---|
| Platform fragmentation | Citizens and officials must navigate multiple disconnected portals and datasets. | Jananiti should present a unified civic record and single citizen journey. |
| Citizen action gap | People may care, but existing systems do not make participation easy, guided, rewarding, or trackable. | The UI must feel social, simple, and motivating, with clear feedback loops. |
| Governance capacity gap | Public teams are understaffed and overloaded, so routing and reporting must be simplified. | Intake, triage, assignment, and DRFI must reduce operational burden. |
| Enforcement and compliance gap | Public-facing accountability, comments, and understandable disclosures are weak. | Jananiti should expose status, progress, and community verification transparently. |
| Data intelligence gap | Existing platforms collect data but do not turn it into local decisions or predictive insight. | Feed, alerts, DRFI, and heat-map views should convert records into action signals. |

## Platform-by-Platform Opportunity Signals

The reviewed analysis highlights missing features across current public systems: little or no hyperlocal feed behavior, weak mobile citizen journeys, no rewarding community engagement loop, poor public status visibility, limited plain-language summaries, and almost no neighborhood-level routing or verification. These are strong validation signals for Jananiti’s direction as a **social civic operating layer** rather than another static complaint portal.

## Design Consequences for the Next Frontend Pass

The landing page should stop feeling like a dense civic SaaS product and instead become a **minimal invitation into a civic participation network**. The first screen should primarily communicate three ideas: citizens can post clearly, local issues become visible, and action can be followed. The local feed, report composer, and verification flows should all inherit the same visual language so the transition from hero to product feels continuous rather than stitched together.

## Immediate Redesign Priorities

| Priority | Why it matters |
|---|---|
| Rebuild the home hero around the mobile reference composition | The current UI is too heavy and does not match the user’s preferred visual pacing. |
| Unify header, hero, feed, and report entry styling | The product currently feels like related pages rather than one coherent app. |
| Surface local participation as the core product promise | The documents emphasize guided public action, not only reporting. |
| Keep operational power in the background | Citizens should first see clarity, trust, and ease of participation. |

## Ward-Level Pilot Priorities

The supplied ward profile document defines six Indore pilot areas and shows that Jananiti’s category system must be grounded in recurring, observable local issues rather than abstract governance labels.

| Ward/context | Repeated local problems | Jananiti product priority |
|---|---|---|
| Ward 11, Bhagirathpura | Drinking-water contamination, choked drains, electricity hazards, garbage collection gaps. | Fast water, drainage, lighting, and waste reporting; health-risk escalation. |
| Ward 20, Gauri Nagar | Industrial discharge, waterlogging, stray-cattle traffic, potholes and dust. | Water-quality evidence, drainage reporting, road safety, and locality context. |
| Ward 24, Sant Balinath Maharaj | Auto-shop waste, non-functional streetlights, construction debris, stagnant puddles. | Image/video evidence, night-safety reports, debris routing, and mosquito-risk labels. |
| Ward 33, Sukliya | Summer water scarcity, intersection congestion, commercial waste, construction dust. | Time-aware water reports, congestion/parking context, commercial waste, and air-quality cues. |
| Ward 40, Khajrana | Pilgrim traffic pressure, single-use waste, chronic parking, drainage back-ups. | Event-sensitive alerts, crowd/road safety reports, waste and drainage verification. |
| Ward 52, Musakhedi | Sewer failures, open-drain overflow, drinking-water vulnerability, animal/solid waste. | Urgent sanitation and public-health reporting, weather-sensitive drainage patterns. |

The first-run feed and report composer should therefore foreground **water, drainage, waste, streetlighting, roads/safety, dust, and public-health risk** rather than forcing users through generic institutional taxonomies. Ward selection must remain optional and privacy-aware, but a locality choice should make the categories and feed immediately feel relevant.

## Complete Gap-to-Feature Matrix

| Source gap | Jananiti response now | Planned extension / external dependency |
|---|---|---|
| Fragmented portals and disconnected citizen journeys | One local feed, report composer, tracking page, profile, notifications, and coordinator workspace built around the same civic record. | Authorized source adapters and cross-department integration only after data-sharing approval. |
| No guided pathway from awareness to action | Mobile-first report composer, category chips, locality paths, visible status timeline, and contextual local feed. | Multilingual voice guidance, IVRS, and WhatsApp adapters. |
| Weak local participation and incentive loop | Privacy-safe reactions, verification responses, nearby prompts, earned badge rules, and transparent badge explainer. | Abuse monitoring, community moderation, and pilot-specific incentive policy. |
| Understaffed governance operations | Typed triage, routing status, assignment workspace, notifications, and DRFI review workflow. | Department systems, automated routing adapters, and approved SLA escalation. |
| Poor public accountability and compliance visibility | Public-safe progress updates, record tracker, community signals, and coordinator-reviewed priority explanation. | External compliance/audit datasets and legally approved public disclosure views. |
| Data collection without intelligence | Structured issue/category/location fields, community signals, DRFI factor inputs, priority explanation, and heat-map fallback. | Authorized weather, GIS, sensor, satellite, and government-data adapters. |
| Water, drainage, contamination, and health vulnerability | Water and sanitation categories; auto/manual location; short photo/audio/video evidence; public-health-relevant report context. | Validated water-quality, monsoon, and municipal asset data. |
| Waste, debris, streetlight, road, and safety issues | Waste, roads, lighting, safety, and environment report categories; local discovery; coordinator status workflow. | Department-specific work-order connectors and field-team verification. |
| Event, congestion, parking, and commercial-lane pressure | Local feed, verification prompt, category/status discovery, and DRFI urgency factors. | Event calendar, traffic, and parking data only through permitted APIs. |
| Accessibility and plain-language needs | Clear mobile composition, concise prompts, social-style interaction language, and planned multilingual input adapters. | Translation, TTS/STT, and accessibility testing with real participants. |
