import { useEffect } from "react";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";

import { Pressable } from "@/components/ui/Pressable";
import { radius } from "@/constants/theme";
import { useHaptics } from "@/hooks/useHaptics";
import { useMotion } from "@/hooks/useMotion";
import { useTheme } from "@/hooks/useTheme";

const TRACK_W = 52;
const TRACK_H = 32;
const KNOB = 26;

export function Switch({
  value,
  onChange,
  label,
  disabled,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
  label: string;
  disabled?: boolean;
}) {
  const theme = useTheme();
  const haptics = useHaptics();
  const { toSpring } = useMotion();

  const t = useSharedValue(value ? 1 : 0);

  useEffect(() => {
    t.value = toSpring(value ? 1 : 0);
  }, [value, toSpring, t]);

  const trackStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      t.value,
      [0, 1],
      [theme.surfacePressed, theme.primary]
    ),
  }));

  const knobStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: t.value * (TRACK_W - KNOB - 6) }],
  }));

  return (
    <Pressable
      noMinSize
      pressScale={0.94}
      disabled={disabled}
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityState={{ checked: value, disabled: !!disabled }}
      aria-checked={value}
      onPress={() => {
        haptics.select();
        onChange(!value);
      }}
      // Padded to clear the 44pt minimum without enlarging the visible track.
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      style={{ width: TRACK_W, height: TRACK_H }}
    >
      <Animated.View
        style={[
          {
            width: TRACK_W,
            height: TRACK_H,
            borderRadius: radius.pill,
            justifyContent: "center",
            paddingHorizontal: 3,
            borderWidth: 1,
            borderColor: theme.borderStrong,
          },
          trackStyle,
        ]}
      >
        <Animated.View
          style={[
            {
              width: KNOB,
              height: KNOB,
              borderRadius: radius.pill,
              backgroundColor: theme.fg,
            },
            knobStyle,
          ]}
        />
      </Animated.View>
    </Pressable>
  );
}
