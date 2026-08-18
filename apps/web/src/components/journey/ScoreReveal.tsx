"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { useCountUp, useReducedMotion } from "@/lib/motion";
import { Confetti } from "@/components/ui/Confetti";

/**
 * Animated awareness score: gradient ring fills while the number
 * counts up inside a soft pulsing halo with celebratory confetti & gamification badges.
 */
export function ScoreReveal({
  score,
  total,
  label = "Awareness Score",
  className,
}: {
  score: number;
  total: number;
  label?: string;
  className?: string;
}) {
  const displayed = useCountUp(score);
  const reduced = useReducedMotion();
  const [filled, setFilled] = useState(false);
  const [showConfetti, setShowConfetti] = useState(true);

  const R = 52;
  const CIRC = 2 * Math.PI * R;
  const fraction = total > 0 ? score / total : 0;
  const xp = score * 100;
  const stars = Array.from({ length: total }, (_, i) => i < score);

  useEffect(() => {
    // Let the ring mount at 0, then transition to the target fill.
    const id = requestAnimationFrame(() => setFilled(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const offset = filled || reduced ? CIRC * (1 - fraction) : CIRC;

  return (
    <div className={cn("relative flex flex-col items-center gap-3.5", className)}>
      {showConfetti ? <Confetti duration={4000} /> : null}

      {/* Gamified Star Rank */}
      <div className="flex items-center gap-1">
        {stars.map((filledStar, idx) => (
          <span
            key={idx}
            className={cn(
              "text-lg transition-transform duration-300",
              filledStar ? "scale-110 text-aha drop-shadow-sm" : "scale-90 opacity-25 text-ink-faint",
            )}
          >
            ★
          </span>
        ))}
      </div>

      {/* Animated Gauge Ring */}
      <div className="animate-halo relative size-40 sm:size-48 rounded-full p-2 bg-linear-to-b from-white to-surface/90 shadow-lift border border-white">
        <svg viewBox="0 0 120 120" className="size-full -rotate-90 drop-shadow-md">
          <defs>
            <linearGradient id="score-ring" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#1b5b88" />
              <stop offset="50%" stopColor="#d97706" />
              <stop offset="100%" stopColor="#0d8a6c" />
            </linearGradient>
          </defs>
          <circle
            cx="60"
            cy="60"
            r={R}
            fill="none"
            strokeWidth="9"
            className="stroke-brand/10"
          />
          <circle
            cx="60"
            cy="60"
            r={R}
            fill="none"
            strokeWidth="9"
            strokeLinecap="round"
            strokeDasharray={CIRC}
            strokeDashoffset={offset}
            stroke="url(#score-ring)"
            className="transition-progress"
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-4xl sm:text-5xl font-black text-brand-deep tracking-tight">
            {displayed}
            <span className="text-xl sm:text-2xl font-extrabold text-ink-faint">
              /{total}
            </span>
          </p>
          <span className="mt-0.5 rounded-full bg-correct-soft px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-correct shadow-soft">
            ⚡ +{xp} XP
          </span>
        </div>
      </div>

      {/* Level & Rank Badge */}
      <div className="flex flex-col items-center gap-1">
        <p className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-brand">
          {label}
        </p>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-aha/30 bg-aha-soft/90 px-3.5 py-1 text-xs font-black uppercase tracking-wider text-aha shadow-soft">
          🏆 {score === total ? "Level 6: Spine Guardian" : score >= 4 ? "Level 5: Health Pioneer" : "Level 4: Knowledge Seeker"}
        </span>
      </div>
    </div>
  );
}


