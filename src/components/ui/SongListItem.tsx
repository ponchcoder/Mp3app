"use client";

/**
 * Song list item for library, queue, and playlists
 */

import { motion } from "framer-motion";
import { Play, Heart } from "lucide-react";
import { AlbumArt } from "@/components/ui/AlbumArt";
import { SongOptionsMenu } from "@/components/ui/SongOptionsMenu";
import { getDisplayTitle, getDisplayArtist, formatTime } from "@/utils";
import type { SongMeta, Playlist } from "@/types";
import { useState } from "react";

interface SongListItemProps {
  song: SongMeta;
  index?: number;
  isPlaying?: boolean;
  isFavorite?: boolean;
  onPlay: () => void;
  onToggleFavorite?: () => void;
  onDelete?: () => void;
  onRemove?: () => void;
  onRename?: (newName: string) => void;
  onSetArtwork?: (dataUrl: string) => void;
  playlists?: Playlist[];
  onAddToPlaylist?: (playlistId: string) => void;
  excludePlaylistId?: string;
  showActions?: boolean;
}

export function SongListItem({
  song,
  index,
  isPlaying = false,
  isFavorite = false,
  onPlay,
  onToggleFavorite,
  onDelete,
  onRemove,
  onRename,
  onSetArtwork,
  playlists = [],
  onAddToPlaylist,
  excludePlaylistId,
  showActions = true,
}: SongListItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(getDisplayTitle(song));

  const handleRename = () => {
    if (editName.trim() && onRename) {
      onRename(editName.trim());
      setIsEditing(false);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      className={`
        flex items-center gap-3 p-3 rounded-2xl transition-colors cursor-pointer group
        ${isPlaying ? "bg-[var(--color-accent-light)]" : "hover:bg-[var(--color-glass)]"}
      `}
      onClick={onPlay}
      role="button"
      tabIndex={0}
      aria-label={`Play ${getDisplayTitle(song)}`}
      onKeyDown={(e) => e.key === "Enter" && onPlay()}
    >
      <div className="w-8 text-center text-sm text-[var(--color-text-secondary)]">
        {isPlaying ? (
          <motion.div
            className="flex items-end justify-center gap-0.5 h-4"
            aria-label="Now playing"
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-0.5 bg-[var(--color-accent)] rounded-full"
                animate={{ height: ["4px", "16px", "4px"] }}
                transition={{ duration: 0.6, delay: i * 0.15, repeat: Infinity }}
              />
            ))}
          </motion.div>
        ) : (
          <span className="group-hover:hidden">{index !== undefined ? index + 1 : ""}</span>
        )}
        <Play
          size={14}
          className={`mx-auto hidden group-hover:block text-[var(--color-accent)] ${isPlaying ? "!hidden" : ""}`}
        />
      </div>

      <AlbumArt src={song.artwork} title={getDisplayTitle(song)} size="sm" />

      <div className="flex-1 min-w-0">
        {isEditing ? (
          <input
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onBlur={handleRename}
            onKeyDown={(e) => e.key === "Enter" && handleRename()}
            onClick={(e) => e.stopPropagation()}
            className="w-full bg-transparent border-b border-[var(--color-accent)] text-sm font-medium text-[var(--color-text)] outline-none"
            autoFocus
          />
        ) : (
          <>
            <p className="text-sm font-medium text-[var(--color-text)] truncate">
              {getDisplayTitle(song)}
            </p>
            <p className="text-xs text-[var(--color-text-secondary)] truncate">
              {getDisplayArtist(song)}
            </p>
          </>
        )}
      </div>

      <span className="text-xs text-[var(--color-text-secondary)] tabular-nums">
        {formatTime(song.duration)}
      </span>

      {showActions && (
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          {onToggleFavorite && (
            <button
              type="button"
              onClick={onToggleFavorite}
              aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
              className={`p-1.5 rounded-full transition-colors ${
                isFavorite ? "" : "hover:bg-[var(--color-glass)]"
              }`}
            >
              <Heart
                size={16}
                className={
                  isFavorite
                    ? "text-red-500 fill-red-500 stroke-red-500"
                    : "text-[var(--color-text-secondary)]"
                }
              />
            </button>
          )}

          <SongOptionsMenu
            songId={song.id}
            playlists={playlists}
            excludePlaylistId={excludePlaylistId}
            onAddToPlaylist={onAddToPlaylist}
            onDelete={onDelete}
            onRemove={onRemove}
            onRequestRename={onRename ? () => setIsEditing(true) : undefined}
            onSetArtwork={onSetArtwork}
          />
        </div>
      )}
    </motion.div>
  );
}
