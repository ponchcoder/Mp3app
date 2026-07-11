"use client";

/**
 * Pick songs from the uploaded library to add to a playlist.
 * Already-added songs are shown as selected and cannot be duplicated.
 */

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search, X, Check, Plus } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { AlbumArt } from "@/components/ui/AlbumArt";
import { useLibrary } from "@/contexts/LibraryContext";
import { getDisplayTitle, getDisplayArtist } from "@/utils";

interface AddSongsPanelProps {
  playlistId: string;
  playlistSongIds: string[];
  onClose: () => void;
}

export function AddSongsPanel({
  playlistId,
  playlistSongIds,
  onClose,
}: AddSongsPanelProps) {
  const { songs, search, addManyToPlaylist } = useLibrary();
  const [query, setQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isAdding, setIsAdding] = useState(false);

  const inPlaylist = useMemo(
    () => new Set(playlistSongIds),
    [playlistSongIds]
  );

  const displayedSongs = query.trim() ? search(query) : songs;

  const toggleSong = (songId: string) => {
    if (inPlaylist.has(songId)) return;

    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(songId)) {
        next.delete(songId);
      } else {
        next.add(songId);
      }
      return next;
    });
  };

  const handleAdd = async () => {
    if (selectedIds.size === 0) return;

    setIsAdding(true);
    await addManyToPlaylist(playlistId, Array.from(selectedIds));
    setIsAdding(false);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 24 }}
      className="fixed inset-0 z-[60] flex flex-col bg-[var(--color-bg)]/95 backdrop-blur-md"
    >
      <div className="px-4 pt-6 pb-3 max-w-lg mx-auto w-full">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl font-bold text-[var(--color-text)]">
            Add Songs
          </h2>
          <button
            onClick={onClose}
            aria-label="Close add songs"
            className="p-2 rounded-full hover:bg-[var(--color-glass)] transition-colors"
          >
            <X size={20} className="text-[var(--color-text)]" />
          </button>
        </div>

        <p className="text-sm text-[var(--color-text-secondary)] mb-3">
          Pick from your library. Songs already in this playlist are marked and
          won&apos;t be added twice.
        </p>

        <div className="relative mb-3">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]"
          />
          <input
            type="search"
            placeholder="Search your library..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search library"
            className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-[var(--color-glass)] border border-[var(--color-card-border)] text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-secondary)] outline-none focus:border-[var(--color-accent)]"
            autoFocus
          />
        </div>

        <Button
          size="sm"
          className="w-full"
          disabled={selectedIds.size === 0 || isAdding}
          onClick={handleAdd}
        >
          <Plus size={16} className="mr-1" />
          {isAdding
            ? "Adding..."
            : selectedIds.size > 0
              ? `Add ${selectedIds.size} song${selectedIds.size === 1 ? "" : "s"}`
              : "Select songs to add"}
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-8 max-w-lg mx-auto w-full">
        <GlassCard padding="sm">
          {displayedSongs.length > 0 ? (
            displayedSongs.map((song) => {
              const alreadyAdded = inPlaylist.has(song.id);
              const isSelected = selectedIds.has(song.id);

              return (
                <button
                  key={song.id}
                  type="button"
                  onClick={() => toggleSong(song.id)}
                  disabled={alreadyAdded}
                  className={`
                    flex items-center gap-3 w-full p-3 rounded-2xl text-left transition-colors
                    ${alreadyAdded
                      ? "opacity-70 cursor-default"
                      : isSelected
                        ? "bg-[var(--color-accent-light)]"
                        : "hover:bg-[var(--color-glass)]"
                    }
                  `}
                >
                  <div
                    className={`
                      w-6 h-6 rounded-full border flex items-center justify-center shrink-0
                      ${alreadyAdded
                        ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-white"
                        : isSelected
                          ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-white"
                          : "border-[var(--color-card-border)]"
                      }
                    `}
                  >
                    {(alreadyAdded || isSelected) && <Check size={14} />}
                  </div>

                  <AlbumArt
                    src={song.artwork}
                    title={getDisplayTitle(song)}
                    size="sm"
                  />

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--color-text)] truncate">
                      {getDisplayTitle(song)}
                    </p>
                    <p className="text-xs text-[var(--color-text-secondary)] truncate">
                      {alreadyAdded
                        ? "Already in playlist"
                        : getDisplayArtist(song)}
                    </p>
                  </div>
                </button>
              );
            })
          ) : (
            <p className="text-center py-10 text-[var(--color-text-secondary)]">
              {query
                ? "No songs match your search"
                : "Upload MP3s in Your Library first"}
            </p>
          )}
        </GlassCard>
      </div>
    </motion.div>
  );
}
