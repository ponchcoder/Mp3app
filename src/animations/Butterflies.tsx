"use client";

/**
 * Gentle butterfly animations drifting across the scene
 */

import { motion } from "framer-motion";
import { useMemo } from "react";

interface ButterfliesProps {
  count?: number;
  intensity?: number;
  reduceMotion?: boolean;
}

export function Butterflies({
  count = 5,
  intensity = 0,
  reduceMotion = false,
}: ButterfliesProps) {
  const butterflies = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        y: 20 + Math.random() * 50,
        size: 12 + Math.random() * 8,
        duration: 15 + Math.random() * 10,
        delay: Math.random() * 10,
        color: ["#FFB7C5", "#D4B8FF", "#FFD700", "#FF8FB3"][i % 4],
        direction: i % 2 === 0 ? 1 : -1,
      })),
    [count]
  );

  if (reduceMotion) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {butterflies.map((b) => (
        <motion.div
          key={b.id}
          className="absolute"
          style={{
            top: `${b.y}%`,
            width: b.size,
            height: b.size,
          }}
          animate={{
            x: b.direction > 0 ? ["-5%", "105%"] : ["105%", "-5%"],
            y: [0, -20, 10, -15, 0],
          }}
          transition={{
            duration: b.duration * (1 - intensity * 0.15),
            delay: b.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <svg viewBox="0 0 24 16" fill={b.color} opacity={0.7}>
            <path d="M12 8C10 4 6 2 3 4C1 6 2 10 6 10C8 10 10 9 12 8Z" />
            <path d="M12 8C14 4 18 2 21 4C23 6 22 10 18 10C16 10 14 9 12 8Z" />
            <ellipse cx="12" cy="8" rx="1" ry="3" fill={b.color} opacity={0.8} />
          </svg>
        </motion.div>
      ))}
    </div>
  );
}
