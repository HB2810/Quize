/**
 * Server-side shapes of the versioned JSONB configs (flowConfig,
 * scoringConfig, reportTemplate). These are authored by the seed (and
 * later the CMS) and validated at authoring time; the engine trusts
 * published versions.
 */

export interface StepCopy {
  title: string;
  body: string | string[];
  prompt?: string;
  consentText?: string;
  bullets?: string[];
  cta: string;
}

export interface FlowStepConfig {
  type:
    | "LANGUAGE_SELECT"
    | "DEMOGRAPHIC"
    | "INTRO"
    | "QUESTION"
    | "REPORT_TEASER"
    | "CONTACT"
    | "REPORT";
  key?: "ageRange" | "gender";
  slot?: number;
  copy?: StepCopy;
  options?: Array<{ value: string; label: string; hint?: string }>;
}

export interface FlowConfig {
  steps: FlowStepConfig[];
}

export interface ScoringConfig {
  strategy: "correct-count";
  totalQuestions: number;
  profiles: Array<{ min: number; max: number; profile: string }>;
}

export interface ReportGenderCopy {
  insight: string;
  worthKnowing: string;
  doctorQuote: string;
}

export interface ReportScoreCopy {
  profile: string;
  headline: string;
  opening: string;
  whatThisMeans: string;
  discoveryStatement: string;
}

export interface ReportTemplate {
  type: "standard-v1";
  title: string;
  footer: string;
  cta: string;
  genderCopy: Record<"female" | "male" | "neutral", ReportGenderCopy>;
  scoreCopy: Record<string, ReportScoreCopy>;
  teasers: Record<string, string>;
}

export type GenderRoute = "female" | "male" | "neutral";

export interface SessionContext {
  ageRange?: string;
  gender?: string;
  reportUnlocked?: boolean;
}

export interface SessionScores {
  awareness: number;
  discovery: number;
  profile: string;
}

/** Canonical Awareness Map topic order (report structure, approved doc). */
export const TOPIC_ORDER = [
  "Bone Basics",
  "Nutrition",
  "Vitamin D",
  "Movement",
  "Bone Density",
  "Prevention",
];

export function genderRouteOf(gender: string | undefined): GenderRoute {
  if (gender === "female") return "female";
  if (gender === "male") return "male";
  return "neutral";
}

/**
 * Neutral route serves the M-variant Q3/Q5 as the universal
 * alternatives (documented content decision in the seed).
 */
export function questionVariantSuffix(gender: string | undefined): string {
  return gender === "female" ? "-F" : "-M";
}
