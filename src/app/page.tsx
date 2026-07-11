"use client";

/**
 * Main application shell — orchestrates all screens, navigation,
 * animated backgrounds, audio analysis, and romantic surprises.
 */

import { useState, useEffect, useCallback } from "react";
import { PlayerProvider, usePlayer } from "@/contexts/PlayerContext";
import { PlayerUIProvider, usePlayerUI } from "@/contexts/PlayerUIContext";
import { SettingsProvider, useSettings } from "@/contexts/SettingsContext";
import { LibraryProvider } from "@/contexts/LibraryContext";
import { AnimatedBackground } from "@/animations/AnimatedBackground";
import { BottomNav } from "@/components/layout/BottomNav";
import { MiniPlayer } from "@/components/layout/MiniPlayer";
import { HomeScreen } from "@/components/screens/HomeScreen";
import { LibraryScreen } from "@/components/screens/LibraryScreen";
import { PlaylistsScreen } from "@/components/screens/PlaylistsScreen";
import { SettingsScreen } from "@/components/screens/SettingsScreen";
import { NowPlayingScreen } from "@/components/screens/NowPlayingScreen";
import { QueuePanel } from "@/components/screens/QueuePanel";
import { SurprisesLayer } from "@/components/ui/SurprisesLayer";
import { useEnvironmentCycle } from "@/hooks/useEnvironment";
import { useAudioAnalyzer } from "@/hooks/useAudioAnalyzer";
import { useSurprises } from "@/hooks/useSurprises";
import { useListeningTime } from "@/hooks/useListeningTime";
import type { TabId } from "@/types";

function AppContent() {
  const [activeTab, setActiveTab] = useState<TabId>("home");
  const { settings, setEnvironment } = useSettings();
  const { currentSong, isPlaying, audioRef } = usePlayer();
  const {
    showFullPlayer,
    showQueue,
    openFullPlayer,
    closeFullPlayer,
    openQueue,
    closeQueue,
    resetAll,
  } = usePlayerUI();

  const noAnimation = settings.noAnimation;
  useEnvironmentCycle(settings.currentEnvironment, noAnimation, setEnvironment);
  const { connect } = useAudioAnalyzer(audioRef, isPlaying);
  const listeningMinutes = useListeningTime(isPlaying);
  const { surprises, triggerFavoriteSparkle, triggerPlayHeart } = useSurprises(
    listeningMinutes,
    noAnimation
  );

  useEffect(() => {
    if (isPlaying) connect();
  }, [isPlaying, connect]);

  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      navigator.serviceWorker?.getRegistrations().then((regs) => {
        regs.forEach((r) => r.unregister());
      });
      return;
    }
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);

  const handleTabChange = useCallback(
    (tab: TabId) => {
      setActiveTab(tab);
      closeFullPlayer();
    },
    [closeFullPlayer]
  );

  const renderScreen = () => {
    switch (activeTab) {
      case "home":
        return <HomeScreen key="home" />;
      case "library":
        return <LibraryScreen key="library" />;
      case "playlists":
        return <PlaylistsScreen key="playlists" />;
      case "settings":
        return <SettingsScreen key="settings" />;
      default:
        return null;
    }
  };

  const showMiniPlayer = !!currentSong && !showFullPlayer;

  return (
    <div className={`relative min-h-dvh ${noAnimation ? "no-animations" : ""}`}>
      <AnimatedBackground
        environment={settings.currentEnvironment}
        noAnimation={noAnimation}
      />

      <SurprisesLayer surprises={surprises} />

      <main className="relative z-10" role="main">
        {renderScreen()}
      </main>

      {showMiniPlayer && <MiniPlayer onOpenFullPlayer={openFullPlayer} />}

      {showFullPlayer && currentSong && (
        <NowPlayingScreen
          onClose={closeFullPlayer}
          onOpenQueue={openQueue}
          onFavoriteToggle={triggerFavoriteSparkle}
          onPlayHeart={triggerPlayHeart}
        />
      )}

      {showQueue && (
        <QueuePanel onClose={closeQueue} onClear={resetAll} />
      )}

      {!showFullPlayer && (
        <BottomNav
          activeTab={activeTab}
          onTabChange={handleTabChange}
          onOpenPlayer={openFullPlayer}
          hasActiveTrack={!!currentSong}
        />
      )}
    </div>
  );
}

function AppWithPlayerUI() {
  return (
    <PlayerUIProvider>
      <AppContent />
    </PlayerUIProvider>
  );
}

export default function Home() {
  return (
    <SettingsProvider>
      <LibraryProvider>
        <PlayerProvider>
          <AppWithPlayerUI />
        </PlayerProvider>
      </LibraryProvider>
    </SettingsProvider>
  );
}
