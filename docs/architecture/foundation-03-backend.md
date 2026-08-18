# Foundation 3 — Backend NestJS foundation

Date: 2026-08-13 · Status: Implemented & verified

## Decisions

1. **Environment is a validated contract** (`src/config/env.schema.ts`,
   Zod). The API refuses to boot on missing/malformed configuration and
   names every offending variable — misconfiguration fails loudly at
   startup, never silently during OPD hours. `@nestjs/config` (global)
   carries the typed values.

2. **Security baseline from the first endpoint**:
   - Helmet security headers (CSP, nosniff, frame options; X-Powered-By
     removed).
   - CORS strict allowlist: only `WEB_ORIGIN`, methods GET/POST/PATCH.
   - Global rate limiting via `@nestjs/throttler`: 60 req/min per IP;
     sensitive routes will tighten with route-level `@Throttle`.

3. **Zod validation at the edge** — `ZodValidationPipe` binds schemas
   from `@stavya/contracts` per route. Unknown keys are stripped;
   failures return `VALIDATION_FAILED` with field paths. No
   class-validator: one validation vocabulary (Zod) across the whole
   platform.

4. **One error shape** — `GlobalExceptionFilter` emits
   `{ statusCode, code, message, details? }` for every error. 5xx
   internals (stacks, Prisma/SQL errors) are logged server-side and
   never reach the client.

5. **Domain skeletons registered** — journeys, sessions, scoring,
   reports, participants, consent, recognition, analytics, auth, admin.
   Each is an empty `@Module` with its responsibility documented;
   content arrives in its designated foundation. Questions/pathways
   live inside journeys; responses inside sessions.

6. **Jest + ts-jest** wired into the API with tests colocated as
   `*.spec.ts`.

## Verification

- `pnpm build` green; `pnpm test` — 9/9 passing (env schema, Zod pipe).
- Live boot: `/api/health` 200 with Helmet headers present and
  X-Powered-By absent.
- Invalid env (`mysql://` URL + bad origin): process exits 1, both
  variables named in the error.
- Rate limiting: 65 rapid requests → exactly 60×200 + 5×429.
