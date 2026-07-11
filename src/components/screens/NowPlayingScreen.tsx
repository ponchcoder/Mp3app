"use client";

/**
 * Full-screen Now Playing view with album art, controls, and lyrics placeholder
 */

import { motion } from "framer-motion";
import { useState } from "react";
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
      className="fixed inset-0 z-50 flex flex-col"
    >
      {/* Blurred artwork background */}
      {artwork && (
        <div
          className="absolute inset-0 -z-10"
          style={{
            backgroundImage: `url(${artwork})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "blur(60px) brightness(0.6)",
            transform: "scale(1.2)",
          }}
          aria-hidden="true"
        />
      )}
      <div className="absolute inset-0 -z-10 bg-[var(--color-bg)]/80 backdrop-blur-sm" />

      {/* Header */}
      <div className="grid grid-cols-3 items-center px-4 pt-4 pb-2">
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
      <div className="flex-1 flex items-center justify-center px-8 py-4">
        {settings.vinylMode ? (
          <VinylRecord
            src={artwork}
            title={getDisplayTitle(currentSong)}
            isPlaying={isPlaying}
            size={288}
          />
        ) : (
          <AlbumArt
            src={artwork}
            title={getDisplayTitle(currentSong)}
            size="xl"
            className="!rounded-full"
          />
        )}
      </div>

      {/* Song info */}
      <div className="px-8 text-center mb-4">
        {isRenaming ? (
          <input
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onBlur={handleRename}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleRename();
              if (e.key === "Escape") setIsRenaming(false);
            }}
            className="w-full max-w-xs mx-auto text-center bg-transparent border-b border-[var(--color-accent)] font-display text-2xl font-bold text-[var(--color-text)] outline-none"
            autoFocus
          />
        ) : (
          <h2 className="font-display text-2xl font-bold text-[var(--color-text)] truncate">
            {displayTitle}
          </h2>
        )}
        <p className="text-[var(--color-text-secondary)] mt-1">
          {getDisplayArtist(currentSong)}
        </p>
      </div>

      {/* Progress */}
      <div className="px-8 mb-6">
        <ProgressBar
          currentTime={currentTime}
          duration={duration}
          onSeek={seek}
        />
      </div>

      {/* Controls — play/pause centered, others relative to it */}
      <div className="px-4 mb-8 pb-safe">
        <div className="grid grid-cols-3 items-center max-w-md mx-auto">
          <div className="flex items-center justify-end gap-3 pr-2">
            <button
              onClick={toggleShuffle}
              aria-label={shuffle ? "Disable shuffle" : "Enable shuffle"}
              className={`p-2 transition-colors ${
                shuffle ? "text-[var(--color-accent)]" : "text-[var(--color-text-secondary)]"
              }`}
            >
              <Shuffle size={20} />
            </button>
            <button
              onClick={previous}
              aria-label="Previous track"
              className="p-2 text-[var(--color-text)] hover:text-[var(--color-accent)] transition-colors"
            >
              <SkipBack size={26} />
            </button>
          </div>

          <div className="flex justify-center">
            <motion.button
              onClick={handleTogglePlay}
              aria-label={isPlaying ? "Pause" : "Play"}
              whileTap={{ scale: 0.9 }}
              className="p-5 rounded-full bg-[var(--color-accent)] text-white shadow-glow"
            >
              {isPlaying ? <Pause size={32} /> : <Play size={32} className="ml-1" />}
            </motion.button>
          </div>

          <div className="flex items-center justify-start gap-3 pl-2">
            <button
              onClick={next}
              aria-label="Next track"
              className="p-2 text-[var(--color-text)] hover:text-[var(--color-accent)] transition-colors"
            >
              <SkipForward size={26} />
            </button>
            <button
              onClick={cycleRepeat}
              aria-label={`Repeat: ${repeat}`}
              className={`p-2 transition-colors ${
                repeat !== "off" ? "text-[var(--color-accent)]" : "text-[var(--color-text-secondary)]"
              }`}
            >
              {repeat === "one" ? <Repeat1 size={20} /> : <Repeat size={20} />}
            </button>
            <button
              onClick={handleFavorite}
              aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
              className="p-2 transition-colors"
            >
              <Heart
                size={20}
                className={
                  isFav ? "text-blush-500 fill-blush-500" : "text-[var(--color-text-secondary)]"
                }
              />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
