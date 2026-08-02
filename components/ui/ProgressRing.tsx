import { useEffect, type ReactNode } from "react";
import { View } from "react-native";
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withDelay,
} from "react-native-reanimated";
import Svg, { Circle, Defs, LinearGradient, Stop } from "react-native-svg";

import { useMotion } from "@/hooks/useMotion";
import { useTheme } from "@/hooks/useTheme";

/**
 * Ported from 21st.dev "Financial Score Cards" (@designali-in/financial-score-cards),
 * whose half-circle indicator animates its stroke on mount. Reproduced with
 * react-native-svg + an animated strokeDashoffset.
 */

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export type ProgressRingProps = {
  /** 0-1. Values above 1 are clamped but should be signalled by colour too. */
  progress: number;
  size?: number;
  thickness?: number;
  /** Sweep in degrees; 360 = full ring, 240 = gauge. */
  sweep?: number;
  color?: string;
  trackColor?: string;
  /** Second gradient stop; omit for a flat stroke. */
  colorEnd?: string;
  delay?: number;
  children?: ReactNode;
  gradientId?: string;
};

export function ProgressRing({
  progress,
  size = 160,
  thickness = 12,
  sweep = 360,
  color,
  colorEnd,
  trackColor,
  delay = 0,
  children,
  gradientId = "ring",
}: ProgressRingProps) {
  const theme = useTheme();
  const { toSpring, reduce } = useMotion();

  const stroke = color ?? theme.primary;
  const strokeEnd = colorEnd ?? theme.primaryBright;
  const track = trackColor ?? theme.surfacePressed;

  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const arc = circumference * (sweep / 360);
  const rotation = sweep === 360 ? -90 : 90 + (360 - sweep) / 2;

  const value = useSharedValue(0);
  const clamped = Math.min(1, Math.max(0, progress));

  useEffect(() => {
    value.value = withDelay(reduce ? 0 : delay, toSpring(clamped));
  }, [clamped, delay, reduce, toSpring, value]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: arc * (1 - value.value),
  }));

  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <Svg width={size} height={size} style={{ position: "absolute" }}>
        <Defs>
          <LinearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={stroke} />
            <Stop offset="1" stopColor={strokeEnd} />
          </LinearGradient>
        </Defs>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={track}
          strokeWidth={thickness}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${arc} ${circumference}`}
          transform={`rotate(${rotation} ${size / 2} ${size / 2})`}
        />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={`url(#${gradientId})`}
          strokeWidth={thickness}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${arc} ${circumference}`}
          animatedProps={animatedProps}
          transform={`rotate(${rotation} ${size / 2} ${size / 2})`}
        />
      </Svg>
      {children}
    </View>
  );
}
