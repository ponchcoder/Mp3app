/**
 * Smooth CSS-based drifting clouds (GPU-accelerated)
 */

"use client";

import { useMemo } from "react";

interface CloudsProps {
  count?: number;
  noAnimation?: boolean;
  nightMode?: boolean;
}

export function DriftingClouds({
  count = 5,
  noAnimation = false,
  nightMode = false,
}: CloudsProps) {
  const clouds = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        y: 8 + (i % 4) * 12 + (i % 2) * 5,
        width: 100 + (i % 3) * 50,
        duration: 45 + (i % 3) * 15,
        delay: i * 6,
        drift: i % 2 === 0 ? 1 : -1,
        opacity: nightMode ? 0.22 + (i % 3) * 0.08 : 0.35 + (i % 3) * 0.1,
      })),
    [count, nightMode]
  );

  if (noAnimation) return null;

  return (
    <div
      className="absolute inset-0 z-[10] overflow-hidden pointer-events-none"
      aria-hidden="true"
    >
      {clouds.map((cloud) => (
        <div
          key={cloud.id}
          className={`cloud ${cloud.drift > 0 ? "cloud-drift-right" : "cloud-drift-left"}`}
          style={{
            top: `${cloud.y}%`,
            width: cloud.width,
            opacity: cloud.opacity,
            ["--cloud-duration" as string]: `${cloud.duration}s`,
            ["--cloud-delay" as string]: `${cloud.delay}s`,
          }}
        >
          <svg
            viewBox="0 0 200 80"
            fill={nightMode ? "rgba(220, 215, 240, 0.9)" : "white"}
            className="w-full h-auto"
          >
            <ellipse cx="60" cy="50" rx="50" ry="30" />
            <ellipse cx="110" cy="40" rx="40" ry="28" />
            <ellipse cx="150" cy="48" rx="45" ry="25" />
            <ellipse cx="90" cy="55" rx="55" ry="22" />
          </svg>
        </div>
      ))}
    </div>
  );
}
