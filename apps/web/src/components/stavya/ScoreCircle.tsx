"use client";

import { motion } from "motion/react";
import { useEffect, useState } from "react";

export function ScoreCircle({ score, label }: { score: number; label: string }) {
  const [display, setDisplay] = useState(0);
  const r = 88;
  const c = 2 * Math.PI * r;

  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / 1400);
      setDisplay(Math.round(score * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [score]);

  return (
    <div className="relative mx-auto grid h-56 w-56 place-items-center">
      <span className="absolute h-40 w-40 rounded-full bg-primary/10 animate-pulse-ring" />
      <svg className="h-56 w-56 -rotate-90" viewBox="0 0 200 200" aria-hidden>
        <circle
          cx="100"
          cy="100"
          r={r}
          fill="none"
          strokeWidth="14"
          className="stroke-primary-soft"
        />
        <motion.circle
          cx="100"
          cy="100"
          r={r}
          fill="none"
          strokeWidth="14"
          strokeLinecap="round"
          className="stroke-primary"
          style={{ strokeDasharray: c }}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c * (1 - score / 100) }}
          transition={{ duration: 1.4, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute text-center">
        <div className="text-6xl font-extrabold tabular-nums tracking-tight text-primary">
          {display}%
        </div>
        <div className="mt-1 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </div>
      </div>
    </div>
  );
}
