/**
 * MP3 metadata extraction service
 * Reads ID3 tags and album artwork from uploaded files
 */

import type { Song, SongMeta } from "@/types";
import { generateId, fileToArrayBuffer } from "@/utils";

interface ExtractedMetadata {
  title: string;
  artist: string;
  album: string;
  duration: number;
  artwork: string | null;
}

/**
 * Extract metadata from an MP3 file using jsmediatags.
 * Falls back to filename-based metadata if tags are unavailable.
 */
export async function extractMetadata(file: File): Promise<ExtractedMetadata> {
  const fallbackTitle = file.name.replace(/\.[^/.]+$/, "");

  try {
    const metadata = await readID3Tags(file);
    if (metadata) return metadata;
  } catch {
    // ID3 parsing failed, use fallback
  }

  // Get duration from audio element
  const duration = await getAudioDuration(file);

  return {
    title: fallbackTitle,
    artist: "Unknown Artist",
    album: "Unknown Album",
    duration,
    artwork: null,
  };
}

/** Read ID3 tags from an MP3 file */
function readID3Tags(file: File): Promise<ExtractedMetadata | null> {
  return new Promise((resolve) => {
    // Dynamic import to avoid SSR issues
    import("jsmediatags").then(({ default: jsmediatags }) => {
      jsmediatags.read(file, {
        onSuccess: async (tag: {
          tags: {
            title?: string;
            artist?: string;
            album?: string;
            picture?: { data: number[]; format: string };
          };
        }) => {
          const { title, artist, album, picture } = tag.tags;
          let artwork: string | null = null;

          if (picture) {
            const byteArray = new Uint8Array(picture.data);
            const blob = new Blob([byteArray], { type: picture.format });
            artwork = await blobToDataURL(blob);
          }

          const duration = await getAudioDuration(file);

          resolve({
            title: title || file.name.replace(/\.[^/.]+$/, ""),
            artist: artist || "Unknown Artist",
            album: album || "Unknown Album",
            duration,
            artwork,
          });
        },
        onError: () => resolve(null),
      });
    }).catch(() => resolve(null));
  });
}

/** Get audio duration by loading into an Audio element */
function getAudioDuration(file: File): Promise<number> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const audio = new Audio();
    audio.addEventListener("loadedmetadata", () => {
      resolve(audio.duration || 0);
      URL.revokeObjectURL(url);
    });
    audio.addEventListener("error", () => {
      resolve(0);
      URL.revokeObjectURL(url);
    });
    audio.src = url;
  });
}

/** Convert a Blob to a base64 data URL */
function blobToDataURL(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

/**
 * Process an uploaded MP3 file into a Song object ready for storage.
 */
export async function processUpload(file: File): Promise<Song> {
  if (!file.type.includes("audio") && !file.name.endsWith(".mp3")) {
    throw new Error("Please upload MP3 audio files only");
  }

  const [metadata, audioData] = await Promise.all([
    extractMetadata(file),
    fileToArrayBuffer(file),
  ]);

  return {
    id: generateId(),
    title: metadata.title,
    artist: metadata.artist,
    album: metadata.album,
    duration: metadata.duration,
    audioData,
    artwork: metadata.artwork,
    dateAdded: Date.now(),
    playCount: 0,
    lastPlayed: null,
  };
}

/**
 * Process multiple files in parallel with progress callback.
 */
export async function processMultipleUploads(
  files: File[],
  onProgress?: (completed: number, total: number) => void
): Promise<Song[]> {
  const mp3Files = files.filter(
    (f) => f.type.includes("audio") || f.name.endsWith(".mp3")
  );

  const songs: Song[] = [];
  for (let i = 0; i < mp3Files.length; i++) {
    try {
      const song = await processUpload(mp3Files[i]);
      songs.push(song);
    } catch (err) {
      console.error(`Failed to process ${mp3Files[i].name}:`, err);
    }
    onProgress?.(i + 1, mp3Files.length);
  }

  return songs;
}

/** Convert Song to SongMeta (strip audio data) */
export function songToMeta(song: import("@/types").Song): SongMeta {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { audioData, ...meta } = song;
  return meta;
}
