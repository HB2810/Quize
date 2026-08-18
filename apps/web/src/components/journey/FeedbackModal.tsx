"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/cn";
import { Logo } from "@/components/stavya/Logo";
import { PrimaryButton } from "@/components/stavya/PrimaryButton";

export function FeedbackModal({
  wasCorrect,
  message,
  ahaMoment,
  takeaway,
  onContinue,
}: {
  wasCorrect: boolean;
  message: string;
  ahaMoment: string;
  takeaway: string;
  onContinue: () => void;
}) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-foreground/25 backdrop-blur-md" onClick={onContinue} />

      <motion.div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-lg overflow-hidden rounded-4xl border border-glass-border bg-card p-6 sm:p-8 text-center shadow-float backdrop-blur-2xl"
        initial={{ opacity: 0, scale: 0.9, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: -28 }}
        transition={{ type: "spring", stiffness: 260, damping: 24 }}
      >
        <div className="flex items-center justify-center mb-2">
          <div className="rounded-2xl bg-white px-4 py-2 border border-slate-100/80 shadow-sm flex items-center justify-center">
            <Logo className="h-10 sm:h-12" />
          </div>
        </div>

        {/* Verdict Badge */}
        <div className="mt-4 flex justify-center">
          <span
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-extrabold uppercase tracking-wider shadow-soft",
              wasCorrect
                ? "bg-emerald-500/15 text-emerald-600 border border-emerald-500/30"
                : "bg-amber-500/15 text-amber-600 border border-amber-500/30",
            )}
          >
            <span>{wasCorrect ? "🎯 Correct!" : "💡 Medical Revelation"}</span>
          </span>
        </div>

        {/* Message */}
        <h3 className="mt-4 text-xl sm:text-2xl font-black leading-snug tracking-tight text-foreground">
          {message}
        </h3>

        {/* Aha Moment */}
        <div className="mt-4 rounded-3xl border border-amber-500/30 bg-amber-500/10 p-4 text-left shadow-soft">
          <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-amber-600">
            <span className="text-base">💡</span> Aha! Moment
          </p>
          <p className="mt-1.5 text-sm sm:text-base font-semibold leading-relaxed text-foreground">
            {ahaMoment}
          </p>
        </div>

        {/* Takeaway */}
        <div className="mt-3 rounded-3xl surface-primary p-4 text-left text-white shadow-glow">
          <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-white/80">
            <span className="text-base">📌</span> Key Medical Insight
          </p>
          <p className="mt-1.5 text-sm sm:text-base font-semibold leading-relaxed">
            {takeaway}
          </p>
        </div>

        <div className="mt-6">
          <PrimaryButton fullWidth onClick={onContinue}>
            Next Question →
          </PrimaryButton>
        </div>
      </motion.div>
    </motion.div>
  );
}
