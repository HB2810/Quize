"use client";

import { motion } from "motion/react";

export function ConfettiEffect() {
  const colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];
  const shapes = ["rounded-full", "rounded-none", "w-3 h-1.5"];
  
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
      {Array.from({ length: 70 }).map((_, i) => {
        const color = colors[i % colors.length];
        const shape = shapes[i % shapes.length];
        const angle = Math.random() * Math.PI * 2;
        const velocity = Math.random() * 350 + 150;
        const x = Math.cos(angle) * velocity;
        const y = Math.sin(angle) * velocity - 250;
        
        return (
          <motion.div
            key={i}
            className={`absolute left-1/2 top-1/2 w-2.5 h-2.5 ${shape}`}
            style={{ backgroundColor: color }}
            initial={{ x: 0, y: 100, scale: 0, rotate: 0, opacity: 1 }}
            animate={{
              x,
              y,
              scale: Math.random() * 1.5 + 0.5,
              rotate: Math.random() * 720,
              opacity: [1, 1, 0],
            }}
            transition={{
              duration: Math.random() * 1.5 + 1.5,
              ease: "easeOut",
            }}
          />
        );
      })}
    </div>
  );
}
