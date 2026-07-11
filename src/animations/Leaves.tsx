"use client";

/**
 * Gentle drifting leaves
 */

import { motion } from "framer-motion";
import { useMemo } from "react";

interface LeavesProps {
  count?: number;
  intensity?: number;
  reduceMotion?: boolean;
}

export function DriftingLeaves({
  count = 8,
  intensity = 0,
  reduceMotion = false,
}: LeavesProps) {
  const leaves = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 10,
        duration: 12 + Math.random() * 8,
        size: 12 + Math.random() * 10,
        color: ["#7CB87C", "#A8D5A8", "#5A9A5A", "#C4A882"][i % 4],
      })),
    [count]
  );

  if (reduceMotion) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {leaves.map((leaf) => (
        <motion.div
          key={leaf.id}
          className="absolute"
          style={{
            left: `${leaf.x}%`,
            top: "-5%",
            width: leaf.size,
            height: leaf.size,
          }}
          animate={{
            y: ["0vh", "110vh"],
            x: [0, 30, -20, 40, 0],
            rotate: [0, 90, 180, 270, 360],
            opacity: [0, 0.7, 0.5, 0],
          }}
          transition={{
            duration: leaf.duration * (1 - intensity * 0.2),
            delay: leaf.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <svg viewBox="0 0 24 24" fill={leaf.color} opacity={0.6}>
            <path d="M12 2C8 6 4 10 6 16C7 19 10 21 12 22C14 21 17 19 18 16C20 10 16 6 12 2Z" />
          </svg>
        </motion.div>
      ))}
    </div>
  );
}
