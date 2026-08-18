import { z } from "zod";

export const PublicJourneySchema = z.object({
  slug: z.string(),
  name: z.string(),
  languages: z.array(
    z.object({
      code: z.string(),
      name: z.string(),
      isDefault: z.boolean(),
    }),
  ),
});
export type PublicJourney = z.infer<typeof PublicJourneySchema>;
