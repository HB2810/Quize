import { cn } from "@/lib/cn";

/** One titled block of the personalized snapshot. */
export function ReportSection({
  title,
  children,
  className,
  delay = 0,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
  /** Entrance stagger in ms. */
  delay?: number;
}) {
  return (
    <section
      className={cn(
        "animate-fade-up card-tappable rounded-card border-l-4 border-l-brand border border-white/60 bg-card p-5 sm:p-6 shadow-soft",
        className,
      )}
      style={delay ? { animationDelay: `${delay}ms` } : undefined}
    >
      <h3 className="text-xs font-extrabold uppercase tracking-widest text-brand">
        {title}
      </h3>
      <div className="mt-3 text-[15px] sm:text-base leading-relaxed text-ink">
        {children}
      </div>
    </section>
  );
}

