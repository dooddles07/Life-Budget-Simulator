import { useEffect, type ReactNode } from "react";
import { View } from "react-native";
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withDelay,
} from "react-native-reanimated";
import Svg, { Circle, G } from "react-native-svg";

import { useMotion } from "@/hooks/useMotion";
import { useTheme } from "@/hooks/useTheme";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export type DonutSlice = {
  key: string;
  value: number;
  color: string;
  label: string;
};

export type DonutChartProps = {
  data: DonutSlice[];
  size?: number;
  thickness?: number;
  gap?: number;
  children?: ReactNode;
};

/**
 * Each slice is a dashed circle offset by the running total, so the whole chart
 * is one animated prop per slice -- no path math on the JS thread.
 */
export function DonutChart({
  data,
  size = 200,
  thickness = 26,
  gap = 3,
  children,
}: DonutChartProps) {
  const theme = useTheme();
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const total = data.reduce((sum, d) => sum + d.value, 0) || 1;

  let offset = 0;
  const slices = data.map((slice) => {
    const fraction = slice.value / total;
    const length = Math.max(0, circumference * fraction - gap);
    const entry = { ...slice, length, offset: circumference * offset, fraction };
    offset += fraction;
    return entry;
  });

  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <Svg width={size} height={size} style={{ position: "absolute" }}>
        {/* A transform string, not rotation+origin: the latter emits an invalid
            `transform-origin` DOM attribute on react-native-web. */}
        <G transform={`rotate(-90 ${size / 2} ${size / 2})`}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={theme.surfacePressed}
            strokeWidth={thickness}
            fill="none"
          />
          {slices.map((slice, i) => (
            <Slice
              key={slice.key}
              index={i}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              thickness={thickness}
              color={slice.color}
              length={slice.length}
              offset={slice.offset}
              circumference={circumference}
            />
          ))}
        </G>
      </Svg>
      {children}
    </View>
  );
}

function Slice({
  index,
  cx,
  cy,
  r,
  thickness,
  color,
  length,
  offset,
  circumference,
}: {
  index: number;
  cx: number;
  cy: number;
  r: number;
  thickness: number;
  color: string;
  length: number;
  offset: number;
  circumference: number;
}) {
  const { toSpring, reduce } = useMotion();
  const t = useSharedValue(0);

  useEffect(() => {
    t.value = withDelay(reduce ? 0 : index * 70, toSpring(1));
  }, [index, reduce, toSpring, t]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDasharray: [length * t.value, circumference],
    strokeDashoffset: -offset,
    opacity: t.value,
  }));

  return (
    <AnimatedCircle
      cx={cx}
      cy={cy}
      r={r}
      stroke={color}
      strokeWidth={thickness}
      strokeLinecap="butt"
      fill="none"
      animatedProps={animatedProps}
    />
  );
}
