---
tags: [feature, backend, frontend]
---

# Authentication

Up: [[Home]] · Related: [[Patient Records]], [[Doctor Portal]], [[Known Gaps and Roadmap]]

OTP-based login/registration for both patients and doctors, plus a Google Sign-In flow for the Patient app that skips OTP entirely. Backend module: `Backend/src/auth`.

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
| POST | `/auth/google` | Verifies a Google `idToken` via `google-auth-library` (`GoogleAuthService`), looks up the patient by the verified email (`patientService.getPatientByEmail`), and either issues JWT + refresh tokens via `authService.signTokens` (same success path as `/auth/verifycode`) or throws a 404 if the email isn't registered — mirrors `/auth/verifycode`'s needsRegistration pattern exactly, just keyed by a verified Google email instead of an OTP. **Not yet usable end-to-end** — see caveat below. |

## Mechanisms

- **OTP service** (`services/otp.service.ts`) — real implementation: 6-digit code, hashed with **argon2**, 5-minute TTL via `@nestjs/cache-manager`, attempt tracking, generic failure messages. Currently unused in the live flow due to the dev bypass above.
- **Email service** — `nodemailer` SMTP, styled HTML login-code emails.
- **JWT strategy** — Bearer via `passport-jwt`, secret from `JWT_SECRET` (fallback `'super-secret-key'`), payload `{ sub: id }`.
- **Refresh strategy** — separate secret (`REFRESH_SECRET`) and expiry (`REFRESH_EXPIRES_IN`).
- **`@Public()` decorator** — `SetMetadata('isPublic', true)`, read by the global `JwtAuthGuard` via `Reflector`.

## Patient app (`Frontend/Patient/src/app/(auth)`)

Route group wrapped in an `UnauthorizedOnly` guard (redirects away if already logged in):

- `Login.tsx` — email/phone entry, calls `requestcode`, navigates to OTP screen. Also has a working "Continue with Google" button: uses `@react-native-google-signin/google-signin`'s `GoogleSignin.signIn()` to get an `idToken`, then calls `backend.googleAuth(idToken)` (new method in `backend.service.tsx`, mirrors `verifycode`'s 404→`{needsRegistration:true}` handling). On `needsRegistration`, routes straight to `/Signup` with `patientEmail`/`patientName` prefilled from the Google profile; otherwise sets the patient session directly — **OTP screen is skipped entirely** for Google sign-in/sign-up.
- `Otp.tsx` — 6-digit entry (`react-native-otp-entry`), calls `verifycode`; routes to Signup on a "needs registration" response, otherwise loads the patient profile and persists tokens via `expo-secure-store`. Only reached via the email/phone flow, not the Google flow.
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
- Doctor Web app's Google button (`LoginPage.tsx`) remains a decorative, non-functional placeholder — Google Sign-In was only wired up for the Patient mobile app.
- **Google Sign-In is fully coded but not runnable yet** — no real Google OAuth credentials exist in this checkout:
  - `Frontend/Patient/google-services.json` and `GoogleService-Info.plist` are stub/placeholder files (the plist has a literal `STUB FILE` comment); their `oauth_client` lists are empty.
  - Two new env vars were added as **empty placeholders** and must both be filled in with the same Google OAuth "Web application" client ID (from Google Cloud Console, or Firebase Console → Authentication → Sign-in method → Google, once enabled): `GOOGLE_WEB_CLIENT_ID` in `Frontend/Patient/.env`, `GOOGLE_CLIENT_ID` in `Backend/.env`.
  - `@react-native-google-signin/google-signin` is a native module (added to `app.json`'s `plugins`) — it requires a fresh custom dev-client rebuild (EAS build / `expo run`); it will not work in an existing, already-built dev client.
