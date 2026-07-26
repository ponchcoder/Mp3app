"use client";

/**
 * Album artwork display with fallback
 */

import { Music } from "lucide-react";

interface AlbumArtProps {
  src: string | null;
  title?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeMap = {
  sm: "w-12 h-12 rounded-xl",
  md: "w-16 h-16 rounded-2xl",
  lg: "w-48 h-48 rounded-3xl",
  xl: "w-64 h-64 md:w-72 md:h-72 rounded-3xl",
};

export function AlbumArt({
  src,
  title = "Album",
  size = "md",
  className = "",
}: AlbumArtProps) {
  return (
    <div
      className={`relative overflow-hidden shadow-soft ${sizeMap[size]} ${className}`}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element -- data URLs from IndexedDB; next/image does not support blob/data src
        <img
          src={src}
          alt={`${title} artwork`}
          className="w-full h-full object-cover"
          loading="lazy"
          draggable={false}
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-blush-200 to-lavender-200 flex items-center justify-center">
          <Music
            className="text-[var(--color-accent)] opacity-60"
            size={size === "xl" ? 64 : size === "lg" ? 48 : 24}
          />
        </div>
      )}
    </div>
  );
}
