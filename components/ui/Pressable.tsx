import { forwardRef } from "react";
import {
  Pressable as RNPressable,
  type PressableProps as RNPressableProps,
  type View,
  type ViewStyle,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { PRESS_SCALE, TAP_MIN, motion } from "@/constants/theme";
import { useMotion } from "@/hooks/useMotion";

const AnimatedPressable = Animated.createAnimatedComponent(RNPressable);

export type PressableProps = Omit<RNPressableProps, "style"> & {
  style?: ViewStyle | (ViewStyle | false | undefined)[];
  /** Scale target while held. Set 1 to opt out. */
  pressScale?: number;
  /** Dim instead of scale -- for full-width rows where scaling looks wrong. */
  dimOnly?: boolean;
  /** Skip the automatic 44x44 minimum target. */
  noMinSize?: boolean;
};

/**
 * Every tappable surface in the app. Guarantees press feedback under 100ms and
 * a >=44pt target, and never animates a layout-affecting property.
 */
export const Pressable = forwardRef<View, PressableProps>(function Pressable(
  {
    style,
    pressScale = PRESS_SCALE,
    dimOnly,
    noMinSize,
    onPressIn,
    onPressOut,
    disabled,
    hitSlop,
    ...rest
  },
  ref
) {
  const held = useSharedValue(0);
  const { reduce } = useMotion();

  // The disabled dim lives here rather than in a plain style: this animated style
  // is applied last, so an opacity set earlier in the array would be overwritten.
  const animatedStyle = useAnimatedStyle(() => ({
    transform: dimOnly || reduce ? [] : [{ scale: 1 - (1 - pressScale) * held.value }],
    opacity: disabled ? 0.45 : 1 - (dimOnly ? 0.4 : 0.15) * held.value,
  }));

  return (
    <AnimatedPressable
      ref={ref}
      accessibilityState={{ disabled: !!disabled }}
      // react-native-web 0.21 drops accessibilityState, so the aria form is
      // passed too; RN core maps aria-* natively, keeping one source of truth.
      aria-disabled={!!disabled}
      disabled={disabled}
      hitSlop={hitSlop ?? 8}
      onPressIn={(e) => {
        held.value = withTiming(1, { duration: reduce ? 0 : motion.press });
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        held.value = withTiming(0, { duration: reduce ? 0 : motion.press * 1.6 });
        onPressOut?.(e);
      }}
      style={[
        !noMinSize && {
          minHeight: TAP_MIN,
          minWidth: TAP_MIN,
          justifyContent: "center" as const,
        },
        ...(Array.isArray(style) ? style : [style]),
        animatedStyle,
      ]}
      {...rest}
    />
  );
});
