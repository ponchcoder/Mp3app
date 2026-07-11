/**
 * Subtle twinkling stars for night sky (CSS-only, scattered placement)
 */

"use client";

import { useMemo } from "react";

interface StarsProps {
  count?: number;
  noAnimation?: boolean;
}

/** Deterministic pseudo-random — scattered but stable across renders */
function scatter(seed: number): number {
  const n = Math.sin(seed * 127.1 + seed * 311.7) * 43758.5453;
  return n - Math.floor(n);
}

export function NightStars({ count = 70, noAnimation = false }: StarsProps) {
  const stars = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const s1 = scatter(i * 2.17 + 1);
        const s2 = scatter(i * 5.43 + 2);
        const s3 = scatter(i * 8.91 + 3);
        const s4 = scatter(i * 3.67 + 4);
        return {
          id: i,
          x: s1 * 98 + 1,
          y: s2 * 92 + 2,
          size: 0.8 + s3 * 2.2,
          opacity: 0.35 + s4 * 0.65,
          delay: s3 * 6,
          duration: 1.8 + s4 * 3.5,
        };
      }),
    [count]
  );

  if (noAnimation) return null;

  return (
    <div
      className="absolute inset-0 z-[1] overflow-hidden pointer-events-none"
      aria-hidden="true"
    >
      {stars.map((star) => (
        <div
          key={star.id}
          className="night-star"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size,
            height: star.size,
            ["--star-base-opacity" as string]: String(star.opacity),
            ["--star-delay" as string]: `${star.delay}s`,
            ["--star-duration" as string]: `${star.duration}s`,
          }}
        />
      ))}
    </div>
  );
}
