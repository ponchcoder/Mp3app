/**
 * Keeps HTML5 audio playing when the screen locks or the app is backgrounded.
 */

import { useEffect, useRef } from "react";
import { enableBackgroundPlayback, configureAudioElement } from "@/services/media-session";

export function useBackgroundAudio(
  audioRef: React.RefObject<HTMLAudioElement | null>,
  isPlaying: boolean
): void {
  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;

  useEffect(() => {
    enableBackgroundPlayback();
    const audio = audioRef.current;
    if (audio) configureAudioElement(audio);
  }, [audioRef]);

  useEffect(() => {
    if (isPlaying) enableBackgroundPlayback();
  }, [isPlaying]);

  useEffect(() => {
    let keepAliveInterval: ReturnType<typeof setInterval> | null = null;

    const ensurePlayback = () => {
      const audio = audioRef.current;
      if (!audio || !isPlayingRef.current || !audio.src) return;

      enableBackgroundPlayback();

      // Resume if the OS paused us mid-track (not after natural end — queue advance handles that)
      if (audio.paused && !audio.ended) {
        void audio.play().catch(() => {});
      }
    };

    const startKeepAlive = () => {
      if (keepAliveInterval) return;
      keepAliveInterval = setInterval(ensurePlayback, 2000);
    };

    const stopKeepAlive = () => {
      if (keepAliveInterval) {
        clearInterval(keepAliveInterval);
        keepAliveInterval = null;
      }
    };

    const onVisibility = () => {
      enableBackgroundPlayback();

      if (document.visibilityState === "hidden") {
        ensurePlayback();
        startKeepAlive();
      } else {
        stopKeepAlive();
        ensurePlayback();
      }
    };

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", ensurePlayback);
    window.addEventListener("pageshow", ensurePlayback);

    if (document.visibilityState === "hidden" && isPlayingRef.current) {
      startKeepAlive();
    }

    return () => {
      stopKeepAlive();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", ensurePlayback);
      window.removeEventListener("pageshow", ensurePlayback);
    };
  }, [audioRef]);
}
