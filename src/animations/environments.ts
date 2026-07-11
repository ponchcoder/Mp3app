/**
 * Environment color palettes for animated backgrounds
 */

import type { EnvironmentType } from "@/types";

export interface EnvironmentConfig {
  name: string;
  gradient: string;
  petals: boolean;
  stars: boolean;
  particleColor: string;
}

export const ENVIRONMENT_CONFIGS: Record<EnvironmentType, EnvironmentConfig> = {
  "cherry-blossom": {
    name: "Cherry Blossom",
    gradient: "linear-gradient(180deg, #FFE4EC 0%, #FFF0F5 40%, #E8F8E8 100%)",
    petals: true,
    stars: false,
    particleColor: "#FFB7C5",
  },
  "night-sky": {
    name: "Night Sky",
    gradient: "linear-gradient(180deg, #0A0E27 0%, #1A1040 50%, #2D1B69 100%)",
    petals: false,
    stars: true,
    particleColor: "#FFFFFF",
  },
};
