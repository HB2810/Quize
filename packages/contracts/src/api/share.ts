import { z } from "zod";

/**
 * Sharing engine contracts. Sharing is always an explicit participant
 * action; the public payload is the minimal approved-for-sharing set —
 * never PII, never answers, never private report sections.
 */

export const ShareCardFormatSchema = z.enum(["square", "story", "landscape"]);
export type ShareCardFormat = z.infer<typeof ShareCardFormatSchema>;

export const ShareCardUrlsSchema = z.object({
  square: z.string(),
  story: z.string(),
  landscape: z.string(),
});

export const CreateShareResponseSchema = z.object({
  publicId: z.string(),
  shareUrl: z.string(),
  journeyUrl: z.string(),
  caption: z.string(),
  cards: ShareCardUrlsSchema,
});
export type CreateShareResponse = z.infer<typeof CreateShareResponseSchema>;

export const PublicShareSchema = z.object({
  journeySlug: z.string(),
  journeyName: z.string(),
  score: z.number().int(),
  total: z.number().int(),
  profile: z.string(),
  tagline: z.string(),
  cta: z.string(),
  journeyUrl: z.string(),
  meta: z.object({
    title: z.string(),
    description: z.string(),
  }),
  cards: ShareCardUrlsSchema,
});
export type PublicShare = z.infer<typeof PublicShareSchema>;
