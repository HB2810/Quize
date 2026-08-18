"use client";

import { cn } from "@/lib/cn";

export function AppShell({
  children,
  className,
  maxWidth = "max-w-5xl",
}: {
  children: React.ReactNode;
  className?: string;
  maxWidth?: string;
}) {
  return (
    <div className="relative min-h-dvh overflow-x-hidden surface-hero selection:bg-primary/20 selection:text-primary">
      {/* Dynamic ambient background light fields */}
      <span
        className="pointer-events-none absolute left-1/2 -top-72 h-152 w-152 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl"
        aria-hidden
      />
      <span
        className="pointer-events-none absolute -left-32 bottom-0 h-104 w-104 rounded-full bg-accent/[0.07] blur-3xl animate-float-slow"
        aria-hidden
      />

      <div
        className={cn(
          "relative mx-auto flex min-h-dvh w-full flex-col px-4 sm:px-6 lg:px-8",
          "pt-[max(1.25rem,env(safe-area-inset-top))]",
          "pb-[max(1.5rem,env(safe-area-inset-bottom))]",
          maxWidth,
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}
