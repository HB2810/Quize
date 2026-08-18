"use client";

import Link from "next/link";
import { AppShell } from "./AppShell";
import { ProgressBar } from "@/components/stavya/ProgressBar";
import { Logo } from "@/components/stavya/Logo";

export function JourneyShell({
  progress,
  children,
  footer,
}: {
  progress?: { current: number; total: number };
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  const percentage = progress ? (progress.current / progress.total) * 100 : 0;

  return (
    <AppShell maxWidth="max-w-4xl">
      {/* Top Header with Stavya Logo & Progress */}
      <header className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 sm:pb-6 border-b border-border/40 mb-4 sm:mb-6">
        <Link href="/" className="transition-transform hover:scale-[1.02]">
          <Logo className="h-10 sm:h-14" />
        </Link>

        {progress ? (
          <div className="w-full sm:w-64 flex flex-col items-end">
            <div className="w-full flex items-center justify-between gap-3 mb-1.5 text-xs font-bold text-muted-foreground">
              <span className="uppercase tracking-wider text-primary">
                Healthy Bones Journey
              </span>
              <span className="font-extrabold text-foreground">
                Question {progress.current} of {progress.total}
              </span>
            </div>
            <ProgressBar value={percentage} />
          </div>
        ) : (
          <div className="hidden sm:flex items-center gap-2 rounded-full glass-panel px-4 py-1.5 text-xs font-extrabold text-foreground shadow-soft">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Stavya Spine Awareness</span>
          </div>
        )}
      </header>

      {/* Main Elevated Step Container */}
      <main className="flex flex-1 flex-col">
        <div className="flex flex-1 flex-col rounded-4xl glass-panel p-6 sm:p-10 shadow-card border border-glass-border">
          {children}
        </div>
      </main>

      {footer ? <footer className="pt-4">{footer}</footer> : null}
    </AppShell>
  );
}
