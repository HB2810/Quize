import { cn } from "@/lib/cn";

/**
 * Frames incorrect answers as discoveries — "you learned N new things
 * today", never "you got N wrong".
 */
export function DiscoveryCard({
  count,
  className,
}: {
  count: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "animate-fade-up rounded-card border border-aha/30 bg-aha-soft/90 p-5 sm:p-6 text-center shadow-soft",
        className,
      )}
    >
      <p className="text-3xl sm:text-4xl animate-bounce" aria-hidden>
        ✨
      </p>
      <p className="mt-2 text-lg sm:text-xl font-black text-brand-deep">
        {count === 0
          ? "You knew it all!"
          : `${count} new ${count === 1 ? "discovery" : "discoveries"}`}
      </p>
      <p className="mt-1 text-sm sm:text-base leading-relaxed text-ink-soft">
        {count === 0
          ? "Your bone health awareness is exceptional!"
          : "Each discovery is an empowering insight into your spine & bone health."}
      </p>
    </div>
  );
}

