"use client";

/**
 * Player Context — central audio playback state management
 * Handles play/pause, queue, shuffle, repeat, volume, and persistence
 */

import React, {
  createContext,
  useContext,
  useRef,
  useState,
  useCallback,
  useEffect,
} from "react";
import type { Song, SongMeta, RepeatMode, QueueItem } from "@/types";
import {
  getSong,
  savePlaybackState,
  getPlaybackState,
  recordPlay,
} from "@/storage/indexeddb";
import { createAudioURL, revokeAudioURL, shuffleArray } from "@/utils";
import {
  setupMediaSession,
  updateMediaMetadata,
  updateMediaPlaybackState,
  updateMediaPosition,
  clearMediaSession,
  enableBackgroundPlayback,
  configureAudioElement,
} from "@/services/media-session";
import { useBackgroundAudio } from "@/hooks/useBackgroundAudio";

interface PlayerContextValue {
  // State
  currentSong: SongMeta | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  shuffle: boolean;
  repeat: RepeatMode;
  queue: QueueItem[];
  queueIndex: number;
  isLoading: boolean;

  // Actions
  play: (songId?: string) => void;
  pause: () => void;
  togglePlay: () => void;
  next: () => void;
  previous: () => void;
  seek: (time: number) => void;
  setVolume: (vol: number) => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
  playSong: (songId: string) => void;
  playQueue: (songIds: string[], startIndex?: number) => void;
  addToQueue: (songId: string) => void;
  playNext: (songId: string) => void;
  removeFromQueue: (index: number) => void;
  reorderQueue: (fromIndex: number, toIndex: number) => void;
  resetPlayback: () => void;
  audioRef: React.RefObject<HTMLAudioElement | null>;
}

