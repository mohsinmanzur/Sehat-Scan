---
tags: [roadmap, gaps]
---

# Known Gaps and Roadmap

Up: [[Home]]

Things visible directly in the code that are either temporary dev states, incomplete features, or latent bugs — worth tracking so they aren't mistaken for intended design.

## Auth is in a dev-bypass state — see [[Authentication]]

- `POST /auth/requestcode` is short-circuited: it returns a canned "OTP disabled for development" message and never reaches the real OTP/email flow.
- `POST /auth/verifycode` and `/auth/doctor/verifycode` both accept **`000000` as a hardcoded bypass** regardless of the real OTP.
- The real OTP service (argon2-hashed, 5-min TTL, attempt tracking) exists and works — it's just not in the live path.
- Google OAuth (`/auth/google`) verifies the token but doesn't issue a Sehat session or link to a Patient/Doctor record.

**Do not treat current auth behavior as production-ready security.**

## Consent system has enforcement gaps — see [[Consent-Based Sharing]]

- `ShareService.hasAccess()` is implemented but **never called** by any controller — grants currently function as a UX model, not an enforced authorization boundary.
- The Doctor portal's `AccessPage` ("Access Patient") does a direct, unfiltered `GET /patient` search and lets a doctor jump to any patient's Overview **without creating or checking an `Access_Grant` at all**. This is the most significant gap versus the "consent-first" pitch.
- `GET /patient` itself has no per-caller ownership check — any authenticated user (patient or doctor token) can query any patient by id/email/name, or list all patients if no filter is given (also no pagination).
- No audit-log entity exists despite the marketing site ([[Patient Web Landing Page]]) claiming "immutable audit logging."
- Dead code in the Doctor portal's `utils/session.ts`: a notification-firing block sits after an early `return` in `startPatientSession`, so it never runs.

## Incomplete modules / stub screens

- **Doctor module** (`Backend/src/doctor`) — `DoctorController` has **zero routes**. All doctor creation/lookup happens through `AuthController` and `ShareService`. There's no `GET /doctor` search endpoint and no backend `PUT` for doctor profile updates (the Doctor portal's Settings page only saves to `localStorage`).
- **Patient app profile screens** (`profile/UserProfile.tsx`, `profile/ChangePassword.tsx`) are UI-only stubs — forms validate client-side but persistence is simulated (`setTimeout` + toast, with a `// TODO: wire up actual update API` comment). Not connected to the existing `PUT /patient` endpoint.
- **`AI_Analysis` entity** (`Backend/src/entities`) — anomaly-detection data model exists in the schema with no controller/service using it. Planned but unimplemented "AI insight per document" feature.

## Data model drift

- `CreateMeasurementDto` accepts `special_conditions[]`, and the API docs mention it, but the live `Health_Measurement` entity has **no such column** — it's silently dropped server-side even though the Patient app's local SQLite mirror and `AddNew` UI collect it. See [[Health Measurements]].

## Documentation drift found during this survey

- `Backend_API_Documentation.md` was missing several real routes: `/share/shared-measurements`, `/share/shared-by-id`, `/share/shared-by-code`, `/share/webhook`, and the WebSocket gateway entirely.
- The Patient app's own `README.md` claims "frontend-only prototype with mock data and no backend" — this is stale; the app is fully wired against the live NestJS backend plus the separate OCR microservice.
- The Patient app's `.env` has `OCR_BASE_URL` set to a placeholder (`"test"`), so OCR calls won't resolve in this checkout until pointed at a real deployment.

## Suggested next documentation/dev priorities

1. Wire `ShareService.hasAccess()` into an actual guard on measurement/document/patient routes.
2. Decide whether `AccessPage` in the Doctor portal should be removed or gated behind a real consent check.
3. Re-enable real OTP delivery once ready to leave the dev-bypass state, and gate the `000000` bypass behind an env flag rather than leaving it hardcoded.
4. Either persist `special_conditions` server-side or drop it from the DTO/local schema to stop the drift.
