import { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
} from "react-native-reanimated";

import { Pressable } from "@/components/ui/Pressable";
import { Text } from "@/components/ui/Text";
import { radius, space } from "@/constants/theme";
import { useMotion } from "@/hooks/useMotion";
import { useTheme } from "@/hooks/useTheme";

/**
 * Ported from 21st.dev "Weekly Expense Card" (@ravikatiyar162/card-20), which
 * staggers its bars in with Framer Motion. Same staggered grow, driven by
 * Reanimated springs on scaleY.
 */

export type Bar = { label: string; value: number };

export type BarChartProps = {
  data: Bar[];
  height?: number;
  color?: string;
  /** Index of the bar to highlight; others dim. */
  activeIndex?: number;
  onSelect?: (index: number) => void;
  formatValue?: (v: number) => string;
};

export function BarChart({
  data,
  height = 140,
  color,
  activeIndex,
  onSelect,
  formatValue,
}: BarChartProps) {
  const theme = useTheme();
  const tint = color ?? theme.primaryBright;
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <View style={{ flexDirection: "row", alignItems: "flex-end", gap: space.sm }}>
      {data.map((bar, i) => {
        const active = activeIndex === undefined || activeIndex === i;
        return (
          <Pressable
            key={bar.label}
            noMinSize
            dimOnly
            disabled={!onSelect}
            onPress={() => onSelect?.(i)}
            accessibilityRole={onSelect ? "button" : "text"}
            accessibilityLabel={`${bar.label}: ${formatValue ? formatValue(bar.value) : bar.value}`}
            style={{ flex: 1, alignItems: "center", gap: space.sm }}
          >
            <View style={{ height, justifyContent: "flex-end", width: "100%" }}>
              <GrowBar
                index={i}
                ratio={bar.value / max}
                height={height}
                color={tint}
                dim={!active}
              />
            </View>
            <Text
              variant="caption"
              tone={active ? "muted" : "faint"}
              numberOfLines={1}
            >
              {bar.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function GrowBar({
  index,
  ratio,
  height,
  color,
  dim,
}: {
  index: number;
  ratio: number;
  height: number;
  color: string;
  dim: boolean;
}) {
  const { toSpring, reduce } = useMotion();
  const t = useSharedValue(0);

  useEffect(() => {
    t.value = withDelay(reduce ? 0 : index * 55, toSpring(ratio));
  }, [ratio, index, reduce, toSpring, t]);

  const style = useAnimatedStyle(() => ({
    height: Math.max(4, height * t.value),
  }));

  return (
    <Animated.View
      style={[
        {
          width: "100%",
          borderRadius: radius.sm,
          backgroundColor: color,
          opacity: dim ? 0.3 : 1,
        },
        style,
      ]}
    />
  );
}
