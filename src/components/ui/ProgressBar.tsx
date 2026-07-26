"use client";

/**
 * Custom styled progress/seek bar — tap or drag to scrub.
 */

import { useRef, useCallback, useState } from "react";
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
  const isDraggingRef = useRef(false);
  const [isDragging, setIsDragging] = useState(false);
  const [scrubTime, setScrubTime] = useState<number | null>(null);

  const displayTime = scrubTime ?? currentTime;
  const progress = duration > 0 ? (displayTime / duration) * 100 : 0;

  const timeFromClientX = useCallback(
    (clientX: number): number => {
      const bar = barRef.current;
      if (!bar || duration <= 0) return 0;
      const rect = bar.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      return ratio * duration;
    },
    [duration]
  );

  const seekTo = useCallback(
    (clientX: number) => {
      const time = timeFromClientX(clientX);
      setScrubTime(time);
      onSeek(time);
      return time;
    },
    [timeFromClientX, onSeek]
  );

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    isDraggingRef.current = true;
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
    seekTo(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    e.preventDefault();
    e.stopPropagation();
    seekTo(e.clientX);
  };

  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    setIsDragging(false);
    seekTo(e.clientX);
    setScrubTime(null);
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") onSeek(Math.min(currentTime + 5, duration));
    if (e.key === "ArrowLeft") onSeek(Math.max(currentTime - 5, 0));
  };

  return (
    <div className={`w-full ${className}`}>
      <div
        role="slider"
        aria-label="Seek"
        aria-valuemin={0}
        aria-valuemax={duration}
        aria-valuenow={displayTime}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        className="relative py-3 touch-none cursor-pointer select-none group"
      >
        <div
          ref={barRef}
          className="relative h-2 bg-[var(--color-accent-light)] rounded-full"
        >
          <div
            className="absolute inset-y-0 left-0 bg-[var(--color-accent)] rounded-full"
            style={{ width: `${progress}%` }}
          />
          <div
            className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-[var(--color-accent)] rounded-full shadow-glow transition-opacity ${
              isDragging ? "opacity-100 scale-110" : "opacity-0 group-hover:opacity-100"
            }`}
            style={{ left: `calc(${progress}% - 8px)` }}
          />
        </div>
      </div>
      {showTimes && (
        <div className="flex justify-between mt-1.5 text-xs text-[var(--color-text-secondary)]">
          <span>{formatTime(displayTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      )}
    </div>
  );
}
