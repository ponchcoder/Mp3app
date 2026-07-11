/**
 * Soft glowing moon for the night sky — always visible above clouds
 */

"use client";

export function NightMoon() {
  return (
    <div
      className="absolute top-[8%] right-[8%] z-[20] pointer-events-none"
      aria-hidden="true"
    >
      <div className="night-moon">
        <div className="night-moon-crater night-moon-crater-1" />
        <div className="night-moon-crater night-moon-crater-2" />
        <div className="night-moon-crater night-moon-crater-3" />
      </div>
    </div>
  );
}