const PlayerContext = createContext<PlayerContextValue | null>(null);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentSong, setCurrentSong] = useState<SongMeta | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.8);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState<RepeatMode>("off");
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [queueIndex, setQueueIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const currentUrlRef = useRef<string | null>(null);
  const shuffledOrderRef = useRef<number[]>([]);
  const persistTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hydrationTokenRef = useRef(0);

  const seek = useCallback((time: number) => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = Math.max(0, Math.min(time, audio.duration || 0));
      setCurrentTime(audio.currentTime);
    }
  }, []);

  const loadAudio = useCallback(
    async (song: Song, startTime = 0) => {
      const audio = audioRef.current;
      if (!audio) return;

      setIsLoading(true);

      if (currentUrlRef.current) {
        revokeAudioURL(currentUrlRef.current);
      }

      const url = createAudioURL(song.audioData);
      currentUrlRef.current = url;
      audio.src = url;
      audio.volume = volume;

      await new Promise<void>((resolve) => {
        audio.addEventListener("loadedmetadata", () => resolve(), { once: true });
        audio.load();
      });

      if (startTime > 0) {
        audio.currentTime = startTime;
      }

      setDuration(audio.duration || song.duration);
      setIsLoading(false);
    },
    [volume]
  );

  const loadAudioRef = useRef(loadAudio);
  loadAudioRef.current = loadAudio;

  useBackgroundAudio(audioRef, isPlaying);

  // Load persisted playback state on mount
  useEffect(() => {
    const hydrationToken = hydrationTokenRef.current;

    (async () => {
      const state = await getPlaybackState();
      if (hydrationToken !== hydrationTokenRef.current) return;

      setVolumeState(state.volume);
      setShuffle(state.shuffle);
      setRepeat(state.repeat);
      setQueue(state.queue);
      setQueueIndex(state.queueIndex);

      if (state.currentSongId) {
        const song = await getSong(state.currentSongId);
        if (!song || hydrationToken !== hydrationTokenRef.current) return;

        const { audioData: _audio, ...meta } = song;
        void _audio;
        setCurrentSong(meta);
        await loadAudioRef.current(song, state.currentTime);
      }
    })();
  }, []);

  // Set up Media Session API (refs keep handlers current without re-registering)
  const mediaHandlersRef = useRef({
    play: () => {},
    pause: () => {},
    previous: () => {},
    next: () => {},
    seek,
  });

  useEffect(() => {
    setupMediaSession({
      onPlay: () => mediaHandlersRef.current.play(),
      onPause: () => mediaHandlersRef.current.pause(),
      onPrevious: () => mediaHandlersRef.current.previous(),
      onNext: () => mediaHandlersRef.current.next(),
      onSeek: (offset) => {
        const audio = audioRef.current;
        if (audio) mediaHandlersRef.current.seek(audio.currentTime + offset);
      },
      onSeekTo: (time) => {
        mediaHandlersRef.current.seek(time);
      },
    });
  }, [seek]);

  // Persist playback state on changes
  useEffect(() => {
    if (persistTimerRef.current) {
      clearTimeout(persistTimerRef.current);
    }

    persistTimerRef.current = setTimeout(() => {
      savePlaybackState({
        currentSongId: currentSong?.id ?? null,
        currentTime,
        isPlaying,
        shuffle,
        repeat,
        volume,
        queue,
        queueIndex,
      });
      persistTimerRef.current = null;
    }, 500);

    return () => {
      if (persistTimerRef.current) {
        clearTimeout(persistTimerRef.current);
        persistTimerRef.current = null;
      }
    };
  }, [currentSong, currentTime, isPlaying, shuffle, repeat, volume, queue, queueIndex]);

  /** Load and play a specific song by ID */
  const playSong = useCallback(
    async (songId: string) => {
      const song = await getSong(songId);
      if (!song) return;

      const { audioData: _audio, ...meta } = song;
      void _audio;

      enableBackgroundPlayback();
      setCurrentSong(meta);
      updateMediaMetadata(meta);
      updateMediaPlaybackState(true);

      await loadAudio(song);
      await recordPlay(songId);

      const audio = audioRef.current;
      if (audio) {
        configureAudioElement(audio);
        try {
          await audio.play();
          setIsPlaying(true);
          updateMediaPlaybackState(true);
          updateMediaPosition(audio.duration, audio.currentTime);
        } catch {
          setIsPlaying(false);
          updateMediaPlaybackState(false);
        }
      }
    },
    [loadAudio]
  );

  const play = useCallback(
    async (songId?: string) => {
      if (songId) {
        await playSong(songId);
        return;
      }

      const audio = audioRef.current;
      if (!audio) return;

      enableBackgroundPlayback();

      if (!currentSong && queue.length > 0) {
        const idx = queueIndex >= 0 ? queueIndex : 0;
        await playSong(queue[idx].songId);
        setQueueIndex(idx);
        return;
      }

      try {
        await audio.play();
        setIsPlaying(true);
        updateMediaPlaybackState(true);
        updateMediaPosition(audio.duration, audio.currentTime);
      } catch {
        // Autoplay may be blocked
      }
    },
    [currentSong, queue, queueIndex, playSong]
  );

  const pause = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      setIsPlaying(false);
      updateMediaPlaybackState(false);
    }
  }, []);

  const togglePlay = useCallback(() => {
    if (isPlaying) pause();
    else play();
  }, [isPlaying, play, pause]);

  const getNextIndex = useCallback((): number => {
    if (queue.length === 0) return -1;

    if (shuffle) {
      if (shuffledOrderRef.current.length === 0) {
        shuffledOrderRef.current = shuffleArray(
          Array.from({ length: queue.length }, (_, i) => i)
        );
      }
      const currentShuffleIdx = shuffledOrderRef.current.indexOf(queueIndex);
      const nextShuffleIdx = (currentShuffleIdx + 1) % shuffledOrderRef.current.length;
      return shuffledOrderRef.current[nextShuffleIdx];
    }

    return (queueIndex + 1) % queue.length;
  }, [queue, queueIndex, shuffle]);

  const getPrevIndex = useCallback((): number => {
    if (queue.length === 0) return -1;

    const audio = audioRef.current;
    // If more than 3 seconds in, restart current song
    if (audio && audio.currentTime > 3) return queueIndex;

    if (shuffle) {
      if (shuffledOrderRef.current.length === 0) {
        shuffledOrderRef.current = shuffleArray(
          Array.from({ length: queue.length }, (_, i) => i)
        );
      }
      const currentShuffleIdx = shuffledOrderRef.current.indexOf(queueIndex);
      const prevShuffleIdx =
        (currentShuffleIdx - 1 + shuffledOrderRef.current.length) %
        shuffledOrderRef.current.length;
      return shuffledOrderRef.current[prevShuffleIdx];
    }

    return queueIndex <= 0 ? queue.length - 1 : queueIndex - 1;
  }, [queue, queueIndex, shuffle]);

  const next = useCallback(async () => {
    if (queue.length === 0) return;

    const nextIdx = getNextIndex();

    // Handle repeat modes
    if (nextIdx === 0 && queueIndex === queue.length - 1 && repeat === "off") {
      pause();
      return;
    }

    setQueueIndex(nextIdx);
    await playSong(queue[nextIdx].songId);
  }, [queue, queueIndex, repeat, getNextIndex, playSong, pause]);

  const previous = useCallback(async () => {
    if (queue.length === 0) return;

    const audio = audioRef.current;
    if (audio && audio.currentTime > 3) {
      seek(0);
      return;
    }

    const prevIdx = getPrevIndex();
    setQueueIndex(prevIdx);
    await playSong(queue[prevIdx].songId);
  }, [queue, getPrevIndex, playSong, seek]);

  const setVolume = useCallback((vol: number) => {
    const clamped = Math.max(0, Math.min(1, vol));
    setVolumeState(clamped);
    if (audioRef.current) {
      audioRef.current.volume = clamped;
    }
  }, []);

  const toggleShuffle = useCallback(() => {
    setShuffle((prev) => !prev);
    shuffledOrderRef.current = [];
  }, []);

  const cycleRepeat = useCallback(() => {
    setRepeat((prev) => {
      const modes: RepeatMode[] = ["off", "all", "one"];
      return modes[(modes.indexOf(prev) + 1) % modes.length];
    });
  }, []);

  const playQueue = useCallback(
    async (songIds: string[], startIndex = 0) => {
      const items: QueueItem[] = songIds.map((id) => ({
        songId: id,
        addedAt: Date.now(),
      }));
      setQueue(items);
      setQueueIndex(startIndex);
      shuffledOrderRef.current = [];
      await playSong(songIds[startIndex]);
    },
    [playSong]
  );

  const addToQueue = useCallback((songId: string) => {
    setQueue((prev) => [...prev, { songId, addedAt: Date.now() }]);
  }, []);

  const playNext = useCallback(
    (songId: string) => {
      setQueue((prev) => {
        const newQueue = [...prev];
        const insertIdx = queueIndex + 1;
        newQueue.splice(insertIdx, 0, { songId, addedAt: Date.now() });
        return newQueue;
      });
    },
    [queueIndex]
  );

  const removeFromQueue = useCallback(
    (index: number) => {
      setQueue((prev) => prev.filter((_, i) => i !== index));
      if (index < queueIndex) setQueueIndex((prev) => prev - 1);
      else if (index === queueIndex) pause();
    },
    [queueIndex, pause]
  );

  const reorderQueue = useCallback((fromIndex: number, toIndex: number) => {
    setQueue((prev) => {
      const newQueue = [...prev];
      const [item] = newQueue.splice(fromIndex, 1);
      newQueue.splice(toIndex, 0, item);
      return newQueue;
    });
    setQueueIndex((prev) => {
      if (prev === fromIndex) return toIndex;
      if (fromIndex < prev && toIndex >= prev) return prev - 1;
      if (fromIndex > prev && toIndex <= prev) return prev + 1;
      return prev;
    });
  }, []);

  const resetPlayback = useCallback(() => {
    if (persistTimerRef.current) {
      clearTimeout(persistTimerRef.current);
      persistTimerRef.current = null;
    }

    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
    }
    if (currentUrlRef.current) {
      revokeAudioURL(currentUrlRef.current);
      currentUrlRef.current = null;
    }

    setQueue([]);
    setQueueIndex(-1);
    setIsPlaying(false);
    setCurrentSong(null);
    setCurrentTime(0);
    setDuration(0);
    shuffledOrderRef.current = [];
    hydrationTokenRef.current += 1;
    clearMediaSession();

    void savePlaybackState({
      currentSongId: null,
      currentTime: 0,
      isPlaying: false,
      shuffle,
      repeat,
      volume,
      queue: [],
      queueIndex: -1,
    });
  }, [shuffle, repeat, volume]);

  // Audio element event handlers
  const handleTimeUpdate = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      setCurrentTime(audio.currentTime);
      updateMediaPosition(audio.duration, audio.currentTime);
    }
  }, []);

  const handleEnded = useCallback(() => {
    if (repeat === "one") {
      seek(0);
      play();
    } else {
      next();
    }
  }, [repeat, seek, play, next]);

  const handleLoadedMetadata = useCallback(() => {
    const audio = audioRef.current;
    if (audio) setDuration(audio.duration);
  }, []);

  mediaHandlersRef.current = { play, pause, previous, next, seek };

  return (
    <PlayerContext.Provider
      value={{
        currentSong,
        isPlaying,
        currentTime,
        duration,
        volume,
        shuffle,
        repeat,
        queue,
        queueIndex,
        isLoading,
        play,
        pause,
        togglePlay,
        next,
        previous,
        seek,
        setVolume,
        toggleShuffle,
        cycleRepeat,
        playSong,
        playQueue,
        addToQueue,
        playNext,
        removeFromQueue,
        reorderQueue,
        resetPlayback,
        audioRef,
      }}
    >
      {children}
      <audio
        ref={(el) => {
          audioRef.current = el;
          if (el) configureAudioElement(el);
        }}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        onLoadedMetadata={handleLoadedMetadata}
        playsInline
        preload="auto"
      />
    </PlayerContext.Provider>
  );
}

export function usePlayer(): PlayerContextValue {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used within PlayerProvider");
  return ctx;
}
