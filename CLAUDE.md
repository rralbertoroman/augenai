# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

AugenAI is a Turborepo monorepo for AI-assisted retinal-image diagnosis (diabetic retinopathy + glaucoma). Two apps:
- `apps/web` — Next.js 16 / React 19 frontend + API layer (TypeScript, pnpm)
- `apps/ai_service` — FastAPI ML inference service (Python 3.13, managed by `uv`)

Shared config lives in `packages/eslint-config` and `packages/typescript-config`.

## Commands

Run from the repo root (Turborepo fans out to both apps):

```bash
pnpm install          # installs Node deps AND Python deps (uv) for all apps
pnpm dev              # web on :3000, ai_service on :8000
pnpm build
pnpm lint             # eslint (web) + ruff (ai_service)
pnpm check-types      # tsc --noEmit
pnpm test
pnpm format
pnpm docker:build     # docker compose up --build
```

Web (`apps/web`):
```bash
pnpm test                          # vitest run
npx vitest server/tests/core/prediction_workflow.test.ts   # single test file
pnpm generate -- <migration_name>  # create a Drizzle migration
pnpm migrate                       # apply migrations
pnpm migrate:seed                  # migrate + seed (server/db/seed/init.ts)
```

AI service (`apps/ai_service`):
```bash
uv run pytest                                  # all tests
uv run pytest tests/model/test_model_service.py -v   # single file
uv run fastapi dev src/ai_service/main.py      # run directly
uv run ruff check --fix . && uv run ruff format .
```

Commits must follow Conventional Commits (enforced by commitlint + Husky `pre-commit` runs check-types/lint/format).

## Architecture

### Cross-service flow
The web app orchestrates predictions; the AI service is a stateless inference worker.

1. User uploads a retinal image (stored in Supabase Storage).
2. `apps/web/server/services/prediction_workflow.ts` selects models from the DB, downloads the image, and POSTs `multipart/form-data` (`model_id` + `image`) to `${AI_PREDICTION_SERVICE_URL}/predict` for each model.
3. Auth between services is a shared secret sent as the `X-API-Key` header (`AI_PREDICTION_SERVICE_SECRET_KEY`, must match on both sides). The AI service does NOT know about users.
4. Results (classifications / detections) are persisted via Drizzle.

User auth (browser → web) is separate: Supabase JWT, validated server-side.

### Web app (`apps/web`)
- Next.js App Router. `app/` = routes/pages; `modules/` = feature UI (diagnosis, patients, predictions); `components/` = shared UI (Radix + Tailwind v4).
- `server/` is trusted server-only code: `db/schemas/` (Drizzle tables — patients, predictions, classifications, detections, diseases, lesions, feedback, sharing), `db/migrations/`, `services/` (business logic; `prediction_workflow.ts` is the orchestrator), `auth/`, `zod-schemas/`.
- Postgres via Supabase; Drizzle ORM (`drizzle.config.ts`).

### AI service (`apps/ai_service`) — adapter/factory pattern
This is the key abstraction. Each model has TWO registrations, and **adding a model means touching both tiers plus dropping weights in `weights/<model_id>/`**:

1. **Adapter** (`src/ai_service/services/model/`) — extracts metadata for `GET /api/v1/models`. Subclass `BaseModelAdapter`, decorate with `@register_adapter("<model_id>")` (populates `ADAPTER_REGISTRY`). Existing adapters: `hf.py` (ViT/SwinV2/DINOv2), `ultralytics.py` (YOLO), `pytorch_custom.py` (custom ResNet18). New adapter files must be imported in `services/model/__init__.py` to register.

2. **Factory** (`src/ai_service/services/prediction/factories/`) — a function returning a `ModelInstance` subclass that loads weights and implements `run(image) -> PredictionResult`. Register it in the `factories` dict in `services/prediction/service.py` (`PredictionService.__init__`).

Runtime: `POST /api/v1/predict` → `PredictionService` → `ModelPool.get_model(model_id)` lazily instantiates via the factory and caches the instance (evicted after ~60 min idle) → `instance.run(image)`.

- `model_id` is the weights subdirectory name; it's the join key across adapter, factory, weights dir, and the web app's `model` table.
- Response schemas in `models/schemas.py`: `ClassificationResult` / `DetectionResult`. Low-confidence classifications (below `confidence_threshold`, default 0.70) fall back to an "Unknown disease" object.
- Supported weight formats: HuggingFace dirs (`from_pretrained`), YOLO `.pt`, and raw PyTorch checkpoints loaded manually.

### Model weights & Git LFS
Weights live in `apps/ai_service/weights/<model_id>/` and are large. Clone with Git LFS available. Do not commit model binaries without confirming LFS tracking.

## Environment
Each app has its own `.env` (see `.env.example`). The shared secret `AI_PREDICTION_SERVICE_SECRET_KEY` must be identical in both. Web also needs Supabase (`SUPABASE_DB_URL`, JWT JWK, public keys), `AI_PREDICTION_SERVICE_URL`, and Resend keys.
