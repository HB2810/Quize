import { z } from "zod";

/**
 * Lifecycle of a journey version. A PUBLISHED version is immutable:
 * sessions permanently reference the version they started on, and
 * publishing a new version never mutates historical results.
 */
export const JourneyStatusSchema = z.enum([
  "DRAFT",
  "REVIEW",
  "PUBLISHED",
  "ARCHIVED",
]);

export type JourneyStatus = z.infer<typeof JourneyStatusSchema>;
