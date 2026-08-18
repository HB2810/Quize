"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";

function getTopicVisual(topic?: string): string {
  if (!topic) return "/visuals/bone-density.jpg";
  const t = topic.toLowerCase();
  if (t.includes("nutrition") || t.includes("vitamin") || t.includes("calcium")) {
    return "/visuals/nutrition.jpg";
  }
  if (t.includes("movement") || t.includes("muscle") || t.includes("exercise") || t.includes("activity")) {
    return "/visuals/movement.jpg";
  }
  if (t.includes("prevention") || t.includes("fall") || t.includes("injury")) {
    return "/visuals/prevention.jpg";
  }
  return "/visuals/bone-density.jpg";
}

/** Presents one question with 100% full-view 4:3 native medical illustration & tap-to-enlarge lightbox. */
export function QuestionCard({
  topic,
  question,
  children,
  className,
}: {
  topic?: string;
  question: string;
  children: React.ReactNode;
  className?: string;
}) {
  const visualUrl = getTopicVisual(topic);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  return (
    <div className={cn("animate-step-in flex flex-1 flex-col justify-between", className)}>
      <div>
        {/* Native 4:3 Aspect Ratio Full-View Image Container */}
        <div
          onClick={() => setLightboxOpen(true)}
          className="relative mb-5 w-full aspect-4/3 max-h-95 overflow-hidden rounded-card border border-brand/15 bg-white shadow-soft group cursor-pointer"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={visualUrl}
            alt={topic ?? "Spine Visualization"}
            className="w-full h-full object-fill transition-transform duration-500 group-hover:scale-[1.03]"
          />
          <div className="absolute inset-0 bg-linear-to-t from-brand-deep/60 via-transparent to-transparent opacity-90 transition-opacity group-hover:opacity-75" />

          {/* Enlarge Hint Badge */}
          <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full border border-white/40 bg-brand-deep/70 backdrop-blur-md px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white shadow-soft transition-transform group-hover:scale-105">
            🔍 Tap for Fullscreen Diagram
          </span>

          {/* Topic Tag */}
          {topic ? (
            <span className="animate-chip-pop absolute bottom-3 right-3.5 inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-white/95 backdrop-blur-md px-3.5 py-1 text-[11px] font-black uppercase tracking-wider text-brand-deep shadow-soft">
              <span className="size-1.5 rounded-full bg-brand animate-pulse" />
              {topic}
            </span>
          ) : null}
        </div>

        <h2 className="text-lg sm:text-xl font-black leading-snug tracking-tight text-brand-deep">
          {question}
        </h2>
      </div>

      <div className="mt-4 flex flex-col gap-3">{children}</div>

      {/* Fullscreen Interactive Lightbox Modal */}
      {lightboxOpen ? (
        <div
          onClick={() => setLightboxOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 sm:p-6 backdrop-blur-md animate-fade-up cursor-zoom-out"
        >
          <div className="relative max-w-4xl max-h-[92vh] flex flex-col items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={visualUrl}
              alt={topic ?? "Spine Visualization Full View"}
              className="max-h-[82vh] w-auto rounded-card object-contain shadow-glow border border-white/20"
            />
            <div className="mt-3 flex items-center gap-3">
              <span className="rounded-full bg-white/20 px-4 py-1.5 text-xs font-black uppercase tracking-wider text-white backdrop-blur-md">
                {topic ? `Topic: ${topic}` : "Stavya Medical Diagram"} &bull; Tap anywhere to close ✕
              </span>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}





