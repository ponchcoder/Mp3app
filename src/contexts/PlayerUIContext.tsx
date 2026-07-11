"use client";

/**
 * Player UI state — completely separate from audio/queue playback.
 * Full player and queue overlays only open via explicit user actions.
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { usePlayer } from "@/contexts/PlayerContext";

interface PlayerUIContextValue {
  showFullPlayer: boolean;
  showQueue: boolean;
  openFullPlayer: () => void;
  closeFullPlayer: () => void;
  openQueue: () => void;
  closeQueue: () => void;
  resetAll: () => void;
}

const PlayerUIContext = createContext<PlayerUIContextValue | null>(null);

export function PlayerUIProvider({ children }: { children: React.ReactNode }) {
  const { currentSong, resetPlayback } = usePlayer();
  const [showFullPlayer, setShowFullPlayer] = useState(false);
  const [showQueue, setShowQueue] = useState(false);

  const closeFullPlayer = useCallback(() => {
    setShowFullPlayer(false);
    setShowQueue(false);
  }, []);

  const openFullPlayer = useCallback(() => {
    if (!currentSong) return;
    setShowFullPlayer(true);
  }, [currentSong]);

  const openQueue = useCallback(() => {
    setShowQueue(true);
  }, []);

  const closeQueue = useCallback(() => {
    setShowQueue(false);
  }, []);

  const resetAll = useCallback(() => {
    resetPlayback();
    setShowFullPlayer(false);
    setShowQueue(false);
  }, [resetPlayback]);

  // No track = no overlays
  useEffect(() => {
    if (!currentSong) {
      setShowFullPlayer(false);
      setShowQueue(false);
    }
  }, [currentSong]);

  return (
    <PlayerUIContext.Provider
      value={{
        showFullPlayer,
        showQueue,
        openFullPlayer,
        closeFullPlayer,
        openQueue,
        closeQueue,
        resetAll,
      }}
    >
      {children}
    </PlayerUIContext.Provider>
  );
}

export function usePlayerUI(): PlayerUIContextValue {
  const ctx = useContext(PlayerUIContext);
  if (!ctx) throw new Error("usePlayerUI must be used within PlayerUIProvider");
  return ctx;
}
