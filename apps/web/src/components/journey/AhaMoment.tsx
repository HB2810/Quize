import { cn } from "@/lib/cn";

/** The "I didn't know that" reveal — bulb pops in, light sweeps across. */
export function AhaMoment({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "animate-fade-up relative overflow-hidden rounded-card border border-aha/35 bg-aha-soft/90 p-4 sm:p-5 shadow-soft",
        className,
      )}
      style={{ animationDelay: "150ms" }}
    >
      <div aria-hidden className="shine-sweep animate-shine absolute inset-0 opacity-80" />
      <p className="relative flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-aha">
        <span aria-hidden className="animate-bulb-pop inline-block text-xl leading-none drop-shadow-sm">
          💡
        </span>
        Aha Moment
      </p>
      <p className="relative mt-2 text-[15px] sm:text-base font-semibold leading-relaxed text-ink">
        {children}
      </p>
    </div>
  );
}

