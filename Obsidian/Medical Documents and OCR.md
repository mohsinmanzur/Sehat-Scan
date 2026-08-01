---
tags: [feature, backend, frontend-patient, ml]
---

# Medical Documents and OCR

Up: [[Home]] · Related: [[Health Measurements]], [[Consent-Based Sharing]]

Covers report scanning, image storage, and the standalone OCR microservice that digitizes prescriptions. Backend module: `Backend/src/medical_document` (routes under `/record`); ML service: `ml/Medical-Prescription-OCR`.

## Backend routes (`/record`)

| Method | Route | Purpose |
|---|---|---|
| GET | `/record?id=` \| `?patient_id=` | Query documents (else all). |
| GET | `/record/document-url?id=` | Looks up a document's `file_url` **by health-measurement ID** (joins through the `health_measurements` relation) — lets the frontend jump from a measurement straight to its source scan. |
| POST | `/record/image/upload` | Multipart (`FileInterceptor('file')`). Validates file type is png/jpeg/jpg (a size validator exists in code but is **commented out** — no current upload size limit). Converts the image to **WebP** via `sharp` (quality 80) before uploading to **Azure Blob Storage**, filename pattern `${record_type}_${uuid()}.webp`. Then creates the `Medical_Document` row. |
| POST | `/record/image/get-secure-url` | Given a blob `file_url`, generates a **time-boxed SAS URL** (read-only, valid −5 min to +10 min) — this is the "encrypted storage" mechanism referenced in the product pitch: raw storage isn't exposed long-term. |

## `Medical_Document` entity

- UUID PK; `ManyToOne` → `Patient`; `OneToMany` → `Health_Measurement`, `AI_Analysis`
- `file_name, file_url`
- `record_type` (enum: `lab_report | prescription | imaging | other`)
- `ocr_extracted_text?`
- `date_issued?`
- timestamps

## `AI_Analysis` entity — planned, not yet wired up

Exists in the schema (`anomaly_detected` bool, `suggested_text?`, `severity_score`, timestamps) with **no controller or service currently using it**. This is a placeholder data model for a future "AI insight / anomaly flagging" feature per document. See [[Known Gaps and Roadmap]].

## Patient app: scanning flow

`Frontend/Patient/src/app/health_measurements/Scan.tsx` — full-screen camera (`expo-camera`) with an SVG-masked document viewfinder overlay, pinch-to-zoom, flip camera, and a gallery-picker fallback (auto-triggered on web, since native camera capture isn't available there). Sets the captured URI into `GlobalContext.scannedImage` and returns to the [[Health Measurements|AddNew]] screen.

## OCR integration — a genuinely separate microservice

**The Patient app calls the OCR service directly, bypassing the NestJS backend entirely.** `services/Backend/backend.service.tsx → extractTextFromImage(imageUri)` POSTs the photo as multipart form-data straight to a separate `OCR_BASE_URL` (env var — currently a placeholder `"test"` in this checkout, i.e. not pointed at a real deployment). The extracted text and inferred label are shown inline in `AddNew.tsx` for the patient to review/edit before the reading and document are saved.

Only afterward, when the mobile app calls `POST /record/image/upload`, does the OCR text get attached to `Medical_Document.ocr_extracted_text` — **the backend never calls the OCR service itself**; the mobile app is the one relaying OCR output to the backend.

### OCR service (`ml/Medical-Prescription-OCR`)

- **Model**: fine-tuned **NAVER Clova Donut** (document-understanding vision-encoder-decoder), hosted on Hugging Face Hub as `chinmays18/medical-prescription-ocr` (~800MB). Trained on a synthetic 1,000-image dataset (`chinmays18/medical-prescription-dataset`, 800/100/100 split), documented in `OCR_training.ipynb` (PyTorch Lightning, AdamW + linear warmup, gradual augmentation curriculum, gradient checkpointing/AMP).
- **Reported performance**: 71% character-level accuracy, 84% word-level accuracy, ~2s/image on CPU (Apple M1), benchmarked on 100 held-out prescriptions.
- **Explicit caveat from the README**: research use only — not clinically validated, trained on synthetic (not real patient) data, **not for real prescriptions**.
- **`model_download.py`** — pulls the pretrained snapshot from Hugging Face Hub into `model/` (~800MB) via `huggingface_hub.snapshot_download`.
- **`app.py`** — a Gradio drag-and-drop demo UI for manual testing.
- **`server.py`** — the actual production API the Patient app talks to. FastAPI app (`Sehat OCR`, CORS wide open `allow_origins=["*"]`):
  - `GET /health` → `{ status, device }` (`cuda`/`cpu`)
  - `POST /ocr` (multipart, must be `image/*`) → runs the Donut model (beam size 1, max length 512, decoder seeded with the `<s_ocr>` task-prompt token) to transcribe, then classifies the text with a **zero-shot BART classifier** (`facebook/bart-large-mnli`) against `"medical prescription"` vs `"not medical prescription"`, refined by a hand-tuned keyword heuristic (looks for "prescribed," "mg," "dosage," "dr.," "rx," etc.) to correct low-confidence zero-shot misclassifications. Returns `{ text, label, confidence }`.

Tech stack: PyTorch 2, PyTorch Lightning, Hugging Face `transformers` (Donut + BART pipelines), SentencePiece, Albumentations, Gradio, FastAPI/uvicorn. MIT licensed.
