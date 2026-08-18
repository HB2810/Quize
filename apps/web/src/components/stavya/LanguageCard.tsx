"use client";

import { motion } from "motion/react";
import { Check } from "lucide-react";
import { cn } from "@/lib/cn";

export function LanguageCard({
  native,
  label,
  sample,
  active,
  index,
  onSelect,
}: {
  native: string;
  label: string;
  sample: string;
  active: boolean;
  index: number;
  onSelect: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onSelect}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, type: "spring", stiffness: 240, damping: 22 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "flex w-full items-center justify-between gap-4 rounded-4xl border-2 bg-card p-6 text-left shadow-soft transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/30 cursor-pointer",
        active ? "border-primary bg-primary-soft/60" : "border-border hover:border-primary",
      )}
    >
      <div className="min-w-0">
        <div className="text-3xl font-extrabold tracking-tight text-foreground">{native}</div>
        <div className="mt-1 text-base text-muted-foreground">
          {label} · {sample}
        </div>
      </div>
      <span
        className={cn(
          "grid h-11 w-11 shrink-0 place-items-center rounded-2xl",
          active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
        )}
      >
        <Check className="h-5 w-5" />
      </span>
    </motion.button>
  );
}
