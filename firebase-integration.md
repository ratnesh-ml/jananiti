# Firebase and Google Sign-In Integration Plan

## Review Findings

The supplied Jananiti frontend uses a clean public entry pattern: a compact institutional logo, a small governance label, an action-oriented headline, a primary **Continue with Google** control, and secondary demo/tour actions. Jananiti can recreate the same *interaction hierarchy* with its own copy, components, and civic visual system. It must not copy the supplied site’s source, illustrations, or brand assets.

Firebase supports Google account authentication through the Firebase JavaScript SDK. Google must be enabled as a Firebase Authentication provider, and the deployed Jananiti domain must be listed as an authorized domain. Firebase recommends redirect-based flows for mobile devices, while popup flows can be appropriate on desktop.[1]

## Recommended Coexistence Architecture

| Concern | Current Jananiti service | Recommended Firebase role | Migration decision |
|---|---|---|---|
| Civic application session | Manus OAuth cookie and tRPC context | Firebase Authentication with Google provider | **Do not run independent identities permanently.** After configuration, verify Firebase ID tokens server-side and map each Firebase UID to a canonical application user. |
| Civic records, status history, DRFI, operations roles | MySQL/TiDB via Drizzle and tRPC | Keep as system of record during the hackathon build | **Keep current database.** It already provides relational integrity, typed APIs, and audit-oriented history. |
| Community feed reactions and verification | MySQL/TiDB and tRPC | Optional Firestore cache/realtime projection later | **Do not split writes now.** Introduce a controlled server-side projection only after access rules, conflicts, and retention are designed. |
| Citizen evidence uploads | S3 through authenticated application endpoint | Firebase Storage is optional later | **Keep current storage.** Any move requires content migration, owner mapping, retention, and Firebase Storage rules. |
| Server automation and role authority | Express + tRPC + server-side admin checks | Optional Cloud Functions for Firebase-only asynchronous work | **Do not migrate current operations mutation paths until tested.** |

> **Architecture decision:** Firebase Authentication can become Jananiti’s Google identity layer, but Firestore, Firebase Storage, and Cloud Functions should not replace the existing relational civic system without an approved migration plan. A partial dual-write setup would risk inconsistent civic records and unclear audit ownership.

## Required Firebase Project Configuration

| Requirement | Owner action | Why it is required |
|---|---|---|
| Firebase project | Create or select a project owned by the Jananiti team. | Establishes billing, audit, and resource ownership. |
| Google provider | Enable **Google** under Firebase Authentication. | Allows Firebase to begin Google OAuth. |
| Web app settings | Provide the Firebase web configuration fields: API key, auth domain, project ID, storage bucket, messaging sender ID, and app ID. | Initializes the Firebase web SDK. |
| Authorized domains | Add the production Jananiti domain and development preview domains. | Firebase only allows configured domains to initiate sign-in.[1] |
| Redirect handler | Confirm the Firebase `authDomain` and whitelist the exact OAuth handler path if a custom auth domain is used. | Prevents redirect and origin failures.[1] |
| Firestore/Storage | Create only in production mode with explicit rules and test rules before release. | Firebase client requests are evaluated against Security Rules; server libraries instead require IAM controls.[2] |
| Account linking | Approve a stable mapping from Firebase UID to Jananiti user ID, with a flow for existing Manus-OAuth accounts. | Avoids duplicate citizen identities and protects existing civic history. |

## Secure Access Boundary

The frontend must only receive the Firebase web configuration. Server-only service account credentials, private keys, and privileged Admin SDK configuration must never be sent to the browser or committed to the project. All civic writes remain routed through the application server until Firestore rules and server/IAM access policies are reviewed.

Firebase Security Rules use the signed-in identity in `request.auth` to control client access. Rules should be deny-by-default and permit only owner-scoped paths or explicitly role-authorized operations. Firebase’s server client libraries bypass Security Rules, so privileged server access requires carefully scoped IAM.[2] [3]

## Required Inputs Before Implementation

The Google sign-in implementation must wait for the Jananiti-owned Firebase project configuration. The team should provide the Firebase web configuration values through the secure secret workflow and confirm the authorized production domain. If an existing Firebase project is intended, the team should also state whether it already contains users or civic data; no automatic migration or replacement will be performed.

## References

[1]: https://firebase.google.com/docs/auth/web/google-signin "Authenticate using Google with JavaScript — Firebase"
[2]: https://firebase.google.com/docs/firestore/security/get-started "Get started with Cloud Firestore Security Rules — Firebase"
[3]: https://firebase.google.com/docs/rules/rules-and-auth "Security Rules and Firebase Authentication — Firebase"
