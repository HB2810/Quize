# Foundations 5–8 — Journey/session engine + Healthy Bones content

Date: 2026-08-13 · Status: Implemented & verified (covers the engine,
content integration, question interaction, and feedback experience;
scoring engine and report engine cores from Foundations 9–10 are also
live since the flow depends on them)

## Engine decisions

1. **Server-authoritative sessions.** The API is the only authority on
   progression: `POST /api/sessions` creates a session pinned to the
   published journey version; `GET /sessions/:id/step` returns the
   current step; `POST /sessions/:id/step` submits what the participant
   did and returns `{evaluation?, step}` — the next step rides along,
   saving a round trip. The client holds only a session id
   (localStorage) — refresh/back recovery is "ask where am I".

2. **Steps are data.** `flowConfig` on the journey version defines the
   ordered step sequence with its copy; the engine walks it. Step
   payloads/submissions are Zod discriminated unions in
   `@stavya/contracts`, validated on both sides.

3. **Answer integrity.** Question payloads never contain correctness.
   Evaluation happens server-side; `Response` rows are the snapshot;
   the unique `(sessionId, questionId)` constraint plus an idempotent
   replay path makes double-taps harmless (verified: duplicate submit
   returns 409/no double-advance). Stale clients get `STEP_MISMATCH`
   and resync.

4. **Sessions expire after 24h** (410 `SESSION_EXPIRED`); the client
   silently starts a fresh journey. Contact submissions and session
   creation carry tighter rate limits than the global 60/min.

5. **Analytics events** (privacy-safe, no PII) are recorded inline:
   journey_started, language_selected, age_range/gender_selected,
   question_answered, journey_completed, report_unlocked. The fuller
   analytics module remains Foundation 14.

## Healthy Bones content (all copy verbatim from approved sources)

- Seed: `apps/api/prisma/seed.ts` → journey `healthy-bones`, version 1
  PUBLISHED: 6 pathways (one per age range), 48 questions (Q1–Q6 with
  Q3/Q5 F/M variants), full entry/teaser/contact copy, scoring config,
  and the 21-variation standard report template (7 scores × 3 gender
  routes, per the Report Variations spreadsheet).
- Phase 2 report rule honored: report COPY varies only by score +
  gender route; the Awareness Map is computed from actual answers
  (strong = all topic questions correct, explore otherwise); age is
  stored for analytics, not report copy.
- Flow: Language → Age → Gender → Intro → Q1..Q6 (answer → banner →
  Aha → Takeaway → continue) → score-personalized teaser → contact
  gate (report generated only after successful submission, with
  COMMUNICATION consent recorded incl. wording version) → Snapshot.
  6/6 sessions are flagged recognitionEligible; the recognition flow
  itself is Foundation 12.

### Documented content decisions (need content-team confirmation)

1. **Neutral route** serves the M-variant Q3/Q5 as the "universal
   alternatives" — the doc requires universal alternatives but provides
   no separate neutral copy, and the M variants are general-knowledge
   phrasings that never address the participant's own gender.
2. **6/6 Bonus Discovery** uses the approved gender-route insight as
   its content — no separate bonus-fact copy exists in the sources.
3. **Languages:** only English seeded; Hindi/Gujarati join the language
   step when approved translations are supplied (they are then rows of
   data, no code changes).

## Verification

- 18/18 unit tests (env, validation pipe, scoring matrix 0–6 incl.
  profile bands and clamping).
- 49-assertion HTTP E2E: full female 46–55 run (F variants served,
  correctness hidden, aha/takeaway on every answer, teaser
  personalized, report locked until contact, awareness map + gender
  copy + disclaimer correct, refresh re-serves report), neutral-route
  variant check, duplicate-answer safety, invalid contact rejected,
  unknown journey 404.
- Browser E2E on the real UI: complete QR-style journey from language
  to revealed Snapshot, including React contact form and refresh
  recovery (report restored, score correct).
