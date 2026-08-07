import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { useColorScheme } from "react-native";
import { useReducedMotion } from "react-native-reanimated";

import { DEFAULT_CURRENCY, type CurrencyCode } from "@/constants/config";
import { palettes, type Palette, type ThemeName } from "@/constants/theme";

type Prefs = {
  theme: Palette;
  themeName: ThemeName;
  /** null = follow the OS. */
  themeOverride: ThemeName | null;
  setThemeOverride: (t: ThemeName | null) => void;
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
  /** True when the OS asks for reduced motion. */
  reduceMotion: boolean;
  haptics: boolean;
  setHaptics: (v: boolean) => void;
};

const PrefsContext = createContext<Prefs | null>(null);

export function PrefsProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const systemReduceMotion = useReducedMotion();

  const [themeOverride, setThemeOverride] = useState<ThemeName | null>(null);
  const [currency, setCurrency] = useState<CurrencyCode>(DEFAULT_CURRENCY);
  const [haptics, setHaptics] = useState(true);

  const themeName: ThemeName =
    themeOverride ?? (systemScheme === "light" ? "light" : "dark");

  const value = useMemo<Prefs>(
    () => ({
      theme: palettes[themeName],
      themeName,
      themeOverride,
      setThemeOverride,
      currency,
      setCurrency,
      reduceMotion: systemReduceMotion,
      haptics,
      setHaptics,
    }),
    [themeName, themeOverride, currency, systemReduceMotion, haptics]
  );

  return <PrefsContext.Provider value={value}>{children}</PrefsContext.Provider>;
}

function usePrefs() {
  const ctx = useContext(PrefsContext);
  if (!ctx) throw new Error("usePrefs must be used inside PrefsProvider");
  return ctx;
}

export const useTheme = () => usePrefs().theme;
export const useThemeName = () => usePrefs().themeName;
export const useCurrency = () => usePrefs().currency;
export const useReduceMotion = () => usePrefs().reduceMotion;
export const useSettings = usePrefs;
