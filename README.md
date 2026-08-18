# Stavya Awareness Platform

Interactive health-awareness journey platform for Stavya Spine Hospital.
First journey: **Healthy Bones** (Phase 2, beta).

This is a reusable **journey engine**, not a one-off quiz: journeys are
versioned data rendered through a shared step-type registry, so future
journeys plug in without new frontend architecture.

## Structure

| Path                  | Purpose                                              |
| --------------------- | ---------------------------------------------------- |
| `apps/web`            | Next.js (App Router) — participant experience        |
| `apps/api`            | NestJS modular monolith — journey engine, scoring    |
| `packages/contracts`  | Zod schemas + inferred types shared by both apps     |
| `packages/config`     | Shared TypeScript/tooling presets                    |
| `docker/`             | PostgreSQL for local dev; deployment compose later   |
| `docs/architecture/`  | One decision record per foundation                   |
| `docs/content/`       | Approved journey content documents (source of truth) |

## Getting started

```
pnpm install
docker compose -f docker/docker-compose.yml up -d db
pnpm dev            # web on :3000, api on :4000
```

Copy `.env.example` values into per-app `.env` files as needed.

## Development rule

Built foundation-by-foundation (see `docs/architecture/`). Each foundation
is proposed, approved, implemented, tested, and reviewed before the next
begins. Medical content comes only from approved Stavya documents.
