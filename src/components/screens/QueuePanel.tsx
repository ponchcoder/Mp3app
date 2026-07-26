"use client";

/**
 * Queue panel — view, reorder, remove, shuffle, or clear the play queue.
 */

import { useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { X, Trash2, GripVertical, Shuffle } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { AlbumArt } from "@/components/ui/AlbumArt";
import { usePlayer } from "@/contexts/PlayerContext";
import { useLibrary } from "@/contexts/LibraryContext";
import {
  useQueueDragReorder,
  getItemVisualIndex,
  getGapVisualIndex,
} from "@/hooks/useQueueDragReorder";
import { getDisplayTitle, getDisplayArtist } from "@/utils";
import type { SongMeta } from "@/types";
import type { QueueItem } from "@/types";

function QueueRowContent({ song }: { song: SongMeta }) {
  return (
    <>
      <div className="p-2 -ml-1 shrink-0 text-[var(--color-text-secondary)] opacity-60">
        <GripVertical size={18} />
      </div>
      <div className="flex items-center gap-3 flex-1 min-w-0 py-1">
        <AlbumArt src={song.artwork} title={getDisplayTitle(song)} size="sm" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[var(--color-text)] truncate">
            {getDisplayTitle(song)}
          </p>
          <p className="text-xs text-[var(--color-text-secondary)] truncate">
            {getDisplayArtist(song)}
          </p>
        </div>
      </div>
      <div className="p-2 shrink-0 opacity-30">
        <X size={14} />
      </div>
    </>
  );
}

interface QueuePanelProps {
  onClose: () => void;
  onClear: () => void;
}

export function QueuePanel({ onClose, onClear }: QueuePanelProps) {
  const {
    queue,
    queueIndex,
    queueShuffled,
    playSong,
    removeFromQueue,
    reorderQueue,
    toggleQueueShuffle,
  } = usePlayer();
  const { songs } = useLibrary();
  const listRef = useRef<HTMLDivElement>(null);

  const canReorder = !queueShuffled && queue.length > 1;
  const { dragIndex, overIndex, ghost, rowHeight, startDrag } = useQueueDragReorder(
    useCallback(
      (from, to) => {
        reorderQueue(from, to);
      },
      [reorderQueue]
    ),
    !canReorder,
    listRef,
    queue.length
  );

  const getSongMeta = (songId: string) => songs.find((s) => s.id === songId);
  const draggedSong =
    dragIndex !== null ? getSongMeta(queue[dragIndex]?.songId ?? "") : null;

  const dropTarget = overIndex ?? dragIndex ?? 0;
  const isDragging = dragIndex !== null;
  const gapVisualIndex = isDragging ? getGapVisualIndex(dropTarget) : -1;

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-[var(--color-bg)]/95 backdrop-blur-xl">
      <div className="flex items-center justify-between px-4 pt-4 pb-2 gap-2">
        <h2 className="font-display text-xl font-bold text-[var(--color-text)] shrink-0">
          Queue
        </h2>
        <div className="flex items-center gap-1 sm:gap-2 min-w-0">
          {queue.length > 1 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleQueueShuffle}
              className={
                queueShuffled
                  ? "text-[var(--color-accent)] shrink-0"
                  : "shrink-0"
              }
              aria-pressed={queueShuffled}
            >
              <Shuffle size={16} className="mr-1 shrink-0" />
              {queueShuffled ? "Original" : "Shuffle"}
            </Button>
          )}
          {queue.length > 0 && (
            <Button variant="ghost" size="sm" onClick={onClear} className="shrink-0">
              <Trash2 size={16} className="mr-1" /> Clear
            </Button>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close queue"
            className="p-2 rounded-full hover:bg-[var(--color-glass)] shrink-0"
          >
            <X size={20} className="text-[var(--color-text)]" />
          </button>
        </div>
      </div>

      {queueShuffled && queue.length > 0 && (
        <p className="px-4 pb-2 text-xs text-[var(--color-text-secondary)]">
          Shuffled — tap Original to restore the previous order
        </p>
      )}

      {!queueShuffled && queue.length > 1 && (
        <p className="px-4 pb-2 text-xs text-[var(--color-text-secondary)]">
          Hold and drag the handle to reorder
        </p>
      )}

      <div
        data-queue-scroll
        className={`flex-1 overflow-y-auto px-4 pb-8 ${isDragging ? "select-none touch-none" : ""}`}
      >
        {queue.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-[var(--color-text-secondary)]">Queue is empty</p>
            <p className="text-sm text-[var(--color-text-secondary)] mt-1 opacity-60">
              Play a song to start your queue
            </p>
          </div>
        ) : (
          <GlassCard padding="sm">
            <div
              ref={listRef}
              className="relative"
              style={isDragging ? { height: queue.length * rowHeight } : undefined}
            >
              {isDragging &&
                Array.from({ length: queue.length }, (_, slot) => (
                  <div
                    key={`drop-slot-${slot}`}
                    data-queue-drop-slot={slot}
                    className="absolute left-0 right-0 z-0"
                    style={{
                      top: slot * rowHeight,
                      height: rowHeight,
                    }}
                    aria-hidden="true"
                  />
                ))}

              {isDragging && gapVisualIndex >= 0 && (
                <div
                  className="absolute left-0 right-0 z-[1] rounded-xl border-2 border-dashed border-[var(--color-accent)] bg-[var(--color-accent-light)]/40 pointer-events-none"
                  style={{
                    height: rowHeight,
                    top: gapVisualIndex * rowHeight,
                    transition: "top 180ms ease",
                  }}
                  aria-hidden="true"
                />
              )}

              {queue.map((item, index) => {
                const song = getSongMeta(item.songId);
                if (!song) return null;

                const isCurrent = index === queueIndex;
                const isDraggedRow = dragIndex === index;

                if (isDraggedRow && isDragging) return null;

                const visualIndex =
                  isDragging && dragIndex !== null
                    ? getItemVisualIndex(index, dragIndex, dropTarget)
                    : index;

                return (
                  <div
                    key={`${item.songId}-${item.addedAt}`}
                    data-queue-row
                    className={`
                      flex items-center gap-2 p-2 rounded-xl z-10
                      ${isDragging ? "absolute left-0 right-0 pointer-events-none" : "relative"}
                      ${isCurrent ? "bg-[var(--color-accent-light)]" : "hover:bg-[var(--color-glass)]"}
                    `}
                    style={
                      isDragging
                        ? {
                            top: visualIndex * rowHeight,
                            height: rowHeight,
                            transition: "top 180ms ease",
                          }
                        : undefined
                    }
                  >
                    {canReorder ? (
                      <button
                        type="button"
                        onPointerDown={(e) => startDrag(index, e)}
                        aria-label="Drag to reorder"
                        className={`touch-none p-2 -ml-1 rounded-lg text-[var(--color-text-secondary)] opacity-60 active:opacity-100 active:text-[var(--color-accent)] cursor-grab active:cursor-grabbing shrink-0 ${isDragging ? "pointer-events-auto" : ""}`}
                      >
                        <GripVertical size={18} />
                      </button>
                    ) : (
                      <div className="w-9 shrink-0" aria-hidden="true" />
                    )}

                    <button
                      type="button"
                      onClick={() => playSong(item.songId)}
                      className="flex items-center gap-3 flex-1 min-w-0 text-left"
                    >
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
                          {getDisplayArtist(song)}
                        </p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => removeFromQueue(index)}
                      aria-label="Remove from queue"
                      className="p-2 rounded-full hover:bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] hover:text-red-500 shrink-0"
                    >
                      <X size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          </GlassCard>
        )}
      </div>

      {ghost &&
        draggedSong &&
        createPortal(
          <div
            className="fixed z-[80] pointer-events-none flex items-center gap-2 p-2 rounded-xl bg-[var(--color-bg)] border border-[var(--color-accent)] shadow-[0_12px_40px_var(--color-shadow)] scale-[1.03] opacity-95"
            style={{
              left: ghost.pointerX - ghost.offsetX,
              top: ghost.pointerY - ghost.offsetY,
              width: ghost.width,
            }}
            aria-hidden="true"
          >
            <QueueRowContent song={draggedSong} />
          </div>,
          document.body
        )}
    </div>
  );
}
