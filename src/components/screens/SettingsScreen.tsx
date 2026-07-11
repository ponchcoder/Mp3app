"use client";

/**
 * Settings screen — animations, storage, reset
 */

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  HardDrive,
  RotateCcw,
  Disc3,
  ImageIcon,
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { useSettings } from "@/contexts/SettingsContext";
import { useLibrary } from "@/contexts/LibraryContext";
import { getStorageStats, clearAllData } from "@/storage/indexeddb";
import { formatBytes } from "@/utils";
import { fadeInUp, staggerContainer } from "@/animations/variants";
import { ENVIRONMENT_CONFIGS } from "@/animations/environments";
import { ENVIRONMENTS } from "@/hooks/useEnvironment";
import type { StorageStats } from "@/types";

export function SettingsScreen() {
  const { settings, toggleNoAnimation, toggleVinylMode, setEnvironment } = useSettings();
  const { refreshLibrary } = useLibrary();

  const [stats, setStats] = useState<StorageStats | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => {
    getStorageStats().then(setStats);
  }, []);

  const handleReset = async () => {
    await clearAllData();
    await refreshLibrary();
    setConfirmReset(false);
    const newStats = await getStorageStats();
    setStats(newStats);
    window.location.reload();
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial={false}
      animate="visible"
      className="px-4 pb-32 pt-6 space-y-6 max-w-lg mx-auto"
    >
      <motion.h1
        variants={fadeInUp}
        className="font-display text-2xl font-bold text-[var(--color-text)]"
      >
        Settings
      </motion.h1>

      {/* Animation */}
      <motion.section variants={fadeInUp}>
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={18} className="text-[var(--color-accent)]" />
          <h2 className="font-display text-lg font-semibold text-[var(--color-text)]">
            Animation
          </h2>
        </div>
        <GlassCard className="space-y-4">
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-sm text-[var(--color-text)]">No Animation</span>
            <input
              type="checkbox"
              checked={settings.noAnimation}
              onChange={toggleNoAnimation}
              className="w-5 h-5 rounded accent-[var(--color-accent)]"
            />
          </label>
          <p className="text-xs text-[var(--color-text-secondary)] -mt-2">
            Hides falling petals and background effects
          </p>

          <label className="flex items-center justify-between cursor-pointer">
            <div className="flex items-center gap-2">
              <Disc3 size={16} className="text-[var(--color-text-secondary)]" />
              <span className="text-sm text-[var(--color-text)]">Vinyl Mode</span>
            </div>
            <input
              type="checkbox"
              checked={settings.vinylMode}
              onChange={toggleVinylMode}
              className="w-5 h-5 rounded accent-[var(--color-accent)]"
            />
          </label>
          <p className="text-xs text-[var(--color-text-secondary)] -mt-2">
            Spinning vinyl disc on the Now Playing screen
          </p>
        </GlassCard>
      </motion.section>

      {/* Background picker */}
      <motion.section variants={fadeInUp}>
        <div className="flex items-center gap-2 mb-3">
          <ImageIcon size={18} className="text-[var(--color-accent)]" />
          <h2 className="font-display text-lg font-semibold text-[var(--color-text)]">
            Background
          </h2>
        </div>
        <p className="text-xs text-[var(--color-text-secondary)] mb-3">
          Tap to switch — auto-rotates between both every 3 minutes
        </p>
        <div className="grid grid-cols-2 gap-2">
          {ENVIRONMENTS.map((env) => {
            const config = ENVIRONMENT_CONFIGS[env];
            const isActive = settings.currentEnvironment === env;
            return (
              <button
                key={env}
                type="button"
                onClick={() => setEnvironment(env)}
                aria-label={config.name}
                aria-pressed={isActive}
                className={`
                  relative overflow-hidden rounded-2xl p-3 text-left transition-all
                  border-2 h-20
                  ${isActive
                    ? "border-[var(--color-accent)] shadow-soft scale-[1.02]"
                    : "border-[var(--color-card-border)] hover:border-[var(--color-accent-light)]"
                  }
                `}
              >
                <div
                  className="absolute inset-0"
                  style={{ background: config.gradient }}
                />
                <div className="absolute inset-0 bg-black/10" />
                <span
                  className={`relative z-10 text-xs font-semibold leading-tight ${
                    env === "night-sky"
                      ? "text-white"
                      : "text-[var(--color-text)]"
                  }`}
                >
                  {config.name}
                </span>
                {isActive && (
                  <span className="absolute top-2 right-2 z-10 w-2 h-2 rounded-full bg-[var(--color-accent)] shadow-glow" />
                )}
              </button>
            );
          })}
        </div>
      </motion.section>

      {/* Storage */}
      <motion.section variants={fadeInUp}>
        <div className="flex items-center gap-2 mb-3">
          <HardDrive size={18} className="text-[var(--color-accent)]" />
          <h2 className="font-display text-lg font-semibold text-[var(--color-text)]">
            Storage
          </h2>
        </div>
        <GlassCard>
          {stats && (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--color-text-secondary)]">Songs</span>
                <span className="text-[var(--color-text)]">{stats.totalSongs}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-text-secondary)]">Playlists</span>
                <span className="text-[var(--color-text)]">{stats.totalPlaylists}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-text-secondary)]">Favorites</span>
                <span className="text-[var(--color-text)]">{stats.totalFavorites}</span>
              </div>
              <div className="flex justify-between border-t border-[var(--color-card-border)] pt-2">
                <span className="text-[var(--color-text-secondary)]">Total Size</span>
                <span className="text-[var(--color-text)] font-medium">
                  {formatBytes(stats.estimatedSizeBytes)}
                </span>
              </div>
            </div>
          )}
        </GlassCard>
      </motion.section>

      {/* Reset */}
      <motion.section variants={fadeInUp}>
        <div className="flex items-center gap-2 mb-3">
          <RotateCcw size={18} className="text-[var(--color-accent)]" />
          <h2 className="font-display text-lg font-semibold text-[var(--color-text)]">
            Reset
          </h2>
        </div>
        <div className="space-y-2">
          {!confirmReset ? (
            <Button
              variant="danger"
              className="w-full"
              onClick={() => setConfirmReset(true)}
            >
              <RotateCcw size={16} className="mr-2" /> Reset App
            </Button>
          ) : (
            <GlassCard className="text-center space-y-3">
              <p className="text-sm text-red-500">
                This will delete ALL your music and data. Are you sure?
              </p>
              <div className="flex gap-2">
                <Button variant="danger" size="sm" className="flex-1" onClick={handleReset}>
                  Yes, Reset
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1"
                  onClick={() => setConfirmReset(false)}
                >
                  Cancel
                </Button>
              </div>
            </GlassCard>
          )}
        </div>
      </motion.section>

      {/* App info */}
      <motion.div variants={fadeInUp} className="text-center py-4">
        <p className="text-xs text-[var(--color-text-secondary)] opacity-60">
          for Mia — made with love
        </p>
      </motion.div>
    </motion.div>
  );
}
