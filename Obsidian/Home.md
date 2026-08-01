---
tags: [moc]
---

# Sehat — Vault Home

Sehat (aka "SehatScan") bridges patients and doctors through digitized medical reports and **consent-based, time-bound sharing** of health data. Built at FAST National University, Karachi.

> Patient scans a report → OCR/AI digitizes it → stored in Azure Blob Storage → doctor requests access → patient approves → time-bound access token issued → doctor views record → token auto-expires.

## Map of Content

### Summary
- [[Project Summary]] — one-page rollup of every note in this vault
- [[Patient Mobile App]] — one-page rollup of everything specific to the Patient React Native app

### Architecture
- [[Overview]] — tech stack, repo layout, deployment

### Features
- [[Authentication]] — OTP login, registration, Google OAuth (backend + both apps)
- [[Patient Records]] — the core `Patient` entity/module
- [[Health Measurements]] — readings, units, reference ranges, trend views
- [[Medical Documents and OCR]] — scanning, upload, Azure storage, the OCR microservice
- [[Consent-Based Sharing]] — Access Grants, QR/OTP redemption, doctor sessions — the flagship feature
- [[Offline-First Sync]] — the Patient app's local SQLite + mutation outbox + Device-Only Mode

### Apps
- [[Doctor Portal]] — the clinician-facing React web app
- [[Patient Web Landing Page]] — static marketing site

### Planning
- [[Known Gaps and Roadmap]] — dev bypasses, stubs, and unimplemented pieces to be aware of

## Sub-projects at a glance

| Project | Path | Stack |
|---|---|---|
| Backend | `Backend/` | NestJS + TypeORM + PostgreSQL + Azure Blob Storage |
| Patient app | `Frontend/Patient/` | React Native (Expo Router), offline-first SQLite |
| Doctor portal | `Frontend/Doctor/` | React + Vite |
| Patient web | `Frontend/PatientWeb/` | Static HTML/CSS/vanilla JS |
| OCR service | `ml/Medical-Prescription-OCR/` | Python, FastAPI, Donut (HF transformers) |
