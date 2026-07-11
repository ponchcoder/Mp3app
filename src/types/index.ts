/**
 * Core type definitions for Whisper Melody
 * All data structures used throughout the offline music player
 */

/** Supported theme variants */
export type ThemeMode = "light" | "dark" | "pink" | "pastel" | "nature";

/** Repeat modes for playback */
export type RepeatMode = "off" | "one" | "all";

/** Sort options for the music library */
export type SortField = "name" | "artist" | "dateAdded" | "duration";
export type SortDirection = "asc" | "desc";

/** Animated background environment types */
export type EnvironmentType = "cherry-blossom" | "night-sky";

/** A single song stored in IndexedDB */
export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  /** Raw MP3 file data as ArrayBuffer */
  audioData: ArrayBuffer;
  /** Album artwork as base64 data URL, or null */
  artwork: string | null;
  dateAdded: number;
  playCount: number;
  lastPlayed: number | null;
  /** User-defined custom name override */
  customTitle?: string;
}

/** Display-friendly song info (without heavy audio data) */
export interface SongMeta {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  artwork: string | null;
  dateAdded: number;
  playCount: number;
  lastPlayed: number | null;
  customTitle?: string;
}

/** A user-created playlist */
export interface Playlist {
  id: string;
  name: string;
  description: string;
  songIds: string[];
  artwork: string | null;
  dateCreated: number;
  dateModified: number;
  /** System-managed playlists (e.g. Favorites) cannot be deleted or edited manually */
  isSystem?: boolean;
}

/** Fixed ID for the auto-synced favorites playlist */
export const FAVORITES_PLAYLIST_ID = "__favorites__";

export function isSystemPlaylist(playlist: Pick<Playlist, "id" | "isSystem">): boolean {
  return playlist.isSystem === true || playlist.id === FAVORITES_PLAYLIST_ID;
}

/** Queue item referencing a song */
export interface QueueItem {
  songId: string;
  addedAt: number;
}

/** Persisted playback state */
export interface PlaybackState {
  currentSongId: string | null;
  currentTime: number;
  isPlaying: boolean;
  shuffle: boolean;
  repeat: RepeatMode;
  volume: number;
  queue: QueueItem[];
  queueIndex: number;
}

/** User settings persisted to IndexedDB */
export interface AppSettings {
  theme: ThemeMode;
  /** When true, disables all background particle animations */
  noAnimation: boolean;
  vinylMode: boolean;
  /** Recipient name for personalized greetings */
  recipientName: string;
  /** Current background environment */
  currentEnvironment: EnvironmentType;
  /** Last environment transition timestamp */
  lastEnvironmentChange: number;
}

/** Daily quote structure */
export interface DailyQuote {
  text: string;
  author?: string;
}

/** Audio analyzer data for reactive animations */
export interface AudioAnalysis {
  bass: number;
  mid: number;
  treble: number;
  overall: number;
  isPlaying: boolean;
}

/** Storage usage statistics */
export interface StorageStats {
  totalSongs: number;
  totalPlaylists: number;
  totalFavorites: number;
  estimatedSizeBytes: number;
}

/** Welcome message time periods */
export type TimeOfDay = "morning" | "afternoon" | "evening" | "night";

/** Navigation tab identifiers */
export type TabId = "home" | "library" | "playlists" | "player" | "settings";

/** Song upload result */
export interface UploadResult {
  success: boolean;
  song?: SongMeta;
  error?: string;
}
