import type { z } from "zod";

/**
 * The only place fetch() lives. Every response is validated against a
 * Zod schema from @stavya/contracts, so the UI can trust its data.
 * Designed for OPD conditions: timeouts, one GET retry on network
 * failure, and normalized errors the UI can render gracefully.
 */

export function getApiBaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (envUrl) return envUrl.replace(/\/$/, "");

  if (typeof window !== "undefined") {
    const currentHost = window.location.hostname;
    const protocol = window.location.protocol;
    if (
      currentHost &&
      currentHost !== "localhost" &&
      currentHost !== "127.0.0.1"
    ) {
      return `${protocol}//${currentHost}`;
    }
  }
  return "http://localhost:4000";
}

export const API_BASE = getApiBaseUrl();

export class ApiError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly statusCode?: number,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

interface ApiFetchOptions {
  method?: "GET" | "POST" | "PATCH";
  body?: unknown;
  timeoutMs?: number;
}

async function rawFetch(
  path: string,
  { method = "GET", body, timeoutMs = 10_000 }: ApiFetchOptions,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const baseUrl = getApiBaseUrl();
    return await fetch(`${baseUrl}/api${path}`, {
      method,
      headers: body !== undefined ? { "Content-Type": "application/json" } : {},
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
      cache: "no-store",
    });
  } finally {
    clearTimeout(timer);
  }
}

export async function apiFetch<T>(
  path: string,
  schema: z.ZodType<T>,
  options: ApiFetchOptions = {},
): Promise<T> {
  let response: Response;
  try {
    response = await rawFetch(path, options);
  } catch (error) {
    const isGet = (options.method ?? "GET") === "GET";
    // Retry GETs once on network failure/timeout; never retry writes
    // (duplicate-submission safety).
    if (isGet) {
      try {
        response = await rawFetch(path, options);
      } catch {
        throw new ApiError("NETWORK", "Could not reach the server.");
      }
    } else {
      throw new ApiError(
        error instanceof DOMException && error.name === "AbortError"
          ? "TIMEOUT"
          : "NETWORK",
        "Could not reach the server.",
      );
    }
  }

  let payload: unknown = null;
  try {
    payload = await response.json();
  } catch {
    // fall through — handled by status/shape checks below
  }

  if (!response.ok) {
    const p = (payload ?? {}) as Record<string, unknown>;
    throw new ApiError(
      typeof p.code === "string" ? p.code : "HTTP_ERROR",
      typeof p.message === "string"
        ? p.message
        : "The server reported an error.",
      response.status,
      p.details,
    );
  }

  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    throw new ApiError(
      "RESPONSE_SHAPE",
      "Received an unexpected response from the server.",
    );
  }
  return parsed.data;
}
