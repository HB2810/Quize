/** Journey-configurable sharing config (JSONB on JourneyVersion). */
export interface ShareConfig {
  brand: {
    primary: string;
    background: string;
    wordmark: string;
  };
  card: {
    scoreLabel: string;
    tagline: string;
    cta: string;
  };
  captionTemplate: string;
  metaTitleTemplate: string;
  metaDescription: string;
}

/** Minimal approved-for-sharing snapshot stored on ShareResult. */
export interface SharePayload {
  journeyName: string;
  score: number;
  total: number;
  profile: string;
}

export function fillTemplate(
  template: string,
  values: Record<string, string | number>,
): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );
}
