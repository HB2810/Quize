"use client";

/**
 * OPD display screen — runs full-screen on the hospital TVs. Rotates
 * through published 6/6 champions (consented content only: selfie +
 * chosen display name + achievement). Polls the feed periodically.
 */

import { useEffect, useState } from "react";
import { DisplayFeedSchema, type DisplayFeed } from "@stavya/contracts";
import { apiFetch } from "@/lib/api/client";

const ROTATE_MS = 8000;
const REFRESH_MS = 60_000;

export default function OpdDisplayPage() {
  const [feed, setFeed] = useState<DisplayFeed | null>(null);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const data = await apiFetch("/recognition/display", DisplayFeedSchema);
        if (alive) setFeed(data);
      } catch {
        // keep showing the last good feed
      }
    };
    void load();
    const refresh = setInterval(() => void load(), REFRESH_MS);
    return () => {
      alive = false;
      clearInterval(refresh);
    };
  }, []);

  useEffect(() => {
    const rotate = setInterval(
      () => setIndex((i) => i + 1),
      ROTATE_MS,
    );
    return () => clearInterval(rotate);
  }, []);

  const entries = feed?.entries ?? [];
  const entry = entries.length
    ? entries[index % entries.length]
    : undefined;

  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-between overflow-hidden bg-brand-deep px-8 py-12 text-center text-white selection:bg-brand">
      {/* Background glowing ambiance */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="animate-float-a absolute -top-40 -left-40 size-150 rounded-full bg-brand/30 blur-[120px]" />
        <div className="animate-float-b absolute -bottom-40 -right-40 size-150 rounded-full bg-aha/20 blur-[120px]" />
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.06)_1px,transparent_1px)] bg-size-[32px_32px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 flex flex-col items-center gap-2">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-6 py-2 text-xs font-black uppercase tracking-[0.35em] text-white/90 backdrop-blur-md shadow-soft">
          <span className="size-2 rounded-full bg-correct animate-pulse" />
          Stavya Spine Awareness &bull; OPD Live Screen
        </div>
      </header>

      {/* Center Spotlight */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center py-6">
        {entry ? (
          <div key={entry.id} className="animate-step-in flex flex-col items-center gap-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-aha/20 border border-aha/40 px-5 py-1.5 text-xs font-black uppercase tracking-[0.25em] text-aha shadow-glow">
              🏆 Perfect Score Champion
            </div>

            <div className="relative">
              <div className="animate-halo absolute inset-0 rounded-full bg-aha/30 blur-xl" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={entry.imageUrl}
                alt={entry.displayName}
                className="relative size-60 sm:size-72 rounded-full border-4 border-white/40 object-cover shadow-[0_0_50px_rgba(217,119,6,0.35)]"
              />
              <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-linear-to-r from-brand to-correct px-6 py-1.5 text-lg font-black tracking-widest text-white shadow-lift border border-white/30">
                {entry.achievement}
              </span>
            </div>

            <h2 className="mt-4 text-4xl sm:text-5xl font-black tracking-tight drop-shadow-md">
              {entry.displayName}
            </h2>

            <p className="max-w-md text-lg text-white/80 font-medium">
              Celebrating 6/6 excellence in the <strong className="text-white font-extrabold">{entry.journeyName}</strong> Journey
            </p>
          </div>
        ) : (
          <div className="animate-fade-up flex flex-col items-center gap-6 glass-panel-dark rounded-card p-12 max-w-lg border border-white/15 shadow-glow">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/spine-unit-small.png"
              alt=""
              aria-hidden
              className="animate-float-icon h-32 w-auto drop-shadow-xl"
            />
            <h2 className="text-3xl sm:text-4xl font-black leading-tight text-white">
              How well do you know your <span className="text-gradient-brand">bones</span>?
            </h2>
            <p className="text-base text-white/70">
              Take the 3-minute Stavya Spine Health Journey on your phone now.
            </p>
          </div>
        )}
      </div>

      {/* Footer Banner */}
      <footer className="relative z-10 rounded-card glass-panel-dark border border-white/20 px-8 py-5 shadow-glow max-w-xl w-full">
        <p className="text-lg font-black tracking-wide text-white">
          Think you can get a 6/6 score?
        </p>
        <p className="mt-1 text-sm font-medium text-white/75">
          Scan the QR code at the desk to test your bone health knowledge!
        </p>
      </footer>
    </main>
  );
}

