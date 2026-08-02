import * as Haptics from "expo-haptics";
import { useCallback, useMemo } from "react";
import { Platform } from "react-native";

import { useSettings } from "@/hooks/useTheme";

type Weight = "light" | "medium" | "heavy" | "success" | "warning" | "error" | "select";

const IMPACT: Record<string, Haptics.ImpactFeedbackStyle> = {
  light: Haptics.ImpactFeedbackStyle.Light,
  medium: Haptics.ImpactFeedbackStyle.Medium,
  heavy: Haptics.ImpactFeedbackStyle.Heavy,
};

const NOTIFY: Record<string, Haptics.NotificationFeedbackType> = {
  success: Haptics.NotificationFeedbackType.Success,
  warning: Haptics.NotificationFeedbackType.Warning,
  error: Haptics.NotificationFeedbackType.Error,
};

/**
 * Reserved for confirmations and threshold crossings -- never on every tap.
 * No-ops on web, where expo-haptics has no implementation.
 */
export function useHaptics() {
  const { haptics: enabled } = useSettings();

  const fire = useCallback(
    (weight: Weight = "light") => {
      if (!enabled || Platform.OS === "web") return;
      if (weight === "select") {
        void Haptics.selectionAsync();
      } else if (weight in NOTIFY) {
        void Haptics.notificationAsync(NOTIFY[weight]);
      } else {
        void Haptics.impactAsync(IMPACT[weight]);
      }
    },
    [enabled]
  );

  return useMemo(
    () => ({
      tap: () => fire("light"),
      press: () => fire("medium"),
      select: () => fire("select"),
      success: () => fire("success"),
      warning: () => fire("warning"),
      error: () => fire("error"),
    }),
    [fire]
  );
}
