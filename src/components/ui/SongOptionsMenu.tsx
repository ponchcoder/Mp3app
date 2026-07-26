"use client";

/**
 * Three-dot song options menu — add to playlist, rename, artwork, delete
 */

import { createPortal } from "react-dom";
import {
  MoreVertical,
  Trash2,
  Edit3,
  ImageIcon,
  ListMusic,
  Check,
} from "lucide-react";
import type { Playlist } from "@/types";
import { useState, useRef, useEffect, useCallback } from "react";
import { ImageCropModal } from "@/components/ui/ImageCropModal";

interface SongOptionsMenuProps {
  songId: string;
  playlists?: Playlist[];
  excludePlaylistId?: string;
  onAddToPlaylist?: (playlistId: string) => void;
  onDelete?: () => void;
  onRemove?: () => void;
  onRequestRename?: () => void;
  onSetArtwork?: (dataUrl: string) => void;
  buttonClassName?: string;
  iconSize?: number;
}

export function SongOptionsMenu({
  songId,
  playlists = [],
  excludePlaylistId,
  onAddToPlaylist,
  onDelete,
  onRemove,
  onRequestRename,
  onSetArtwork,
  buttonClassName = "p-1.5 rounded-full hover:bg-[var(--color-glass)] transition-colors",
  iconSize = 16,
}: SongOptionsMenuProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [showPlaylistPicker, setShowPlaylistPicker] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<DOMRect | null>(null);
  const [mounted, setMounted] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const artworkInputRef = useRef<HTMLInputElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  const addablePlaylists = playlists.filter((p) => p.id !== excludePlaylistId);

  const hasMenuOptions =
    !!onAddToPlaylist ||
    !!onDelete ||
    !!onRemove ||
    !!onRequestRename ||
    !!onSetArtwork;

  const closeMenu = useCallback(() => {
    setShowMenu(false);
    setShowPlaylistPicker(false);
    setMenuAnchor(null);
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!showMenu) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenu();
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [showMenu, closeMenu]);

  const toggleMenu = () => {
    if (showMenu) {
      closeMenu();
      return;
    }

    if (menuButtonRef.current) {
      setMenuAnchor(menuButtonRef.current.getBoundingClientRect());
    }
    setShowMenu(true);
    setShowPlaylistPicker(false);
  };

  if (!hasMenuOptions) return null;

  const menuContent = showMenu && menuAnchor && (
    <>
      <div
        className="fixed inset-0 z-[200]"
        onClick={closeMenu}
        aria-hidden="true"
      />
      <div
        className="fixed z-[201] py-1 bg-[var(--color-bg)] border border-[var(--color-card-border)] rounded-xl shadow-lg min-w-[160px] max-w-[220px]"
        style={{
          top: menuAnchor.bottom + 4,
          right: Math.max(8, window.innerWidth - menuAnchor.right),
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {showPlaylistPicker ? (
          <>
            <button
              type="button"
              onClick={() => setShowPlaylistPicker(false)}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)] border-b border-[var(--color-card-border)]"
            >
              ← Pick playlist
            </button>
            <div className="max-h-40 overflow-y-auto">
              {addablePlaylists.length > 0 ? (
                addablePlaylists.map((playlist) => {
                  const alreadyAdded = playlist.songIds.includes(songId);
                  return (
                    <button
                      key={playlist.id}
                      type="button"
                      disabled={alreadyAdded}
                      onClick={() => {
                        onAddToPlaylist?.(playlist.id);
                        closeMenu();
                      }}
                      className="flex items-center justify-between gap-2 w-full px-3 py-2 text-sm text-[var(--color-text)] hover:bg-[var(--color-bg-secondary)] disabled:opacity-50"
                    >
                      <span className="truncate">{playlist.name}</span>
                      {alreadyAdded && (
                        <Check size={14} className="text-[var(--color-accent)] shrink-0" />
                      )}
                    </button>
                  );
                })
              ) : (
                <p className="px-3 py-3 text-xs text-[var(--color-text-secondary)]">
                  No playlists yet
                </p>
              )}
            </div>
          </>
        ) : (
          <>
            {onAddToPlaylist && (
              <button
                type="button"
                onClick={() => setShowPlaylistPicker(true)}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[var(--color-text)] hover:bg-[var(--color-bg-secondary)]"
              >
                <ListMusic size={14} /> Add to Playlist
              </button>
            )}
            {onSetArtwork && (
              <button
                type="button"
                onClick={() => {
                  artworkInputRef.current?.click();
                  closeMenu();
                }}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[var(--color-text)] hover:bg-[var(--color-bg-secondary)]"
              >
                <ImageIcon size={14} /> Set Artwork
              </button>
            )}
            {onRequestRename && (
              <button
                type="button"
                onClick={() => {
                  onRequestRename();
                  closeMenu();
                }}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[var(--color-text)] hover:bg-[var(--color-bg-secondary)]"
              >
                <Edit3 size={14} /> Rename
              </button>
            )}
            {onRemove && (
              <button
                type="button"
                onClick={() => {
                  onRemove();
                  closeMenu();
                }}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[var(--color-text)] hover:bg-[var(--color-bg-secondary)]"
              >
                <Trash2 size={14} /> Remove from playlist
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={() => {
                  onDelete();
                  closeMenu();
                }}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-500 hover:bg-[var(--color-bg-secondary)]"
              >
                <Trash2 size={14} /> Delete
              </button>
            )}
          </>
        )}
      </div>
    </>
  );

  return (
    <>
      <button
        ref={menuButtonRef}
        type="button"
        onClick={toggleMenu}
        aria-label="More options"
        aria-expanded={showMenu}
        className={buttonClassName}
      >
        <MoreVertical size={iconSize} className="text-[var(--color-text-secondary)]" />
      </button>

      {onSetArtwork && (
        <input
          ref={artworkInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (file) {
              const { fileToDataURL } = await import("@/utils");
              const dataUrl = await fileToDataURL(file);
              setCropImageSrc(dataUrl);
            }
          }}
        />
      )}

      {mounted && cropImageSrc && onSetArtwork && (
        <ImageCropModal
          imageSrc={cropImageSrc}
          onCancel={() => setCropImageSrc(null)}
          onConfirm={(dataUrl) => {
            onSetArtwork(dataUrl);
            setCropImageSrc(null);
          }}
        />
      )}

      {mounted && menuContent && createPortal(menuContent, document.body)}
    </>
  );
}
