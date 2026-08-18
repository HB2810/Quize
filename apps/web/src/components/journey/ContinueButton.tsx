"use client";

import { cn } from "@/lib/cn";

/** Primary journey CTA — gradient, thumb-friendly, arrow nudges on hover. */
export function ContinueButton({
  children = "Continue",
  onClick,
  disabled,
  busy,
  className,
}: {
  children?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  busy?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || busy}
      className={cn(
        "group relative flex h-14 w-full items-center justify-center gap-3 overflow-hidden rounded-control bg-linear-to-r from-brand to-brand-deep text-base sm:text-lg font-extrabold text-white shadow-glow transition-all duration-300",
        "hover:brightness-110 hover:shadow-[0_8px_30px_rgba(27,91,136,0.4)] active:scale-[0.98]",
        "disabled:pointer-events-none disabled:opacity-40 disabled:shadow-none",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
        className,
      )}
    >
      <div aria-hidden className="shine-sweep animate-shine absolute inset-0 opacity-30 pointer-events-none" />
      {busy ? (
        <span
          aria-label="Loading"
          className="size-5 animate-spin rounded-full border-2 border-white/40 border-t-white"
        />
      ) : (
        <>
          <span className="relative z-10">{children}</span>
          <span
            aria-hidden
            className="relative z-10 text-lg transition-transform duration-200 group-hover:translate-x-1"
          >
            →
          </span>
        </>
      )}
    </button>
  );
}

