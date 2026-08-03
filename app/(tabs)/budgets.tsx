import { useRouter } from "expo-router";
import { AlertTriangle, CheckCircle2, Target, TriangleAlert } from "@/lib/lucide-icons";
import { useMemo } from "react";
import { View } from "react-native";
import Animated from "react-native-reanimated";

import { NumberTicker } from "@/components/money/NumberTicker";
import { Card } from "@/components/ui/Card";
import { Pressable } from "@/components/ui/Pressable";
import { Screen } from "@/components/ui/Screen";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SegmentedBar } from "@/components/ui/SegmentedBar";
import { Text } from "@/components/ui/Text";
import { ErrorState, LoadingState } from "@/components/ui/AsyncState";
import { ICON_STROKE, iconSize, radius, space } from "@/constants/theme";
import { CATEGORY_MAP } from "@/data/seed";
import { formatMoney } from "@/lib/format";
import { useBudgetsWithSpend } from "@/hooks/useBudgets";
import type { Budget } from "@/lib/data/budgets";
import { useGoals } from "@/hooks/useGoals";
import { useMotion } from "@/hooks/useMotion";
import { useCurrency, useTheme } from "@/hooks/useTheme";

type BudgetWithSpend = Budget & { spent: number };

export default function BudgetsScreen() {
  const theme = useTheme();
  const currency = useCurrency();
  const router = useRouter();
  const { enter, enterList } = useMotion();
  const { data: budgets, loading, error, refetch } = useBudgetsWithSpend();
  const { data: goals } = useGoals();

  const { totalLimit, totalSpent, overCount, sorted } = useMemo(() => {
    const list = budgets ?? [];
    return {
      totalLimit: list.reduce((s, b) => s + b.monthly_limit, 0),
      totalSpent: list.reduce((s, b) => s + b.spent, 0),
      overCount: list.filter((b) => b.spent > b.monthly_limit).length,
      sorted: [...list].sort((a, b) => b.spent / b.monthly_limit - a.spent / a.monthly_limit),
    };
  }, [budgets]);

  if (loading) return <LoadingState />;
  if (error || !budgets) {
    return <ErrorState message={error ?? "Couldn't load your budgets."} onRetry={refetch} />;
  }

  return (
    <Screen hasTabBar>
      <Animated.View entering={enter()} style={{ marginBottom: space.xl }}>
        <Text variant="h1">Envelopes</Text>
        <Text variant="body" tone="muted" style={{ marginTop: space.xs }}>
          {overCount > 0
            ? `${overCount} envelope${overCount > 1 ? "s" : ""} over the line`
            : "Every envelope still has room"}
        </Text>
      </Animated.View>

      <Animated.View entering={enterList(0)} style={{ marginBottom: space.xl }}>
        <Card padded="lg">
          <Text variant="caption" tone="muted">
            Spent this month
          </Text>
          <View style={{ flexDirection: "row", alignItems: "flex-end", gap: space.sm }}>
            <NumberTicker value={totalSpent} variant="h1" />
            <Text variant="label" tone="muted" tabular style={{ paddingBottom: 4 }}>
              of {formatMoney(totalLimit, currency)}
            </Text>
          </View>
          <View style={{ marginTop: space.lg }}>
            <SegmentedBar
              progress={totalLimit > 0 ? totalSpent / totalLimit : 0}
              segments={14}
              color={theme.primaryBright}
              delay={200}
            />
          </View>
        </Card>
      </Animated.View>

      <SectionHeader
        title="By category"
        subtitle="Sorted by how close each one is to its limit"
        actionLabel="Goals"
        onAction={() => router.push("/goals")}
      />

      <View style={{ gap: space.md }}>
        {sorted.map((budget, i) => (
          <Animated.View key={budget.id} entering={enterList(i + 1)}>
            <EnvelopeCard budget={budget} delay={i * 40} />
          </Animated.View>
        ))}
      </View>

      <Animated.View entering={enterList(sorted.length + 1)} style={{ marginTop: space.xl }}>
        <Pressable
          dimOnly
          noMinSize
          onPress={() => router.push("/goals")}
          accessibilityRole="button"
          accessibilityLabel="Open savings goals"
        >
          <Card
            padded="lg"
            style={{ flexDirection: "row", alignItems: "center", gap: space.md }}
          >
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: radius.md,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: theme.primaryMutedBg,
              }}
            >
              <Target size={iconSize.md} strokeWidth={ICON_STROKE} color={theme.primaryBright} />
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <Text variant="labelSb">Savings goals</Text>
              <Text variant="caption" tone="muted">
                {goals?.length ?? 0} active
              </Text>
            </View>
          </Card>
        </Pressable>
      </Animated.View>
    </Screen>
  );
}

/**
 * Ported from 21st.dev "Spending Limit Card" (@lavikatiyar/card-8): headline
 * amount with a muted "of limit" suffix over a segmented progress bar.
 */
function EnvelopeCard({ budget, delay }: { budget: BudgetWithSpend; delay: number }) {
  const theme = useTheme();
  const currency = useCurrency();

  const category = CATEGORY_MAP[budget.category];
  const Icon = category.icon;
  const swatch = theme.categories[category.swatch];
  const ratio = budget.monthly_limit > 0 ? budget.spent / budget.monthly_limit : 0;

  const over = ratio > 1;
  const spent = !over && ratio >= 1;
  const near = !over && !spent && ratio >= 0.8;

  // Status is carried by icon + text as well as colour, so it survives
  // colour-blindness and greyscale.
  const StatusIcon = over || spent ? TriangleAlert : near ? AlertTriangle : CheckCircle2;
  const statusColor = over ? theme.danger : spent || near ? theme.warning : theme.success;
  const statusText = over
    ? `${formatMoney(budget.spent - budget.monthly_limit, currency)} over`
    : spent
      ? "Limit reached"
      : near
        ? "Close to limit"
        : `${formatMoney(budget.monthly_limit - budget.spent, currency)} left`;

  return (
    <Card padded="lg" accent={over ? `${theme.danger}66` : undefined}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: space.md,
          marginBottom: space.md,
        }}
      >
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: radius.sm,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: `${swatch}1F`,
          }}
        >
          <Icon size={iconSize.md} strokeWidth={ICON_STROKE} color={swatch} />
        </View>

        <View style={{ flex: 1 }}>
          <Text variant="labelSb">{category.label}</Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: space.xs, marginTop: 2 }}>
            <StatusIcon size={14} strokeWidth={ICON_STROKE} color={statusColor} />
            <Text variant="caption" style={{ color: statusColor }}>
              {statusText}
            </Text>
          </View>
        </View>

        <View style={{ alignItems: "flex-end" }}>
          <Text variant="labelSb" tabular>
            {formatMoney(budget.spent, currency)}
          </Text>
          <Text variant="caption" tone="muted" tabular>
            of {formatMoney(budget.monthly_limit, currency)}
          </Text>
        </View>
      </View>

      <SegmentedBar
        progress={ratio}
        segments={10}
        color={swatch}
        overflowColor={theme.danger}
        delay={delay}
      />
    </Card>
  );
}
