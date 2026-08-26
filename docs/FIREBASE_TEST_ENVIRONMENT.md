# Isolated Firebase test environment

JanaNiti’s shareable test deployment should use a **separate Firebase project** such as `jananiti-test`; it must never reuse the production Firestore database. The application uses the same client code, `firestore.rules`, `storage.rules`, and `firestore.indexes.json` in both environments, so an end-to-end test exercises the real access model without creating production civic records.

Create a new Firebase project, enable Google Sign-In and Firestore, register a separate web application, and add only the dedicated test-host domain to Firebase Authentication’s Authorized domains. Configure its six public Firebase web values only in the Vercel **Preview** environment and set `VITE_JANANITI_ENV=test`. Do not add any production configuration to a preview deployment. Before inviting teammates, publish the tested Firestore rules and composite indexes to that test project.

Use the separate project only for synthetic test records that are labelled as test data, created by consenting teammates, and deleted when the test concludes. Do not upload personal identifiers, raw Aadhaar data, real complaint evidence, credentials, or production exports. The local `pnpm test:firebase-rules` command already tests the same Firestore policy with the Emulator Suite and does not access any Firebase project.

The production `jananiti-production` project remains blocked until its reviewed Firestore and Storage policies are published, `jananiti-team.vercel.app` is an authorized sign-in domain, and Google Sign-In plus public/private record flows pass a manually authenticated browser check.
