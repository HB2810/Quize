"use client";

import { cn } from "@/lib/cn";

export interface SelectorOption {
  value: string;
  label: string;
  /** Optional native-script hint, e.g. "ગુજરાતી" under "Gujarati". */
  hint?: string;
}

/**
 * Generic single-select list used for language, age range, and gender
 * steps — any journey context selection. Options cascade in; the
 * selected row glows. Journey data provides the options; this
 * component only renders them.
 */
export function OptionListSelector({
  options,
  value,
  onChange,
  ariaLabel,
  className,
}: {
  options: SelectorOption[];
  value?: string;
  onChange: (value: string) => void;
  ariaLabel: string;
  className?: string;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={cn("flex flex-col gap-3", className)}
    >
      {options.map((option, index) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(option.value)}
            style={{ animationDelay: `${80 + index * 60}ms` }}
            className={cn(
              "card-tappable animate-fade-up flex items-center justify-between rounded-control border-2 p-4 text-left shadow-soft transition-all duration-200",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
              selected
                ? "animate-halo border-brand bg-brand-soft/70 shadow-glow"
                : "border-brand/10 bg-card hover:border-brand/40 hover:bg-brand-soft/30",
            )}
          >
            <span>
              <span className="block text-[15px] sm:text-base font-semibold text-ink">
                {option.label}
              </span>
              {option.hint ? (
                <span className="block text-sm text-ink-soft">
                  {option.hint}
                </span>
              ) : null}
            </span>
            <span
              aria-hidden
              className={cn(
                "flex size-6 items-center justify-center rounded-full border-2 transition-all duration-200",
                selected
                  ? "scale-105 border-brand bg-brand shadow-sm"
                  : "border-ink-faint/40",
              )}
            >
              {selected ? (
                <span className="size-2 rounded-full bg-white" />
              ) : null}
            </span>
          </button>
        );
      })}
    </div>
  );
}

