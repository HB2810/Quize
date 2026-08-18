"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, Clock, ListChecks, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/stavya/Logo";
import { PrimaryButton } from "@/components/stavya/PrimaryButton";
import { t } from "@/lib/i18n";

export default function HomePage() {
  const lang = "en";
  const chips = [
    { icon: Clock, label: t("minutes", lang) },
    { icon: ListChecks, label: t("questionsCount", lang) },
    { icon: ShieldCheck, label: t("freeAnonymous", lang) },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden surface-hero pb-12">
      {/* Ambient light fields */}
      <span
        className="pointer-events-none absolute left-1/2 -top-72 h-152 w-152 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl"
        aria-hidden
      />
      <span
        className="pointer-events-none absolute -left-32 bottom-0 h-104 w-104 rounded-full bg-accent/[0.07] blur-3xl animate-float-slow"
        aria-hidden
      />

      {/* Header with Logo top center / right */}
      <header className="relative mx-auto flex max-w-6xl items-center justify-between px-6 py-6 sm:py-8">
        <Logo className="h-14 sm:h-20" />
        <span className="inline-flex items-center gap-2 rounded-full glass-panel px-4 py-1.5 text-xs font-bold text-muted-foreground shadow-soft">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          Interactive Experience
        </span>
      </header>

      {/* Centered Patient Awareness Blue Box */}
      <div className="relative z-10 flex justify-center w-full px-6 mb-6 sm:mb-8">
        <span className="inline-flex items-center justify-center gap-2.5 rounded-3xl bg-primary text-primary-foreground px-6 py-3 sm:px-8 sm:py-4 text-lg sm:text-2xl font-extrabold shadow-glow uppercase tracking-wider text-center">
          {t("awarenessProgram", lang)}
        </span>
      </div>

      <main className="relative mx-auto flex max-w-4xl flex-col items-center text-center px-6 pb-20 pt-2">
        <motion.div
          initial={{ opacity: 0, y: 26, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
          className="flex flex-col items-center"
        >
          <h1 className="mt-4 text-4xl sm:text-6xl lg:text-7xl font-black uppercase leading-[1.05] tracking-tight text-foreground">
            {t("heroTitle", lang)}
          </h1>
          <p className="mt-4 text-2xl sm:text-3xl font-normal text-muted-foreground">
            {t("heroSubtitle", lang)}
          </p>
          <p className="mt-6 max-w-xl text-lg sm:text-xl font-light leading-relaxed text-muted-foreground">
            {t("heroNote", lang)}
          </p>

          <div className="mt-10 flex flex-col sm:flex-row flex-wrap justify-center gap-4">
            {chips.map(({ icon: Icon, label }, i) => (
              <motion.span
                key={label}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 + i * 0.09, type: "spring", stiffness: 160, damping: 18 }}
                className="inline-flex items-center gap-3 rounded-3xl glass-panel px-6 py-3.5 text-base sm:text-lg font-bold text-foreground shadow-card hover:shadow-glow hover:-translate-y-1 transition-all duration-300"
              >
                <Icon className="h-5 w-5 text-primary shrink-0" />
                {label}
              </motion.span>
            ))}
          </div>

          <motion.div
            className="mt-12"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, type: "spring", stiffness: 150, damping: 20 }}
          >
            <Link href="/j/healthy-bones">
              <PrimaryButton className="text-xl sm:text-2xl h-18 sm:h-20 px-10 rounded-[2rem]">
                {t("start", lang)}
                <ArrowRight className="h-6 w-6 sm:h-7 sm:w-7" />
              </PrimaryButton>
            </Link>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}
