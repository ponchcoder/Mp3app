"use client";

/**
 * Music library screen with upload, search, sort, and management
 */

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, SortAsc, Music, Play, Shuffle } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { SongListItem } from "@/components/ui/SongListItem";
import { useLibrary } from "@/contexts/LibraryContext";
import { usePlayer } from "@/contexts/PlayerContext";
import { fadeInUp, staggerContainer } from "@/animations/variants";
import { isSystemPlaylist } from "@/types";
import type { SortField, SortDirection } from "@/types";

export function LibraryScreen() {
  const {
    songs,
    uploadFiles,
    uploadProgress,
    removeSong,
    renameSong,
    setSongArtwork,
    isFavorite,
    toggleFavorite,
    search,
    sort,
    playlists,
    addToPlaylist,
  } = useLibrary();
  const { playQueue, currentSong, shuffle, toggleShuffle } = usePlayer();

  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("dateAdded");
  const [sortDir, setSortDir] = useState<SortDirection>("desc");
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const userPlaylists = playlists.filter((p) => !isSystemPlaylist(p));

  const displayedSongs = searchQuery
    ? search(searchQuery)
    : sort(sortField, sortDir);

  const handleUpload = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files);
      if (fileArray.length > 0) {
        await uploadFiles(fileArray);
      }
    },
    [uploadFiles]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      handleUpload(e.dataTransfer.files);
    },
    [handleUpload]
  );

  const songIds = displayedSongs.map((s) => s.id);

  const handlePlaySong = (songId: string) => {
    playQueue(songIds, songIds.indexOf(songId));
  };

  const handlePlayAll = () => {
    if (songIds.length === 0) return;
    if (shuffle) toggleShuffle();
    playQueue(songIds, 0);
  };

  const handleShuffleAll = () => {
    if (songIds.length === 0) return;
    if (!shuffle) toggleShuffle();
    playQueue(songIds, Math.floor(Math.random() * songIds.length));
  };

  const fabBottomClass = currentSong ? "bottom-[165px]" : "bottom-[88px]";

  const cycleSort = () => {
    const fields: SortField[] = ["name", "artist", "dateAdded", "duration"];
    const currentIdx = fields.indexOf(sortField);
    if (sortDir === "asc") {
      setSortDir("desc");
    } else {
      setSortField(fields[(currentIdx + 1) % fields.length]);
      setSortDir("asc");
    }
  };

  return (
    <>
    <motion.div
      variants={staggerContainer}
      initial={false}
      animate="visible"
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
      className={`px-4 pb-32 pt-6 space-y-4 max-w-lg mx-auto transition-colors ${
        isDragOver ? "bg-[var(--color-accent-light)]/30" : ""
      }`}
    >
      <motion.div variants={fadeInUp}>
        <h1 className="font-display text-2xl font-bold text-[var(--color-text)] mb-1">
          Your Library
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)]">
          {songs.length} {songs.length === 1 ? "song" : "songs"}
        </p>
      </motion.div>

      <AnimatePresence>
        {uploadProgress && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="h-2 bg-[var(--color-accent-light)] rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-[var(--color-accent)] rounded-full"
                animate={{
                  width: `${(uploadProgress.completed / uploadProgress.total) * 100}%`,
                }}
              />
            </div>
            <p className="text-xs text-[var(--color-text-secondary)] mt-1 text-center">
              Uploading {uploadProgress.completed} of {uploadProgress.total}...
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search and sort */}
      {songs.length > 0 && (
        <>
          <motion.div variants={fadeInUp} className="flex gap-2">
            <div className="flex-1 relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]"
              />
              <input
                type="search"
                placeholder="Search songs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search songs"
                className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-[var(--color-glass)] border border-[var(--color-card-border)] text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-secondary)] outline-none focus:border-[var(--color-accent)]"
              />
            </div>
            <button
              onClick={cycleSort}
              aria-label={`Sort by ${sortField}`}
              className="p-2.5 rounded-2xl bg-[var(--color-glass)] border border-[var(--color-card-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-accent)]"
            >
              <SortAsc size={18} />
            </button>
          </motion.div>

          {displayedSongs.length > 0 && (
            <motion.div variants={fadeInUp}>
              <GlassCard padding="sm" className="!p-1.5">
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={handlePlayAll}
                    className="inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[var(--color-accent)] text-white text-sm font-semibold"
                  >
                    <Play size={16} className="fill-white shrink-0" />
                    <span>Play</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleShuffleAll}
                    aria-label="Shuffle play"
                    className="inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[var(--color-accent-light)] text-[var(--color-text)] text-sm font-semibold"
                  >
                    <Shuffle size={16} className="shrink-0" />
                    <span>Shuffle</span>
                  </button>
                </div>
              </GlassCard>
            </motion.div>
          )}
        </>
      )}

      {/* Song list */}
      <motion.div variants={fadeInUp}>
        <GlassCard padding="sm">
          {displayedSongs.length > 0 ? (
            displayedSongs.map((song, i) => (
              <SongListItem
                key={song.id}
                song={song}
                index={i}
                isPlaying={currentSong?.id === song.id}
                isFavorite={isFavorite(song.id)}
                onPlay={() => handlePlaySong(song.id)}
                onToggleFavorite={() => toggleFavorite(song.id)}
                onDelete={() => removeSong(song.id)}
                onRename={(name) => renameSong(song.id, name)}
                onSetArtwork={(artwork) => setSongArtwork(song.id, artwork)}
                playlists={userPlaylists}
                onAddToPlaylist={(playlistId) => addToPlaylist(playlistId, song.id)}
              />
            ))
          ) : (
            <div className="text-center py-8">
              <Music
                size={40}
                className="mx-auto mb-3 text-[var(--color-text-secondary)] opacity-40"
              />
              <p className="text-[var(--color-text-secondary)]">
                {searchQuery
                  ? "No songs match your search"
                  : "No songs yet — tap Add Songs to get started"}
              </p>
            </div>
          )}
        </GlassCard>
      </motion.div>
    </motion.div>

    <button
      type="button"
      onClick={() => fileInputRef.current?.click()}
      aria-label="Add songs"
      className={`fixed right-4 z-40 flex items-center gap-2 px-5 py-3.5 rounded-full bg-[var(--color-accent)] text-white text-sm font-semibold shadow-glow transition-all ${fabBottomClass}`}
    >
      <Plus size={20} />
      Add Songs
    </button>
    <input
      ref={fileInputRef}
      type="file"
      accept="audio/mpeg,audio/mp3,.mp3"
      multiple
      className="hidden"
      onChange={(e) => e.target.files && handleUpload(e.target.files)}
    />
    </>
  );
}
