---
tags: [architecture]
---

# Architecture Overview

Up: [[Home]]

## Product pitch

Sehat digitizes physical medical reports and lets patients share them with doctors under **consent-based, time-bound access** rather than permanent record storage on the doctor's side.

## Five sub-projects

1. **Backend** — `Backend/` — NestJS API, PostgreSQL via TypeORM, Azure Blob Storage for document images.
2. **Patient app** — `Frontend/Patient/` — React Native + Expo Router, the primary product surface. Fully offline-first — see [[Offline-First Sync]].
3. **Doctor portal** — `Frontend/Doctor/` — React + Vite web app for clinicians. See [[Doctor Portal]].
4. **Patient web** — `Frontend/PatientWeb/` — static marketing/landing page, not a functional app. See [[Patient Web Landing Page]].
5. **OCR microservice** — `ml/Medical-Prescription-OCR/` — standalone Python/FastAPI service using a fine-tuned Donut model. See [[Medical Documents and OCR]].

## Operations flow (core loop)

```
Patient scans report (Patient app camera)
    → photo sent directly to OCR microservice (/ocr)
    → extracted text + record type shown to patient for review
    → saved: image uploaded to Backend (/record/image/upload)
        → Backend converts to WebP (sharp) and stores in Azure Blob Storage
    → Patient creates an Access Grant (/share) for a doctor or "anyone with code"
    → Doctor redeems the grant via 6-digit code or QR (/share/shared-by-code)
    → Doctor views shared measurements/reports (time-boxed Azure SAS URLs for images)
    → Grant auto-expires or patient revokes it (/share/revoke)
```

## Deployment

- Backend deployed to **Azure App Service** (`sehatscan`), CI/CD via GitHub Actions (`.github/workflows/dev_sehatscan.yml`) on push to `dev`.
- Live backend: `https://sehatscan-abgtfbb6cmgmgugr.uaenorth-01.azurewebsites.net/`
- The OCR service and the two frontends are deployed/run independently — **three separately-deployed runtimes** (NestJS API, OCR FastAPI service, client apps) plus the static web page.

## Global backend conventions

- CORS allow-lists local dev ports (5173, 8081, 19006) with credentials.
- Global `ValidationPipe` (`whitelist`, `forbidNonWhitelisted`, `transform`) — all DTOs strictly validated via `class-validator`.
- **`JwtAuthGuard` registered globally** (`APP_GUARD`) — every route requires a Bearer JWT unless annotated `@Public()`. Only `AuthController` is public.
- TypeORM `synchronize: false` — schema changes go through migrations, not auto-sync.

See [[Known Gaps and Roadmap]] for where these conventions are currently underenforced (e.g. no per-owner checks on patient data lookups).
