# Knova

### Telemetry Driven Educational Content Recommendation Engine

Knova is a short-form, TikTok-style feed for **educational content**. Instead of
entertainment clips, the feed serves bite-sized learning units — text posts, MCQs,
and flashcards — and continuously personalizes what each learner sees based on how
they actually engage: dwell time, scroll depth, completion, and votes.

The core idea is **telemetry-driven recommendation**: every interaction is logged
as a raw signal, and those signals feed a set of ML models (a content ranker, a
collaborative-filtering model, and content-based retrieval) that decide what to
show next.

---

## Table of Contents

- [How It Works](#how-it-works)
- [Repository Layout](#repository-layout)
- [Tech Stack](#tech-stack)
- [Domain Model](#domain-model)
- [Recommendation & ML](#recommendation--ml)
- [Getting Started](#getting-started)
- [API](#api)
- [Contributing](#contributing)

---

## How It Works

1. **Creators** publish short educational **posts** (plain text, an MCQ, or a flashcard).
2. **Learners** scroll a personalized feed. Each impression records **telemetry** —
   how long the post was on screen, how far it was scrolled, whether it was completed,
   and any vote/save/comment.
3. That telemetry is aggregated into per-user and per-post signals and fed to the
   **recommendation models**, which rank candidate posts for each learner.
4. The loop repeats — the more a learner engages, the sharper the personalization.

Expected reading time is derived from a post's **word count**, so completion can be
measured meaningfully even for text-only content.

---

## Repository Layout

```
knova/
├── backend/     FastAPI service — API, auth, database, ML model loading
├── frontend/    Next.js app — feed UI, auth, creator & learner surfaces
├── ml/          Training notebooks, datasets, and exported model artifacts
└── CONTRIBUTING.md
```

---

## Tech Stack

| Layer     | Technology                                                                 |
|-----------|----------------------------------------------------------------------------|
| Backend   | Python 3.12, FastAPI, SQLAlchemy 2 (async), Alembic, Pydantic, `uv`         |
| Database  | PostgreSQL 16 + [pgvector](https://github.com/pgvector/pgvector) (embeddings)|
| Auth      | JWT (access + refresh), Argon2 password hashing, OAuth-ready                |
| ML        | scikit-learn, LightGBM, implicit (ALS), TF-IDF, joblib, NumPy, pandas       |
| Frontend  | Next.js (App Router), TypeScript, Tailwind CSS                             |
| Infra     | Docker Compose (app + pgvector)                                            |

---

## Domain Model

Key entities (see `backend/src/db/models.py`):

- **User** — learner/creator account, with an interest embedding and estimated expertise.
- **CreatorProfile** / **CreatorFollow** — creator reputation and the follower graph.
- **Topic** / **UserTopicInterest** — hierarchical taxonomy and per-user topic affinity.
- **Post** — a unit of content with a `content_type` (`text` · `mcq` · `flashcard`),
  a semantic embedding, and denormalized engagement counters.
  - **Mcq** — structured question / options / correct answer for MCQ posts.
  - **Flashcard** — front / back payload for flashcard posts.
- **Tag** / **PostTag** — free-form labels layered on top of topics.
- **Interaction** — the raw telemetry log (dwell time, scroll depth, completion,
  surface, feed position) that drives the recommendation models.
- **Vote**, **SavedPost**, **Comment** — explicit engagement signals.

---

## Recommendation & ML

The engine combines several signals, with pre-trained artifacts stored in
`backend/models/`:

- **Content Ranker** (`knova_content_ranker.pkl`) — gradient-boosted ranker over
  telemetry + creator + content features.
- **Collaborative Filtering / ALS** (`knova_als*.pkl`) — implicit-feedback
  user↔post matrix factorization for personalized retrieval.
- **Content-based retrieval** (`knova_tfidf*.pkl`) — TF-IDF similarity for related
  and cold-start content.
- **Content-type & difficulty helpers** (`knova_mcq_model.pkl`,
  `knova_type_encoder.pkl`, `knova_feature_scaler.pkl`, `knova_thompson_sampler.pkl`)
  — supporting models for classification, feature scaling, and exploration.

Models are loaded at runtime by `backend/ml/loader.py`; paths are configured via
`ML_MODELS_PATH` / `ML_DATA_PATH` in the backend settings. Training lives in `ml/`.

---

## Getting Started

Clone the repo, then set up each part.

### Backend

Full instructions are in [`backend/README.md`](backend/README.md). Quick start with Docker:

```bash
cd backend
docker compose up --build
```

API docs: `http://localhost:8000/api/v1/docs`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

App: `http://localhost:3000`

---

## API

Base path: `/api/v1`

| Method | Endpoint             | Description                          |
|--------|----------------------|--------------------------------------|
| POST   | `/auth/register`     | Create an account                    |
| POST   | `/auth/login`        | Obtain access + refresh tokens       |
| POST   | `/auth/refresh`      | Rotate the access token              |
| GET    | `/reference/topics`  | List topics                          |
| POST   | `/reference/topics`  | Create a topic                       |
| GET    | `/health`            | Service health check                 |

Interactive docs (Swagger / ReDoc) are available at `/api/v1/docs` and `/api/v1/redoc`.

---

## Contributing

Contributions are welcome. Please read [`CONTRIBUTING.md`](CONTRIBUTING.md) first —
note that all work branches from and targets **`dev`** (never `main`).
