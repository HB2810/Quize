"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { motion } from "motion/react";
import { Gift, ArrowRight, RefreshCw } from "lucide-react";
import { t, type Lang } from "@/lib/i18n";
import { PrimaryButton } from "@/components/stavya/PrimaryButton";
import { Logo } from "@/components/stavya/Logo";

export function ScratchCard({
  lang,
  score,
  onComplete,
}: {
  lang: Lang;
  score: number;
  onComplete: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [scratchPercent, setScratchPercent] = useState(0);
  const isDrawing = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  // Determine prize based on score percentage
  let prizeKey = "spinePrizeParticipation";
  let prizeTier = "Participation Prize 🎉";
  let tierColor = "text-blue-500 bg-blue-500/10";
  if (score >= 80) {
    prizeKey = "spinePrizeGold";
    prizeTier = "Gold Prize 🏆";
    tierColor = "text-amber-500 bg-amber-500/10";
  } else if (score >= 50) {
    prizeKey = "spinePrizeSilver";
    prizeTier = "Silver Prize 🥈";
    tierColor = "text-slate-400 bg-slate-500/10";
  }

  // Generate a random unique claim code
  const [claimCode] = useState(() => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "ST-";
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  });

  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    // Fill with modern gradient overlay
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, "#3b82f6");
    gradient.addColorStop(0.5, "#1d4ed8");
    gradient.addColorStop(1, "#1e3a8a");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw pattern sparkles
    ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
    for (let i = 0; i < 40; i++) {
      ctx.beginPath();
      ctx.arc(
        Math.random() * canvas.width,
        Math.random() * canvas.height,
        Math.random() * 6 + 2,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }

    // Write "SCRATCH HERE" text
    ctx.font = "bold 22px system-ui, sans-serif";
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.shadowColor = "rgba(0, 0, 0, 0.4)";
    ctx.shadowBlur = 4;
    ctx.fillText("👋 SCRATCH HERE 👋", canvas.width / 2, canvas.height / 2 - 10);

    ctx.font = "14px system-ui, sans-serif";
    ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
    ctx.fillText("Reveal your spine health prize!", canvas.width / 2, canvas.height / 2 + 20);

    ctx.shadowBlur = 0;
  }, []);

  useEffect(() => {
    initCanvas();

    const handleResize = () => {
      if (!revealed) {
        initCanvas();
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [initCanvas, revealed]);

  const checkScratchPercentage = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imgData.data;
    let transparentCount = 0;

    const step = 20;
    let sampledTotal = 0;
    for (let i = 0; i < pixels.length; i += step * 4) {
      sampledTotal++;
      if (pixels[i + 3] === 0) {
        transparentCount++;
      }
    }

    const percent = Math.round((transparentCount / sampledTotal) * 100);
    setScratchPercent(percent);

    if (percent >= 45) {
      setRevealed(true);
    }
  };

  const getMousePos = (e: MouseEvent | TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    let clientX = 0;
    let clientY = 0;

    if ("touches" in e) {
      if (e.touches[0]) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      }
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const scratch = (e: MouseEvent | TouchEvent, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => {
    const currentPos = getMousePos(e, canvas);

    ctx.beginPath();
    ctx.globalCompositeOperation = "destination-out";
    ctx.lineWidth = 36;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(currentPos.x, currentPos.y);
    ctx.stroke();

    lastPos.current = currentPos;
  };

  const handleStart = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || revealed) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    isDrawing.current = true;
    lastPos.current = getMousePos(e.nativeEvent, canvas);
  };

  const handleMove = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !isDrawing.current || revealed) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (e.cancelable) {
      e.preventDefault();
    }

    scratch(e.nativeEvent, canvas, ctx);
  };

  const handleEnd = () => {
    const canvas = canvasRef.current;
    if (!canvas || !isDrawing.current) return;

    isDrawing.current = false;
    checkScratchPercentage(canvas);
  };

  return (
    <div className="min-h-screen surface-hero px-5 py-8 sm:px-6 flex flex-col justify-between">
      <div className="mx-auto w-full max-w-xl flex-1 flex flex-col justify-center">
        <div className="flex justify-center mb-6">
          <Logo className="h-16 sm:h-20" />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-4xl border border-border bg-card p-6 shadow-card text-center sm:p-9 relative overflow-hidden"
        >
          <span className="inline-flex items-center gap-2 rounded-full bg-primary-soft px-4 py-2 text-sm font-extrabold text-primary uppercase tracking-wider mb-4">
            <Gift className="h-4 w-4" />
            {t("scratchCardTitle", lang)}
          </span>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            {revealed ? t("scratchedEnough", lang) : t("scratchCardSubtitle", lang)}
          </h1>

          <div className="relative mx-auto mt-8 w-full max-w-100 aspect-[1.8] rounded-3xl overflow-hidden border-4 border-primary/20 shadow-float">
            {/* The Prize under scratch surface */}
            <div className="absolute inset-0 bg-linear-to-br from-primary-soft/30 to-primary-soft/60 flex flex-col items-center justify-center p-6 select-none">
              <span className={`px-4 py-1.5 rounded-full text-base font-extrabold uppercase tracking-wider mb-2 ${tierColor}`}>
                {prizeTier}
              </span>
              <p className="text-2xl sm:text-3xl font-black text-foreground max-w-xs leading-snug">
                {t(prizeKey, lang)}
              </p>
              <div className="mt-4 border-2 border-dashed border-primary/40 rounded-xl px-4 py-2 bg-card">
                <span className="text-xs font-bold text-muted-foreground block uppercase tracking-wider">Claim Code</span>
                <span className="text-xl sm:text-2xl font-black tracking-widest text-primary">{claimCode}</span>
              </div>
            </div>

            {/* The Scratch Canvas */}
            {!revealed && (
              <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full cursor-pointer touch-none z-10"
                onMouseDown={handleStart}
                onMouseMove={handleMove}
                onMouseUp={handleEnd}
                onMouseLeave={handleEnd}
                onTouchStart={handleStart}
                onTouchMove={handleMove}
                onTouchEnd={handleEnd}
              />
            )}
          </div>

          {!revealed && (
            <div className="mt-4 flex items-center justify-center gap-2 text-muted-foreground">
              <div className="w-24 bg-muted h-2 rounded-full overflow-hidden">
                <div
                  className="bg-primary h-full transition-all duration-300"
                  style={{ width: `${Math.min(scratchPercent * 2.2, 100)}%` }}
                />
              </div>
              <span className="text-sm font-semibold">{scratchPercent}% scratched</span>
              <button
                onClick={initCanvas}
                title="Reset scratch card"
                className="p-1 hover:bg-muted rounded-full transition-colors cursor-pointer"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
          )}

          {revealed && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 space-y-4"
            >
              <div className="rounded-2xl bg-muted/50 p-4 border border-border">
                <p className="text-base text-muted-foreground leading-relaxed">
                  {t("claimCode", lang)}
                </p>
                <p className="text-sm font-bold text-muted-foreground mt-2 block">
                  📍 Reception Desk, Stavya Spine Hospital
                </p>
              </div>

              <PrimaryButton onClick={onComplete} className="w-full text-lg h-16 rounded-2xl mt-4">
                {t("finish", lang)} <ArrowRight className="h-5 w-5" />
              </PrimaryButton>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
