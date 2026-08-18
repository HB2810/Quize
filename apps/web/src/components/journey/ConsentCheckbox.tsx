"use client";

import { cn } from "@/lib/cn";

/**
 * One consent, one checkbox — communication and public-recognition
 * consent are always separate decisions, never bundled.
 */
export function ConsentCheckbox({
  checked,
  onChange,
  children,
  className,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-start gap-3 rounded-control border border-brand/10 bg-card p-4 shadow-soft transition-colors hover:border-brand/30 hover:bg-brand-soft/20",
        checked && "border-brand bg-brand-soft/40 shadow-glow",
        className,
      )}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-0.5 size-5 shrink-0 accent-brand cursor-pointer"
      />
      <span className="text-xs sm:text-sm leading-relaxed text-ink-soft select-none font-medium">{children}</span>
    </label>
  );
}

