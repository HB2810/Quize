"use client";

import { motion } from "motion/react";
import { CreativeIcon } from "./CreativeIcon";

export function BadgeCard({ emoji, name, desc }: { emoji: string; name: string; desc: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 220, damping: 20, delay: 0.2 }}
      className="flex items-center gap-4 rounded-4xl border border-border surface-hero bg-card p-6 shadow-card"
    >
      <span className="grid h-16 w-16 shrink-0 place-items-center rounded-3xl bg-primary-soft text-primary">
        <CreativeIcon emoji={emoji} className="h-10 w-10" />
      </span>
      <div className="min-w-0">
        <div className="text-xl font-extrabold tracking-tight text-foreground">{name}</div>
        <p className="mt-1 text-base text-muted-foreground">{desc}</p>
      </div>
    </motion.div>
  );
}
