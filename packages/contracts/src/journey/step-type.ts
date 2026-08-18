import { z } from "zod";

/**
 * The registry of step types a journey may be composed of.
 *
 * The frontend renders every journey through this registry: a journey is
 * an ordered sequence of steps, each step declaring one of these types.
 * Adding a new experience to the platform means adding a step type once —
 * it then becomes available to all journeys.
 */
export const StepTypeSchema = z.enum([
  "LANGUAGE_SELECT",
  "DEMOGRAPHIC",
  "INTRO",
  "QUESTION",
  "SCORE_REVEAL",
  "REPORT_TEASER",
  "CONTACT",
  "REPORT",
  "RECOGNITION",
]);

export type StepType = z.infer<typeof StepTypeSchema>;
