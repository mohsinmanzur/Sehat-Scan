---
tags: [summary, frontend-patient]
---

# Patient Mobile App — Full Summary

Up: [[Home]] · Sources: [[Authentication]], [[Patient Records]], [[Health Measurements]], [[Medical Documents and OCR]], [[Consent-Based Sharing]], [[Offline-First Sync]]

`Frontend/Patient/` — React Native + Expo Router. The primary product surface, fully **offline-first**. Talks to the NestJS backend and, separately, straight to the standalone OCR microservice.

**Key packages**: Expo SDK 54, React Native 0.81.5, React 19, `expo-router`, `expo-sqlite`, `expo-secure-store`, `expo-camera`, `@react-native-community/netinfo`, `expo-file-system` (v2 API), `react-native-qrcode-styled`, `react-native-reanimated`.

## Auth (`src/app/(auth)`)

Route group wrapped in an `UnauthorizedOnly` guard (redirects away if already logged in).

- **`Login.tsx`** — email/phone entry, calls `POST /auth/requestcode`, navigates to OTP screen. Has a decorative, non-functional "Continue with Google" button.
- **`Otp.tsx`** — 6-digit entry (`react-native-otp-entry`), calls `POST /auth/verifycode`; routes to Signup on a "needs registration" (404) response, otherwise loads the patient profile and persists tokens via `expo-secure-store`.
- **`Signup.tsx`** — name, gender, date of birth, blood group, and a "Beta Program / Research opt-in" toggle (maps to `Patient.is_research_opt_in`).
- Token handling: `services/Backend/backend.service.tsx` stores `jwtToken`/`refreshToken` in SecureStore, auto-retries once on a 401 via `/auth/refresh`, force-logs-out (clears tokens + patient + navigates to Login) if refresh fails.
- **Current dev state**: backend accepts hardcoded OTP `000000`, and `requestcode` never actually sends an email — not production-ready security, just a live dev bypass. See [[Known Gaps and Roadmap]].

## Dashboard & Health Measurements (`src/app/(tabs)` and `health_measurements/`)

- **`(tabs)/Dashboard.tsx`** — home screen. Groups all measurements by `measurement_unit.measurement_group`, shows the latest reading per group as a 2-column card grid (Blood Pressure special-cased to combine Systolic+Diastolic into one card). `useFocusEffect` reloads from SQLite on every tab-focus; pull-to-refresh triggers a full sync. Skeleton loading state and empty-state messaging.
- **`health_measurements/DetailedView.tsx`** — per-group trend screen: current value (dual-value for BP), a computed delta/trend pill, a `WeightChart` sparkline, a `HistoryRow` list. Backed by `useMeasurements` + `useReferenceRanges`, SQLite-first.
  - `useFocusEffect` calls `reloadFromCache()` on every focus, so returning from `ItemDetail` after a deletion immediately drops the row without a manual refresh.
  - Auto-navigates back (`router.back()`) if measurements drop to zero after having been non-empty — handles "deleted the last measurement" gracefully.
- **`health_measurements/ItemDetail.tsx`** — single reading detail: value, date, attached document image, edit/delete. Image loading is offline-first (checks local SQLite `local_file_path` first, only calls backend secure-URL when online). Delete goes through `useOfflineMutation.deleteMeasurement` (queues offline). All hooks declared before the early-return guard, per Rules of Hooks.
- **`health_measurements/EditMeasurement.tsx`** — edits a reading's value(s)/date via `useOfflineMutation.updateMeasurement`.
- **`AddNew.tsx`** (modal) — primary "log a new measurement" flow: pick unit/group, numeric input (dual inputs with auto-focus-next for BP), date/time pickers, special-condition pill toggles (Fasting/Post-meal/Morning — **collected here but silently dropped server-side**, see [[Known Gaps and Roadmap]]), an "Add Photo" affordance that opens the Scan screen and runs OCR. Saves online or fully offline depending on connectivity.
- **Reference-range scoring** (`helpers/detailed_view.helpers.ts → findBestReferenceRange`): hard-excludes gender/age mismatches, then scores candidates — gender match (+10000) > age-range specificity (+100–1000) > special-condition overlap (+50/match, −500 if a required condition is missing) — and returns the best match. Accepts a `patientFallback` param so SQLite-sourced measurements without a nested `patient` object can still be scored.
- **Charts**: `components/detailed_view/weight_chart.tsx` — custom SVG smoothing (cubic Bezier), returns `null` on empty data to avoid a crash when the last measurement is deleted mid-render. `history_row.tsx` renders delta-annotated rows.

