"use client";

import { cn } from "@/lib/cn";

export type AnswerOptionState =
  | "idle"
  | "selected"
  | "correct"
  | "incorrect"
  | "disabled";

/**
 * One selectable answer. Options cascade in (staggered by index);
 * states drive the feedback micro-interactions: selected (press-in +
 * halo), correct (spring pop + green glow), incorrect (gentle shake,
 * discovery framing — supportive, never punitive).
 */
export function AnswerOption({
  label,
  optionKey,
  state = "idle",
  index = 0,
  onSelect,
}: {
  label: string;
  /** Letter badge, e.g. "A". */
  optionKey: string;
  state?: AnswerOptionState;
  /** Position in the list — drives the staggered entrance. */
  index?: number;
  onSelect?: () => void;
}) {
  const interactive = state === "idle" || state === "selected";
  const settled = state === "correct" || state === "incorrect";

  return (
    <button
      type="button"
      disabled={!interactive}
      onClick={onSelect}
      aria-pressed={state === "selected"}
      style={!settled ? { animationDelay: `${80 + index * 70}ms` } : undefined}
      className={cn(
        "card-tappable group relative flex w-full items-center gap-3.5 rounded-control border-2 p-4 text-left shadow-soft transition-all duration-200",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
        !settled && "animate-fade-up",
        state === "idle" &&
          "border-brand/10 bg-card hover:border-brand/50 hover:bg-brand-soft/30 hover:shadow-lift",
        state === "selected" &&
          "animate-halo border-brand bg-brand-soft/70 shadow-glow",
        state === "correct" &&
          "animate-check-pop border-correct bg-correct-soft shadow-[0_6px_24px_rgba(13,138,108,0.25)]",
        state === "incorrect" &&
          "animate-gentle-shake border-discover bg-discover-soft shadow-[0_6px_24px_rgba(192,73,104,0.2)]",
        state === "disabled" && "border-transparent bg-card/60 opacity-45",
      )}
    >
      <span
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-extrabold shadow-sm transition-all duration-200",
          (state === "idle" || state === "disabled") &&
            "bg-brand-soft/80 text-brand group-hover:bg-brand group-hover:text-white",
          state === "selected" && "bg-brand text-white scale-105",
          state === "correct" && "bg-correct text-white scale-110",
          state === "incorrect" && "bg-discover text-white scale-105",
        )}
      >
        {state === "correct" ? "✓" : state === "incorrect" ? "!" : optionKey}
      </span>
      <span className="text-[15px] sm:text-base font-semibold leading-snug text-ink">
        {label}
      </span>
    </button>
  );
}

