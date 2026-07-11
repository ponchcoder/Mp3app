"use client";

/**
 * Playlists management screen
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, ListMusic, Play, Trash2, Shuffle, Heart } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { SongListItem } from "@/components/ui/SongListItem";
import { AddSongsPanel } from "@/components/ui/AddSongsPanel";
import { useLibrary } from "@/contexts/LibraryContext";
import { usePlayer } from "@/contexts/PlayerContext";
import { fadeInUp, staggerContainer } from "@/animations/variants";
import { isSystemPlaylist } from "@/types";

export function PlaylistsScreen() {
  const {
    playlists,
    songs,
    createPlaylist,
    removePlaylist,
    removeFromPlaylist,
    removeSong,
    addToPlaylist,
    isFavorite,
    toggleFavorite,
  } = useLibrary();
  const { playQueue, currentSong, shuffle, toggleShuffle } = usePlayer();

  const [selectedPlaylist, setSelectedPlaylist] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [showAddSongs, setShowAddSongs] = useState(false);

  const handleCreate = async () => {
    if (newName.trim()) {
      const playlist = await createPlaylist(newName.trim());
      setNewName("");
      setIsCreating(false);
      setSelectedPlaylist(playlist.id);
    }
  };

  const handleDeleteRequest = (id: string) => {
    setPendingDeleteId(id);
  };

  const handleDeleteConfirm = async (id: string) => {
    await removePlaylist(id);
    setPendingDeleteId(null);
    if (selectedPlaylist === id) {
      setSelectedPlaylist(null);
    }
  };

  const handleDeleteCancel = () => {
    setPendingDeleteId(null);
  };

  const handlePlay = () => {
    if (!selected || selected.songIds.length === 0) return;
    if (shuffle) toggleShuffle();
    playQueue(selected.songIds, 0);
  };

  const handleShufflePlay = () => {
    if (!selected || selected.songIds.length === 0) return;
    if (!shuffle) toggleShuffle();
    const start = Math.floor(Math.random() * selected.songIds.length);
    playQueue(selected.songIds, start);
  };

  const selected = playlists.find((p) => p.id === selectedPlaylist);
  const isSelectedSystem = selected ? isSystemPlaylist(selected) : false;
  const sortedPlaylists = [...playlists].sort((a, b) => {
    if (isSystemPlaylist(a)) return -1;
    if (isSystemPlaylist(b)) return 1;
    return b.dateModified - a.dateModified;
  });
  const playlistSongs = selected
    ? selected.songIds
        .map((id) => songs.find((s) => s.id === id))
        .filter((s): s is NonNullable<typeof s> => s !== undefined)
    : [];

  const fabBottomClass = currentSong ? "bottom-[165px]" : "bottom-[88px]";
  const userPlaylists = playlists.filter((p) => !isSystemPlaylist(p));

  if (selected) {
    return (
      <>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="px-4 pb-32 pt-6 max-w-lg mx-auto"
        >
        <button
          onClick={() => setSelectedPlaylist(null)}
          className="text-[var(--color-accent)] text-sm mb-4 hover:underline"
        >
          ← Back to Playlists
        </button>

        <div className="flex items-start justify-between gap-3 mb-1">
          <h1 className="font-display text-2xl font-bold text-[var(--color-text)]">
            {selected.name}
          </h1>
          {!isSelectedSystem && (
            <button
              onClick={() => handleDeleteRequest(selected.id)}
              aria-label="Delete playlist"
              className="p-2 rounded-full text-red-400 hover:bg-red-400/10 transition-colors shrink-0"
            >
              <Trash2 size={18} />
            </button>
          )}
        </div>
        <p className="text-sm text-[var(--color-text-secondary)] mb-4">
          {isSelectedSystem
            ? "Songs you like are added here automatically"
            : `${playlistSongs.length} songs`}
        </p>

        {pendingDeleteId === selected.id && (
          <GlassCard className="mb-4 text-center space-y-3">
            <p className="text-sm text-red-500">
              Delete &ldquo;{selected.name}&rdquo;? This can&apos;t be undone.
            </p>
            <div className="flex gap-2">
              <Button
                variant="danger"
                size="sm"
                className="flex-1"
                onClick={() => handleDeleteConfirm(selected.id)}
              >
                Delete
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="flex-1"
                onClick={handleDeleteCancel}
              >
                Cancel
              </Button>
            </div>
          </GlassCard>
        )}

        {playlistSongs.length > 0 && (
          <GlassCard padding="sm" className="mb-4 !p-1.5">
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={handlePlay}
                className="inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[var(--color-accent)] text-white text-sm font-semibold"
              >
                <Play size={16} className="fill-white shrink-0" />
                <span>Play</span>
              </button>
              <button
                type="button"
                onClick={handleShufflePlay}
                aria-label="Shuffle play"
                className="inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[var(--color-accent-light)] text-[var(--color-text)] text-sm font-semibold"
              >
                <Shuffle size={16} className="shrink-0" />
                <span>Shuffle</span>
              </button>
            </div>
          </GlassCard>
        )}

        <GlassCard padding="sm">
          {playlistSongs.length > 0 ? (
            playlistSongs.map((song, i) =>
              song ? (
                <SongListItem
                  key={song.id}
                  song={song}
                  index={i}
                  isPlaying={currentSong?.id === song.id}
                  isFavorite={isFavorite(song.id)}
                  onPlay={() => playQueue(selected.songIds, i)}
                  onToggleFavorite={() => toggleFavorite(song.id)}
                  onRemove={() => removeFromPlaylist(selected.id, song.id)}
                  onDelete={() => removeSong(song.id)}
                  playlists={userPlaylists}
                  excludePlaylistId={selected.id}
                  onAddToPlaylist={(playlistId) => addToPlaylist(playlistId, song.id)}
                />
              ) : null
            )
          ) : (
            <p className="text-center py-8 text-[var(--color-text-secondary)]">
              {isSelectedSystem
                ? "Like songs with the heart to add them here"
                : "This playlist is empty"}
            </p>
          )}
        </GlassCard>
        </motion.div>

        {!isSelectedSystem && (
          <button
            type="button"
            onClick={() => setShowAddSongs(true)}
            aria-label="Add songs to playlist"
            className={`fixed right-4 z-40 p-4 rounded-full bg-[var(--color-accent)] text-white shadow-glow transition-all ${fabBottomClass}`}
          >
            <Plus size={22} />
          </button>
        )}

        <AnimatePresence>
          {showAddSongs && (
            <AddSongsPanel
              playlistId={selected.id}
              playlistSongIds={selected.songIds}
              onClose={() => setShowAddSongs(false)}
            />
          )}
        </AnimatePresence>
      </>
    );
  }

  return (
    <>
    <motion.div
      variants={staggerContainer}
      initial={false}
      animate="visible"
      className="px-4 pb-32 pt-6 space-y-4 max-w-lg mx-auto"
    >
      <motion.div variants={fadeInUp}>
        <h1 className="font-display text-2xl font-bold text-[var(--color-text)]">
          Playlists
        </h1>
      </motion.div>

      {/* Create playlist form */}
      <AnimatePresence>
        {isCreating && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <GlassCard className="flex gap-2 items-center">
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Playlist name..."
                className="flex-1 bg-transparent text-[var(--color-text)] outline-none placeholder:text-[var(--color-text-secondary)]"
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              />
              <Button size="sm" onClick={handleCreate}>
                Create
              </Button>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Playlist grid */}
      {sortedPlaylists.length > 0 ? (
        <div className="grid grid-cols-2 gap-3">
          {sortedPlaylists.map((playlist) => {
            const isSystem = isSystemPlaylist(playlist);

            return (
            <motion.div key={playlist.id} variants={fadeInUp}>
              {pendingDeleteId === playlist.id ? (
                <GlassCard className="space-y-3">
                  <p className="text-sm text-red-500 text-center">
                    Delete &ldquo;{playlist.name}&rdquo;?
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="danger"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleDeleteConfirm(playlist.id)}
                    >
                      Delete
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-1"
                      onClick={handleDeleteCancel}
                    >
                      Cancel
                    </Button>
                  </div>
                </GlassCard>
              ) : (
                <GlassCard
                  hover
                  onClick={() => setSelectedPlaylist(playlist.id)}
                  className="relative"
                >
                  {isSystem ? (
                    <Heart
                      size={32}
                      className="text-blush-500 mb-2 opacity-80 fill-blush-500"
                    />
                  ) : (
                    <ListMusic
                      size={32}
                      className="text-[var(--color-accent)] mb-2 opacity-60"
                    />
                  )}
                  <p className="font-medium text-[var(--color-text)] truncate pr-8">
                    {playlist.name}
                  </p>
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    {playlist.songIds.length} songs
                  </p>
                  {!isSystem && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteRequest(playlist.id);
                      }}
                      aria-label="Delete playlist"
                      className="absolute top-2 right-2 p-2 rounded-full text-red-400/80 hover:text-red-500 hover:bg-red-400/10 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </GlassCard>
              )}
            </motion.div>
            );
          })}
        </div>
      ) : (
        <motion.div variants={fadeInUp} className="text-center py-16">
          <ListMusic
            size={48}
            className="mx-auto mb-4 text-[var(--color-text-secondary)] opacity-30"
          />
          <p className="text-[var(--color-text-secondary)]">
            No playlists yet. Create one to organize your music!
          </p>
        </motion.div>
      )}
    </motion.div>

    <button
      type="button"
      onClick={() => setIsCreating(true)}
      aria-label="New playlist"
      className={`fixed right-4 z-40 p-4 rounded-full bg-[var(--color-accent)] text-white shadow-glow transition-all ${fabBottomClass}`}
    >
      <Plus size={22} />
    </button>
    </>
  );
}
