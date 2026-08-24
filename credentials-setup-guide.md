# Jananiti Google and Firebase Setup Guide

Jananiti currently works with its existing account, database, storage, and privacy-safe development-map fallback. **Do not send any credential until a corresponding feature is ready to activate.** The following services are the recommended production path; they are not currently presented as live in the application.

| When to set it up | Service | What Jananiti needs | What it enables |
|---|---|---|---|
| First production identity upgrade | Firebase Authentication | Firebase Web App configuration plus Google sign-in enabled | Google account sign-in and secure account linking |
| When enabling production interactive maps | Google Maps Platform | Browser Maps API key restricted to the Jananiti domains | Interactive map tiles, markers, clustering, and place search |
| When enabling reviewed AI suggestions | Vertex AI / Gemini on Google Cloud | A server-side service account or workload identity, never a browser secret | Draft-only category, priority, and summary suggestions for human review |
| When enabling push alerts | Firebase Cloud Messaging | Firebase Web App configuration and browser notification setup | Optional device push notifications; in-app notifications already work |
| Before production launch | Firebase App Check, Analytics, Cloud Logging, Secret Manager | Project configuration, not a single browser credential | Abuse protection, product analytics, incident visibility, and secret storage |

## Step 1 — Create a Firebase project

1. Visit the [Firebase Console](https://console.firebase.google.com/), sign in with the Google account that should own Jananiti, and choose **Create a project**.
2. Give it a clear name such as `jananiti-production`. Enable Google Analytics only if you want product analytics; it can be turned on later.
3. In **Project overview**, click the web icon (`</>`) and register a web app named `jananiti-web`.
4. Firebase will show a configuration object. The values beginning with `apiKey`, `authDomain`, `projectId`, `storageBucket`, `messagingSenderId`, and `appId` are the **public web configuration**. They identify the Firebase project; they are not a server administrator password. [1]

> Provide these six values securely only after Jananiti is ready to activate Firebase: `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, and `VITE_FIREBASE_APP_ID`.

## Step 2 — Enable Google sign-in safely

1. In Firebase Console, open **Build → Authentication → Get started**.
2. Open **Sign-in method**, choose **Google**, enable it, pick the project support email, and save.
3. Open **Settings → Authorized domains**. Add `jananiti-fspr6tck.manus.space` and any future custom production domain. Add a development/preview domain only when it is known and actually used.
4. Do **not** share a Firebase service-account JSON file or an Admin SDK private key in chat. Jananiti will use server-side secret storage for privileged credentials, and client configuration only for the browser application. [2]

## Step 3 — Configure Google Maps when you are ready for a live map

1. Visit [Google Cloud Console](https://console.cloud.google.com/), select the same Google Cloud project linked to Firebase, and make sure billing is intentionally enabled; Google Maps Platform requires a billing account even when usage remains within available credits.
2. Open **APIs & Services → Library**, then enable **Maps JavaScript API**. Enable **Places API** only if JanaNiti needs place autocomplete or place details.
3. Open **APIs & Services → Credentials → Create credentials → API key**.
4. Immediately open the new key, set **Application restrictions** to **Websites**, and add `https://jananiti-fspr6tck.manus.space/*`. Add your custom domain later. Restrict the key to only the APIs JanaNiti uses.
5. Supply the restricted browser key through secure project configuration when requested. Never use an unrestricted Maps key. [3]

## Step 4 — Configure Vertex AI only for reviewed suggestions

1. In Google Cloud Console, open **Vertex AI**, accept the service terms, and enable the API for the selected project.
2. Create a dedicated service identity with the smallest roles required for Vertex AI invocation. This should be used **only on Jananiti’s server**, never inside mobile/browser code.
3. JanaNiti’s AI output must remain a clearly labelled draft; an administrator or citizen confirms final category, location, and priority.
4. Store any privileged Google credential in a managed secret store, not source code, browser variables, screenshots, or chat messages. [4]

## Step 5 — Optional push notifications and production protection

Firebase Cloud Messaging can be enabled after Firebase Authentication. The browser will ask each citizen for permission; denial must still leave in-app Action Center notifications usable. Firebase App Check should be introduced before broad public rollout to reduce abuse of Firebase resources. Analytics and Cloud Logging should be enabled only with a published privacy notice and an agreed retention policy. [5]

## What **not** to provide

Never send Aadhaar numbers, VID values, OTPs, biometrics, Aadhaar scans, e-KYC payloads, Firebase Admin private keys, or an unrestricted Google Maps key. JanaNiti’s planned duplicate-prevention path uses civic-record similarity, locality, time, category, and human review—not raw identity documents.

## References

[1]: https://firebase.google.com/docs/web/setup "Add Firebase to your JavaScript project"
[2]: https://firebase.google.com/docs/auth/web/google-signin "Authenticate Using Google with JavaScript"
[3]: https://developers.google.com/maps/api-security-best-practices "API Security Best Practices"
[4]: https://cloud.google.com/vertex-ai/docs/start/cloud-environment "Set up your Google Cloud environment for Vertex AI"
[5]: https://firebase.google.com/docs/cloud-messaging/js/client "Receive messages in a JavaScript client"
