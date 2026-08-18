import { z } from "zod";

/**
 * Environment contract. The API refuses to boot when any variable is
 * missing or malformed — misconfiguration must fail loudly at startup,
 * never silently in an OPD corridor.
 */
export const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  TEST_MODE: z.coerce.boolean().default(false),
  DATABASE_URL: z
    .string()
    .url()
    .startsWith("postgresql", "DATABASE_URL must be a PostgreSQL URL"),
  API_PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  WEB_ORIGIN: z.string().url(),
  /** Public base URL of this API (share cards, OG images). */
  API_PUBLIC_URL: z.string().url().default("http://localhost:4000"),
  /** Private media storage root (selfies). Never served statically. */
  MEDIA_DIR: z.string().min(1).default("./storage"),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>): Env {
  const result = envSchema.safeParse(config);
  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("\n  ");
    throw new Error(`Invalid environment configuration:\n  ${issues}`);
  }
  return result.data;
}
