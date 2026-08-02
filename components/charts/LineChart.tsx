import { useMemo } from "react";
import { View } from "react-native";
import Svg, {
  Circle,
  Defs,
  LinearGradient,
  Path,
  Stop,
  Line as SvgLine,
} from "react-native-svg";

import { Text } from "@/components/ui/Text";
import { space } from "@/constants/theme";
import { useTheme } from "@/hooks/useTheme";

export type Point = { label: string; value: number };

export type LineChartProps = {
  data: Point[];
  /** Drawn dashed behind `data` -- the "before" line in a what-if comparison. */
  baseline?: Point[];
  width: number;
  height?: number;
  color?: string;
  baselineColor?: string;
  showLabels?: boolean;
  /** Index of the point to mark with a dot. */
  markIndex?: number;
};

/** Catmull-Rom to cubic Bezier -- keeps the curve smooth without overshooting. */
function smoothPath(points: { x: number; y: number }[]) {
  if (points.length < 2) return "";
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

export function LineChart({
  data,
  baseline,
  width,
  height = 180,
  color,
  baselineColor,
  showLabels = true,
  markIndex,
}: LineChartProps) {
  const theme = useTheme();
  const tint = color ?? theme.accent;
  const baseTint = baselineColor ?? theme.fgFaint;

  const labelSpace = showLabels ? 22 : 0;
  const plotHeight = height - labelSpace;
  const pad = 6;

  const { path, area, basePath, dots, min, max } = useMemo(() => {
    const all = [...data.map((d) => d.value), ...(baseline?.map((d) => d.value) ?? [])];
    const lo = Math.min(...all);
    const hi = Math.max(...all);
    const range = hi - lo || 1;

    const project = (series: Point[]) =>
      series.map((point, i) => ({
        x: pad + (i / Math.max(1, series.length - 1)) * (width - pad * 2),
        y: pad + (1 - (point.value - lo) / range) * (plotHeight - pad * 2),
      }));

    const pts = project(data);
    const line = smoothPath(pts);

    return {
      path: line,
      area: `${line} L ${pts[pts.length - 1].x} ${plotHeight} L ${pts[0].x} ${plotHeight} Z`,
      basePath: baseline ? smoothPath(project(baseline)) : null,
      dots: pts,
      min: lo,
      max: hi,
    };
  }, [data, baseline, width, plotHeight]);

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={`Line chart from ${data[0]?.label} to ${
        data[data.length - 1]?.label
      }, ranging ${Math.round(min).toLocaleString()} to ${Math.round(max).toLocaleString()}`}
    >
      <Svg width={width} height={plotHeight}>
        <Defs>
          <LinearGradient id="lineFill" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={tint} stopOpacity="0.28" />
            <Stop offset="1" stopColor={tint} stopOpacity="0" />
          </LinearGradient>
        </Defs>

        {[0.25, 0.5, 0.75].map((f) => (
          <SvgLine
            key={f}
            x1={0}
            x2={width}
            y1={plotHeight * f}
            y2={plotHeight * f}
            stroke={theme.border}
            strokeWidth={1}
          />
        ))}

        <Path d={area} fill="url(#lineFill)" />

        {basePath ? (
          <Path
            d={basePath}
            stroke={baseTint}
            strokeWidth={2}
            strokeDasharray="5 5"
            fill="none"
          />
        ) : null}

        <Path d={path} stroke={tint} strokeWidth={3} fill="none" strokeLinecap="round" />

        {markIndex !== undefined && dots[markIndex] ? (
          <Circle
            cx={dots[markIndex].x}
            cy={dots[markIndex].y}
            r={5}
            fill={tint}
            stroke={theme.bg}
            strokeWidth={3}
          />
        ) : null}
      </Svg>

      {showLabels ? (
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: space.xs }}>
          {data.map((point, i) => (
            <Text
              key={`${point.label}-${i}`}
              variant="caption"
              tone="faint"
              style={{ flex: 1, textAlign: i === 0 ? "left" : i === data.length - 1 ? "right" : "center" }}
              numberOfLines={1}
            >
              {i === 0 || i === data.length - 1 || i === Math.floor(data.length / 2)
                ? point.label
                : ""}
            </Text>
          ))}
        </View>
      ) : null}
    </View>
  );
}
