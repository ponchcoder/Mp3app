"use client";

/**
 * Queue panel — view, reorder, remove, or clear the play queue.
 */

import { X, Trash2, GripVertical } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { AlbumArt } from "@/components/ui/AlbumArt";
import { usePlayer } from "@/contexts/PlayerContext";
import { useLibrary } from "@/contexts/LibraryContext";
import { getDisplayTitle, getDisplayArtist } from "@/utils";

interface QueuePanelProps {
  onClose: () => void;
  onClear: () => void;
}

export function QueuePanel({ onClose, onClear }: QueuePanelProps) {
  const { queue, queueIndex, playSong, removeFromQueue, reorderQueue } =
    usePlayer();
  const { songs } = useLibrary();

  const getSongMeta = (songId: string) => songs.find((s) => s.id === songId);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData("text/plain", String(index));
  };

  const handleDrop = (e: React.DragEvent, toIndex: number) => {
    e.preventDefault();
    const fromIndex = parseInt(e.dataTransfer.getData("text/plain"), 10);
    if (!Number.isNaN(fromIndex) && fromIndex !== toIndex) {
      reorderQueue(fromIndex, toIndex);
    }
  };

  const handleClear = () => {
    onClear();
  };

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-[var(--color-bg)]/95 backdrop-blur-xl">
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <h2 className="font-display text-xl font-bold text-[var(--color-text)]">
          Queue
        </h2>
        <div className="flex items-center gap-2">
          {queue.length > 0 && (
            <Button variant="ghost" size="sm" onClick={handleClear}>
              <Trash2 size={16} className="mr-1" /> Clear
            </Button>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close queue"
            className="p-2 rounded-full hover:bg-[var(--color-glass)]"
          >
            <X size={20} className="text-[var(--color-text)]" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-8">
        {queue.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-[var(--color-text-secondary)]">Queue is empty</p>
            <p className="text-sm text-[var(--color-text-secondary)] mt-1 opacity-60">
              Play a song to start your queue
            </p>
          </div>
        ) : (
          <GlassCard padding="sm">
            {queue.map((item, index) => {
              const song = getSongMeta(item.songId);
              if (!song) return null;
              const isCurrent = index === queueIndex;

              return (
                <div
                  key={`${item.songId}-${index}`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleDrop(e, index)}
                  className={`
                    flex items-center gap-2 p-2 rounded-xl transition-colors
                    ${isCurrent ? "bg-[var(--color-accent-light)]" : "hover:bg-[var(--color-glass)]"}
                  `}
                >
                  <GripVertical
                    size={16}
                    className="text-[var(--color-text-secondary)] opacity-40 cursor-grab shrink-0"
                  />

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
                    className="p-1.5 rounded-full hover:bg-red-100 text-[var(--color-text-secondary)] hover:text-red-500 shrink-0"
                  >
                    <X size={14} />
                  </button>
                </div>
              );
            })}
          </GlassCard>
        )}
      </div>
    </div>
  );
}
