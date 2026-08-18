import { z } from "zod";

/**
 * 6/6 recognition contracts. Recognition consent is ALWAYS separate
 * from communication consent; selfie capture happens only after
 * explicit consent; only selfie + chosen display name + achievement
 * ever appear publicly.
 */

export const RecognitionStatusSchema = z.enum([
  "PENDING", // eligible, no decision yet
  "ELIGIBLE", // consented, selfie/publication pending
  "COMPLETED", // published to the OPD display
  "DECLINED", // chose not to participate — report unaffected
]);
export type RecognitionStatus = z.infer<typeof RecognitionStatusSchema>;

export const RecognitionStateSchema = z.object({
  status: RecognitionStatusSchema,
  hasSelfie: z.boolean(),
  displayName: z.string().optional(),
});
export type RecognitionState = z.infer<typeof RecognitionStateSchema>;

export const DisplayNameChoiceSchema = z.enum([
  "first-name",
  "initial",
  "anonymous",
]);
export type DisplayNameChoiceValue = z.infer<typeof DisplayNameChoiceSchema>;

export const RecognitionConsentRequestSchema = z
  .object({
    granted: z.boolean(),
    displayNameChoice: DisplayNameChoiceSchema.optional(),
  })
  .refine((value) => !value.granted || value.displayNameChoice !== undefined, {
    message: "Choose how your name should appear",
    path: ["displayNameChoice"],
  });
export type RecognitionConsentRequest = z.infer<
  typeof RecognitionConsentRequestSchema
>;

export const RecognitionActionResponseSchema = z.object({
  recognition: RecognitionStateSchema,
});
export type RecognitionActionResponse = z.infer<
  typeof RecognitionActionResponseSchema
>;

/** OPD display feed — consented, published entries only. */
export const DisplayFeedSchema = z.object({
  entries: z.array(
    z.object({
      id: z.string(),
      displayName: z.string(),
      journeyName: z.string(),
      achievement: z.string(),
      imageUrl: z.string(),
      publishedAt: z.string(),
    }),
  ),
});
export type DisplayFeed = z.infer<typeof DisplayFeedSchema>;
