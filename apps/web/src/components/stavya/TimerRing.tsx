"use client";

import { motion } from "motion/react";

export function TimerRing({
  remaining,
  total,
  label,
}: {
  remaining: number;
  total: number;
  label: string;
}) {
  const r = 26;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, remaining / total));
  const low = remaining <= 10;

  return (
    <div className="relative grid h-16 w-16 shrink-0 place-items-center">
      <svg className="h-16 w-16 -rotate-90" viewBox="0 0 64 64" aria-hidden>
        <circle cx="32" cy="32" r={r} fill="none" strokeWidth="6" className="stroke-primary-soft" />
        <motion.circle
          cx="32"
          cy="32"
          r={r}
          fill="none"
          strokeWidth="6"
          strokeLinecap="round"
          className={low ? "stroke-accent" : "stroke-primary"}
          style={{ strokeDasharray: c }}
          animate={{ strokeDashoffset: c * (1 - pct) }}
          transition={{ duration: 0.9, ease: "linear" }}
        />
      </svg>
      <span
        className={
          "absolute text-sm font-bold tabular-nums " + (low ? "text-accent" : "text-primary")
        }
      >
        {remaining}
        <span className="text-[0.65rem] font-medium">{label}</span>
      </span>
    </div>
  );
}
