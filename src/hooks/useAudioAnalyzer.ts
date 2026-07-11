/**
 * Web Audio API analyzer for audio-reactive animations.
 * Only runs while music is playing to avoid freezing the UI.
 */

import { useRef, useCallback, useEffect, useState } from "react";
import type { AudioAnalysis } from "@/types";
import { isMobileDevice } from "@/utils";

const DEFAULT_ANALYSIS: AudioAnalysis = {
  bass: 0,
  mid: 0,
  treble: 0,
  overall: 0,
  isPlaying: false,
};

/**
 * Hook that connects to an HTMLAudioElement and provides
 * real-time frequency analysis for visual effects.
 */
export function useAudioAnalyzer(
  audioRef: React.RefObject<HTMLAudioElement | null>,
  isPlaying: boolean
) {
  const [analysis, setAnalysis] = useState<AudioAnalysis>(DEFAULT_ANALYSIS);
  const contextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const connectedRef = useRef(false);
  const rafRef = useRef<number>(0);

  const connect = useCallback(() => {
    if (isMobileDevice()) return;
    const audio = audioRef.current;
    if (!audio || connectedRef.current) return;

    try {
      const ctx = new AudioContext();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;

      const source = ctx.createMediaElementSource(audio);
      source.connect(analyser);
      analyser.connect(ctx.destination);

      contextRef.current = ctx;
      analyserRef.current = analyser;
      connectedRef.current = true;
    } catch {
      // Audio element may already be connected
    }
  }, [audioRef]);

  // Only analyze while playing — prevents 60fps re-renders freezing the UI
  useEffect(() => {
    if (!isPlaying) {
      cancelAnimationFrame(rafRef.current);
      setAnalysis(DEFAULT_ANALYSIS);
      return;
    }

    let lastUpdate = 0;

    const analyze = (timestamp: number) => {
      const analyser = analyserRef.current;
      const audio = audioRef.current;

      if (analyser && audio && timestamp - lastUpdate >= 100) {
        lastUpdate = timestamp;

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyser.getByteFrequencyData(dataArray);

        const bassEnd = Math.floor(bufferLength * 0.1);
        const midEnd = Math.floor(bufferLength * 0.5);

        let bass = 0,
          mid = 0,
          treble = 0;
        for (let i = 0; i < bassEnd; i++) bass += dataArray[i];
        for (let i = bassEnd; i < midEnd; i++) mid += dataArray[i];
        for (let i = midEnd; i < bufferLength; i++) treble += dataArray[i];

        setAnalysis({
          bass: bass / bassEnd / 255,
          mid: mid / (midEnd - bassEnd) / 255,
          treble: treble / (bufferLength - midEnd) / 255,
          overall: (bass / bassEnd + mid / (midEnd - bassEnd) + treble / (bufferLength - midEnd)) / 3 / 255,
          isPlaying: true,
        });
      }

      rafRef.current = requestAnimationFrame(analyze);
    };

    rafRef.current = requestAnimationFrame(analyze);

    return () => cancelAnimationFrame(rafRef.current);
  }, [isPlaying, audioRef]);

  useEffect(() => {
    return () => {
      cancelAnimationFrame(rafRef.current);
      if (contextRef.current) {
        contextRef.current.close();
      }
    };
  }, []);

  return { analysis, connect };
}
