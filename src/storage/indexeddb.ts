/**
 * IndexedDB storage layer for Whisper Melody
 * Handles all persistent data: songs, playlists, favorites, settings, queue
 */

import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type {
  Song,
  SongMeta,
  Playlist,
  PlaybackState,
  AppSettings,
  StorageStats,
} from "@/types";
import { FAVORITES_PLAYLIST_ID } from "@/types";
import { normalizeEnvironment } from "@/hooks/useEnvironment";

const DB_NAME = "whisper-melody";
const DB_VERSION = 1;

/** IndexedDB schema definition */
interface WhisperMelodyDB extends DBSchema {
  songs: {
    key: string;
    value: Song;
    indexes: {
      "by-title": string;
      "by-artist": string;
      "by-dateAdded": number;
      "by-playCount": number;
      "by-lastPlayed": number;
    };
  };
  playlists: {
    key: string;
    value: Playlist;
  };
  favorites: {
    key: string;
    value: { songId: string; addedAt: number };
  };
  settings: {
    key: string;
    value: AppSettings & { key: string };
  };
  playback: {
    key: string;
    value: PlaybackState & { key: string };
  };
}

let dbInstance: IDBPDatabase<WhisperMelodyDB> | null = null;

/** Default application settings */
export const DEFAULT_SETTINGS: AppSettings = {
  theme: "pink",
  noAnimation: false,
  vinylMode: false,
  recipientName: "Mia",
  currentEnvironment: "cherry-blossom",
  lastEnvironmentChange: Date.now(),
};

/** Default playback state */
export const DEFAULT_PLAYBACK: PlaybackState = {
  currentSongId: null,
  currentTime: 0,
  isPlaying: false,
  shuffle: false,
  repeat: "off",
  volume: 0.8,
  queue: [],
  queueIndex: -1,
};

/**
 * Initialize and return the IndexedDB database instance.
 * Creates object stores and indexes on first open.
 */
export async function getDB(): Promise<IDBPDatabase<WhisperMelodyDB>> {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB<WhisperMelodyDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Songs store with indexes for sorting/searching
      if (!db.objectStoreNames.contains("songs")) {
        const songStore = db.createObjectStore("songs", { keyPath: "id" });
        songStore.createIndex("by-title", "title");
        songStore.createIndex("by-artist", "artist");
        songStore.createIndex("by-dateAdded", "dateAdded");
        songStore.createIndex("by-playCount", "playCount");
        songStore.createIndex("by-lastPlayed", "lastPlayed");
      }

      if (!db.objectStoreNames.contains("playlists")) {
        db.createObjectStore("playlists", { keyPath: "id" });
      }

      if (!db.objectStoreNames.contains("favorites")) {
        db.createObjectStore("favorites", { keyPath: "songId" });
      }

      if (!db.objectStoreNames.contains("settings")) {
        db.createObjectStore("settings", { keyPath: "key" });
      }

      if (!db.objectStoreNames.contains("playback")) {
        db.createObjectStore("playback", { keyPath: "key" });
      }
    },
  });

  return dbInstance;
}

/** Strip audio data from a song for lightweight metadata */
export function toSongMeta(song: Song): SongMeta {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { audioData, ...meta } = song;
  return meta;
}

// ─── Song Operations ───────────────────────────────────────────────

/** Save a new song or update existing */
export async function saveSong(song: Song): Promise<void> {
  const db = await getDB();
  await db.put("songs", song);
}

/** Get a single song by ID (includes audio data) */
export async function getSong(id: string): Promise<Song | undefined> {
  const db = await getDB();
  return db.get("songs", id);
}

/** Get all song metadata (without audio buffers) */
export async function getAllSongMeta(): Promise<SongMeta[]> {
  const db = await getDB();
  const songs = await db.getAll("songs");
  return songs.map(toSongMeta);
}

/** Delete a song by ID */
export async function deleteSong(id: string): Promise<void> {
  const db = await getDB();
  await db.delete("songs", id);
  // Also remove from favorites
  await db.delete("favorites", id);
  // Remove from all playlists
  const playlists = await db.getAll("playlists");
  for (const playlist of playlists) {
    if (playlist.songIds.includes(id)) {
      playlist.songIds = playlist.songIds.filter((sid) => sid !== id);
      await db.put("playlists", playlist);
    }
  }
}

/** Update song metadata (title, artist, artwork) */
export async function updateSong(
  id: string,
  updates: Partial<Pick<Song, "title" | "artist" | "album" | "artwork" | "customTitle">>
): Promise<void> {
  const db = await getDB();
  const song = await db.get("songs", id);
  if (!song) return;
  Object.assign(song, updates);
  await db.put("songs", song);
}

