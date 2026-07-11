"use client";

/**
 * Romantic surprise elements — floating hearts, messages, sparkles
 */

import { motion, AnimatePresence } from "framer-motion";
import { Heart } from "lucide-react";

interface Surprise {
  id: string;
  type: "heart" | "message" | "sparkle" | "shooting-star";
  x: number;
  y: number;
  message?: string;
  size?: number;
}

interface SurprisesLayerProps {
  surprises: Surprise[];
}

const bubbleFade = {
  initial: { opacity: 0, y: 10 },
  animate: {
    opacity: [0, 1, 1, 0],
    y: [10, 0, -6, -16],
  },
  exit: { opacity: 0, y: -20 },
  transition: {
    duration: 3.5,
    ease: "easeInOut" as const,
    times: [0, 0.18, 0.72, 1],
  },
};

export function SurprisesLayer({ surprises }: SurprisesLayerProps) {
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden" aria-hidden="true">
      <AnimatePresence>
        {surprises.map((surprise) => (
          <motion.div
            key={surprise.id}
            className="absolute"
            style={{ left: `${surprise.x}%`, top: `${surprise.y}%` }}
            {...(surprise.type === "heart" || surprise.type === "message"
              ? bubbleFade
              : {
                  initial: { opacity: 0, scale: 0, y: 20 },
                  animate: { opacity: 1, scale: 1, y: 0 },
                  exit: { opacity: 0, scale: 0, y: -30 },
                  transition: { duration: 0.8, ease: "easeOut" as const },
                })}
          >
            {surprise.type === "heart" && (
              <Heart
                className="text-blush-400 fill-blush-400 drop-shadow-sm"
                size={surprise.size ?? 20}
              />
            )}

            {surprise.type === "message" && surprise.message && (
              <div className="px-4 py-2 rounded-2xl bg-[var(--color-glass)] backdrop-blur-md border border-[var(--color-glass-border)] shadow-glass text-sm text-[var(--color-text)] whitespace-nowrap">
                {surprise.message}
              </div>
            )}

            {surprise.type === "sparkle" && (
              <motion.div
                animate={{ scale: [0, 1.5, 0], rotate: [0, 180] }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="#FBBF24">
                  <path d="M10 0L12 8L20 10L12 12L10 20L8 12L0 10L8 8Z" />
                </svg>
              </motion.div>
            )}

            {surprise.type === "shooting-star" && (
              <motion.div
                className="w-16 h-0.5 bg-gradient-to-r from-transparent via-golden-300 to-transparent rounded-full"
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: -200, opacity: [0, 1, 0] }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
