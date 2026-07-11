"use client";

/**
 * Realistic vinyl record — circular disc with grooves, label, and smooth CSS spin
 */

interface VinylRecordProps {
  src: string | null;
  title?: string;
  isPlaying?: boolean;
  size?: number;
}

export function VinylRecord({
  src,
  title = "Album",
  isPlaying = false,
  size = 288,
}: VinylRecordProps) {
  const labelSize = size * 0.38;

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      {/* Vinyl disc */}
      <div
        className={`vinyl-disc ${isPlaying ? "vinyl-spinning" : ""}`}
        style={{ width: size, height: size }}
      >
        {/* Grooved surface */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-950 shadow-2xl">
          {/* Concentric groove rings */}
          {[12, 18, 24, 30, 36, 42, 48].map((inset) => (
            <div
              key={inset}
              className="absolute rounded-full border border-white/[0.04]"
              style={{ inset: `${inset}%` }}
            />
          ))}

          {/* Shine highlight */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/[0.06] to-transparent" />

          {/* Center label */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full overflow-hidden shadow-inner border-2 border-zinc-700/50"
            style={{ width: labelSize, height: labelSize }}
          >
            {src ? (
              // eslint-disable-next-line @next/next/no-img-element -- data URLs from IndexedDB; next/image does not support blob/data src
              <img
                src={src}
                alt={`${title} artwork`}
                className="w-full h-full object-cover"
                draggable={false}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blush-300 to-lavender-300 flex items-center justify-center">
                <span className="text-2xl text-white/60">♪</span>
              </div>
            )}
          </div>

          {/* Spindle hole */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-zinc-950 border border-zinc-600 z-10 shadow-inner" />
        </div>
      </div>
    </div>
  );
}
