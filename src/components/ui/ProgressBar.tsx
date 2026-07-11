"use client";

/**
 * Custom styled progress/seek bar
 */

import { useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { formatTime } from "@/utils";

interface ProgressBarProps {
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
  className?: string;
  showTimes?: boolean;
}

export function ProgressBar({
  currentTime,
  duration,
  onSeek,
  className = "",
  showTimes = true,
}: ProgressBarProps) {
  const barRef = useRef<HTMLDivElement>(null);
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleSeek = useCallback(
    (clientX: number) => {
      const bar = barRef.current;
      if (!bar || duration <= 0) return;
      const rect = bar.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      onSeek(ratio * duration);
    },
    [duration, onSeek]
  );

  const handleClick = (e: React.MouseEvent) => handleSeek(e.clientX);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") onSeek(Math.min(currentTime + 5, duration));
    if (e.key === "ArrowLeft") onSeek(Math.max(currentTime - 5, 0));
  };

  return (
    <div className={`w-full ${className}`}>
      <div
        ref={barRef}
        role="slider"
        aria-label="Seek"
        aria-valuemin={0}
        aria-valuemax={duration}
        aria-valuenow={currentTime}
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className="relative h-2 bg-[var(--color-accent-light)] rounded-full cursor-pointer group"
      >
        <motion.div
          className="absolute inset-y-0 left-0 bg-[var(--color-accent)] rounded-full"
          style={{ width: `${progress}%` }}
          layout
        />
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-[var(--color-accent)] rounded-full shadow-glow opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ left: `calc(${progress}% - 8px)` }}
        />
      </div>
      {showTimes && (
        <div className="flex justify-between mt-1.5 text-xs text-[var(--color-text-secondary)]">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      )}
    </div>
  );
}
