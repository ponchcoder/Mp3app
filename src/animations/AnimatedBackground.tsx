"use client";

/**
 * Animated background — cherry blossom or night sky with smooth CSS effects
 *
 * Layer order (night sky): gradient → stars → clouds → moon (moon on top)
 */

import type { EnvironmentType } from "@/types";
import { ENVIRONMENT_CONFIGS } from "@/animations/environments";
import { FloatingPetals } from "@/animations/Petals";
import { DriftingClouds } from "@/animations/Clouds";
import { NightStars } from "@/animations/Stars";
import { NightMoon } from "@/animations/Moon";

interface AnimatedBackgroundProps {
  environment: EnvironmentType;
  noAnimation?: boolean;
}

export function AnimatedBackground({
  environment,
  noAnimation = false,
}: AnimatedBackgroundProps) {
  const config = ENVIRONMENT_CONFIGS[environment];
  const isNight = config.stars;

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
      {/* Base gradient */}
      <div
        key={environment}
        className="absolute inset-0 z-0 transition-opacity duration-[2000ms] ease-in-out"
        style={{ background: config.gradient }}
      />

      {/* Night sky layers — stars behind clouds, moon always visible on top */}
      {isNight && (
        <>
          <NightStars count={70} noAnimation={noAnimation} />
          <DriftingClouds count={5} noAnimation={noAnimation} nightMode={isNight} />
          <NightMoon />
        </>
      )}

      {/* Cherry blossom clouds */}
      {!isNight && (
        <DriftingClouds count={5} noAnimation={noAnimation} nightMode={false} />
      )}

      {config.petals && (
        <FloatingPetals color={config.particleColor} count={8} noAnimation={noAnimation} />
      )}
    </div>
  );
}
