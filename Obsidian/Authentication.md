---
tags: [feature, backend, frontend]
---

# Authentication

Up: [[Home]] · Related: [[Patient Records]], [[Doctor Portal]], [[Known Gaps and Roadmap]]

OTP-based login/registration for both patients and doctors, plus a partial Google OAuth flow. Backend module: `Backend/src/auth`.

## Backend routes (`/auth`, all `@Public()`)

| Method | Route | Purpose |
|---|---|---|
| POST | `/auth/requestcode` | Request an OTP for patient login. **Currently short-circuited** — returns a canned "OTP disabled for development" message before reaching the real `otpService`/email send (dead code below an early return). |
| POST | `/auth/verifycode` | Verify patient OTP. Accepts **`000000` as a hardcoded testing bypass**. 404 if email not registered → frontend treats this as "needs registration." Returns JWT + refresh token via `authService.signTokens`. |
| POST | `/auth/doctor/verifycode` | Same for doctors; 412 if not registered. |
| POST | `/auth/register` | Registers a new patient (`CreatePatientDto`); 401 if email already exists. |
| POST | `/auth/doctor/register` | Registers a new doctor (`CreateDoctorDTO`); 401 if email exists. |
| POST | `/auth/doctor/verifyaccount` | Sets `Doctor.is_verified = true`. |
| POST | `/auth/refresh` | Guarded by a separate `jwt-refresh` Passport strategy/secret; issues a new short-lived JWT. |
| POST | `/auth/google` | Verifies a Google `idToken` via `google-auth-library`, returns profile info — **does not yet issue a Sehat JWT or link to a Patient/Doctor record** (explicitly stubbed). |

## Mechanisms

- **OTP service** (`services/otp.service.ts`) — real implementation: 6-digit code, hashed with **argon2**, 5-minute TTL via `@nestjs/cache-manager`, attempt tracking, generic failure messages. Currently unused in the live flow due to the dev bypass above.
- **Email service** — `nodemailer` SMTP, styled HTML login-code emails.
- **JWT strategy** — Bearer via `passport-jwt`, secret from `JWT_SECRET` (fallback `'super-secret-key'`), payload `{ sub: id }`.
- **Refresh strategy** — separate secret (`REFRESH_SECRET`) and expiry (`REFRESH_EXPIRES_IN`).
- **`@Public()` decorator** — `SetMetadata('isPublic', true)`, read by the global `JwtAuthGuard` via `Reflector`.

## Patient app (`Frontend/Patient/src/app/(auth)`)

Route group wrapped in an `UnauthorizedOnly` guard (redirects away if already logged in):

- `Login.tsx` — email/phone entry, calls `requestcode`, navigates to OTP screen. Has a decorative (non-functional) "Continue with Google" button.
- `Otp.tsx` — 6-digit entry (`react-native-otp-entry`), calls `verifycode`; routes to Signup on a "needs registration" response, otherwise loads the patient profile and persists tokens via `expo-secure-store`.
- `Signup.tsx` — name, gender, date of birth, blood group, and a "Beta Program / Research opt-in" toggle (maps to `Patient.is_research_opt_in`).

Token handling lives in `services/Backend/backend.service.tsx`: stores `jwtToken`/`refreshToken` in SecureStore, auto-retries once on a 401 via `/auth/refresh`, force-logs-out (clears tokens + patient + navigates to Login) if refresh fails.

## Doctor portal (`Frontend/Doctor/src`)

- `LoginPage` → `requestCode(email)` → navigates to `/verify`.
- `VerifyPage` → OTP inputs, `verifyDoctorCode`, stores whatever token field the backend returns (`jwtToken`/`accessToken`/`token`/`jwt`) into `localStorage.doctorToken`. UI literally hints *"For testing, you can try OTP: 000000."*
- `RegisterDoctorPage` → collects name/email/phone/license/hospital/specialization, calls register then verifyaccount.
- `AuthContext` caches doctor profiles in `localStorage` keyed by normalized email, since there's no backend "get doctor profile" endpoint.
- `services/api.ts` — Axios instance; injects `Authorization: Bearer <token>`, and on 401 attempts a silent `/auth/refresh` before retrying.

## Notable state

- Auth is currently in an intentional-looking **dev bypass state**: OTP `000000` works everywhere, and `requestcode` never actually sends an email. Treat this as temporary, not a security design — see [[Known Gaps and Roadmap]].
- Google login is UI-present in both frontends but not functionally wired end-to-end.
