# Sharing Engine (spec §26–40) — shareable results & social growth loop

Date: 2026-08-13 · Status: Implemented & verified

## Decisions

1. **Platform capability, not a Healthy Bones feature.** The engine is
   journey-agnostic: each journey version carries a `shareConfig` JSONB
   (brand colors, wordmark, card copy, caption/meta templates). The
   renderer, endpoints, and pages contain zero Healthy Bones copy.

2. **Sharing is always explicit.** A `ShareResult` row is created only
   by `POST /api/sessions/:id/share` (rejected with `RESULT_NOT_READY`
   before completion + report unlock). Idempotent per session. Distinct
   from communication consent and recognition consent — completing the
   quiz never implies sharing.

3. **Safe public identity.** `publicId` is 12 random bytes
   (base64url, ~16 chars, non-guessable). The public payload snapshot
   holds ONLY {journeyName, score, total, profile} — never PII, session
   ids, internal ids, or answers (E2E-asserted).

4. **Deterministic server-side card rendering** — satori (layout → SVG
   with embedded Manrope) + resvg (SVG → PNG). No client screenshots,
   no headless browser. Three formats: square 1080×1080, story
   1080×1920, landscape 1200×630, served at
   `GET /api/share/:publicId/card.png?format=…` with immutable caching.
   Brand per spec §28: white background, #0056AC, Manrope, minimal.

5. **Public result page** `/share/[journeySlug]/[publicId]` (Next.js)
   renders approved fields + journey CTA, with full social metadata:
   OG title/description/image (landscape card), Twitter
   `summary_large_image`, canonical URL. Meta title from the journey's
   template ("I scored 4/6 on Stavya's Healthy Bones Journey").

6. **Share UX** (spec §38): prominent "Share Your Result" on the report
   → Web Share API with the card image where `canShare({files})`
   allows, text+URL share otherwise, and an always-available fallback
   sheet: WhatsApp / Telegram / X / LinkedIn / Facebook intents,
   download card, copy link, copy caption. No platform capability is
   assumed; every path degrades gracefully.

7. **Analytics:** `share_created` and `share_viewed` events (no PII).

8. **New env:** `API_PUBLIC_URL` (API base for card/OG URLs, default
   localhost) and web `NEXT_PUBLIC_WEB_ORIGIN` (canonical URLs).

## Note

The dev database was reset (with explicit user consent via Prisma's
consent gate) because the 0_init migration checksum changed after its
BOM fix; migrations replayed cleanly and `add_sharing` applied. Content
reseeded; only local test data was lost.

## Verification

- 21-assertion HTTP E2E: pre-completion rejection, idempotency,
  non-guessable id, templated caption/meta, PII-free public payload,
  all three formats byte-verified as PNG at exact dimensions with
  cache headers, unknown id 404.
- Cards visually reviewed (square + story) against the §28 brand spec.
- Browser: share page renders with correct OG/Twitter/canonical tags;
  CTA click lands a visitor in a fresh journey (growth loop closed).
