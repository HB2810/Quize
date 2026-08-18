"use client";

import { motion } from "motion/react";
import { Check } from "lucide-react";
import { cn } from "@/lib/cn";
import { CreativeIcon } from "./CreativeIcon";

export function OptionCard({
  label,
  emoji,
  index,
  state,
  disabled,
  onSelect,
}: {
  label: string;
  emoji?: string | undefined;
  index: number;
  state: "idle" | "picked" | "dimmed" | "correct" | "incorrect";
  disabled?: boolean;
  onSelect?: () => void;
}) {
  const letter = String.fromCharCode(65 + index);
  return (
    <motion.button
      type="button"
      disabled={disabled}
      onClick={onSelect}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: state === "dimmed" ? 0.45 : 1, y: 0 }}
      transition={{ delay: 0.06 * index, type: "spring", stiffness: 260, damping: 24 }}
      whileHover={{ scale: disabled ? 1 : 1.015 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      className={cn(
        "group flex w-full items-center gap-4 rounded-3xl border-2 bg-card p-5 text-left shadow-soft transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/30 sm:p-6 cursor-pointer",
        state === "idle" && "border-border hover:border-primary hover:bg-primary-soft/50",
        state === "dimmed" && "border-border opacity-50",
        state === "picked" && "border-primary bg-primary-soft/30",
        state === "correct" && "border-correct bg-correct-soft/40 shadow-glow",
        state === "incorrect" && "border-discover bg-discover-soft/40",
      )}
    >
      <span
        className={cn(
          "grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-lg font-bold transition-colors",
          state === "picked" && "bg-primary text-primary-foreground",
          state === "correct" && "bg-correct text-white",
          state === "incorrect" && "bg-discover text-white",
          (state === "idle" || state === "dimmed") &&
            "bg-primary-soft text-primary group-hover:bg-primary group-hover:text-primary-foreground",
        )}
      >
        {state === "picked" || state === "correct" ? (
          <Check className="h-6 w-6" />
        ) : emoji ? (
          <CreativeIcon emoji={emoji} className="h-6 w-6 text-primary group-hover:text-primary-foreground" />
        ) : (
          letter
        )}
      </span>
      <span className="min-w-0 flex-1 text-lg font-semibold leading-snug text-foreground sm:text-xl">
        {label}
      </span>
    </motion.button>
  );
}
