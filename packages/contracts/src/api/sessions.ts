import { z } from "zod";
import { StepPayloadSchema } from "./steps";

export const CreateSessionRequestSchema = z.object({
  journeySlug: z
    .string()
    .min(1)
    .max(64)
    .regex(/^[a-z0-9-]+$/),
});
export type CreateSessionRequest = z.infer<typeof CreateSessionRequestSchema>;

export const SessionStateSchema = z.enum([
  "IN_PROGRESS",
  "COMPLETED",
  "EXPIRED",
  "ABANDONED",
]);

export const SessionResponseSchema = z.object({
  sessionId: z.string(),
  journeySlug: z.string(),
  state: SessionStateSchema,
  step: StepPayloadSchema,
});
export type SessionResponse = z.infer<typeof SessionResponseSchema>;

/** Client → server: what the participant did on the current step. */
export const SubmitStepRequestSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("LANGUAGE_SELECT"),
    language: z.string().min(2).max(8),
  }),
  z.object({
    type: z.literal("DEMOGRAPHIC"),
    key: z.enum(["ageRange", "gender"]),
    value: z.string().min(1).max(32),
  }),
  z.object({ type: z.literal("INTRO") }),
  z.object({
    type: z.literal("QUESTION"),
    questionKey: z.string().min(1).max(32),
    optionKey: z.string().min(1).max(8),
  }),
  z.object({ type: z.literal("REPORT_TEASER") }),
]);
export type SubmitStepRequest = z.infer<typeof SubmitStepRequestSchema>;

/** Teach-after-every-answer payload (doc: never display "Wrong"). */
export const AnswerEvaluationSchema = z.object({
  wasCorrect: z.boolean(),
  correctOptionKey: z.string(),
  ahaMoment: z.string(),
  takeaway: z.string(),
});
export type AnswerEvaluation = z.infer<typeof AnswerEvaluationSchema>;

export const SubmitStepResponseSchema = z.object({
  evaluation: AnswerEvaluationSchema.optional(),
  step: StepPayloadSchema,
});
export type SubmitStepResponse = z.infer<typeof SubmitStepResponseSchema>;

/** Indian mobile number: 10 digits starting 6-9. */
export const ContactRequestSchema = z.object({
  name: z.string().trim().min(1).max(100),
  mobile: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
  email: z
    .string()
    .trim()
    .email()
    .max(200)
    .optional()
    .or(z.literal("").transform(() => undefined)),
  consentCommunication: z.literal(true),
});
export type ContactRequest = z.infer<typeof ContactRequestSchema>;
