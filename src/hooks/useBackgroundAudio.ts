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
    const ensurePlayback = () => {
      const audio = audioRef.current;
      if (!audio || !isPlayingRef.current || !audio.src || audio.ended) return;

      enableBackgroundPlayback();

      if (audio.paused) {
        void audio.play().catch(() => {});
      }
    };

    const onVisibility = () => {
      enableBackgroundPlayback();

      // Screen locked or app backgrounded — keep audio alive
      if (document.visibilityState === "hidden") {
        ensurePlayback();
      }
    };

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", ensurePlayback);
    window.addEventListener("pageshow", ensurePlayback);

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", ensurePlayback);
      window.removeEventListener("pageshow", ensurePlayback);
    };
  }, [audioRef]);
}
