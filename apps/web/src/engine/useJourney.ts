"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  CreateShareResponseSchema,
  SessionResponseSchema,
  SubmitStepResponseSchema,
  type AnswerEvaluation,
  type ContactRequest,
  type CreateShareResponse,
  type StepPayload,
  type SubmitStepRequest,
} from "@stavya/contracts";
import { ApiError, apiFetch } from "@/lib/api/client";

/**
 * The journey client state machine. The server is the single authority
 * on progression — this hook only tracks "what step did the server last
 * give us" plus transient UI state (busy flags, answer evaluation).
 * Refresh recovery: the session id is kept in localStorage and the
 * current step is re-fetched on mount.
 */

export type JourneyState =
  | { phase: "loading" }
  | { phase: "error"; message: string; canRetry: boolean }
  | {
      phase: "step";
      step: StepPayload;
      busy: boolean;
      /** Present between answering a question and continuing. */
      evaluation?: AnswerEvaluation;
      answeredOptionKey?: string;
    };

const storageKey = (slug: string) => `stavya-session-${slug}`;

export function useJourney(slug: string) {
  const [state, setState] = useState<JourneyState>({ phase: "loading" });
  // Holds the next step while the evaluation is on screen.
  const pendingStep = useRef<StepPayload | null>(null);

  const fail = (error: unknown) => {
    const message =
      error instanceof ApiError && error.code !== "INTERNAL_ERROR"
        ? error.message
        : "Something went wrong. Please try again.";
    setState({ phase: "error", message, canRetry: true });
  };

  const start = useCallback(async () => {
    setState({ phase: "loading" });
    const existing =
      typeof window !== "undefined"
        ? window.localStorage.getItem(storageKey(slug))
        : null;

    try {
      if (existing) {
        try {
          const session = await apiFetch(
            `/sessions/${existing}/step`,
            SessionResponseSchema,
          );
          setState({ phase: "step", step: session.step, busy: false });
          return;
        } catch (error) {
          // Expired/lost sessions fall through to a fresh start —
          // never a dead end. Report-locked sessions also restart.
          if (
            !(error instanceof ApiError) ||
            error.code === "NETWORK" ||
            error.code === "TIMEOUT"
          ) {
            throw error;
          }
          window.localStorage.removeItem(storageKey(slug));
        }
      }
      const session = await apiFetch(`/sessions`, SessionResponseSchema, {
        method: "POST",
        body: { journeySlug: slug },
      });
      window.localStorage.setItem(storageKey(slug), session.sessionId);
      setState({ phase: "step", step: session.step, busy: false });
    } catch (error) {
      fail(error);
    }
  }, [slug]);

  useEffect(() => {
    void start();
  }, [start]);

  const sessionId = () =>
    typeof window !== "undefined"
      ? window.localStorage.getItem(storageKey(slug))
      : null;

  /** Submit the current step; the server returns what comes next. */
  const submit = useCallback(
    async (body: SubmitStepRequest) => {
      const id = sessionId();
      if (!id) return void start();
      setState((prev) =>
        prev.phase === "step" ? { ...prev, busy: true } : prev,
      );
      try {
        const result = await apiFetch(
          `/sessions/${id}/step`,
          SubmitStepResponseSchema,
          { method: "POST", body },
        );
        if (body.type === "QUESTION" && result.evaluation) {
          // Hold the next step; show the teach-moment first.
          pendingStep.current = result.step;
          setState((prev) =>
            prev.phase === "step"
              ? {
                  ...prev,
                  busy: false,
                  evaluation: result.evaluation,
                  answeredOptionKey: body.optionKey,
                }
              : prev,
          );
        } else {
          setState({ phase: "step", step: result.step, busy: false });
        }
      } catch (error) {
        if (error instanceof ApiError && error.code === "STEP_MISMATCH") {
          // Session moved on (double-tap/refresh race) — resync.
          return void start();
        }
        fail(error);
      }
    },
    [slug, start],
  );

  /** Leave the evaluation view and show the held next step. */
  const continueAfterAnswer = useCallback(() => {
    const next = pendingStep.current;
    if (next) {
      pendingStep.current = null;
      setState({ phase: "step", step: next, busy: false });
    }
  }, []);

  const submitContact = useCallback(
    async (body: ContactRequest) => {
      const id = sessionId();
      if (!id) return void start();
      setState((prev) =>
        prev.phase === "step" ? { ...prev, busy: true } : prev,
      );
      try {
        const result = await apiFetch(
          `/sessions/${id}/contact`,
          SubmitStepResponseSchema,
          { method: "POST", body },
        );
        setState({ phase: "step", step: result.step, busy: false });
      } catch (error) {
        fail(error);
      }
    },
    [slug, start],
  );

  const restart = useCallback(() => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(storageKey(slug));
    }
    void start();
  }, [slug, start]);

  /** Explicit share action — creates (or reuses) the public share result. */
  const createShare = useCallback(async (): Promise<CreateShareResponse> => {
    const id = sessionId();
    if (!id) throw new ApiError("SESSION_NOT_FOUND", "Session missing.");
    return apiFetch(`/sessions/${id}/share`, CreateShareResponseSchema, {
      method: "POST",
    });
  }, [slug]);

  return {
    state,
    sessionId: sessionId(),
    submit,
    continueAfterAnswer,
    submitContact,
    createShare,
    retry: start,
    restart,
  };
}
