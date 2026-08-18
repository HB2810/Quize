import { cn } from "@/lib/cn";

/**
 * Immediate verdict banner after answering. Incorrect answers are
 * framed as discoveries — the journey's core emotional mechanic.
 */
export function AnswerFeedback({
  kind,
  message,
}: {
  kind: "correct" | "incorrect";
  message: string;
}) {
  const correct = kind === "correct";
  return (
    <div
      role="status"
      className={cn(
        "animate-pop-in rounded-card p-4 sm:p-5 shadow-soft border border-dashed",
        correct
          ? "border-correct/40 bg-correct-soft/90 shadow-[0_4px_20px_rgba(13,138,108,0.15)]"
          : "border-discover/40 bg-discover-soft/90 shadow-[0_4px_20px_rgba(192,73,104,0.15)]",
      )}
    >
      <p
        className={cn(
          "flex items-center gap-2 text-sm font-extrabold uppercase tracking-wider",
          correct ? "text-correct" : "text-discover",
        )}
      >
        <span aria-hidden className="animate-chip-pop inline-block text-lg">
          {correct ? "🎯" : "✨"}
        </span>
        {correct ? "You knew it!" : "A discovery!"}
      </p>
      <p className="mt-2 text-[15px] sm:text-base font-medium leading-relaxed text-ink">
        {message}
      </p>
    </div>
  );
}

