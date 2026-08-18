"use client";

import { useEffect, useRef, useState } from "react";

/** True when the user requests reduced motion — components must honor it. */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(query.matches);
    const onChange = (event: MediaQueryListEvent) => setReduced(event.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  return reduced;
}

/**
 * Animate a number from 0 to `target` (e.g. the score count-up).
 * Jumps straight to the target under reduced motion.
 */
export function useCountUp(target: number, durationMs = 900): number {
  const reduced = useReducedMotion();
  const [value, setValue] = useState(0);
  const frame = useRef<number>(0);

  useEffect(() => {
    if (reduced) {
      setValue(target);
      return;
    }
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / durationMs, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
    // rAF is suspended in hidden tabs (locked phone, backgrounded app);
    // guarantee the final value lands regardless.
    const failsafe = setTimeout(() => setValue(target), durationMs + 300);
    return () => {
      cancelAnimationFrame(frame.current);
      clearTimeout(failsafe);
    };
  }, [target, durationMs, reduced]);

  return value;
}
