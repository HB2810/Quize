# Foundation 2 — Database architecture & Prisma schema

Date: 2026-08-13 · Status: Implemented & verified

## Decisions

1. **All content hangs off `JourneyVersion`** — journeys are versioned
   data; a PUBLISHED version is immutable. Immutability is enforced in
   the service layer (writes to published content rejected) plus audit
   logging, since Postgres cannot express it cleanly and an explicit,
   logged emergency-correction path must remain possible.

2. **`Participant` is the only PII table** (name, mobile, email).
   `Session.participantId` uses `onDelete: SetNull`, so deleting a
   participant anonymizes their sessions without destroying results or
   analytics. Consent rows are per-type (`COMMUNICATION`,
   `PUBLIC_RECOGNITION`) and record the wording version shown.

3. **Server-authoritative answers** — `AnswerOption.isCorrect` never
   leaves the server pre-submission; `Response.wasCorrect` is the
   evaluation snapshot. `@@unique([sessionId, questionId])` on Response
   makes duplicate submission impossible at the database level.

4. **Branching-ready** — `AnswerOption.nextQuestionId` (nullable,
   `SetNull`) exists but is unused in the linear Healthy Bones beta.

5. **Translations are tables** (`QuestionTranslation`,
   `AnswerOptionTranslation`, unique per language) because text is what
   content teams edit; **structurally journey-specific config is JSONB**
   (`flowConfig`, `scoringConfig`, `reportTemplate`, `eligibility`,
   `Session.context`, `Session.scores`) validated by Zod schemas in
   `@stavya/contracts`, so structurally different future journeys need
   new data, not new migrations.

6. **Stable content keys** — `Question.questionKey` (e.g. `HB-Q1`) and
   `AnswerOption.optionKey` stay constant across versions, enabling
   v1-vs-v2 analytics comparisons.

7. **IDs are `cuid()`**; the Session id doubles as the unguessable
   bearer capability token for the participant.

8. **Prisma 6** (current stable major at scaffold time). The initial
   migration was generated deterministically via
   `prisma migrate diff --from-empty` into `prisma/migrations/0_init/`.

## Verification

- `prisma generate` succeeds — schema is valid; typed client compiles
  into the API build (`pnpm build` green across the workspace).
- `PrismaModule` is global; `PrismaService` manages connect/disconnect.
- PostgreSQL 16.14 installed locally (winget, service
  `postgresql-x64-16`; Docker unavailable on this machine — compose file
  remains the deployment path). Role `stavya` + database
  `stavya_awareness` created; migration `0_init` applied; all 16 tables
  present and owned by `stavya`.
- API boots with a live Prisma connection and `/api/health` responds.

## Dev database access

- Connection: `postgresql://stavya:…@localhost:5432/stavya_awareness`
  (password in `apps/api/.env`, dev-only).
- Note: the initial migration SQL must stay BOM-free — Postgres rejects
  a UTF-8 BOM as a syntax error.
