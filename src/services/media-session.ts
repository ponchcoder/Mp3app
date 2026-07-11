/**
 * Media Session API integration
 * Provides lock screen controls and system media notifications
 */

import type { SongMeta } from "@/types";
import { getDisplayTitle, getDisplayArtist } from "@/utils";

type MediaAction =
  | "play"
  | "pause"
  | "previoustrack"
  | "nexttrack"
  | "seekbackward"
  | "seekforward"
  | "seekto";

interface MediaSessionCallbacks {
  onPlay: () => void;
  onPause: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onSeek?: (offset: number) => void;
  onSeekTo?: (time: number) => void;
}

/** Tell iOS/Android this app is a music player (required for lock screen audio). */
export function enableBackgroundPlayback(): void {
  const nav = navigator as Navigator & {
    audioSession?: { type: string };
  };
  if (nav.audioSession) {
    try {
      nav.audioSession.type = "playback";
    } catch {
      // Unsupported browser
    }
  }
}

/** Configure the <audio> element for inline + lock screen playback on iOS. */
export function configureAudioElement(audio: HTMLAudioElement): void {
  audio.setAttribute("playsinline", "true");
  audio.setAttribute("webkit-playsinline", "true");
  audio.preload = "auto";
  audio.disableRemotePlayback = false;
}

/**
 * Set up Media Session API handlers for background/lock screen playback.
 */
export function setupMediaSession(callbacks: MediaSessionCallbacks): void {
  if (!("mediaSession" in navigator)) return;

  const actions: MediaAction[] = [
    "play",
    "pause",
    "previoustrack",
    "nexttrack",
    "seekbackward",
    "seekforward",
    "seekto",
  ];

  for (const action of actions) {
    try {
      navigator.mediaSession.setActionHandler(action, (details) => {
        switch (action) {
          case "play":
            callbacks.onPlay();
            break;
          case "pause":
            callbacks.onPause();
            break;
          case "previoustrack":
            callbacks.onPrevious();
            break;
          case "nexttrack":
            callbacks.onNext();
            break;
          case "seekbackward":
            callbacks.onSeek?.(-(details.seekOffset ?? 10));
            break;
          case "seekforward":
            callbacks.onSeek?.(details.seekOffset ?? 10);
            break;
          case "seekto":
            if (details.seekTime != null) {
              callbacks.onSeekTo?.(details.seekTime);
            }
            break;
        }
      });
    } catch {
      // Some actions may not be supported on all platforms
    }
  }
}

/**
 * Update the media session metadata for the current track.
 */
export function updateMediaMetadata(song: SongMeta | null): void {
  if (!("mediaSession" in navigator)) return;

  if (!song) {
    navigator.mediaSession.metadata = null;
    return;
  }

  const artwork: MediaImage[] = [];
  if (song.artwork) {
    artwork.push({ src: song.artwork, sizes: "512x512", type: "image/jpeg" });
    artwork.push({ src: song.artwork, sizes: "256x256", type: "image/jpeg" });
    artwork.push({ src: song.artwork, sizes: "128x128", type: "image/jpeg" });
  }

  navigator.mediaSession.metadata = new MediaMetadata({
    title: getDisplayTitle(song),
    artist: getDisplayArtist(song),
    album: song.album,
    artwork,
  });
}

/**
 * Update playback state on the media session.
 */
export function updateMediaPlaybackState(isPlaying: boolean): void {
  if (!("mediaSession" in navigator)) return;
  navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused";
}

/**
 * Update position state for seek bar on lock screen.
 */
export function updateMediaPosition(
  duration: number,
  position: number,
  playbackRate = 1
): void {
  if (!("mediaSession" in navigator)) return;

  try {
    navigator.mediaSession.setPositionState({
      duration: Math.max(0, duration),
      position: Math.max(0, Math.min(position, duration)),
      playbackRate,
    });
  } catch {
    // Position state may fail if duration is not yet known
  }
}

/**
 * Clear media session when playback stops.
 */
export function clearMediaSession(): void {
  if (!("mediaSession" in navigator)) return;
  navigator.mediaSession.metadata = null;
  navigator.mediaSession.playbackState = "none";
}
