"use client";

import { motion } from "motion/react";
import type { HTMLMotionProps } from "motion/react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "accent" | "ghost" | "outline";
type Size = "md" | "lg";

interface Props extends HTMLMotionProps<"button"> {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
  fullWidth?: boolean;
  disabled?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  type?: "button" | "submit" | "reset";
}

const variants: Record<Variant, string> = {
  primary:
    "surface-primary text-primary-foreground shadow-card hover:shadow-glow hover:brightness-110",
  accent:
    "surface-accent text-accent-foreground shadow-card hover:shadow-glow hover:brightness-110",
  ghost: "bg-transparent text-muted-foreground hover:bg-glass hover:shadow-soft",
  outline: "glass-panel text-foreground border border-glass-border hover:bg-glass",
};

const sizes: Record<Size, string> = {
  md: "h-12 px-6 text-base rounded-2xl",
  lg: "h-16 px-9 text-lg rounded-3xl",
};

export function PrimaryButton({
  variant = "primary",
  size = "lg",
  className,
  children,
  fullWidth,
  ...rest
}: Props) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 420, damping: 26 }}
      className={cn(
        "inline-flex select-none items-center justify-center gap-2 font-semibold tracking-tight outline-none transition-[filter,background-color] focus-visible:ring-4 focus-visible:ring-ring/30 disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
        variants[variant],
        sizes[size],
        fullWidth && "w-full",
        className,
      )}
      {...rest}
    >
      {children}
    </motion.button>
  );
}