/** Increment play count and update last played timestamp */
export async function recordPlay(id: string): Promise<void> {
  const db = await getDB();
  const song = await db.get("songs", id);
  if (!song) return;
  song.playCount += 1;
  song.lastPlayed = Date.now();
  await db.put("songs", song);
}

// ─── Playlist Operations ─────────────────────────────────────────

export async function savePlaylist(playlist: Playlist): Promise<void> {
  const db = await getDB();
  await db.put("playlists", playlist);
}

export async function getPlaylist(id: string): Promise<Playlist | undefined> {
  const db = await getDB();
  return db.get("playlists", id);
}

export async function getAllPlaylists(): Promise<Playlist[]> {
  const db = await getDB();
  return db.getAll("playlists");
}

export async function deletePlaylist(id: string): Promise<void> {
  if (id === FAVORITES_PLAYLIST_ID) return;
  const db = await getDB();
  await db.delete("playlists", id);
}

/** Auto-synced playlist that mirrors liked songs */
export async function ensureFavoritesPlaylist(favoriteSongIds: string[]): Promise<void> {
  const db = await getDB();
  const existing = await db.get("playlists", FAVORITES_PLAYLIST_ID);

  const playlist: Playlist = existing ?? {
    id: FAVORITES_PLAYLIST_ID,
    name: "Favorites",
    description: "Songs you love",
    songIds: [],
    artwork: null,
    dateCreated: Date.now(),
    dateModified: Date.now(),
    isSystem: true,
  };

  playlist.songIds = favoriteSongIds;
  playlist.dateModified = Date.now();
  playlist.isSystem = true;
  await db.put("playlists", playlist);
}

// ─── Favorites Operations ──────────────────────────────────────────

export async function addFavorite(songId: string): Promise<void> {
  const db = await getDB();
  await db.put("favorites", { songId, addedAt: Date.now() });
}

export async function removeFavorite(songId: string): Promise<void> {
  const db = await getDB();
  await db.delete("favorites", songId);
}

export async function getFavorites(): Promise<string[]> {
  const db = await getDB();
  const favs = await db.getAll("favorites");
  return favs
    .sort((a, b) => b.addedAt - a.addedAt)
    .map((f) => f.songId);
}

export async function isFavorite(songId: string): Promise<boolean> {
  const db = await getDB();
  const fav = await db.get("favorites", songId);
  return !!fav;
}

// ─── Settings Operations ───────────────────────────────────────────

export async function getSettings(): Promise<AppSettings> {
  const db = await getDB();
  const stored = await db.get("settings", "app");
  if (!stored) return DEFAULT_SETTINGS;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { key, animationIntensity, reduceMotion, currentEnvironment, ...rest } = stored as AppSettings & {
    key: string;
    animationIntensity?: string;
    reduceMotion?: boolean;
    currentEnvironment?: string;
  };
  return {
    ...rest,
    noAnimation: rest.noAnimation ?? reduceMotion ?? false,
    currentEnvironment: normalizeEnvironment(currentEnvironment),
  } as AppSettings;
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  const db = await getDB();
  await db.put("settings", { key: "app", ...settings });
}

// ─── Playback State Operations ─────────────────────────────────────

export async function getPlaybackState(): Promise<PlaybackState> {
  const db = await getDB();
  const stored = await db.get("playback", "state");
  if (!stored) return DEFAULT_PLAYBACK;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { key, ...state } = stored;
  return state as PlaybackState;
}

export async function savePlaybackState(state: PlaybackState): Promise<void> {
  const db = await getDB();
  await db.put("playback", { key: "state", ...state });
}

// ─── Storage Stats ─────────────────────────────────────────────────

export async function getStorageStats(): Promise<StorageStats> {
  const db = await getDB();
  const songs = await db.getAll("songs");
  const playlists = await db.getAll("playlists");
  const favorites = await db.getAll("favorites");

  let estimatedSizeBytes = 0;
  for (const song of songs) {
    estimatedSizeBytes += song.audioData.byteLength;
    if (song.artwork) {
      // Rough estimate: base64 is ~4/3 of original size
      estimatedSizeBytes += Math.ceil((song.artwork.length * 3) / 4);
    }
  }

  return {
    totalSongs: songs.length,
    totalPlaylists: playlists.length,
    totalFavorites: favorites.length,
    estimatedSizeBytes,
  };
}

/** Clear all data from the database */
export async function clearAllData(): Promise<void> {
  const db = await getDB();
  await db.clear("songs");
  await db.clear("playlists");
  await db.clear("favorites");
  await db.clear("settings");
  await db.clear("playback");
}
