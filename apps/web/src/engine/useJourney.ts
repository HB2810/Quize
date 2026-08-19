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
import {
  createMockSession,
  createMockShare,
  getMockStep,
  submitMockContact as submitMockContactLocal,
  submitMockStep as submitMockStepLocal,
} from "@/engine/mockEngine";

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
  const pendingStep = useRef<StepPayload | null>(null);
  const isMockRef = useRef<boolean>(false);

  const start = useCallback(async () => {
    setState({ phase: "loading" });
    const existing =
      typeof window !== "undefined"
        ? window.localStorage.getItem(storageKey(slug))
        : null;

    if (existing) {
      if (existing.startsWith("mock-")) {
        isMockRef.current = true;
        const res = getMockStep(existing);
        setState({ phase: "step", step: res.step, busy: false });
        return;
      }
      try {
        const session = await apiFetch(
          `/sessions/${existing}/step`,
          SessionResponseSchema,
        );
        isMockRef.current = false;
        setState({ phase: "step", step: session.step, busy: false });
        return;
      } catch {
        window.localStorage.removeItem(storageKey(slug));
      }
    }

    try {
      const session = await apiFetch(`/sessions`, SessionResponseSchema, {
        method: "POST",
        body: { journeySlug: slug },
      });
      isMockRef.current = false;
      window.localStorage.setItem(storageKey(slug), session.sessionId);
      setState({ phase: "step", step: session.step, busy: false });
    } catch {
      // Automatic seamless fallback to local mock engine for testing/preview!
      isMockRef.current = true;
      const session = createMockSession();
      window.localStorage.setItem(storageKey(slug), session.sessionId);
      setState({ phase: "step", step: session.step, busy: false });
    }
  }, [slug]);

  useEffect(() => {
    void start();
  }, [start]);

  const sessionId = () =>
    typeof window !== "undefined"
      ? window.localStorage.getItem(storageKey(slug))
      : null;

  /** Submit the current step; the server (or local mock engine) returns what comes next. */
  const submit = useCallback(
    async (body: SubmitStepRequest) => {
      const id = sessionId();
      if (!id) return void start();
      setState((prev) =>
        prev.phase === "step" ? { ...prev, busy: true } : prev,
      );

      if (isMockRef.current || id.startsWith("mock-")) {
        const result = submitMockStepLocal(id, body);
        if (body.type === "QUESTION" && result.evaluation) {
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
        return;
      }

      try {
        const result = await apiFetch(
          `/sessions/${id}/step`,
          SubmitStepResponseSchema,
          { method: "POST", body },
        );
        if (body.type === "QUESTION" && result.evaluation) {
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
          return void start();
        }
        // Fallback to local mock step handling if API drops
        isMockRef.current = true;
        const result = submitMockStepLocal(id, body);
        setState({ phase: "step", step: result.step, busy: false });
      }
    },
    [slug, start],
  );

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

      if (isMockRef.current || id.startsWith("mock-")) {
        const result = submitMockContactLocal(id, body);
        setState({ phase: "step", step: result.step, busy: false });
        return;
      }

      try {
        const result = await apiFetch(
          `/sessions/${id}/contact`,
          SubmitStepResponseSchema,
          { method: "POST", body },
        );
        setState({ phase: "step", step: result.step, busy: false });
      } catch {
        isMockRef.current = true;
        const result = submitMockContactLocal(id, body);
        setState({ phase: "step", step: result.step, busy: false });
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

  const createShare = useCallback(async (): Promise<CreateShareResponse> => {
    const id = sessionId();
    if (!id) throw new ApiError("SESSION_NOT_FOUND", "Session missing.");
    if (isMockRef.current || id.startsWith("mock-")) {
      return createMockShare(id);
    }
    try {
      return await apiFetch(`/sessions/${id}/share`, CreateShareResponseSchema, {
        method: "POST",
      });
    } catch {
      return createMockShare(id);
    }
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
