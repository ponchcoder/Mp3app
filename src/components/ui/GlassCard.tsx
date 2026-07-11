"use client";

/**
 * Glassmorphism card component
 */

import { motion } from "framer-motion";
import { scaleIn, springTransition } from "@/animations/variants";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
  padding?: "sm" | "md" | "lg";
}

const paddingMap = {
  sm: "p-3",
  md: "p-5",
  lg: "p-8",
};

export function GlassCard({
  children,
  className = "",
  onClick,
  hover = false,
  padding = "md",
}: GlassCardProps) {
  const Component = onClick ? motion.button : motion.div;

  return (
    <Component
      variants={scaleIn}
      initial={false}
      animate="visible"
      transition={springTransition}
      onClick={onClick}
      whileHover={hover ? { scale: 1.02, y: -2 } : undefined}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      className={`
        rounded-3xl border backdrop-blur-xl
        bg-[var(--color-glass)] border-[var(--color-glass-border)]
        shadow-[0_8px_32px_var(--color-shadow)]
        ${paddingMap[padding]} ${className}
        ${onClick ? "cursor-pointer text-left w-full" : ""}
      `}
    >
      {children}
    </Component>
  );
}
