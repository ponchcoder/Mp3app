"use client";

/**
 * Mini player — tap the bar to open full player; controls stay independent.
 */

import { useEffect, useState } from "react";
import { Play, Pause, SkipBack, SkipForward } from "lucide-react";
import { AlbumArt } from "@/components/ui/AlbumArt";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { usePlayer } from "@/contexts/PlayerContext";
import { getDisplayTitle, getDisplayArtist } from "@/utils";

/** Brief delay after a new song starts so a library tap doesn't ghost-open the full player */
const EXPAND_DELAY_MS = 500;

interface MiniPlayerProps {
  onOpenFullPlayer: () => void;
}

export function MiniPlayer({ onOpenFullPlayer }: MiniPlayerProps) {
  const { currentSong, isPlaying, currentTime, duration, togglePlay, previous, next, seek } =
    usePlayer();
  const [canExpand, setCanExpand] = useState(false);

  useEffect(() => {
    setCanExpand(false);
    const timer = setTimeout(() => setCanExpand(true), EXPAND_DELAY_MS);
    return () => clearTimeout(timer);
  }, [currentSong?.id]);

  if (!currentSong) return null;

  const handleExpand = () => {
    if (!canExpand) return;
    onOpenFullPlayer();
  };

  return (
    <div className="fixed bottom-[72px] left-4 right-4 z-30 mx-auto max-w-lg">
      <div
        className="rounded-2xl bg-[var(--color-player-bg)] backdrop-blur-xl border border-[var(--color-card-border)] shadow-glass overflow-hidden cursor-pointer"
        onClick={handleExpand}
        role="button"
        tabIndex={0}
        aria-label="Open now playing"
        onKeyDown={(e) => e.key === "Enter" && handleExpand()}
      >
        <div onClick={(e) => e.stopPropagation()}>
          <ProgressBar
            currentTime={currentTime}
            duration={duration}
            onSeek={seek}
            showTimes={false}
            className="!rounded-none"
          />
        </div>

        <div className="flex items-center gap-3 p-3">
          <AlbumArt
            src={currentSong.artwork}
            title={getDisplayTitle(currentSong)}
            size="sm"
          />

          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[var(--color-text)] truncate">
              {getDisplayTitle(currentSong)}
            </p>
            <p className="text-xs text-[var(--color-text-secondary)] truncate">
              {getDisplayArtist(currentSong)}
            </p>
          </div>

          <div
            className="flex items-center gap-1 shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={previous}
              aria-label="Previous track"
              className="p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-accent)]"
            >
              <SkipBack size={18} />
            </button>
            <button
              type="button"
              onClick={togglePlay}
              aria-label={isPlaying ? "Pause" : "Play"}
              className="p-2 rounded-full bg-[var(--color-accent)] text-white"
            >
              {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Next track"
              className="p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-accent)]"
            >
              <SkipForward size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
