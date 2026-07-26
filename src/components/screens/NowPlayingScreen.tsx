"use client";

/**
 * Full-screen Now Playing view with album art, controls, and lyrics placeholder
 */

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Heart,
  ChevronLeft,
  ListMusic,
} from "lucide-react";
import { AlbumArt } from "@/components/ui/AlbumArt";
import { VinylRecord } from "@/components/ui/VinylRecord";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { SongOptionsMenu } from "@/components/ui/SongOptionsMenu";
import { usePlayer } from "@/contexts/PlayerContext";
import { useLibrary } from "@/contexts/LibraryContext";
import { useSettings } from "@/contexts/SettingsContext";
import { isSystemPlaylist } from "@/types";
import { getDisplayTitle, getDisplayArtist } from "@/utils";

interface NowPlayingScreenProps {
  onClose: () => void;
  onOpenQueue: () => void;
  onFavoriteToggle?: () => void;
  onPlayHeart?: () => void;
}

export function NowPlayingScreen({
  onClose,
  onOpenQueue,
  onFavoriteToggle,
  onPlayHeart,
}: NowPlayingScreenProps) {
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    shuffle,
    repeat,
    togglePlay,
    next,
    previous,
    seek,
    toggleShuffle,
    cycleRepeat,
  } = usePlayer();

  const {
    isFavorite,
    toggleFavorite,
    playlists,
    addToPlaylist,
    removeSong,
    renameSong,
    setSongArtwork,
  } = useLibrary();
  const { settings } = useSettings();

  const [isRenaming, setIsRenaming] = useState(false);
  const [editName, setEditName] = useState("");
  const [artSize, setArtSize] = useState(288);

  useEffect(() => {
    const updateArtSize = () => {
      setArtSize(Math.min(288, window.innerWidth - 32));
    };
    updateArtSize();
    window.addEventListener("resize", updateArtSize);
    return () => window.removeEventListener("resize", updateArtSize);
  }, []);

  const controlBtn =
    "p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] transition-colors shrink-0";
  const controlBtnActive =
    "p-2 text-[var(--color-accent)] transition-colors shrink-0";

  if (!currentSong) return null;

  const isFav = isFavorite(currentSong.id);
  const artwork = currentSong.artwork;
  const userPlaylists = playlists.filter((p) => !isSystemPlaylist(p));
  const displayTitle = getDisplayTitle(currentSong);

  const handleRename = () => {
    if (editName.trim()) {
      renameSong(currentSong.id, editName.trim());
      setIsRenaming(false);
    }
  };

  const startRename = () => {
    setEditName(displayTitle);
    setIsRenaming(true);
  };

  const handleDelete = async () => {
    await removeSong(currentSong.id);
    onClose();
  };

  const handleTogglePlay = () => {
    if (!isPlaying) onPlayHeart?.();
    togglePlay();
  };

  const handleFavorite = () => {
    toggleFavorite(currentSong.id);
    if (!isFav) onFavoriteToggle?.();
  };

  return (
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", damping: 30, stiffness: 300 }}
      className="fixed inset-0 z-50 flex flex-col bg-transparent pointer-events-auto"
    >
      {/* Top — transparent so cherry blossoms / night sky show through */}
      <div className="relative flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Header */}
        <div className="relative z-10 grid grid-cols-3 items-center px-4 pt-4 pb-2 [&_button]:drop-shadow-sm [&_p]:drop-shadow-sm">
          <button
            onClick={onClose}
            aria-label="Go back"
            className="p-2 rounded-full hover:bg-[var(--color-glass)] transition-colors justify-self-start"
          >
            <ChevronLeft size={24} className="text-[var(--color-text)]" />
          </button>
          <p className="text-sm font-medium text-[var(--color-text-secondary)] text-center">
            Now Playing
          </p>
          <div className="flex items-center gap-1 justify-self-end">
            <SongOptionsMenu
              songId={currentSong.id}
              playlists={userPlaylists}
              onAddToPlaylist={(playlistId) => addToPlaylist(playlistId, currentSong.id)}
              onDelete={handleDelete}
              onRequestRename={startRename}
              onSetArtwork={(artworkUrl) => setSongArtwork(currentSong.id, artworkUrl)}
              buttonClassName="p-2 rounded-full hover:bg-[var(--color-glass)] transition-colors"
              iconSize={20}
            />
            <button
              onClick={onOpenQueue}
              aria-label="Open queue"
              className="p-2 rounded-full hover:bg-[var(--color-glass)] transition-colors"
            >
              <ListMusic size={20} className="text-[var(--color-text)]" />
            </button>
          </div>
        </div>

        {/* Album Art / Vinyl */}
        <div className="relative z-10 flex-1 flex items-center justify-center px-4 py-4 min-w-0 w-full">
          {artwork && (
            <div
              className="absolute w-[min(320px,85vw)] h-[min(320px,85vw)] rounded-full opacity-35 pointer-events-none"
              style={{
                backgroundImage: `url(${artwork})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                filter: "blur(48px)",
              }}
              aria-hidden="true"
            />
          )}
          {settings.vinylMode ? (
            <VinylRecord
              src={artwork}
              title={getDisplayTitle(currentSong)}
              isPlaying={isPlaying}
              size={artSize}
            />
          ) : (
            <AlbumArt
              src={artwork}
              title={getDisplayTitle(currentSong)}
              size="xl"
              className="!rounded-full !w-[min(288px,calc(100vw-2rem))] !h-[min(288px,calc(100vw-2rem))]"
            />
          )}
        </div>
      </div>

      {/* Bottom — solid panel for song info, progress, and controls */}
      <div className="relative z-10 shrink-0 bg-[var(--color-bg)] border-t border-[var(--color-card-border)] rounded-t-3xl pt-3 pb-safe shadow-[0_-8px_32px_var(--color-shadow)]">
        {/* Song info */}
        <div className="px-4 sm:px-8 mb-2 min-w-0">
          <div className="flex items-start justify-center gap-1 max-w-full mx-auto">
            <div className="min-w-0 flex-1 text-center">
              {isRenaming ? (
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onBlur={handleRename}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleRename();
                    if (e.key === "Escape") setIsRenaming(false);
                  }}
                  className="w-full max-w-xs mx-auto text-center bg-transparent border-b border-[var(--color-accent)] font-display text-xl font-bold text-[var(--color-text)] outline-none"
                  autoFocus
                />
              ) : (
                <h2 className="font-display text-xl font-bold text-[var(--color-text)] truncate">
                  {displayTitle}
                </h2>
              )}
              <p className="text-sm text-[var(--color-text-secondary)] mt-0.5 truncate">
                {getDisplayArtist(currentSong)}
              </p>
            </div>
            <button
              onClick={handleFavorite}
              aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
              className={`p-1.5 rounded-full transition-colors shrink-0 ${
                isFav
                  ? "text-red-500"
                  : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-secondary)]"
              }`}
            >
              <Heart
                size={20}
                className={
                  isFav
                    ? "text-red-500 fill-red-500 stroke-red-500"
                    : ""
                }
              />
            </button>
          </div>
        </div>

        {/* Progress */}
        <div className="px-4 sm:px-8 mb-3">
          <ProgressBar
            currentTime={currentTime}
            duration={duration}
            onSeek={seek}
          />
        </div>

        {/* Controls */}
        <div className="px-4 mb-2">
          <div className="flex items-center justify-center gap-1 sm:gap-2 max-w-[320px] mx-auto w-full">
            <button
              onClick={toggleShuffle}
              aria-label={shuffle ? "Disable shuffle" : "Enable shuffle"}
              className={shuffle ? controlBtnActive : controlBtn}
            >
              <Shuffle size={18} />
            </button>
            <button
              onClick={previous}
              aria-label="Previous track"
              className={controlBtn}
            >
              <SkipBack size={22} />
            </button>
            <motion.button
              onClick={handleTogglePlay}
              aria-label={isPlaying ? "Pause" : "Play"}
              whileTap={{ scale: 0.9 }}
              className="p-3.5 sm:p-4 rounded-full bg-[var(--color-accent)] text-white shadow-glow shrink-0"
            >
              {isPlaying ? <Pause size={28} /> : <Play size={28} className="ml-0.5" />}
            </motion.button>
            <button
              onClick={next}
              aria-label="Next track"
              className={controlBtn}
            >
              <SkipForward size={22} />
            </button>
            <button
              onClick={cycleRepeat}
              aria-label={`Repeat: ${repeat}`}
              className={repeat !== "off" ? controlBtnActive : controlBtn}
            >
              {repeat === "one" ? <Repeat1 size={18} /> : <Repeat size={18} />}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
