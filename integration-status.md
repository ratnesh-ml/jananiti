# Jananiti Integration Status

## Verified Runtime Status

| Capability | Current status | Evidence and behavior | Next production action |
|---|---|---|---|
| Manus OAuth account sign-in | **Available through the initialized application scaffold.** | The application uses the platform’s established OAuth callback, session, and role-aware context. | Test with a real project account during acceptance; add locality/consent onboarding once signed in. |
| MySQL/TiDB persistence | **Connected.** | The civic schema migration completed successfully; tRPC persistence helpers target the connected database. | Extend schema for DRFI evidence, consent, and administrative configuration. |
| Typed frontend/backend connection | **Connected.** | Citizen, profile, notification, coordinator, and triage flows use the shared tRPC application router. | Add end-to-end real-account tests and administrative management procedures. |
| In-app notifications | **Implemented.** | Receipt, assignment, status, resolution, and update records are written for the intended recipient. | Add email/SMS/WhatsApp delivery only through approved, consented channel adapters. |
| Gemini triage | **Implemented as an optional server-side, structured draft.** | Live model catalog confirmed `gemini-3-flash-preview`; the procedure stores reviewable suggestions only. | Add cost/rate controls, abuse monitoring, and formal prompt/evaluation tests before production use. |
| Google Maps interactive JavaScript | **Blocked in the current managed runtime.** | The supported platform maps proxy returned `401 invalid token` with server credentials and `403` with frontend credentials. The client displays a clear fallback rather than a fake map. | Resolve the platform-proxy configuration with the platform/provider, or use a dedicated, restricted production Google Maps key through a reviewed server/client integration. |
| Location capture during map outage | **Partially available.** | Citizens can supply a clear locality/landmark; the application will add manual coordinate fields as a graceful fallback. | Restore pin-drop and map visualization only after the interactive maps bootstrap returns a verified 200 response. |
| Aadhaar identity verification | **Intentionally not implemented.** | The current product does not collect Aadhaar numbers, card images, VIDs, OTPs, biometrics, or e-KYC payloads. | Integrate only through a legally authorized Requesting Entity, informed consent, alternate-ID path, retention policy, security review, and UIDAI-compliant provider agreement. |

## Maps Resolution Path

The location model and map component are already part of Jananiti. The blocker is not a feature-design gap: the platform-provided Maps bootstrap path rejected both tested credential mechanisms. Until it is repaired, the product keeps the location label as an operationally useful fallback and does not display an empty visual area as if a map were working.

The production remedy should be selected after security review. Either the managed maps proxy must issue a valid bootstrap credential for the project, or an authorized Google Cloud project should supply a **restricted Maps JavaScript API key** limited to Jananiti’s verified web origins and services. The key must be supplied through the project’s secure environment configuration, never committed to source control or written into database records.

## Identity Safeguard

> Identity verification is a separate, high-risk capability—not a shortcut for complaint de-duplication. Jananiti’s immediate duplicate workflow must use report similarity, locality, timing, category, and human review. It must preserve a viable report path for people who do not use or cannot provide Aadhaar.

The government guidance reviewed for the project requires consent before Aadhaar authentication, describes use through authorized requesting entities, and emphasizes strict handling and retention of authentication information.[1] [2]

## References

[1]: https://uidai.gov.in/en/ecosystem/authentication-ecosystem.html "UIDAI Authentication Ecosystem"
[2]: https://www.pib.gov.in/PressReleasePage.aspx?PRID=1892991 "UIDAI informed-consent guidance for Requesting Entities"
