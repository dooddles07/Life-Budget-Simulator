import { useRouter } from "expo-router";
import { ArrowDownRight, ArrowUpRight, TrendingDown, TriangleAlert, Wand2 } from "@/lib/lucide-icons";
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
import { ErrorState, LoadingState } from "@/components/ui/AsyncState";
import { ICON_STROKE, iconSize, radius, space } from "@/constants/theme";
import { CATEGORY_MAP } from "@/data/seed";
import { computeBudgetInsights, type BudgetInsight } from "@/lib/aggregate";
import { formatMoney } from "@/lib/format";
import { useInsightsData } from "@/hooks/useInsightsData";
import { useMotion } from "@/hooks/useMotion";
import { useCurrency, useTheme } from "@/hooks/useTheme";

export default function InsightsScreen() {
  const theme = useTheme();
  const currency = useCurrency();
  const router = useRouter();
  const { enter, enterList } = useMotion();
  const { width } = useWindowDimensions();
  const { data, loading, error, refetch } = useInsightsData();

  const [activeDay, setActiveDay] = useState<number | undefined>(undefined);

  const slices = useMemo(() => {
    if (!data) return [];
    return [...data.budgetsSpend]
      .sort((a, b) => b.spent - a.spent)
      .slice(0, 6)
      .filter((b) => b.spent > 0)
      .map((b) => ({
        key: b.id,
        value: b.spent,
        color: theme.categories[CATEGORY_MAP[b.category].swatch],
        label: CATEGORY_MAP[b.category].label,
      }));
  }, [data, theme]);

  const insights = useMemo(() => (data ? computeBudgetInsights(data.budgetsSpend) : []), [data]);

  if (loading) return <LoadingState />;
  if (error || !data) {
    return <ErrorState message={error ?? "Couldn't load your insights."} onRetry={refetch} />;
  }

  const { weeklySpend, netWorthHistory } = data;
  const totalSpent = slices.reduce((s, d) => s + d.value, 0);
  const weekTotal = weeklySpend.reduce((s, d) => s + d.value, 0);
  const chartWidth = Math.min(width, 460) - space.lg * 2 - space.lg * 2;
  const netWorthChangePct =
    netWorthHistory[0]?.value ? ((netWorthHistory[netWorthHistory.length - 1].value - netWorthHistory[0].value) / Math.abs(netWorthHistory[0].value)) * 100 : 0;

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
                  totalSpent > 0 ? (slice.value / totalSpent) * 100 : 0
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
                  {Math.round(totalSpent > 0 ? (slice.value / totalSpent) * 100 : 0)}%
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
                  : weeklySpend[activeDay]?.label}
              </Text>
            </View>
            <NumberTicker
              value={activeDay === undefined ? weekTotal : (weeklySpend[activeDay]?.value ?? 0)}
              variant="h2"
            />
          </View>

          <BarChart
            data={weeklySpend}
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
              {netWorthChangePct >= 0 ? (
                <ArrowUpRight size={iconSize.sm} strokeWidth={ICON_STROKE} color={theme.success} />
              ) : (
                <ArrowDownRight size={iconSize.sm} strokeWidth={ICON_STROKE} color={theme.danger} />
              )}
              <Text
                variant="captionSb"
                tone={netWorthChangePct >= 0 ? "success" : "danger"}
                tabular
              >
                {netWorthChangePct >= 0 ? "+" : ""}
                {netWorthChangePct.toFixed(1)}%
              </Text>
            </View>
          </View>

          <LineChart
            data={netWorthHistory}
            width={chartWidth}
            height={168}
            color={theme.accent}
            markIndex={netWorthHistory.length - 1}
          />
        </Card>
      </Animated.View>

      <SectionHeader title="What stands out" />
      <View style={{ gap: space.md, marginBottom: space.xl }}>
        {insights.length > 0 ? (
          insights.map((insight, i) => (
            <Animated.View key={insight.id} entering={enterList(i + 3)}>
              <InsightCard insight={insight} currency={currency} />
            </Animated.View>
          ))
        ) : (
          <Card padded="lg">
            <Text variant="body" tone="muted">
              Every envelope is on track this month.
            </Text>
          </Card>
        )}
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

function InsightCard({
  insight,
  currency,
}: {
  insight: BudgetInsight;
  currency: Parameters<typeof formatMoney>[1];
}) {
  const theme = useTheme();
  const category = CATEGORY_MAP[insight.category];

  const tone = insight.tone === "bad" ? theme.danger : theme.warning;
  // Icon differs per tone so the signal is not colour-only.
  const Icon = insight.tone === "bad" ? TriangleAlert : TrendingDown;

  const title = insight.tone === "bad" ? `${category.label} is over budget` : `${category.label} is close to its limit`;
  const body =
    insight.tone === "bad"
      ? `${formatMoney(insight.amount, currency)} past the envelope this month.`
      : `${formatMoney(insight.amount, currency)} left before you hit the limit.`;

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
        <Text variant="labelSb">{title}</Text>
        <Text variant="caption" tone="muted">
          {body}
        </Text>
      </View>
    </Card>
  );
}
