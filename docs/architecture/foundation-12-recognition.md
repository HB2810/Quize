# Foundation 12 — 6/6 recognition & OPD display

Date: 2026-08-13 · Status: Implemented & verified

## Decisions

1. **Eligibility is server-enforced**: recognition endpoints require a
   COMPLETED session with an unlocked report and awareness ==
   totalQuestions. Anything else → 403 `NOT_ELIGIBLE`.

2. **Consent is separate and explicit** (doc §14): a
   `PUBLIC_RECOGNITION` consent row (with wording version) is recorded
   on every decision — grant or decline. Declining leaves the report
   untouched. The decision is re-decidable until publication, then
   locked (`ALREADY_PUBLISHED`).

3. **Display name is server-derived** from the participant's chosen
   style — first name / initials / anonymous ("A Stavya Champion") —
   and is the ONLY name form that can appear publicly.

4. **Selfies are re-encoded, never stored raw**: sharp applies EXIF
   orientation, strips ALL metadata (incl. GPS), crops to 1080×1080
   (attention-weighted), and outputs JPEG. Files live in private
   storage (`MEDIA_DIR`, git-ignored), never served statically;
   retakes delete the previous file. Upload limits: 8 MB,
   image/jpeg|png|webp|heic only, invalid images rejected.

5. **Two serving paths, strictly separated**:
   - Own selfie preview: session-scoped, `private, no-store`.
   - Public photo: `/api/recognition/display/:id/photo` serves ONLY
     COMPLETED (published) entries — unpublished media is unreachable.

6. **OPD display**: `GET /api/recognition/display` returns the last 12
   published champions (display name + journey + achievement + photo
   URL only). The web app's `/display` page runs full-screen on OPD
   TVs, rotating entries every 8s, refreshing the feed every 60s, with
   the approved "Think you can beat the score?" CTA.

7. **Frontend flow** (copy verbatim from doc §13): perfect-score
   consent card → display-name choice → selfie capture
   (`<input capture="user">` — native camera on phones, file picker on
   desktop) → preview (Retake / Use This Photo) → display-composition
   preview → publish → "YOU'RE ON THE SCREEN!" confirmation. State is
   restored from the server on refresh.

8. **Helmet CORP relaxed to `cross-origin`** — share cards and
   published display photos are intentionally embeddable cross-origin
   (web app, OG scrapers, OPD screens); all other Helmet protections
   unchanged.

## Verification

- 19-assertion HTTP E2E: non-6/6 rejection, real 6/6 run via correct
  answers, PENDING state in report payload, selfie-before-consent
  rejection, decline → re-consent, first-name derivation, upload +
  re-encode, private preview, feed exclusion before publish, publish,
  feed content limited to approved fields (no mobile/full name/session
  id — asserted), photo serving, post-publish consent lock.
- Browser: `/display` renders the champion entry with the published
  photo loading at 1080×1080 (after the CORP fix).
