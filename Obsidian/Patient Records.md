---
tags: [feature, backend]
---

# Patient Records

Up: [[Home]] · Related: [[Authentication]], [[Health Measurements]], [[Consent-Based Sharing]]

The `Patient` entity is the root record everything else hangs off of. Backend module: `Backend/src/patient`.

## Routes (`/patient`)

| Method | Route | Purpose |
|---|---|---|
| GET | `/patient` | Optional query `id` \| `email` \| `name`; **if none given, returns all patients** — no pagination. Potential PII exposure at scale. |
| POST | `/patient` | Create (`CreatePatientDto`). |
| PUT | `/patient?id=` | Update (`UpdatePatientDto`, all fields optional). |
| DELETE | `/patient?id=` | Delete. |

Note: the Doctor portal's [[Doctor Portal|Access page]] uses this same unfiltered `GET /patient` for a patient-search directory — meaning any authenticated doctor can currently search all patients without a consent grant. See [[Known Gaps and Roadmap]].

## `CreatePatientDto` validation

- `name` (string)
- `email` (string)
- `gender` (enum: male / female / other)
- `phone` (optional, `@IsPhoneNumber`)
- `date_of_birth` (Date via `@Type(() => Date)`)
- `blood_group` (optional, enum of 8 standard blood groups)
- `emergency_contacts` (optional array of key/value records)
- `reward_points` (optional number)
- `is_research_opt_in` (optional boolean) — feeds the "Beta Program / Research opt-in" toggle on the Patient app's Signup screen

## `Patient` entity

- UUID primary key
- `OneToMany` → `Medical_Document`, `Health_Measurement`, `Access_Grant`
- Columns: `name, email, gender (enum), phone?, date_of_birth, blood_group?, emergency_contacts (jsonb), reward_points (default 0), is_research_opt_in (default false), created_at, updated_at`

## Patient app profile screens

`Frontend/Patient/src/app/profile/`:

- `index.tsx` (Settings) — menu to User Profile / Change Password / FAQs, a **"Device-Only Mode" toggle** (stores data only locally, pauses network reachability checks and cloud sync — a real privacy feature with confirmation dialogs both ways), Logout, WhatsApp support link.
- `UserProfile.tsx` / `ChangePassword.tsx` — **UI-only stubs**. Forms validate client-side but persistence is simulated (`setTimeout` + toast, with a `// TODO: wire up actual update API` comment). Not connected to the backend's `PUT /patient` even though that endpoint exists.
- `FAQs.tsx` — static accordion content (adding measurements, sharing records, encryption claims, revoking access, updating profile, expiry behavior).
