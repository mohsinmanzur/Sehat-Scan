---
tags: [summary]
---

# Sehat — Full Project Summary

Up: [[Home]]

A single-page rollup of the whole vault ([[Home]], [[Overview]], [[Authentication]], [[Patient Records]], [[Health Measurements]], [[Medical Documents and OCR]], [[Consent-Based Sharing]], [[Offline-First Sync]], [[Doctor Portal]], [[Patient Web Landing Page]], [[Known Gaps and Roadmap]]).

## What it is

Sehat ("SehatScan") bridges patients and doctors through digitized medical reports and **consent-based, time-bound sharing** of health data. Built at FAST National University, Karachi.

Core loop: patient scans a report → OCR/AI digitizes it → stored in Azure Blob Storage → doctor requests access → patient approves → time-bound access token issued → doctor views record → token auto-expires.

## Sub-projects

| Project | Path | Stack |
|---|---|---|
| Backend | `Backend/` | NestJS + TypeORM + PostgreSQL + Azure Blob Storage |
| Patient app | `Frontend/Patient/` | React Native (Expo Router), offline-first SQLite |
| Doctor portal | `Frontend/Doctor/` | React + Vite |
| Patient web | `Frontend/PatientWeb/` | Static HTML/CSS/vanilla JS (marketing only, no backend calls) |
| OCR service | `ml/Medical-Prescription-OCR/` | Python, FastAPI, fine-tuned Donut (HF transformers) |

**Deployment**: Backend on Azure App Service (`sehatscan`), CI/CD via GitHub Actions on push to `dev`. OCR service and both frontends deploy/run independently — three separate runtimes plus the static web page.

**Global backend conventions**: CORS allow-lists local dev ports; global `ValidationPipe` (whitelist/forbid-non-whitelisted/transform); `JwtAuthGuard` global via `APP_GUARD` (every route needs a Bearer JWT unless `@Public()`); TypeORM `synchronize: false` (migrations only).

## Authentication

OTP-based login/registration for patients and doctors, plus a partial Google OAuth flow (`Backend/src/auth`, routes under `/auth`, all `@Public()`).

- `requestcode` / `doctor/verifycode` / `verifycode` / `register` / `doctor/register` / `doctor/verifyaccount` / `refresh` / `google`.
- Real OTP service exists (argon2-hashed, 5-min TTL, attempt tracking via `@nestjs/cache-manager`) but **isn't in the live path**.
- **Dev bypass state**: `requestcode` is short-circuited (canned "OTP disabled for development" message, never sends email); `verifycode` accepts hardcoded `000000` everywhere (Doctor portal UI even hints at this).
- Google OAuth verifies the token but doesn't issue a Sehat JWT or link to a Patient/Doctor record — stubbed.
- Patient app: `Login → Otp → Signup` flow, tokens in `expo-secure-store`, auto-refresh-and-retry on 401.
- Doctor portal: `LoginPage → VerifyPage → RegisterDoctorPage`, token stored in `localStorage.doctorToken`; `AuthContext` caches doctor profiles client-side since there's no backend "get doctor profile" endpoint.

## Patient Records

`Patient` is the root entity (`Backend/src/patient`, routes under `/patient`).

- `GET /patient` — optional `id`/`email`/`name`; **returns all patients if none given, no pagination** — PII exposure risk, and also used unmodified by the Doctor portal's Access page (no consent check).
- Entity: UUID PK, name/email/gender/phone/date_of_birth/blood_group/emergency_contacts(jsonb)/reward_points/is_research_opt_in, `OneToMany` → documents/measurements/access grants.
- Patient app profile screens (`UserProfile.tsx`, `ChangePassword.tsx`) are **UI-only stubs** — client-side validation, simulated save via `setTimeout`, not wired to the existing `PUT /patient`.
- "Device-Only Mode" toggle in Settings is a real, working privacy feature.

## Health Measurements

Numeric health readings (BP, weight, blood sugar, etc.), grouped by unit, scored against clinical reference ranges, charted as trends (`Backend/src/health_measurement`, routes under `/health-measurement`).

- CRUD routes plus `/unit` (measurement units/groups) and `/reference-ranges`.
- Entities: `Health_Measurement`, `Measurement_Unit` (has `measurement_group`, e.g. "Blood Pressure" groups Systolic+Diastolic), `Reference_Range` (min/max, gender/age/special-condition targeting).
- **Schema drift**: `CreateMeasurementDto` accepts `special_conditions[]` (and the Patient app collects it), but the live entity has no such column — silently dropped server-side.
- Patient app: `Dashboard` (grouped card grid), `DetailedView` (trend screen, auto-navigates back when last reading is deleted), `ItemDetail` (offline-first image loading), `EditMeasurement`, `AddNew` (main logging flow, includes OCR photo capture).
- Reference-range scoring (`findBestReferenceRange`): excludes gender/age mismatches, then scores by gender match > age specificity > special-condition overlap (with a penalty for missing a required condition).

## Medical Documents and OCR

Report scanning, image storage, and a standalone OCR microservice (`Backend/src/medical_document`, routes under `/record`; ML service in `ml/Medical-Prescription-OCR`).