## Scanning & OCR (`health_measurements/Scan.tsx`)

- Full-screen camera (`expo-camera`) with an SVG-masked document viewfinder, pinch-to-zoom, flip camera, gallery-picker fallback (auto-triggered on web). Captured URI goes into `GlobalContext.scannedImage`, then back to `AddNew`.
- **The app calls the OCR microservice directly, bypassing the NestJS backend.** `services/Backend/backend.service.tsx → extractTextFromImage(imageUri)` POSTs the photo as multipart form-data to a separate `OCR_BASE_URL` (env var — currently a placeholder `"test"` in this checkout, so OCR calls won't resolve until pointed at a real deployment). Extracted text/label are shown inline in `AddNew.tsx` for the patient to review/edit before saving.
- Only when the app later calls `POST /record/image/upload` does the OCR text get attached to the document record — the backend itself never talks to the OCR service.

## Consent-Based Sharing — owning & granting (`src/app`)

- **`(tabs)/Shares.tsx`** — lists the patient's outgoing (non-expired) `Access_Grant`s: doctor name/specialization/hospital or "Anyone With Access" for codeless shares, a live `CountdownTimer` per grant ("Unlimited Access" if expiry is ~100 years out), a "My QR" button. Fully disabled with an explanatory message when offline or in Device-Only Mode.
- **`components/tabBar/customTabBar.tsx`** — the floating action button morphs from "Add" to "Share" icon when the Shares tab is active; the share FAB is dimmed/disabled when `!isOnline || isDeviceOnly` (from `useNetwork()` / `NetworkContext`).
- **`NewShare.tsx`** (modal) — build a new grant: pick reports via `share/SelectReports`, choose a duration via a custom time-picker (0/0/0 = "Unlimited" → ~100-year expiry), optional recipient email, calls `backend.shareMeasurement`.
- **`share/SelectReports.tsx`** — filterable checklist of the patient's own measurements (BP-aware systolic/diastolic pairing).
- **`share/ScanQR.tsx`** — camera QR scanner used by the share **owner** to scan a recipient's device QR; triggers `backend.handleWebhook(receiverUuid, shareId)` → backend `/share/webhook` → Socket.IO push.
- **`share/SharedDetail.tsx`** — owner's view of a specific share: 6-digit access token (tap-to-copy), button to beam it via `ScanQR`, filterable list of shared measurements (drills into `ItemDetail` in "guest mode"), "Revoke Access" action.
- **`components/QRCodeCard` / `QRCodeButton`** — renders the patient's own QR (encodes just their `patient.id`), opens a Socket.IO connection joining room `share_room_${patientId}`, listens for `share-received` to auto-navigate the recipient into `SharedDashboard` the instant someone shares via QR.

## Consent-Based Sharing — receiving (recipient side)

- **`share/SharedDashboard.tsx`** — after a share lands, fetches `backend.getSharedById(sharingId)`, shows the sharing patient's name in a banner, renders the same card-grid UI as the owner's Dashboard but scoped to shared measurements only.
- **`share/SharedDetailedView.tsx`** — read-only variant of `DetailedView` for a specific shared measurement group.

## Profile & Settings (`src/app/profile/`)

- **`index.tsx`** (Settings) — menu to User Profile / Change Password / FAQs, a **"Device-Only Mode" toggle** (real, working privacy feature — stores data only locally, pauses network reachability checks and cloud sync, with confirmation dialogs both ways), Logout, WhatsApp support link.
- **`UserProfile.tsx` / `ChangePassword.tsx`** — **UI-only stubs**. Forms validate client-side but persistence is simulated (`setTimeout` + toast, with a `// TODO: wire up actual update API` comment) — not connected to the backend's existing `PUT /patient`.
- **`FAQs.tsx`** — static accordion (adding measurements, sharing records, encryption claims, revoking access, updating profile, expiry behavior).

## Offline-First Sync — the app's signature engineering feature

Fully usable with **zero connectivity** — add measurements, view history/trends, view/attach photos — reconciling automatically once back online.

- **Local database** (`services/Database/database.service.ts`): SQLite (`expo-sqlite`, WAL mode, FK constraints on) mirroring the backend schema — `patients, measurement_units, reference_ranges, medical_documents, health_measurements, access_grants` — plus a `pending_mutations` outbox table (`entity_type, operation, payload, local_id, server_id, retry_count, last_error`).
- **Connectivity** (`context/NetworkContext.tsx`): wraps `@react-native-community/netinfo`, exposes `isOnline` and a persisted **Device-Only Mode** flag.
  - `isOnline` initializes to `false` (not `true`) to avoid a race where sync fires before NetInfo confirms real connectivity; flips to `true` only after the first resolution.
  - Device-Only Mode persists in AsyncStorage (`device_only_mode`); when on, no network call happens even if technically online.
- **Sync orchestration** (`context/PatientContext.tsx`):
  - On db-ready, reads the cached patient from AsyncStorage and upserts to SQLite via a `useEffect` on patient-object change — covers OTP login where `Otp.tsx` sets the patient directly.
  - Uses `lastSyncedPatientRef` to detect two sync triggers: offline→online transition, or a new patient id not yet synced this session — fixes a bug where re-login after logout wouldn't fetch fresh data.
  - `services/Sync/sync.service.ts → syncAllForPatient` order: `syncPatientProfile` → `syncDocuments` → `syncMeasurements` → `syncShares` (patient row must exist before FK-dependent writes; `syncMeasurements` calls `syncUnitsAndRanges` first).
  - `syncDocuments` calls `ensureLocalDocumentImages` to download any Azure Blob images not yet cached locally under `<documentDir>/medical_docs/<id>.<ext>`.
- **Push sync** (`services/Sync/mutation.service.ts → drainMutationQueue`): replays queued creates/updates/deletes for `health_measurement` and `medical_document`, reconciling `local_*` temp IDs to real server UUIDs on success, max 3 retries.
- **`hooks/useOfflineMutation.ts`** — `createMeasurement`/`updateMeasurement`/`deleteMeasurement` write directly to backend when online + not device-only, else fall back to SQLite + an enqueued mutation.
- **`hooks/useMeasurements.ts` / `useShares.ts`** — `syncAndReload` bails early if offline or device-only; both expose `reloadFromCache` for a focus-triggered SQLite re-read without a background sync.
- **`useMeasurementUnits` / `useReferenceRanges`** — SQLite-read-only, populated via `syncAllForPatient` rather than their own sync call.
- **Logout wipe**: `PatientContext` calls `clearAllData(db)` before navigating to Login — deletes `pending_mutations`, then `patients` (cascades to measurements/documents/access_grants), then `measurement_units` (cascades to reference_ranges), plus the `medical_docs/` image cache directory. Navigation only happens after the wipe completes.

## Known issues specific to this app

- OCR won't resolve in this checkout — `OCR_BASE_URL` is a placeholder (`"test"`).
- Profile edit screens are non-functional stubs despite a working backend endpoint.
- `special_conditions` collected in `AddNew.tsx` are dropped server-side (schema drift).
- Auth currently runs on a hardcoded OTP bypass, not real verification.
- The app's own `README.md` claims "frontend-only prototype with mock data and no backend" — stale; it's fully wired against the live backend + OCR microservice.

See [[Known Gaps and Roadmap]] for the full cross-cutting list.
