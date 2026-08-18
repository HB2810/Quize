# Foundation 1 — Project architecture & repository structure

Date: 2026-08-13 · Status: Implemented

## Decisions

1. **pnpm-workspace monorepo with Turborepo** at `qp2/`. Modular monolith
   in one repository; no microservices. Domain boundaries are folders now
   and can become services later only if genuinely required.

2. **`apps/web` (Next.js, App Router, Tailwind v4)** — three layers:
   routes (thin) → journey engine state → typed API client. One dynamic
   route `/j/[journeySlug]` renders every journey through a step-type
   registry; there is never one route per journey. Gamified experience
   (progress ring, streaks, score count-up, 6/6 celebration) is a design
   system concern, built in Foundation 4, respecting
   `prefers-reduced-motion`.

3. **`apps/api` (NestJS, CommonJS)** — one module per domain under
   `src/modules/`: journeys, sessions, responses, scoring, reports,
   participants, consent, recognition, analytics, auth, admin. Only the
   health module exists in Foundation 1. Two invariants from day one:
   - The **session is server-authoritative** — the client never asserts
     position or correctness; it asks "where am I?" and submits answers.
   - **Correct answers never reach the browser before submission** —
     evaluation happens server-side; feedback returns in the answer
     response.

4. **`packages/contracts`** — Zod schemas as the single source of truth;
   TypeScript types inferred. Compiled as CommonJS so both the CJS NestJS
   build and Next.js consume it without ESM interop issues. The journey
   definition schema will live here and later validates CMS-authored
   content.

5. **Database boundary** — only `apps/api` touches PostgreSQL (Prisma,
   Foundation 2). API responses are DTOs from contracts, never raw Prisma
   models. Participant PII is stored separately from response/analytics
   data so retention and access policies can differ.

6. **Environment** — per-app `.env`, git-ignored; committed
   `.env.example`. Both apps will validate environment at boot with Zod
   (Foundation 3/4) and refuse to start when misconfigured. Only
   `NEXT_PUBLIC_*` reaches the browser.

7. **Journeys are versioned data, not code** — lifecycle
   DRAFT → REVIEW → PUBLISHED → ARCHIVED; published versions are
   immutable and sessions reference them permanently. Options carry an
   optional `nextNodeId` in the data model for future branching, unused
   in beta.

8. **Deliberately deferred** — no `packages/ui` (design system lives in
   `apps/web` until a second surface needs it), no CMS build-out, no
   Playwright until Foundation 17.

## Verification

- `pnpm install` and `pnpm build` succeed across the workspace.
- `GET /api/health` responds from the NestJS app.
- Next.js renders `/` and `/j/healthy-bones` placeholder.
