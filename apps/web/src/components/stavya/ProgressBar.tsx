"use client";

import { motion } from "motion/react";

export function ProgressBar({ value, className }: { value: number; className?: string }) {
  return (
    <div
      className={"h-3 w-full overflow-hidden rounded-full bg-primary-soft " + (className ?? "")}
      role="progressbar"
      aria-valuenow={Math.round(value)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <motion.div
        className="h-full rounded-full surface-primary"
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        transition={{ type: "spring", stiffness: 120, damping: 22 }}
      />
    </div>
  );
}
