import { z } from "zod";
import { RecognitionStateSchema } from "./recognition";

/**
 * Step payloads — what the server says the participant sees next.
 * The frontend renders whichever step arrives; it never decides
 * progression itself. Correct answers NEVER appear in a QUESTION
 * payload; they only arrive in the post-submission evaluation.
 */

export const SelectOptionSchema = z.object({
  value: z.string(),
  label: z.string(),
  hint: z.string().optional(),
});
export type SelectOption = z.infer<typeof SelectOptionSchema>;

export const QuestionOptionSchema = z.object({
  key: z.string(),
  label: z.string(),
});
export type QuestionOption = z.infer<typeof QuestionOptionSchema>;

const LanguageStepSchema = z.object({
  type: z.literal("LANGUAGE_SELECT"),
  title: z.string(),
  body: z.string(),
  prompt: z.string(),
  cta: z.string(),
  options: z.array(SelectOptionSchema),
});

const DemographicStepSchema = z.object({
  type: z.literal("DEMOGRAPHIC"),
  key: z.enum(["ageRange", "gender"]),
  title: z.string(),
  body: z.string(),
  prompt: z.string(),
  cta: z.string(),
  options: z.array(SelectOptionSchema),
});

const IntroStepSchema = z.object({
  type: z.literal("INTRO"),
  title: z.string(),
  body: z.array(z.string()),
  cta: z.string(),
});

const QuestionStepSchema = z.object({
  type: z.literal("QUESTION"),
  progress: z.object({ current: z.number().int(), total: z.number().int() }),
  questionKey: z.string(),
  topic: z.string(),
  text: z.string(),
  options: z.array(QuestionOptionSchema),
});

const ReportTeaserStepSchema = z.object({
  type: z.literal("REPORT_TEASER"),
  title: z.string(),
  body: z.string(),
  /** Score-personalized curiosity hook. */
  teaser: z.string(),
  bullets: z.array(z.string()),
  cta: z.string(),
});

const ContactStepSchema = z.object({
  type: z.literal("CONTACT"),
  title: z.string(),
  body: z.string(),
  consentText: z.string(),
  cta: z.string(),
});

export const ReportPayloadSchema = z.object({
  title: z.string(),
  headline: z.string(),
  opening: z.string(),
  lifeStage: z.string(),
  profile: z.string(),
  awareness: z.object({ score: z.number().int(), total: z.number().int() }),
  discovery: z.object({
    count: z.number().int(),
    isBonus: z.boolean(),
    statement: z.string(),
    /** Bonus discovery content (6/6 only). */
    bonus: z.string().optional(),
  }),
  awarenessMap: z.array(
    z.object({
      topic: z.string(),
      status: z.enum(["strong", "explore"]),
    }),
  ),
  genderInsight: z.string(),
  whatThisMeans: z.string(),
  worthKnowing: z.string(),
  doctorQuote: z.string(),
  cta: z.string(),
  footer: z.string(),
});
export type ReportPayload = z.infer<typeof ReportPayloadSchema>;

const ReportStepSchema = z.object({
  type: z.literal("REPORT"),
  report: ReportPayloadSchema,
  recognitionEligible: z.boolean(),
  /** Present only when the session is 6/6-eligible. */
  recognition: RecognitionStateSchema.optional(),
});

export const StepPayloadSchema = z.discriminatedUnion("type", [
  LanguageStepSchema,
  DemographicStepSchema,
  IntroStepSchema,
  QuestionStepSchema,
  ReportTeaserStepSchema,
  ContactStepSchema,
  ReportStepSchema,
]);
export type StepPayload = z.infer<typeof StepPayloadSchema>;
