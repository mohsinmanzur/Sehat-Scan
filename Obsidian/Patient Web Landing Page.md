---
tags: [frontend-web]
---

# Patient Web Landing Page

Up: [[Home]] · Related: [[Consent-Based Sharing]], [[Medical Documents and OCR]]

`Frontend/PatientWeb/` — a **static marketing/landing page** (plain HTML/CSS/vanilla-JS ES modules, no framework, no backend calls). This is the public web footprint / "download our app" page — **not** a functional patient portal.

## Contents

- **`index.html`** — hero section; a "Core Capabilities" features grid (AI-Powered Digitization, Consent Access Control, Insightful Trends); a 4-step "How Sehat Operates" timeline (Scan → Local Records → Doctor Requests → Consent Grant, mirroring the backend README's operations-flow diagram); a "Privacy-First Consent Architecture" security section listing: consent-based validation, time-bound self-revoking permissions, zero permanent doctor storage, immutable audit logging; a bottom CTA plus fake "Get it on Google Play" buttons (`onclick="alert(...)"` demo stubs); a footer with contributor credits.
- **`phone.html`** + `js/components/{clock,scanner,slider}.js`, orchestrated by `js/main.js` — an interactive **animated phone mockup** embedded in the hero. Fetches `phone.html` and injects it, then wires up a 3-screen swipeable simulation: a Dashboard mock (Blood Pressure/Heart Rate/Blood Sugar widgets with SVG sparklines), a Scan screen (animated scanning-line loop), and a Share screen (`initConsentSlider`, a "slide to grant access" consent gesture), plus a live-updating clock in the mock status bar. Purely illustrative — no real data, no API calls, but visually mirrors the actual Patient app UI.
- CSS modularized under `css/components/*.css` (hero, features, timeline, security, footer, header, phone) plus shared `variables.css`/`layout.css`/`animations.css`.

## Note on marketing claims vs. implementation

The security section's bullet points are aspirational in places — e.g. **"immutable audit logging" has no corresponding entity or mechanism** in the backend as currently implemented. See [[Known Gaps and Roadmap]] before treating this page's copy as a spec.
