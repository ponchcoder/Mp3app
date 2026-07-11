/**
 * Utility functions for Whisper Melody
 */

import type { SongMeta, SortField, SortDirection, TimeOfDay } from "@/types";

/** Detect phones/tablets where Web Audio breaks background playback */
export function isMobileDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  if (/Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(ua)) {
    return true;
  }
  return navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
}

/** Format seconds into mm:ss display */
export function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

/** Format bytes into human-readable size */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}

/** Get display title for a song (custom title takes priority) */
export function getDisplayTitle(song: SongMeta): string {
  return song.customTitle || song.title;
}

/** Get display artist, with fallback */
export function getDisplayArtist(song: SongMeta): string {
  return song.artist || "Unknown Artist";
}

/** Determine time of day for greeting messages */
export function getTimeOfDay(): TimeOfDay {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 21) return "evening";
  return "night";
}

/** Sort songs by the given field and direction */
export function sortSongs(
  songs: SongMeta[],
  field: SortField,
  direction: SortDirection
): SongMeta[] {
  const sorted = [...songs].sort((a, b) => {
    let comparison = 0;
    switch (field) {
      case "name":
        comparison = getDisplayTitle(a).localeCompare(getDisplayTitle(b));
        break;
      case "artist":
        comparison = getDisplayArtist(a).localeCompare(getDisplayArtist(b));
        break;
      case "dateAdded":
        comparison = a.dateAdded - b.dateAdded;
        break;
      case "duration":
        comparison = a.duration - b.duration;
        break;
    }
    return direction === "asc" ? comparison : -comparison;
  });
  return sorted;
}

/** Search songs by title, artist, or album */
export function searchSongs(songs: SongMeta[], query: string): SongMeta[] {
  const lower = query.toLowerCase().trim();
  if (!lower) return songs;
  return songs.filter(
    (s) =>
      getDisplayTitle(s).toLowerCase().includes(lower) ||
      getDisplayArtist(s).toLowerCase().includes(lower) ||
      s.album.toLowerCase().includes(lower)
  );
}

/** Shuffle an array using Fisher-Yates algorithm */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/** Pick a random item from an array */
export function randomPick<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

/** Clamp a number between min and max */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** Debounce a function call */
export function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/** Convert a File to ArrayBuffer */
export function fileToArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(file);
  });
}

/** Convert a File to base64 data URL */
export function fileToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

/** Generate a unique ID */
export function generateId(): string {
  return crypto.randomUUID();
}

/** Check if the device prefers reduced motion */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Create an object URL from audio data for playback */
export function createAudioURL(audioData: ArrayBuffer, mimeType = "audio/mpeg"): string {
  const blob = new Blob([audioData], { type: mimeType });
  return URL.createObjectURL(blob);
}

/** Revoke an object URL to free memory */
export function revokeAudioURL(url: string): void {
  URL.revokeObjectURL(url);
}
