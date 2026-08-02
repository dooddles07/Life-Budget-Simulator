import { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
} from "react-native-reanimated";

import { radius, space } from "@/constants/theme";
import { useMotion } from "@/hooks/useMotion";
import { useTheme } from "@/hooks/useTheme";

/**
 * Ported from 21st.dev "Spending Limit Card" (@lavikatiyar/card-8). The original
 * fills N discrete segments and staggers them in at 0.08s intervals; kept here,
 * with the stagger moved onto Reanimated delays.
 */

export type SegmentedBarProps = {
  /** 0-1; may exceed 1 to signal an overrun. */
  progress: number;
  segments?: number;
  color: string;
  trackColor?: string;
  /** Colour applied to segments past 100%. */
  overflowColor?: string;
  height?: number;
  delay?: number;
};

export function SegmentedBar({
  progress,
  segments = 12,
  color,
  trackColor,
  overflowColor,
  height = 8,
  delay = 0,
}: SegmentedBarProps) {
  const theme = useTheme();
  const track = trackColor ?? theme.surfacePressed;
  const over = progress > 1;

  return (
    <View
      style={{ flexDirection: "row", gap: space.xs / 1.3 }}
      accessibilityRole="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress * 100)}
    >
      {Array.from({ length: segments }).map((_, i) => (
        <Segment
          key={i}
          index={i}
          filled={progress > i / segments}
          color={over ? (overflowColor ?? theme.danger) : color}
          trackColor={track}
          height={height}
          delay={delay}
        />
      ))}
    </View>
  );
}

function Segment({
  index,
  filled,
  color,
  trackColor,
  height,
  delay,
}: {
  index: number;
  filled: boolean;
  color: string;
  trackColor: string;
  height: number;
  delay: number;
}) {
  const { toSpring, reduce } = useMotion();
  const t = useSharedValue(0);

  useEffect(() => {
    t.value = withDelay(reduce ? 0 : delay + index * 28, toSpring(filled ? 1 : 0));
  }, [filled, index, delay, reduce, toSpring, t]);

  const style = useAnimatedStyle(() => ({
    backgroundColor: t.value > 0.5 ? color : trackColor,
    // Grows on the cross axis only -- flex:1 keeps the layout box fixed.
    transform: [{ scaleY: 0.55 + 0.45 * t.value }],
    opacity: 0.45 + 0.55 * t.value,
  }));

  return (
    <Animated.View
      style={[{ flex: 1, height, borderRadius: radius.pill }, style]}
    />
  );
}