- `/record` CRUD, `/record/document-url` (measurement → source scan), `/record/image/upload` (multipart → WebP via `sharp` → Azure Blob; size-limit validator exists but is commented out), `/record/image/get-secure-url` (time-boxed SAS URL, −5/+10 min).
- `Medical_Document` entity: file_name/file_url, record_type enum, ocr_extracted_text, date_issued.
- `AI_Analysis` entity exists in schema (anomaly_detected, suggested_text, severity_score) but has **no controller/service** — planned, unimplemented feature.
- **The Patient app calls the OCR microservice directly**, bypassing the NestJS backend entirely; only afterward does OCR text get attached via `/record/image/upload`. The backend never calls OCR itself.
- OCR service: fine-tuned Donut model (HF Hub `chinmays18/medical-prescription-ocr`), 71% char-level / 84% word-level accuracy, ~2s/image on CPU. Explicitly "research use only, not clinically validated, not for real prescriptions." FastAPI `/ocr` endpoint runs Donut + zero-shot BART classification (prescription vs. not) refined by keyword heuristics.
- Known issue: Patient app's `.env` `OCR_BASE_URL` is a placeholder (`"test"`) in this checkout — OCR calls won't resolve until pointed at a real deployment.

## Consent-Based Sharing (flagship feature)

The core "consent-based, time-bound access" pitch, spanning all tiers (`Backend/src/share`, routes under `/share`, plus a WebSocket gateway).

- Creates `Access_Grant`s: optional doctor (null = "anyone with the code"), optional measurement subset, permission enum (`view_only|emergency|full_access`), required `expires_at`, auto-generated 6-digit access code.
- Routes: create, list shares, get shared measurements, get by id/code, revoke, and a `/share/webhook` that relays real-time notifications over Socket.IO (room `share_room_${receiverUuid}`) — powers QR-based proximity sharing.
- **`ShareService.hasAccess()` is implemented but never called by any controller** — grants are a UX model, not an enforced authorization boundary yet.
- Patient app: `Shares.tsx` (outgoing grants list, countdown timers, disabled offline/Device-Only), `NewShare.tsx` (create grant), `SelectReports.tsx`, `ScanQR.tsx` (beam access via QR), `SharedDetail.tsx` (access code, revoke), `SharedDashboard.tsx`/`SharedDetailedView.tsx` (recipient side).
- Doctor portal redeems shares (see below); active session cached client-side in `localStorage`, not server session state.

## Doctor Portal

Read-only clinician web app (`Frontend/Doctor/`, React + Vite, React Router).

- Core UX: "Patient Sessions" — doctor redeems a 6-digit OTP or scanned QR (`GET /share/shared-by-code`) for temporary read-only access; session state lives in `localStorage`.
- `utils/session.ts`: `startPatientSession` (has **dead code** — a notification block placed after an early `return`, never executes), `clearPatientSession`, `validateActivePatientSession` (re-checks server-side revocation/expiry), `getTodayInsights`.
- Pages: `DashboardPage` (OTP/QR entry, insight tiles), **`AccessPage`** ("Access Patient" — direct unfiltered `GET /patient` search, **bypasses the entire consent system**, no `Access_Grant` created/checked — the single biggest gap vs. the product pitch), `SessionsPage`, `OverviewPage`, `ReportsPage`, `ReportDetailPage` (client-side-only ownership check since backend doesn't enforce it), `SettingsPage` (profile only saved to `localStorage`, no backend PUT for doctors).

## Offline-First Sync (Patient App)

The app's most distinctive engineering feature: fully usable with zero connectivity, reconciling automatically once back online.

- Local **SQLite** mirror (`expo-sqlite`, WAL mode, FK on) of the backend schema, plus a `pending_mutations` outbox table.
- `NetworkContext`: `isOnline` (starts `false` to avoid a race before NetInfo resolves) and persisted **Device-Only Mode** (`isDeviceOnly`, AsyncStorage) — when on, no network calls happen even if technically online.
- `PatientContext` coordinates sync: triggers a full sync on offline→online transition or a new unsynced patient id. `syncAllForPatient` order: profile → documents → measurements → shares (FK-safe ordering).
- `mutation.service.ts` (`drainMutationQueue`) replays queued create/update/delete ops, reconciling local temp IDs to server UUIDs, max 3 retries.
- `useOfflineMutation` writes to backend when online+not-device-only, else falls back to SQLite + enqueued mutation.
- Logout: `clearAllData(db)` wipes all tables (FK-safe order) and the local image cache before navigating to Login.

## Patient Web Landing Page

`Frontend/PatientWeb/` — static marketing site (HTML/CSS/vanilla JS ES modules), not a functional app.

- Hero, features grid, 4-step "How Sehat Operates" timeline, "Privacy-First Consent Architecture" security section, animated phone mockup (interactive but illustrative, no real data/API calls).
- **Marketing vs. reality gap**: claims "immutable audit logging" — no such entity/mechanism exists in the backend.

## Known Gaps and Roadmap (cross-cutting)

1. **Auth dev-bypass**: OTP `000000` hardcoded everywhere; `requestcode` never sends real emails; Google OAuth doesn't issue sessions. Not production-ready security.
2. **Consent enforcement gaps**: `hasAccess()` unused; Doctor portal's `AccessPage` completely bypasses consent; `GET /patient` has no per-caller ownership check or pagination; no audit-log entity despite marketing claims; dead notification code in `session.ts`.
3. **Incomplete modules**: `DoctorController` has zero routes (all doctor ops go through Auth/Share); Patient app profile screens are UI-only stubs; `AI_Analysis` entity is unwired.
4. **Data model drift**: `special_conditions[]` collected client-side but dropped server-side.
5. **Documentation drift**: API docs missing several real `/share/*` routes and the WebSocket gateway; Patient app README stale (claims "no backend" — false); `.env` `OCR_BASE_URL` placeholder.

**Suggested priorities**: wire `hasAccess()` into real guards; resolve/gate `AccessPage`; re-enable real OTP delivery (env-flag the bypass); reconcile `special_conditions` drift.
