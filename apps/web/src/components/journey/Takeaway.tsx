import { cn } from "@/lib/cn";

/** The message worth remembering after each question. */
export function Takeaway({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "animate-fade-up rounded-card bg-linear-to-r from-brand-deep via-brand to-brand-light p-4.5 sm:p-5 text-white shadow-glow border border-white/10",
        className,
      )}
      style={{ animationDelay: "300ms" }}
    >
      <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-white/80">
        <span aria-hidden className="text-base">📌</span> Key Takeaway
      </p>
      <p className="mt-2 text-[15px] sm:text-base font-semibold leading-relaxed drop-shadow-sm">
        {children}
      </p>
    </div>
  );
}

