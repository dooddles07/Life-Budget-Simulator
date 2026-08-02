import { useEffect } from "react";
import { View, type ViewStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
} from "react-native-reanimated";

import { motion, radius } from "@/constants/theme";
import { useMotion } from "@/hooks/useMotion";
import { useTheme } from "@/hooks/useTheme";

export type ProgressBarProps = {
  /** 0-1; clamped for the fill, but pass `overflow` to signal an overrun. */
  progress: number;
  color?: string;
  trackColor?: string;
  height?: number;
  delay?: number;
  /** Slight spring overshoot -- reads as "juice" on XP and goal bars. */
  bouncy?: boolean;
  style?: ViewStyle;
  accessibilityLabel?: string;
};

export function ProgressBar({
  progress,
  color,
  trackColor,
  height = 8,
  delay = 0,
  bouncy,
  style,
  accessibilityLabel,
}: ProgressBarProps) {
  const theme = useTheme();
  const { toSpring, reduce } = useMotion();
  const clamped = Math.min(1, Math.max(0, progress));
  const t = useSharedValue(0);

  useEffect(() => {
    t.value = withDelay(
      reduce ? 0 : delay,
      toSpring(clamped, bouncy ? motion.springBouncy : motion.springSoft)
    );
  }, [clamped, delay, bouncy, reduce, toSpring, t]);

  const fill = useAnimatedStyle(() => ({
    width: `${t.value * 100}%`,
  }));

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(clamped * 100)}
      style={[
        {
          height,
          borderRadius: radius.pill,
          backgroundColor: trackColor ?? theme.surfacePressed,
          overflow: "hidden",
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          { height: "100%", borderRadius: radius.pill, backgroundColor: color ?? theme.primary },
          fill,
        ]}
      />
    </View>
  );
}
