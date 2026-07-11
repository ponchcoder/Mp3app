"use client";

/**
 * Settings Context — theme, animation, and app preferences
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import type { AppSettings, ThemeMode, EnvironmentType } from "@/types";
import { getSettings, saveSettings, DEFAULT_SETTINGS } from "@/storage/indexeddb";
import { applyTheme } from "@/utils/theme";
import { normalizeEnvironment } from "@/hooks/useEnvironment";

interface SettingsContextValue {
  settings: AppSettings;
  updateSettings: (updates: Partial<AppSettings>) => void;
  setTheme: (theme: ThemeMode) => void;
  toggleNoAnimation: () => void;
  toggleVinylMode: () => void;
  setEnvironment: (environment: EnvironmentType) => void;
  setRecipientName: (name: string) => void;
  isLoaded: boolean;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const stored = await getSettings();
      const merged = {
        ...stored,
        theme: "pink" as const,
        recipientName: "Mia",
        currentEnvironment: normalizeEnvironment(stored.currentEnvironment),
      };
      setSettings(merged);
      applyTheme("pink");
      setIsLoaded(true);
    })();
  }, []);

  const updateSettings = useCallback((updates: Partial<AppSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...updates };
      saveSettings(next);
      if (updates.theme) applyTheme(updates.theme);
      return next;
    });
  }, []);

  const setTheme = useCallback(
    (theme: ThemeMode) => updateSettings({ theme }),
    [updateSettings]
  );

  const toggleNoAnimation = useCallback(
    () => updateSettings({ noAnimation: !settings.noAnimation }),
    [updateSettings, settings.noAnimation]
  );

  const toggleVinylMode = useCallback(
    () => updateSettings({ vinylMode: !settings.vinylMode }),
    [updateSettings, settings.vinylMode]
  );

  const setEnvironment = useCallback(
    (currentEnvironment: EnvironmentType) =>
      updateSettings({ currentEnvironment, lastEnvironmentChange: Date.now() }),
    [updateSettings]
  );

  const setRecipientName = useCallback(
    (recipientName: string) => updateSettings({ recipientName }),
    [updateSettings]
  );

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSettings,
        setTheme,
        toggleNoAnimation,
        toggleVinylMode,
        setEnvironment,
        setRecipientName,
        isLoaded,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}
