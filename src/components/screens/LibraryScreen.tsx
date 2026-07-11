"use client";

/**
 * Music library screen with upload, search, sort, and management
 */

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Search, SortAsc, Music } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { SongListItem } from "@/components/ui/SongListItem";
import { Button } from "@/components/ui/Button";
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
  const { playQueue, currentSong } = usePlayer();

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

  const handlePlaySong = (songId: string) => {
    const ids = displayedSongs.map((s) => s.id);
    playQueue(ids, ids.indexOf(songId));
  };

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
    <motion.div
      variants={staggerContainer}
      initial={false}
      animate="visible"
      className="px-4 pb-32 pt-6 space-y-4 max-w-lg mx-auto"
    >
      <motion.div variants={fadeInUp}>
        <h1 className="font-display text-2xl font-bold text-[var(--color-text)] mb-1">
          Your Library
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)]">
          {songs.length} {songs.length === 1 ? "song" : "songs"}
        </p>
      </motion.div>

      {/* Upload area */}
      <motion.div variants={fadeInUp}>
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          className={`
            relative rounded-3xl border-2 border-dashed p-8 text-center transition-colors
            ${isDragOver
              ? "border-[var(--color-accent)] bg-[var(--color-accent-light)]"
              : "border-[var(--color-card-border)] bg-[var(--color-glass)]"
            }
          `}
        >
          <Upload
            size={32}
            className="mx-auto mb-3 text-[var(--color-accent)] opacity-60"
          />
          <p className="text-[var(--color-text)] font-medium mb-1">
            Drop MP3 files here
          </p>
          <p className="text-sm text-[var(--color-text-secondary)] mb-4">
            or browse from your device
          </p>
          <Button size="sm" onClick={() => fileInputRef.current?.click()}>
            Browse Files
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/mpeg,audio/mp3,.mp3"
            multiple
            className="hidden"
            onChange={(e) => e.target.files && handleUpload(e.target.files)}
          />
        </div>

        {/* Upload progress */}
        <AnimatePresence>
          {uploadProgress && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3"
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
      </motion.div>

      {/* Search and sort */}
      {songs.length > 0 && (
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
                {searchQuery ? "No songs match your search" : "No songs yet"}
              </p>
            </div>
          )}
        </GlassCard>
      </motion.div>
    </motion.div>
  );
}
