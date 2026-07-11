"use client";

/**
 * Twinkling fireflies and stars
 */

import { motion } from "framer-motion";
import { useMemo } from "react";

interface FirefliesProps {
  count?: number;
  color?: string;
  intensity?: number;
  reduceMotion?: boolean;
}

export function Fireflies({
  count = 15,
  color = "#FFD700",
  intensity = 0,
  reduceMotion = false,
}: FirefliesProps) {
  const flies = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 2 + Math.random() * 3,
        delay: Math.random() * 5,
        duration: 2 + Math.random() * 3,
      })),
    [count]
  );

  if (reduceMotion) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {flies.map((fly) => (
        <motion.div
          key={fly.id}
          className="absolute rounded-full"
          style={{
            left: `${fly.x}%`,
            top: `${fly.y}%`,
            width: fly.size,
            height: fly.size,
            backgroundColor: color,
            boxShadow: `0 0 ${fly.size * 2}px ${color}`,
          }}
          animate={{
            opacity: [0.2, 0.4 + intensity * 0.6, 0.2],
            scale: [1, 1 + intensity * 0.5, 1],
            y: [0, -10, 5, 0],
            x: [0, 5, -3, 0],
          }}
          transition={{
            duration: fly.duration,
            delay: fly.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
