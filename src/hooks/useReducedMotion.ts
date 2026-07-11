/**
 * Hook for detecting and responding to reduced motion preferences
 */

import { useState, useEffect } from "react";

export function useReducedMotion(userPreference?: boolean): boolean {
  const [systemPreference, setSystemPreference] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setSystemPreference(mq.matches);

    const handler = (e: MediaQueryListEvent) => setSystemPreference(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return userPreference ?? systemPreference;
}
