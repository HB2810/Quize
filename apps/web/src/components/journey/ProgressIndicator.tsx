import { cn } from "@/lib/cn";

/**
 * Segmented journey progress — one segment per question/step, filling
 * left to right; the segment just completed glows briefly.
 */
export function ProgressIndicator({
  current,
  total,
  className,
}: {
  current: number;
  total: number;
  className?: string;
}) {
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={current}
      aria-label={`Step ${current} of ${total}`}
      className={cn("flex gap-1.5", className)}
    >
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className="h-1.5 flex-1 overflow-hidden rounded-full bg-brand/15"
        >
          <div
            className={cn(
              "transition-progress h-full rounded-full",
              i < current
                ? "w-full bg-gradient-to-r from-brand to-brand-deep"
                : "w-0 bg-brand",
              i === current - 1 && "shadow-glow",
            )}
          />
        </div>
      ))}
    </div>
  );
}
