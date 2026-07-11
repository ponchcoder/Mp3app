"use client";

/**
 * Library Context — song collection, favorites, playlists management
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import type { SongMeta, Playlist, SortField, SortDirection } from "@/types";
import { FAVORITES_PLAYLIST_ID } from "@/types";
import {
  getAllSongMeta,
  saveSong,
  deleteSong,
  updateSong,
  getAllPlaylists,
  savePlaylist,
  deletePlaylist,
  getFavorites,
  addFavorite,
  removeFavorite,
  ensureFavoritesPlaylist,
} from "@/storage/indexeddb";
import { processMultipleUploads } from "@/services/metadata";
import { sortSongs, searchSongs, generateId } from "@/utils";

interface LibraryContextValue {
  songs: SongMeta[];
  playlists: Playlist[];
  favorites: string[];
  isLoading: boolean;
  uploadProgress: { completed: number; total: number } | null;

  // Song operations
  uploadFiles: (files: File[]) => Promise<void>;
  removeSong: (id: string) => Promise<void>;
  renameSong: (id: string, customTitle: string) => Promise<void>;
  setSongArtwork: (id: string, artwork: string) => Promise<void>;
  refreshLibrary: () => Promise<void>;

  // Favorites
  toggleFavorite: (songId: string) => Promise<void>;
  isFavorite: (songId: string) => boolean;

  // Playlists
  createPlaylist: (name: string, description?: string) => Promise<Playlist>;
  updatePlaylist: (playlist: Playlist) => Promise<void>;
  removePlaylist: (id: string) => Promise<void>;
  addToPlaylist: (playlistId: string, songId: string) => Promise<void>;
  addManyToPlaylist: (playlistId: string, songIds: string[]) => Promise<number>;
  removeFromPlaylist: (playlistId: string, songId: string) => Promise<void>;

  // Queries
  getRecentSongs: (limit?: number) => SongMeta[];
  getFavoriteSongs: () => SongMeta[];
  getMostPlayed: (limit?: number) => SongMeta[];
  search: (query: string) => SongMeta[];
  sort: (field: SortField, direction: SortDirection) => SongMeta[];
}

const LibraryContext = createContext<LibraryContextValue | null>(null);

export function LibraryProvider({ children }: { children: React.ReactNode }) {
  const [songs, setSongs] = useState<SongMeta[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadProgress, setUploadProgress] = useState<{
    completed: number;
    total: number;
  } | null>(null);

  const refreshLibrary = useCallback(async () => {
    const [allSongs, allFavorites] = await Promise.all([
      getAllSongMeta(),
      getFavorites(),
    ]);

    await ensureFavoritesPlaylist(allFavorites);

    const allPlaylists = await getAllPlaylists();
    setSongs(allSongs);
    setPlaylists(allPlaylists);
    setFavorites(allFavorites);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    refreshLibrary();
  }, [refreshLibrary]);

  const uploadFiles = useCallback(
    async (files: File[]) => {
      setUploadProgress({ completed: 0, total: files.length });

      const newSongs = await processMultipleUploads(files, (completed, total) => {
        setUploadProgress({ completed, total });
      });

      for (const song of newSongs) {
        await saveSong(song);
      }

      setUploadProgress(null);
      await refreshLibrary();
    },
    [refreshLibrary]
  );

  const removeSong = useCallback(
    async (id: string) => {
      await deleteSong(id);
      await refreshLibrary();
    },
    [refreshLibrary]
  );

  const renameSong = useCallback(
    async (id: string, customTitle: string) => {
      await updateSong(id, { customTitle });
      await refreshLibrary();
    },
    [refreshLibrary]
  );

  const setSongArtwork = useCallback(
    async (id: string, artwork: string) => {
      await updateSong(id, { artwork });
      await refreshLibrary();
    },
    [refreshLibrary]
  );

  const toggleFavorite = useCallback(
    async (songId: string) => {
      if (favorites.includes(songId)) {
        await removeFavorite(songId);
      } else {
        await addFavorite(songId);
      }
      await refreshLibrary();
    },
    [favorites, refreshLibrary]
  );

  const isFav = useCallback(
    (songId: string) => favorites.includes(songId),
    [favorites]
  );

  const createPlaylist = useCallback(
    async (name: string, description = ""): Promise<Playlist> => {
      const playlist: Playlist = {
        id: generateId(),
        name,
        description,
        songIds: [],
        artwork: null,
        dateCreated: Date.now(),
        dateModified: Date.now(),
      };
      await savePlaylist(playlist);
      await refreshLibrary();
      return playlist;
    },
    [refreshLibrary]
  );

  const updatePlaylist = useCallback(
    async (playlist: Playlist) => {
      playlist.dateModified = Date.now();
      await savePlaylist(playlist);
      await refreshLibrary();
    },
    [refreshLibrary]
  );

  const removePlaylist = useCallback(
    async (id: string) => {
      if (id === FAVORITES_PLAYLIST_ID) return;
      await deletePlaylist(id);
      await refreshLibrary();
    },
    [refreshLibrary]
  );

  const addToPlaylist = useCallback(
    async (playlistId: string, songId: string) => {
      if (playlistId === FAVORITES_PLAYLIST_ID) return;
      const playlist = playlists.find((p) => p.id === playlistId);
      if (!playlist || playlist.songIds.includes(songId)) return;
      playlist.songIds.push(songId);
      playlist.dateModified = Date.now();
      await savePlaylist(playlist);
      await refreshLibrary();
    },
    [playlists, refreshLibrary]
  );

  const addManyToPlaylist = useCallback(
    async (playlistId: string, songIds: string[]) => {
      if (playlistId === FAVORITES_PLAYLIST_ID) return 0;
      const playlist = playlists.find((p) => p.id === playlistId);
      if (!playlist) return 0;

      const newIds = songIds.filter((id) => !playlist.songIds.includes(id));
      if (newIds.length === 0) return 0;

      playlist.songIds.push(...newIds);
      playlist.dateModified = Date.now();
      await savePlaylist(playlist);
      await refreshLibrary();
      return newIds.length;
    },
    [playlists, refreshLibrary]
  );

  const removeFromPlaylist = useCallback(
    async (playlistId: string, songId: string) => {
      if (playlistId === FAVORITES_PLAYLIST_ID) {
        await removeFavorite(songId);
        await refreshLibrary();
        return;
      }
      const playlist = playlists.find((p) => p.id === playlistId);
      if (!playlist) return;
      playlist.songIds = playlist.songIds.filter((id) => id !== songId);
      playlist.dateModified = Date.now();
      await savePlaylist(playlist);
      await refreshLibrary();
    },
    [playlists, refreshLibrary]
  );

  const getRecentSongs = useCallback(
    (limit = 10) =>
      [...songs]
        .filter((s) => s.lastPlayed)
        .sort((a, b) => (b.lastPlayed ?? 0) - (a.lastPlayed ?? 0))
        .slice(0, limit),
    [songs]
  );

  const getFavoriteSongs = useCallback(
    () =>
      favorites
        .map((id) => songs.find((s) => s.id === id))
        .filter((s): s is SongMeta => s !== undefined),
    [songs, favorites]
  );

  const getMostPlayed = useCallback(
    (limit = 10) =>
      [...songs].sort((a, b) => b.playCount - a.playCount).slice(0, limit),
    [songs]
  );

  const search = useCallback(
    (query: string) => searchSongs(songs, query),
    [songs]
  );

  const sort = useCallback(
    (field: SortField, direction: SortDirection) =>
      sortSongs(songs, field, direction),
    [songs]
  );

  return (
    <LibraryContext.Provider
      value={{
        songs,
        playlists,
        favorites,
        isLoading,
        uploadProgress,
        uploadFiles,
        removeSong,
        renameSong,
        setSongArtwork,
        refreshLibrary,
        toggleFavorite,
        isFavorite: isFav,
        createPlaylist,
        updatePlaylist,
        removePlaylist,
        addToPlaylist,
        addManyToPlaylist,
        removeFromPlaylist,
        getRecentSongs,
        getFavoriteSongs,
        getMostPlayed,
        search,
        sort,
      }}
    >
      {children}
    </LibraryContext.Provider>
  );
}

export function useLibrary(): LibraryContextValue {
  const ctx = useContext(LibraryContext);
  if (!ctx) throw new Error("useLibrary must be used within LibraryProvider");
  return ctx;
}
