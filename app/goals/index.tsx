import { useRouter } from "expo-router";
import { CalendarClock, ChevronLeft, Plus } from "@/lib/lucide-icons";
import { createElement } from "react";
import { View } from "react-native";
import Animated from "react-native-reanimated";

import { NumberTicker } from "@/components/money/NumberTicker";
import { Button, IconButton } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Screen } from "@/components/ui/Screen";
import { Text } from "@/components/ui/Text";
import { ErrorState, LoadingState } from "@/components/ui/AsyncState";
import { ICON_STROKE, iconSize, radius, space } from "@/constants/theme";
import { useGoals } from "@/hooks/useGoals";
import type { Goal } from "@/lib/data/goals";
import { iconForKey } from "@/lib/icons";
import { formatMoney } from "@/lib/format";
import { useMotion } from "@/hooks/useMotion";
import { useCurrency, useTheme } from "@/hooks/useTheme";

export default function GoalsScreen() {
  const router = useRouter();
  const currency = useCurrency();
  const { enter, enterList } = useMotion();
  const { data: goals, loading, error, refetch } = useGoals();

  if (loading) return <LoadingState />;
  if (error || !goals) {
    return <ErrorState message={error ?? "Couldn't load your goals."} onRetry={refetch} />;
  }

  const totalSaved = goals.reduce((s, g) => s + g.saved, 0);
  const totalTarget = goals.reduce((s, g) => s + g.target, 0);

  return (
    <Screen>
      <Animated.View
        entering={enter()}
        style={{ flexDirection: "row", alignItems: "center", gap: space.sm, marginBottom: space.xl }}
      >
        <IconButton icon={ChevronLeft} label="Go back" filled onPress={() => router.back()} />
        <View style={{ flex: 1 }}>
          <Text variant="h2">Goals</Text>
          <Text variant="caption" tone="muted" tabular>
            {formatMoney(totalSaved, currency, { compact: true })} of{" "}
            {formatMoney(totalTarget, currency, { compact: true })} saved
          </Text>
        </View>
      </Animated.View>

      <View style={{ gap: space.md }}>
        {goals.map((goal, i) => (
          <Animated.View key={goal.id} entering={enterList(i)}>
            <GoalCard goal={goal} delay={i * 60} />
          </Animated.View>
        ))}
      </View>

      <Animated.View entering={enterList(goals.length)} style={{ marginTop: space.xl }}>
        <Button
          full
          size="lg"
          variant="surface"
          icon={Plus}
          label="New goal"
          onPress={() => router.push("/goals/new")}
        />
      </Animated.View>
    </Screen>
  );
}

function GoalCard({ goal, delay }: { goal: Goal; delay: number }) {
  const theme = useTheme();
  const currency = useCurrency();

  const Icon = iconForKey(goal.icon);
  const accent = theme.categories[goal.accent_index];
  const progress = goal.target > 0 ? goal.saved / goal.target : 0;
  const remaining = goal.target - goal.saved;
  const monthsLeft = goal.monthly > 0 ? Math.max(1, Math.ceil(remaining / goal.monthly)) : null;

  let etaLabel = "no monthly contribution set";
  if (monthsLeft !== null) {
    const eta = new Date();
    eta.setMonth(eta.getMonth() + monthsLeft);
    etaLabel = eta.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  }

  return (
    <Card padded="lg">
      <View style={{ flexDirection: "row", alignItems: "center", gap: space.md }}>
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: radius.md,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: `${accent}1F`,
          }}
        >
          {createElement(Icon, { size: iconSize.md, strokeWidth: ICON_STROKE, color: accent })}
        </View>

        <View style={{ flex: 1 }}>
          <Text variant="labelSb" numberOfLines={1}>
            {goal.title}
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: space.xs, marginTop: 2 }}>
            <CalendarClock size={14} strokeWidth={ICON_STROKE} color={theme.fgMuted} />
            <Text variant="caption" tone="muted" tabular>
              {monthsLeft !== null ? `${monthsLeft} mo · ${etaLabel}` : etaLabel}
            </Text>
          </View>
        </View>

        <Text variant="h3" tabular style={{ color: accent }}>
          {Math.round(progress * 100)}%
        </Text>
      </View>

      <View style={{ marginTop: space.lg, gap: space.sm }}>
        <ProgressBar
          progress={progress}
          color={accent}
          height={10}
          delay={delay}
          accessibilityLabel={`${goal.title} progress`}
        />
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <NumberTicker value={goal.saved} variant="labelSb" />
          <Text variant="caption" tone="muted" tabular>
            {formatMoney(remaining, currency)} to go
          </Text>
        </View>
      </View>
    </Card>
  );
}
