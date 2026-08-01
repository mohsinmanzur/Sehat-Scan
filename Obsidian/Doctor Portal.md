---
tags: [feature, frontend-doctor]
---

# Doctor Portal

Up: [[Home]] · Related: [[Authentication]], [[Consent-Based Sharing]], [[Known Gaps and Roadmap]]

A **read-only clinician web portal** — `Frontend/Doctor/` (React + Vite). Its own README frames it as a "mocked auth/session flow" for parts of it, though the auth calls are real backend calls; only profile-completeness/session-validity bookkeeping is client-local (`localStorage`).

## Routing (`src/App.tsx`, React Router)

- Public: `/login`, `/register-doctor`, `/verify`
- Protected (behind `ProtectedRoute` gated on `AuthContext.isVerified`, wrapped in `AppShell`): `/dashboard`, `/access`, `/overview`, `/reports`, `/reports/:id`, `/sessions`, `/settings`

Auth pages are covered in [[Authentication]].

## Core workflow: "Patient Sessions"

The whole UX model: a doctor gains **temporary, read-only access** to one patient's shared data by redeeming a **6-digit OTP** or a **scanned QR**, both resolving via `GET /share/shared-by-code`. This "active session" lives in `localStorage` (`activeShareId, activeAccessCode, selectedPatientId, selectedPatientName, activeSharedMeasurements, activeSharedReports`) rather than as server session state.

### `utils/session.ts`

- `startPatientSession(otp)` — calls `getShareByAccessCode`, defensively extracts patient + measurements + reports from multiple possible response shapes, persists the session, fires a `session-started` window event, and rolls up daily insight counters (`doctorTodayInsights:<date>` in localStorage: unique patients, total reports, total measurements shared today).
  - **Dead code**: a notification-firing block intended to also push doctor-portal notifications sits *after* an early `return` in this function, so it never executes. Worth fixing if notifications on session start are actually wanted.
- `clearPatientSession()` — wipes the local session, posts a "Session ended" notification.
- `validateActivePatientSession()` — re-checks the code is still valid on app load; if the grant was revoked/expired server-side, force-clears the local session and redirects back to `/dashboard` if the doctor is viewing Overview/Reports.
- `getTodayInsights()` — read accessor for the dashboard's stat tiles.

### Pages

- **`DashboardPage.tsx`** — two entry actions: "Enter Patient OTP" (modal, dispatches a global `open-patient-otp-modal` event handled in `AppShell`) and "Scan QR" (in-page camera modal using the browser's native `BarcodeDetector` API, degrading to a manual paste-QR-content textarea if unsupported). Both funnel into `startPatientSession`. Shows the day's insight tiles.
- **`AccessPage.tsx`** ("Access Patient") — a **direct, unfiltered patient directory search** (`GET /patient` with name/email/id filters) that lets a doctor jump straight to `/overview` for any patient by just setting `selectedPatientId/selectedPatientName` in localStorage. **This bypasses the entire access-grant/consent system** — no `Access_Grant` is created or checked. Flagged in [[Known Gaps and Roadmap]] as a real authorization gap versus the product's "consent-first" pitch.
- **`SessionsPage.tsx`** — manual "start/inspect/revoke session" console. Same OTP-based start, plus a "Revoke Access" button (`POST /share/revoke`) that force-closes the local session even if the backend call fails.
- **`OverviewPage.tsx`** — summary of the active session's shared measurements (count, "needs review" heuristic = any measurement with `numeric_value <= 0`) and reports (count); each measurement row can "Open Source Document."
- **`ReportsPage.tsx`** — full list of the active session's shared reports, each with an "Open Document" action.
- **`ReportDetailPage.tsx`** (`/reports/:id`) — fetches one record via `GET /record?id=`, **defensively checks client-side** that the record's `patient_id` matches the active session's `selectedPatientId` (since the backend doesn't enforce this), shows OCR-extracted text, and an "Open File" button that resolves a secure SAS URL before opening in a new tab.
- **`SettingsPage.tsx`** — doctor profile editor (saved only to `localStorage` — no backend `PUT` exists for doctors), dark-mode toggle, and a client-side-only notifications center (`utils/notifications.ts`: session-started/revoked, reports/measurements-shared alerts, mark-all-read/clear).
- **`AppShell.tsx`** — persistent sidebar nav, top header with the global "Enter Patient OTP" button, notifications dropdown, dark-mode toggle, and re-validates the active session on every route mount.

## Tech

React + Vite, `react-router-dom`, `lucide-react` icons, `axios`, plain CSS with a light custom design system (`.card`/`.panel`/`.btn` utility classes, dark-mode aware via CSS variables).
