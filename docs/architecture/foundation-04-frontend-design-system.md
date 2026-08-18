# Foundation 4 — Frontend foundation & design system

Date: 2026-08-13 · Status: Implemented & verified

## Decisions

1. **Design tokens in Tailwind v4 `@theme`** (`src/styles/globals.css`)
   — the single source of truth for color, shape, elevation, and
   motion. Palette is premium medical: deep navy ink, Stavya blue
   brand, soft surfaces; semantic tokens for `correct` (green),
   `discover` (muted rose — incorrect answers are framed as
   discoveries, supportive not punitive), and `aha` (warm gold).
   Typeface: Manrope via `next/font` (self-hosted at build, no
   third-party font requests at runtime).

2. **CSS-first motion system** — no animation library (~0 kB JS cost;
   OPD load-time priority). Keyframes as `--animate-*` tokens
   (fade-up, pop-in, check-pop, gentle-shake, shimmer) plus two hooks
   in `src/lib/motion`: `useReducedMotion` and `useCountUp` (rAF-based
   score count-up with a setTimeout failsafe so the final value lands
   even when rAF is suspended — locked phone, backgrounded tab).
   `prefers-reduced-motion` collapses all animation globally.

3. **Component set is journey-agnostic and presentational** — content
   arrives via props, never hard-coded. Built: AppShell, JourneyShell,
   ProgressIndicator (segmented), QuestionCard, AnswerOption (5 states:
   idle/selected/correct/incorrect/disabled), AnswerFeedback, AhaMoment,
   Takeaway, ContinueButton, ScoreReveal (ring + count-up),
   DiscoveryCard, OptionListSelector (generic single-select used for
   language AND demographics), ConsentCheckbox (one consent per
   checkbox, never bundled), ReportSection, LoadingState (skeleton),
   ErrorState (always offers recovery). Deferred to their foundations:
   ContactForm fields (11), RecognitionFlow/SelfiePreview (12).

4. **Typed API client** (`src/lib/api/client.ts`) — the only place
   `fetch` lives. Validates every response against contracts schemas,
   normalizes errors to `ApiError{code,message}`, 10s timeout, retries
   GETs once on network failure, never retries writes
   (duplicate-submission safety).

5. **`/design` showcase** — dev-only (404s in production) interactive
   gallery of every component with placeholder content, for design
   review before journey logic exists.

## Verification

- Production build green; `/design` adds 4.2 kB; shared first-load JS
  103 kB.
- Browser-verified: answer selection → correct/incorrect states →
  feedback + Aha + Takeaway sequence renders; selectors and consent
  toggle; score reveal reaches 5/6 even with the tab hidden (failsafe
  exercised — rAF confirmed suspended in hidden tabs).
