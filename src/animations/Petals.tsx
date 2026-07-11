/**
 * Smooth CSS-based petal animations (GPU-accelerated, no Framer Motion)
 */

"use client";

import { useMemo } from "react";

interface PetalsProps {
  count?: number;
  color?: string;
  noAnimation?: boolean;
}

export function FloatingPetals({
  count = 8,
  color = "#FFB7C5",
  noAnimation = false,
}: PetalsProps) {
  const petals = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        x: 5 + (i / count) * 90 + (i % 3) * 3,
        delay: (i * 1.7) % 12,
        duration: 14 + (i % 4) * 2,
        drift: -40 + (i % 5) * 20,
        size: 10 + (i % 3) * 4,
        rotation: (i * 47) % 360,
      })),
    [count]
  );

  if (noAnimation) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {petals.map((petal) => (
        <div
          key={petal.id}
          className="petal"
          style={{
            left: `${petal.x}%`,
            width: petal.size,
            height: petal.size * 1.2,
            color,
            // CSS custom properties for per-petal variation
            ["--petal-delay" as string]: `${petal.delay}s`,
            ["--petal-duration" as string]: `${petal.duration}s`,
            ["--petal-drift" as string]: `${petal.drift}px`,
            ["--petal-rotation" as string]: `${petal.rotation}deg`,
          }}
        >
          <svg viewBox="0 0 20 24" fill="currentColor" className="w-full h-full opacity-70">
            <ellipse cx="10" cy="12" rx="8" ry="10" />
          </svg>
        </div>
      ))}
    </div>
  );
}
