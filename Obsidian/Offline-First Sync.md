---
tags: [feature, frontend-patient]
---

# Offline-First Sync (Patient App)

Up: [[Home]] · Related: [[Health Measurements]], [[Consent-Based Sharing]]

The single most distinctive engineering feature of the Patient app: it's fully usable — add measurements, view history/trends, view/attach photos — with **zero connectivity**, reconciling automatically once back online. `Frontend/Patient/src`.

## Local database

`services/Database/database.service.ts` opens a local **SQLite** database (`expo-sqlite`, WAL mode, FK constraints on) mirroring the backend schema: `patients, measurement_units, reference_ranges, medical_documents, health_measurements, access_grants`, plus a **`pending_mutations`** outbox table (`entity_type, operation, payload, local_id, server_id, retry_count, last_error`).

`clearAllData(db)` wipes every table in FK-safe order and deletes the `medical_docs/` image cache directory — called on logout so no patient data persists between accounts on the same device.

## Connectivity and Device-Only Mode

`context/NetworkContext.tsx` wraps `@react-native-community/netinfo`, exposing `isOnline` and a persisted **"Device-Only Mode"** flag (`isDeviceOnly`).

- **`isOnline` initialises to `false`** (not `true`) to prevent a race condition where sync fires before NetInfo has actually confirmed connectivity. It transitions to `true` only after the first NetInfo resolution.
- Device-Only Mode is stored in AsyncStorage (`device_only_mode` key), so it survives app restarts. All sync hooks check `isDeviceOnly` — when enabled, no network call is made even if the device is technically online.

## Sync orchestration

`context/PatientContext.tsx` is the coordinator:
- On db-ready (app start), reads the cached patient from AsyncStorage and upserts it to SQLite via a `useEffect([currentPatient, db])` that fires on every patient-object change — this covers OTP login, where the Otp screen calls `setCurrentPatient(patient)` directly without going through `loadCurrentPatient` again.
- Uses `lastSyncedPatientRef` (not just `prevOnlineRef`) to detect two triggers for a full sync: **(1)** the device transitions from offline → online, and **(2)** a new patient ID appears in context that hasn't been synced this session. This fixes the bug where a re-login after logout wouldn't fetch fresh measurements.

`services/Sync/sync.service.ts` — pull-sync helpers, each fail-silent:
- **`syncAllForPatient`** runs in this order: `syncPatientProfile` → `syncDocuments` → `syncMeasurements` → `syncShares`. Patient profile is pulled first so the `patients` row exists in SQLite before any FK-dependent write (documents and measurements both foreign-key on `patient_id`).
- `syncMeasurements` internally calls `syncUnitsAndRanges` first, so unit/range data is always present before measurements that reference them.
- `syncDocuments` calls `ensureLocalDocumentImages` after upserting document metadata — downloads any Azure Blob images that don't have a local copy yet, storing them under `<documentDir>/medical_docs/<id>.<ext>`.

`services/Sync/mutation.service.ts` (`drainMutationQueue`) — push-sync: replays queued creates/updates/deletes for `health_measurement` and `medical_document` against the backend, reconciling `local_*` temp IDs to real server UUIDs once a create succeeds, with a max-retry cap (3).

`hooks/useOfflineMutation.ts` — `createMeasurement`/`updateMeasurement`/`deleteMeasurement` transparently write to the backend when `isOnline && !isDeviceOnly`, or fall back to local SQLite + an enqueued mutation otherwise.

`hooks/useMeasurements.ts` and `hooks/useShares.ts`:
- `syncAndReload` bails early if `!isOnline || isDeviceOnly`, preventing any network call in offline or device-only state.
- Both expose `reloadFromCache` (alias for the internal `loadFromDb`) so screens can re-read SQLite on focus without triggering a full background sync.

`services/Sync/image.service.ts` — `downloadAndCacheDocumentImage` uses the expo-file-system v2 API (`File.downloadFileAsync`, `Paths.document`, `Directory`). `ensureLocalDocumentImages` skips docs that already have a local file on disk.

## Logout data wipe

On logout, `PatientContext` calls `clearAllData(db)` before navigating to the Login screen. This:
1. Deletes `pending_mutations`, then `patients` (cascades to `health_measurements`, `medical_documents`, `access_grants`), then `measurement_units` (cascades to `reference_ranges`).
2. Deletes the `<documentDir>/medical_docs/` directory and all cached images.

Navigation only happens after the wipe completes.

## Supporting hooks

`hooks/useMeasurementUnits` and `useReferenceRanges` follow the same cache-first pattern but are SQLite-read-only (no background sync call of their own — data arrives via `syncAllForPatient`).

## Key packages

Expo SDK 54, React Native 0.81.5, React 19, `expo-router`, `expo-sqlite`, `expo-secure-store`, `expo-camera`, `@react-native-community/netinfo`, `expo-file-system` (v2 API), `react-native-qrcode-styled`, `react-native-reanimated`.
