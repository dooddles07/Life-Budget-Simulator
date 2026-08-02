import { useRouter } from "expo-router";
import { ArrowUpRight, Lightbulb, TrendingDown, TriangleAlert, Wand2 } from "lucide-react-native";
import { useMemo, useState } from "react";
import { View, useWindowDimensions } from "react-native";
import Animated from "react-native-reanimated";

import { BarChart } from "@/components/charts/BarChart";
import { DonutChart } from "@/components/charts/DonutChart";
import { LineChart } from "@/components/charts/LineChart";
import { NumberTicker } from "@/components/money/NumberTicker";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Screen } from "@/components/ui/Screen";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Text } from "@/components/ui/Text";
import { ICON_STROKE, iconSize, radius, space } from "@/constants/theme";
import {
  BUDGETS,
  CATEGORY_MAP,
  INSIGHTS,
  NET_WORTH_HISTORY,
  WEEKLY_SPEND,
  type Insight,
} from "@/data/seed";
import { formatMoney } from "@/lib/format";
import { useMotion } from "@/hooks/useMotion";
import { useCurrency, useTheme } from "@/hooks/useTheme";

export default function InsightsScreen() {
  const theme = useTheme();
  const currency = useCurrency();
  const router = useRouter();
  const { enter, enterList } = useMotion();
  const { width } = useWindowDimensions();

  const [activeDay, setActiveDay] = useState<number | undefined>(undefined);

  const slices = useMemo(
    () =>
      [...BUDGETS]
        .sort((a, b) => b.spent - a.spent)
        .slice(0, 6)
        .map((b) => ({
          key: b.id,
          value: b.spent,
          color: theme.categories[CATEGORY_MAP[b.category].swatch],
          label: CATEGORY_MAP[b.category].label,
        })),
    [theme]
  );

  const totalSpent = slices.reduce((s, d) => s + d.value, 0);
  const weekTotal = WEEKLY_SPEND.reduce((s, d) => s + d.value, 0);
  const chartWidth = Math.min(width, 460) - space.lg * 2 - space.lg * 2;

  return (
    <Screen hasTabBar>
      <Animated.View entering={enter()} style={{ marginBottom: space.xl }}>
        <Text variant="h1">Insights</Text>
        <Text variant="body" tone="muted" style={{ marginTop: space.xs }}>
          Where the money actually went
        </Text>
      </Animated.View>

      {/* Category breakdown */}
      <Animated.View entering={enterList(0)} style={{ marginBottom: space.xl }}>
        <Card padded="lg">
          <Text variant="h3" style={{ marginBottom: space.lg }}>
            By category
          </Text>

          <View style={{ alignItems: "center", marginBottom: space.lg }}>
            <DonutChart data={slices} size={196} thickness={24}>
              <View style={{ alignItems: "center" }}>
                <Text variant="caption" tone="muted">
                  Total
                </Text>
                <NumberTicker value={totalSpent} variant="h2" compact />
              </View>
            </DonutChart>
          </View>

          <View style={{ gap: space.md }}>
            {slices.map((slice) => (
              <View
                key={slice.key}
                accessible
                accessibilityLabel={`${slice.label}, ${formatMoney(slice.value, currency)}, ${Math.round(
                  (slice.value / totalSpent) * 100
                )} percent`}
                style={{ flexDirection: "row", alignItems: "center", gap: space.md }}
              >
                <View
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: slice.color,
                  }}
                />
                <Text variant="label" style={{ flex: 1 }} numberOfLines={1}>
                  {slice.label}
                </Text>
                <Text variant="caption" tone="muted" tabular>
                  {Math.round((slice.value / totalSpent) * 100)}%
                </Text>
                <Text variant="labelSb" tabular style={{ minWidth: 82, textAlign: "right" }}>
                  {formatMoney(slice.value, currency)}
                </Text>
              </View>
            ))}
          </View>
        </Card>
      </Animated.View>

      {/* Weekly rhythm */}
      <Animated.View entering={enterList(1)} style={{ marginBottom: space.xl }}>
        <Card padded="lg">
          <View
            style={{
              flexDirection: "row",
              alignItems: "flex-start",
              justifyContent: "space-between",
              marginBottom: space.lg,
            }}
          >
            <View>
              <Text variant="h3">This week</Text>
              <Text variant="caption" tone="muted">
                {activeDay === undefined
                  ? "Tap a bar to isolate a day"
                  : WEEKLY_SPEND[activeDay].label}
              </Text>
            </View>
            <NumberTicker
              value={activeDay === undefined ? weekTotal : WEEKLY_SPEND[activeDay].value}
              variant="h2"
            />
          </View>

          <BarChart
            data={WEEKLY_SPEND}
            activeIndex={activeDay}
            color={theme.primaryBright}
            formatValue={(v) => formatMoney(v, currency)}
            onSelect={(i) => setActiveDay((prev) => (prev === i ? undefined : i))}
          />
        </Card>
      </Animated.View>

      {/* Net worth trend */}
      <Animated.View entering={enterList(2)} style={{ marginBottom: space.xl }}>
        <Card padded="lg">
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: space.lg,
            }}
          >
            <Text variant="h3">Net worth trend</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: space.xs }}>
              <ArrowUpRight size={iconSize.sm} strokeWidth={ICON_STROKE} color={theme.success} />
              <Text variant="captionSb" tone="success" tabular>
                +35.6%
              </Text>
            </View>
          </View>

          <LineChart
            data={NET_WORTH_HISTORY}
            width={chartWidth}
            height={168}
            color={theme.accent}
            markIndex={NET_WORTH_HISTORY.length - 1}
          />
        </Card>
      </Animated.View>

      <SectionHeader title="What stands out" />
      <View style={{ gap: space.md, marginBottom: space.xl }}>
        {INSIGHTS.map((insight, i) => (
          <Animated.View key={insight.id} entering={enterList(i + 3)}>
            <InsightCard insight={insight} />
          </Animated.View>
        ))}
      </View>

      <Animated.View entering={enterList(6)}>
        <Button
          full
          size="lg"
          variant="accent"
          icon={Wand2}
          label="Test a change"
          onPress={() => router.push("/simulator")}
        />
      </Animated.View>
    </Screen>
  );
}

function InsightCard({ insight }: { insight: Insight }) {
  const theme = useTheme();

  const tone =
    insight.tone === "bad" ? theme.danger
    : insight.tone === "warn" ? theme.warning
    : theme.success;

  // Icon differs per tone so the signal is not colour-only.
  const Icon =
    insight.tone === "bad" ? TriangleAlert
    : insight.tone === "warn" ? Lightbulb
    : TrendingDown;

  return (
    <Card
      padded="lg"
      accent={`${tone}44`}
      style={{ flexDirection: "row", gap: space.md }}
    >
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: radius.sm,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: `${tone}1F`,
        }}
      >
        <Icon size={iconSize.md} strokeWidth={ICON_STROKE} color={tone} />
      </View>
      <View style={{ flex: 1, gap: space.xs }}>
        <Text variant="labelSb">{insight.title}</Text>
        <Text variant="caption" tone="muted">
          {insight.body}
        </Text>
      </View>
    </Card>
  );
}
