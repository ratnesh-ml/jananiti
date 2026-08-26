# JanaNiti mobile product checklist

This checklist records the **functional patterns** observed in the supplied mobile screen references. It deliberately does not preserve or reuse reference images, personal portraits, organization marks, copy, civic statistics, location-specific claims, or interface construction.

| Product surface | Required Jananiti behavior | Truthful data boundary |
| --- | --- | --- |
| Home feed | Switch among personal, locality, trending, and following views; open an issue; share, react, comment, and verify where allowed. | Feed entries come from Firestore or clearly labelled test-only records; reactions are never verification. |
| Issue detail | Show evidence, category, locality, priority context, concise description, validation controls, discussion, and a status journey. | Display only fields actually stored; coordinator/authority steps remain pending until a trusted admin backend exists. |
| Report | Let a citizen select text, image, audio, video, or file evidence; set location; review editable fields; choose private or community visibility; submit. | Browser recording uses explicit permission; AI suggestions remain optional and cannot determine priority. |
| Review and confirm | Show an editable report summary before storage and explain why any optional draft suggestion appeared. | Never describe a model as having detected severity or made a decision unless a reviewed model service is genuinely active. |
| Explore and map | Search/filter locality records, categories, and activity summaries; open an issue from a list or map fallback. | No fabricated heat-map totals, nearby counts, or live service claims. |
| Activity | Surface the signed-in citizen’s real notifications, verifications, and lifecycle updates. | Test state is labelled; achievements or points are not fabricated. |
| Profile | Show the authenticated profile, real report/verification aggregates, settings, and activity history. | No placeholder personal identity, verified badges, credits, or impact statistics presented as real. |
| Shared shell | Provide a compact header, locality control, accessible notification action, and a Home / Explore / Report / Activity / Profile dock with a visible active state. | Each control opens a working screen or clear availability feedback. |
