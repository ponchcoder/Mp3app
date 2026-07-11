"use client";

/**
 * Sparkling particle effects
 */

import { motion } from "framer-motion";
import { useMemo } from "react";

interface SparklesProps {
  count?: number;
  color?: string;
  intensity?: number;
  reduceMotion?: boolean;
}

export function Sparkles({
  count = 20,
  color = "#FFD700",
  intensity = 0,
  reduceMotion = false,
}: SparklesProps) {
  const sparkles = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 2 + Math.random() * 4,
        delay: Math.random() * 4,
        duration: 1.5 + Math.random() * 2,
      })),
    [count]
  );

  if (reduceMotion) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {sparkles.map((sparkle) => (
        <motion.div
          key={sparkle.id}
          className="absolute"
          style={{
            left: `${sparkle.x}%`,
            top: `${sparkle.y}%`,
            width: sparkle.size,
            height: sparkle.size,
          }}
          animate={{
            opacity: [0, 0.3 + intensity * 0.7, 0],
            scale: [0, 1 + intensity * 0.3, 0],
            rotate: [0, 180],
          }}
          transition={{
            duration: sparkle.duration,
            delay: sparkle.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <svg viewBox="0 0 10 10" fill={color}>
            <path d="M5 0L6 4L10 5L6 6L5 10L4 6L0 5L4 4Z" />
          </svg>
        </motion.div>
      ))}
    </div>
  );
}
