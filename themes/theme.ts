// themes/theme.ts
import { useColorScheme } from "react-native";

/** Central theme contract based on your current styles */
export type AppTheme = {
  // base
  bg: string;
  text: string;
  muted: string;

  // surfaces
  card: string;
  border: string;
  disabledBg: string;
  modalBg: string;

  // inputs
  inputBg: string;
  inputBorder: string;
  placeholder: string;

  // buttons
  accent: string;
  onAccent: string;
  buttonSecondary: string;

  // semantic
  success: string;
  danger: string;

  // list/pills
  listRowBg: string;
  listRowSelectedBg: string;
  listRowSelectedBorder: string;
  listRowEmptyText: string;

  // misc
  iconButtonBg: string;
  iconButtonBorder: string;
  dashedBorder: string;

  // overlays / banners
  overlay: string;
  bannerBg: string;
  bannerText: string;
};

export const lightTheme: AppTheme = {
  // base
  bg: "#ffffff",
  text: "#0f0f0f",
  muted: "#666666",

  // surfaces
  card: "#f2f2f2",        // replaces #f2f2f2 / #eee cards
  border: "#cccccc",      // replaces #ccc
  disabledBg: "#eeeeee",  // replaces #eee read-only
  modalBg: "#ffffff",     // replaces #fff modal

  // inputs
  inputBg: "#ffffff",
  inputBorder: "#cccccc",
  placeholder: "#666666",

  // buttons
  accent: "#007bff",      // replaces primary blue
  onAccent: "#ffffff",
  buttonSecondary: "#cccccc",

  // semantic
  success: "green",       // used in add buttons
  danger: "red",          // used in delete buttons

  // list/pills
  listRowBg: "#f5f5f5",
  listRowSelectedBg: "#eef4ff",
  listRowSelectedBorder: "#007bff",
  listRowEmptyText: "#666666",

  // misc
  iconButtonBg: "#ffffff",
  iconButtonBorder: "#dddddd",
  dashedBorder: "#000000",

  // overlays / banners
  overlay: "rgba(0,0,0,0.5)",
  bannerBg: "#fff7e6",    // deload banner
  bannerText: "#8a5200",
};

export const darkTheme: AppTheme = {
  // base
  bg: "#121212",            // softer dark background
  text: "#f5f5f5",
  muted: "#aaaaaa",

  // surfaces
  card: "#1c1c1e",          // matches iOS/Android card surfaces
  border: "#2c2c2e",
  disabledBg: "#2a2a2a",
  modalBg: "#1a1a1a",

  // inputs
  inputBg: "#1c1c1e",
  inputBorder: "#3a3a3c",
  placeholder: "#888888",

  // buttons
  accent: "#4f8cff",
  onAccent: "#ffffff",
  buttonSecondary: "#3a3a3c",

  // semantic
  success: "#4caf50",
  danger: "#ef5350",

  // list/pills
  listRowBg: "#1e1e1e",
  listRowSelectedBg: "#0f1a2e",
  listRowSelectedBorder: "#4f8cff",
  listRowEmptyText: "#aaaaaa",

  // misc
  iconButtonBg: "#1c1c1e",
  iconButtonBorder: "#333333",
  dashedBorder: "#444444",

  // overlays / banners
  overlay: "rgba(0,0,0,0.6)",
  bannerBg: "#2a1d00",
  bannerText: "#ffb74d",
};

/** Hook to consume the active theme (system-based) */
export function useAppTheme() {
  const scheme = useColorScheme(); // 'light' | 'dark' | null
  const theme = scheme === "dark" ? darkTheme : lightTheme;
  return { scheme: scheme ?? "light", theme };
}