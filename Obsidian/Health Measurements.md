---
tags: [feature, backend, frontend-patient]
---

# Health Measurements

Up: [[Home]] · Related: [[Patient Records]], [[Medical Documents and OCR]], [[Consent-Based Sharing]]

The core "readings" feature — patients log numeric health values (blood pressure, weight, blood sugar, etc.), grouped by unit, scored against clinical reference ranges, and charted as trends. Backend module: `Backend/src/health_measurement`.

## Backend routes (`/health-measurement`)

| Method | Route | Purpose |
|---|---|---|
| GET | `/health-measurement?patient_id=` \| `?id=` | Query readings (else returns all). |
| POST | `/health-measurement` | Create (`CreateMeasurementDto`: `patient_id`, `unit_id`, `numeric_value`, optional `document_id`, `special_conditions[]`). |
| PUT | `/health-measurement?id=` | Update. |
| DELETE | `/health-measurement?id=` | Delete. |
| POST/GET | `/health-measurement/unit` | CRUD-lite for measurement units (`unit_name`, `symbol`, `measurement_group`, e.g. "Blood Pressure", "Weight", "Blood Sugar"). |
| GET | `/health-measurement/reference-ranges?unit_id=` | Clinical reference ranges, optionally filtered by unit. |

**Known schema/DTO drift**: `CreateMeasurementDto` accepts `special_conditions[]` (and the API docs mention it), but the live `Health_Measurement` entity has **no `special_conditions` column** — it's effectively dropped server-side. The Patient app's local SQLite mirror does have this column, and the `AddNew` screen collects it (Fasting / Post-meal / Morning tags), but as coded it isn't persisted to the backend. See [[Known Gaps and Roadmap]].

## Entities

- **`Health_Measurement`** — UUID PK; `ManyToOne` → `Medical_Document` (nullable `document_id`), `Patient`, `Measurement_Unit`; `numeric_value`; timestamps.
- **`Measurement_Unit`** — UUID PK; `unit_name, symbol, measurement_group`. The `measurement_group` is the "family" that groups related units — e.g. "Blood Pressure" groups Systolic + Diastolic — and is central to how the Patient app renders combined BP cards.
- **`Reference_Range`** — UUID PK; `ManyToOne` → `Measurement_Unit`; `min_value, max_value` (default 0); optional `target_gender` (enum), `min_age`, `max_age`, `special_conditions` (text array).

## Patient app screens (`Frontend/Patient/src/app`)

- **`(tabs)/Dashboard.tsx`** — home screen. Groups all of a patient's measurements by `measurement_unit.measurement_group`, shows the latest reading per group as a 2-column card grid (Blood Pressure is special-cased to combine Systolic+Diastolic into one card). Uses `useFocusEffect` to reload from SQLite on every tab-focus; pull-to-refresh triggers a full sync. Skeleton loading state; empty-state messaging when no cached data.

- **`health_measurements/DetailedView.tsx`** — per-group trend screen: current value (dual-value for BP), a computed delta/trend pill, a `WeightChart` sparkline, a `HistoryRow` list. Backed by `useMeasurements` + `useReferenceRanges` reading SQLite-first. Two focus-aware behaviours:
  - `useFocusEffect` calls `reloadFromCache()` every time the screen regains focus, so returning from `ItemDetail` after a deletion immediately drops the deleted row from the list without a manual pull-to-refresh.
  - An effect watches `allMeasurements`: once measurements have been non-empty at least once (`hadMeasurementsRef`), if they drop to zero after loading completes it calls `router.back()` — handles the "deleted last measurement" case automatically.

- **`health_measurements/ItemDetail.tsx`** — single reading detail: value, date, attached document image, edit/delete. Image loading is **offline-first**: checks `local_file_path` in SQLite (`getDocumentById`) first; only falls back to a backend secure-URL call when `isOnline`. Delete uses `useOfflineMutation.deleteMeasurement` (queues offline, syncs when back online) rather than calling the backend directly. All hooks are declared before the `if (!measurement) return` early exit to comply with Rules of Hooks.

- **`health_measurements/EditMeasurement.tsx`** — edits a reading's value(s)/date via `useOfflineMutation.updateMeasurement`.

- **`AddNew.tsx`** (modal) — the primary "log a new measurement" flow: pick a unit/group, numeric input (dual inputs with auto-focus-next for BP), date/time pickers, special-condition pill toggles, an "Add Photo" affordance that opens the [[Medical Documents and OCR|Scan screen]] and runs OCR. Saves online or fully offline depending on connectivity.

## The reference-range scoring algorithm

`helpers/detailed_view.helpers.ts → findBestReferenceRange` picks the most clinically-specific applicable `Reference_Range` for a given measurement. It accepts an optional `patientFallback` parameter so SQLite-sourced measurements (which have no nested `patient` object) can still be scored against the patient's age/gender from context.

1. Hard-excludes gender mismatches and out-of-bounds ages.
2. Scores remaining candidates: gender match (+10000) > age-range specificity (+100 to +1000) > special-condition overlap (+50 per match, **−500 penalty** if the range demands a condition the reading lacks).
3. Returns the highest-scoring range.

## Charts

`components/detailed_view/weight_chart.tsx` implements custom SVG chart smoothing (cubic Bezier via `buildSmoothPath`/`buildAreaPath`) and returns `null` immediately when `measurements` is empty — preventing a crash that would otherwise occur when the last measurement is deleted and the component re-renders before the navigate-back effect fires.

`components/detailed_view/history_row.tsx` renders delta-annotated history rows.
