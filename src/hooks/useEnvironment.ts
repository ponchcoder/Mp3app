/**
 * Auto-cycles between cherry blossom and night sky every 3 minutes
 */

import { useEffect, useCallback } from "react";
import type { EnvironmentType } from "@/types";

const ENVIRONMENTS: EnvironmentType[] = ["cherry-blossom", "night-sky"];

const TRANSITION_INTERVAL = 3 * 60 * 1000;

/** Cycles to the next environment on an interval */
export function useEnvironmentCycle(
  current: EnvironmentType,
  noAnimation: boolean,
  onChange: (env: EnvironmentType) => void
) {
  const cycle = useCallback(() => {
    const idx = ENVIRONMENTS.indexOf(current);
    const next = ENVIRONMENTS[(idx + 1) % ENVIRONMENTS.length] ?? "cherry-blossom";
    onChange(next);
  }, [current, onChange]);

  useEffect(() => {
    if (noAnimation) return;
    const interval = setInterval(cycle, TRANSITION_INTERVAL);
    return () => clearInterval(interval);
  }, [cycle, noAnimation]);
}

export { ENVIRONMENTS };

/** Normalize a stored value — falls back if an old environment was saved */
export function normalizeEnvironment(value: string | undefined): EnvironmentType {
  if (value === "night-sky" || value === "cherry-blossom") return value;
  return "cherry-blossom";
}
