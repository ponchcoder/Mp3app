/**
 * Theme configuration and CSS variable management
 */

import type { ThemeMode } from "@/types";

/** Theme color palettes */
export interface ThemeColors {
  bg: string;
  bgSecondary: string;
  text: string;
  textSecondary: string;
  accent: string;
  accentLight: string;
  card: string;
  cardBorder: string;
  glass: string;
  glassBorder: string;
  gradient: string;
  playerBg: string;
  shadow: string;
}

export const THEMES: Record<ThemeMode, ThemeColors> = {
  light: {
    bg: "#FFFDF8",
    bgSecondary: "#FFF9F0",
    text: "#4A3728",
    textSecondary: "#8B7355",
    accent: "#F4729A",
    accentLight: "#FFC9D9",
    card: "rgba(255, 255, 255, 0.85)",
    cardBorder: "rgba(244, 114, 154, 0.15)",
    glass: "rgba(255, 255, 255, 0.6)",
    glassBorder: "rgba(255, 255, 255, 0.8)",
    gradient: "linear-gradient(135deg, #FFF5F7 0%, #FFF9F0 50%, #F5F3FF 100%)",
    playerBg: "rgba(255, 253, 248, 0.95)",
    shadow: "rgba(244, 114, 154, 0.15)",
  },
  dark: {
    bg: "#1A1520",
    bgSecondary: "#251F2E",
    text: "#F5E6D3",
    textSecondary: "#B8A9C9",
    accent: "#FF8FB3",
    accentLight: "#4A3040",
    card: "rgba(37, 31, 46, 0.85)",
    cardBorder: "rgba(255, 143, 179, 0.15)",
    glass: "rgba(37, 31, 46, 0.6)",
    glassBorder: "rgba(255, 143, 179, 0.2)",
    gradient: "linear-gradient(135deg, #1A1520 0%, #251F2E 50%, #1E1830 100%)",
    playerBg: "rgba(26, 21, 32, 0.95)",
    shadow: "rgba(255, 143, 179, 0.1)",
  },
  pink: {
    bg: "#FFF0F5",
    bgSecondary: "#FFE4EC",
    text: "#5C3040",
    textSecondary: "#9E6070",
    accent: "#FF6B9D",
    accentLight: "#FFB3CC",
    card: "rgba(255, 255, 255, 0.8)",
    cardBorder: "rgba(255, 107, 157, 0.2)",
    glass: "rgba(255, 240, 245, 0.7)",
    glassBorder: "rgba(255, 255, 255, 0.9)",
    gradient: "linear-gradient(135deg, #FFF0F5 0%, #FFE4EC 40%, #F5E6FF 100%)",
    playerBg: "rgba(255, 240, 245, 0.95)",
    shadow: "rgba(255, 107, 157, 0.2)",
  },
  pastel: {
    bg: "#F8F4FF",
    bgSecondary: "#F0EBFF",
    text: "#4A4060",
    textSecondary: "#8B80A8",
    accent: "#B8A9E8",
    accentLight: "#DDD6FE",
    card: "rgba(255, 255, 255, 0.8)",
    cardBorder: "rgba(184, 169, 232, 0.2)",
    glass: "rgba(248, 244, 255, 0.7)",
    glassBorder: "rgba(255, 255, 255, 0.9)",
    gradient: "linear-gradient(135deg, #F8F4FF 0%, #E8F4FD 50%, #FFF0F5 100%)",
    playerBg: "rgba(248, 244, 255, 0.95)",
    shadow: "rgba(184, 169, 232, 0.15)",
  },
  nature: {
    bg: "#F0F7F0",
    bgSecondary: "#E8F5E8",
    text: "#2D4A2D",
    textSecondary: "#5A7A5A",
    accent: "#7CB87C",
    accentLight: "#BBF7D0",
    card: "rgba(255, 255, 255, 0.8)",
    cardBorder: "rgba(124, 184, 124, 0.2)",
    glass: "rgba(240, 247, 240, 0.7)",
    glassBorder: "rgba(255, 255, 255, 0.9)",
    gradient: "linear-gradient(135deg, #F0F7F0 0%, #E8F5E8 40%, #FFF9E8 100%)",
    playerBg: "rgba(240, 247, 240, 0.95)",
    shadow: "rgba(124, 184, 124, 0.15)",
  },
};

/** Apply theme CSS variables to the document root */
export function applyTheme(theme: ThemeMode): void {
  const colors = THEMES[theme];
  const root = document.documentElement;

  root.style.setProperty("--color-bg", colors.bg);
  root.style.setProperty("--color-bg-secondary", colors.bgSecondary);
  root.style.setProperty("--color-text", colors.text);
  root.style.setProperty("--color-text-secondary", colors.textSecondary);
  root.style.setProperty("--color-accent", colors.accent);
  root.style.setProperty("--color-accent-light", colors.accentLight);
  root.style.setProperty("--color-card", colors.card);
  root.style.setProperty("--color-card-border", colors.cardBorder);
  root.style.setProperty("--color-glass", colors.glass);
  root.style.setProperty("--color-glass-border", colors.glassBorder);
  root.style.setProperty("--color-gradient", colors.gradient);
  root.style.setProperty("--color-player-bg", colors.playerBg);
  root.style.setProperty("--color-shadow", colors.shadow);

  root.setAttribute("data-theme", theme);
}

/** Theme display names for the settings UI */
export const THEME_LABELS: Record<ThemeMode, string> = {
  light: "Light",
  dark: "Dark",
  pink: "Pink",
  pastel: "Pastel",
  nature: "Nature",
};
