// @stavya/contracts — single source of truth for types shared between
// apps/web and apps/api. Schemas are Zod-first; TypeScript types are
// inferred from them so runtime validation and compile-time types can
// never drift apart.
//
// Foundation 1 ships only the platform skeleton. Full journey, session,
// scoring, and report schemas are added in their own foundations.

export * from "./journey/step-type.js";
export * from "./journey/journey-status.js";
export * from "./api/health.js";
export * from "./api/journeys.js";
export * from "./api/steps.js";
export * from "./api/sessions.js";
export * from "./api/share.js";
export * from "./api/recognition.js";
