/**
 * Hook for tracking total listening time in the current session
 */

import { useState, useEffect, useRef } from "react";

export function useListeningTime(isPlaying: boolean): number {
  const [minutes, setMinutes] = useState(0);
  const startRef = useRef<number | null>(null);
  const accumulatedRef = useRef(0);

  useEffect(() => {
    if (isPlaying) {
      startRef.current = Date.now();
    } else if (startRef.current) {
      accumulatedRef.current += Date.now() - startRef.current;
      startRef.current = null;
    }
  }, [isPlaying]);

  useEffect(() => {
    const interval = setInterval(() => {
      let total = accumulatedRef.current;
      if (startRef.current) {
        total += Date.now() - startRef.current;
      }
      setMinutes(Math.floor(total / 60000));
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return minutes;
}
