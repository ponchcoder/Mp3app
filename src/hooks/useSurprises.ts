/**
 * Hook for romantic surprise elements (floating hearts, secret messages)
 */

import { useState, useEffect, useCallback } from "react";
import { getEncouragingMessage, getSecretMessage } from "@/utils/messages";

interface Surprise {
  id: string;
  type: "heart" | "message" | "sparkle" | "shooting-star";
  x: number;
  y: number;
  message?: string;
  size?: number;
}

export function useSurprises(listeningMinutes: number, noAnimation?: boolean) {
  const [surprises, setSurprises] = useState<Surprise[]>([]);
  const [secretRevealed, setSecretRevealed] = useState(false);

  const addSurprise = useCallback((type: Surprise["type"], message?: string) => {
    const surprise: Surprise = {
      id: crypto.randomUUID(),
      type,
      x: Math.random() * 80 + 10,
      y: Math.random() * 60 + 20,
      message,
      size: type === "heart" ? 16 + Math.random() * 10 : undefined,
    };
    setSurprises((prev) => [...prev, surprise]);

    const duration =
      type === "sparkle" || type === "shooting-star" ? 1500 : 3500;
    setTimeout(() => {
      setSurprises((prev) => prev.filter((s) => s.id !== surprise.id));
    }, duration);
  }, []);

  // Occasional floating hearts
  useEffect(() => {
    if (noAnimation) return;

    const interval = setInterval(() => {
      if (Math.random() < 0.3) {
        addSurprise("heart");
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [addSurprise, noAnimation]);

  // Random encouraging messages
  useEffect(() => {
    if (noAnimation) return;

    const interval = setInterval(() => {
      if (Math.random() < 0.2) {
        addSurprise("message", getEncouragingMessage());
      }
    }, 45000);

    return () => clearInterval(interval);
  }, [addSurprise, noAnimation]);

  // Secret message after 30 minutes of listening
  useEffect(() => {
    if (listeningMinutes >= 30 && !secretRevealed) {
      setSecretRevealed(true);
      addSurprise("message", getSecretMessage());
      addSurprise("sparkle");
      addSurprise("sparkle");
    }
  }, [listeningMinutes, secretRevealed, addSurprise]);

  const triggerFavoriteSparkle = useCallback(() => {
    addSurprise("sparkle");
    addSurprise("heart");
  }, [addSurprise]);

  const triggerPlayHeart = useCallback(() => {
    addSurprise("heart");
  }, [addSurprise]);

  const triggerShootingStar = useCallback(() => {
    addSurprise("shooting-star");
  }, [addSurprise]);

  return {
    surprises,
    triggerFavoriteSparkle,
    triggerPlayHeart,
    triggerShootingStar,
  };
}
