"use client";

import { ContinueButton } from "@/components/journey/ContinueButton";

/**
 * Friendly recovery screen for OPD network conditions. Always offers a
 * way forward — never a dead end or blank screen.
 */
export function ErrorState({
  title = "Connection hiccup",
  message = "We couldn't reach the server. Your progress is safe — please try again.",
  onRetry,
  retryLabel = "Try again",
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
}) {
  return (
    <div className="animate-fade-up flex flex-col items-center gap-4 rounded-card bg-card p-6 text-center shadow-soft">
      <span aria-hidden className="text-3xl">
        📶
      </span>
      <div>
        <h3 className="text-lg font-bold text-ink">{title}</h3>
        <p className="mt-1 text-sm leading-relaxed text-ink-soft">{message}</p>
      </div>
      {onRetry ? (
        <ContinueButton onClick={onRetry}>{retryLabel}</ContinueButton>
      ) : null}
    </div>
  );
}
