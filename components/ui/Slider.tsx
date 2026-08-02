import { useCallback, useState } from "react";
import { View, type LayoutChangeEvent } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { Text } from "@/components/ui/Text";
import { TAP_MIN, motion, radius, space } from "@/constants/theme";
import { useMotion } from "@/hooks/useMotion";
import { useTheme } from "@/hooks/useTheme";

const THUMB = 28;

export type SliderProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  /** Rendered to the right of the label; receives the live value. */
  format: (v: number) => string;
  onChange: (v: number) => void;
  color?: string;
  /** Fires when the thumb crosses a step -- wire to selection haptics. */
  onStepCross?: () => void;
};

/**
 * Worklet-driven so the track follows the finger on the UI thread; React state
 * is only updated on step changes, which keeps the projected chart at 60fps.
 */
export function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  format,
  onChange,
  color,
  onStepCross,
}: SliderProps) {
  const theme = useTheme();
  const { reduce } = useMotion();
  const tint = color ?? theme.primaryBright;

  const [display, setDisplay] = useState(value);

  const trackWidth = useSharedValue(0);
  const position = useSharedValue(0);
  const dragging = useSharedValue(0);
  const startPosition = useSharedValue(0);

  const onLayout = useCallback(
    (e: LayoutChangeEvent) => {
      const w = e.nativeEvent.layout.width - THUMB;
      trackWidth.value = w;
      position.value = ((value - min) / (max - min)) * w;
    },
    // Deliberately excludes `value`: re-seeding position mid-drag would fight the gesture.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [min, max]
  );

  const commit = useCallback(
    (next: number) => {
      setDisplay(next);
      onChange(next);
    },
    [onChange]
  );

  const lastStep = useSharedValue(value);

  const toValue = (px: number) => {
    "worklet";
    if (trackWidth.value <= 0) return min;
    const ratio = Math.min(1, Math.max(0, px / trackWidth.value));
    const raw = min + ratio * (max - min);
    return Math.round(raw / step) * step;
  };

  const pan = Gesture.Pan()
    // Claim horizontal drags, hand vertical ones back to the enclosing ScrollView.
    // Without these the parent scroll wins every gesture and the thumb never moves.
    .activeOffsetX([-6, 6])
    .failOffsetY([-14, 14])
    .onBegin(() => {
      dragging.value = withTiming(1, { duration: reduce ? 0 : motion.press });
      startPosition.value = position.value;
    })
    .onUpdate((e) => {
      const next = Math.min(
        trackWidth.value,
        Math.max(0, startPosition.value + e.translationX)
      );
      position.value = next;
      const stepped = toValue(next);
      if (stepped !== lastStep.value) {
        lastStep.value = stepped;
        runOnJS(commit)(stepped);
        if (onStepCross) runOnJS(onStepCross)();
      }
    })
    .onFinalize(() => {
      dragging.value = withTiming(0, { duration: reduce ? 0 : motion.micro });
      // Snap the thumb onto the committed step.
      const snapped = ((lastStep.value - min) / (max - min)) * trackWidth.value;
      position.value = reduce
        ? withTiming(snapped, { duration: 0 })
        : withSpring(snapped, motion.spring);
    });

  const tap = Gesture.Tap().onEnd((e) => {
    const next = Math.min(trackWidth.value, Math.max(0, e.x - THUMB / 2));
    const stepped = toValue(next);
    lastStep.value = stepped;
    position.value = reduce
      ? withTiming(((stepped - min) / (max - min)) * trackWidth.value, { duration: 0 })
      : withSpring(((stepped - min) / (max - min)) * trackWidth.value, motion.spring);
    runOnJS(commit)(stepped);
    if (onStepCross) runOnJS(onStepCross)();
  });

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: position.value },
      { scale: 1 + dragging.value * 0.18 },
    ],
  }));

  const fillStyle = useAnimatedStyle(() => ({
    width: position.value + THUMB / 2,
  }));

  const haloStyle = useAnimatedStyle(() => ({
    opacity: dragging.value * 0.28,
    transform: [{ translateX: position.value }, { scale: 0.9 + dragging.value * 0.9 }],
  }));

  return (
    <View style={{ gap: space.md }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Text variant="label" tone="muted">
          {label}
        </Text>
        <Text variant="labelSb" tabular style={{ color: tint }}>
          {format(display)}
        </Text>
      </View>

      <GestureDetector gesture={Gesture.Race(pan, tap)}>
        <View
          onLayout={onLayout}
          accessible
          accessibilityRole="adjustable"
          accessibilityLabel={label}
          // aria-* is the form that reaches both the native accessibility tree and
          // the DOM; accessibilityValue alone is dropped by react-native-web 0.21.
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={display}
          aria-valuetext={format(display)}
          accessibilityActions={[{ name: "increment" }, { name: "decrement" }]}
          onAccessibilityAction={(e) => {
            const delta = e.nativeEvent.actionName === "increment" ? step : -step;
            const next = Math.min(max, Math.max(min, display + delta));
            lastStep.value = next;
            position.value = withTiming(
              ((next - min) / (max - min)) * trackWidth.value,
              { duration: reduce ? 0 : motion.micro }
            );
            commit(next);
          }}
          style={{ height: TAP_MIN, justifyContent: "center" }}
        >
          <View
            style={{
              height: 10,
              borderRadius: radius.pill,
              backgroundColor: theme.surfacePressed,
              overflow: "hidden",
            }}
          >
            <Animated.View
              style={[
                { height: "100%", borderRadius: radius.pill, backgroundColor: tint },
                fillStyle,
              ]}
            />
          </View>

          <Animated.View
            style={[
              {
                pointerEvents: "none",
                position: "absolute",
                width: THUMB,
                height: THUMB,
                borderRadius: radius.pill,
                backgroundColor: tint,
              },
              haloStyle,
            ]}
          />
          <Animated.View
            style={[
              {
                pointerEvents: "none",
                position: "absolute",
                width: THUMB,
                height: THUMB,
                borderRadius: radius.pill,
                backgroundColor: theme.fg,
                borderWidth: 3,
                borderColor: tint,
              },
              thumbStyle,
            ]}
          />
        </View>
      </GestureDetector>
    </View>
  );
}
