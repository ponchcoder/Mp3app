"use client";

/**
 * Bottom navigation bar
 */

import { Home, Library, ListMusic, Settings, Music } from "lucide-react";
import type { TabId } from "@/types";

interface BottomNavProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  onOpenPlayer?: () => void;
  hasActiveTrack?: boolean;
}

const tabs: { id: TabId; icon: typeof Home; label: string }[] = [
  { id: "home", icon: Home, label: "Home" },
  { id: "library", icon: Library, label: "Library" },
  { id: "playlists", icon: ListMusic, label: "Playlists" },
  { id: "settings", icon: Settings, label: "Settings" },
];

export function BottomNav({
  activeTab,
  onTabChange,
  onOpenPlayer,
  hasActiveTrack,
}: BottomNavProps) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-[100] px-4 pb-safe"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="mx-auto max-w-lg mb-2 flex items-center gap-1 p-1.5 rounded-2xl bg-[var(--color-player-bg)] backdrop-blur-xl border border-[var(--color-card-border)] shadow-glass">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              aria-label={tab.label}
              aria-current={isActive ? "page" : undefined}
              className="relative flex-1 flex flex-col items-center gap-0.5 py-2 rounded-xl transition-colors"
            >
              {isActive && (
                <div className="absolute inset-0 bg-[var(--color-accent-light)] rounded-xl" />
              )}
              <Icon
                size={20}
                className={`relative z-10 transition-colors ${
                  isActive
                    ? "text-[var(--color-accent)]"
                    : "text-[var(--color-text-secondary)]"
                }`}
              />
              <span
                className={`relative z-10 text-[10px] font-medium ${
                  isActive
                    ? "text-[var(--color-accent)]"
                    : "text-[var(--color-text-secondary)]"
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}

        {hasActiveTrack && (
          <button
            type="button"
            onClick={() => onOpenPlayer?.()}
            aria-label="Now Playing"
            className="relative flex flex-col items-center gap-0.5 py-2 px-3 rounded-xl"
          >
            <Music size={20} className="text-[var(--color-accent)] animate-pulse" />
            <span className="text-[10px] font-medium text-[var(--color-accent)]">Now</span>
          </button>
        )}
      </div>
    </nav>
  );
}
