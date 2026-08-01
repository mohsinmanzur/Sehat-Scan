---
tags: [feature, backend, frontend-patient, frontend-doctor, flagship]
---

# Consent-Based Sharing

Up: [[Home]] · Related: [[Patient Records]], [[Health Measurements]], [[Doctor Portal]], [[Known Gaps and Roadmap]]

This is the **flagship feature** of the product — the whole "consent-based, time-bound access" pitch. It spans all three tiers: backend `Access_Grant` entity + `/share/*` routes + a WebSocket gateway, the Patient app's QR/code generation and scanning UX, and the Doctor portal's OTP/QR redemption and session management.

## Backend module (`Backend/src/share`, routes under `/share`)

| Method | Route | Purpose |
|---|---|---|
| POST | `/share?patient_id=` | Creates an `Access_Grant`. Body (`ShareMeasurementDto`): optional `doctorEmail` (resolved to a doctor id, or left null for an "anyone with the code" share), optional `measurement_ids[]`, optional `permission` (default `'view_only'`), **required** `expires_at`. Auto-generates a 6-digit `access_token` (`Math.floor(100000 + Math.random()*900000)`) as a human-readable access code. |
| GET | `/share/shares?patient_id=` | Lists a patient's non-revoked shares (with `doctor`+`patient` relations). |
| GET | `/share/shared-measurements?share_id=` | Returns the actual `Health_Measurement[]` covered by a grant. |
| GET | `/share/shared-by-id?share_id=` | Fetch one grant by UUID + its resolved `measurements`. |
| GET | `/share/shared-by-code?access_code=` | Fetch a grant by its 6-digit access token — used by the Doctor portal's "Enter Patient OTP" flow. |
| POST | `/share/revoke?patient_id=&share_id=` | Sets `is_revoked = true` (only if the share belongs to that patient). |
| POST | `/share/webhook` | Body `{ receiverUuid, sharingId }` — relays a real-time notification over Socket.IO to whichever client has joined room `share_room_${receiverUuid}`, emitting `share-received` with `{ sharingId, success: true }`. |

### `Access_Grant` entity

- UUID PK
- `ManyToOne` → `Doctor` (nullable `doctor_id` — null means "anyone with the code"), `Patient`
- `measurement_ids` (nullable UUID array — null/omitted means "all measurements")
- `access_token` (the 6-digit code)
- `permission` (enum: `view_only | emergency | full_access`, default `view_only`)
- `is_revoked` (default false)
- `expires_at`

### `ShareService.hasAccess(doctorId, patientId, measurementId?)`

A query-builder helper that checks a non-revoked, non-expired grant exists for that doctor+patient (and optionally that the grant's `measurement_ids` includes the measurement, or is null meaning "all"). **Defined but not currently invoked by any controller** — i.e. authorization-checking logic exists as a utility but isn't wired into route guards yet. See [[Known Gaps and Roadmap]].

### Real-time WebSocket gateway (`share/websocket/websocket.ts`)

`ShareGateway`, Socket.IO, CORS enabled. Clients emit `join-share-room` with their own UUID to join a private room; `/share/webhook` pushes `share-received` events into that room. This powers **QR-based proximity sharing** — beaming access to a nearby device without typing a code.

## Patient app: owning and granting shares

`Frontend/Patient/src/app`:

- **`(tabs)/Shares.tsx`** — lists the patient's outgoing (non-expired) `Access_Grant`s, showing doctor name/specialization/hospital or "Anyone With Access" for codeless shares, a live `CountdownTimer` per grant ("Unlimited Access" if expiry is ~100 years out), a "My QR" button, and is fully disabled with an explanatory message when offline or in Device-Only Mode.
- **`components/tabBar/customTabBar.tsx`** — the floating action button (FAB) morphs from an "Add" icon to a "Share" icon when the Shares tab is active. The share FAB is disabled (dimmed + struck-through) when `!isOnline || isDeviceOnly`; tapping it while disabled is a no-op. Both conditions are read from `useNetwork()` which exposes `isOnline` and `isDeviceOnly` from `NetworkContext`.
- **`NewShare.tsx`** (modal) — build a new grant: pick reports via `share/SelectReports`, choose an access-time duration via a custom time-picker (0/0/0 = "Unlimited" → sets `expires_at` ~100 years out), optional recipient email, calls `backend.shareMeasurement`.
- **`share/SelectReports.tsx`** — filterable-by-group checklist of the patient's own measurements (BP-aware pairing of systolic/diastolic).
- **`share/ScanQR.tsx`** — camera-based QR scanner used by the **share owner** to scan a recipient's device QR; on scan, calls `backend.handleWebhook(receiverUuid, shareId)`, which triggers the backend's `/share/webhook` → Socket.IO push.
- **`share/SharedDetail.tsx`** — owner's view of a specific share: the 6-digit `access_token` (tap-to-copy), a button to open `ScanQR` to beam it to a nearby device, a filterable list of shared measurements (drilling into `ItemDetail` in "guest mode"), and a "Revoke Access" action.
- **`components/QRCodeCard` / `QRCodeButton`** — renders the current patient's own QR (encodes just their `patient.id`), opens a Socket.IO connection joining room `share_room_${patientId}`, and listens for `share-received` to auto-navigate the recipient into `SharedDashboard` the instant someone shares via QR.

## Patient app: receiving shares (recipient side)

- **`share/SharedDashboard.tsx`** — after a share lands, fetches `backend.getSharedById(sharingId)`, shows the shared patient's name in a banner, and renders the same card-grid UI as the owner's Dashboard but scoped to shared measurements only.
- **`share/SharedDetailedView.tsx`** — read-only variant of `DetailedView` for a specific shared measurement group.

## Doctor portal: redeeming and managing sessions

See [[Doctor Portal]] for the full clinical workflow — in short, a doctor gains **temporary read-only access** to a patient's shared data by redeeming a 6-digit OTP or scanned QR (both resolve via `GET /share/shared-by-code`), and this "active session" is cached client-side in `localStorage` rather than as server session state.

## Known gaps in this feature specifically

- `hasAccess()` exists but isn't enforced by any guard — grants are the UX model, not an enforced authorization boundary yet.
- The Doctor portal's `AccessPage` ("Access Patient") bypasses this system entirely via a direct, unfiltered patient search (see [[Doctor Portal]] and [[Known Gaps and Roadmap]]).
- No audit-log entity exists despite the marketing site's claim of "immutable audit logging" (see [[Patient Web Landing Page]]).
- `utils/session.ts` in the Doctor portal has a dead code path — a notification-firing block placed after an early `return`, so it never executes.
