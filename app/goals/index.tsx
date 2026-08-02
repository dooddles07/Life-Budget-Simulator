import { useRouter } from "expo-router";
import { CalendarClock, ChevronLeft, Plus } from "lucide-react-native";
import { View } from "react-native";
import Animated from "react-native-reanimated";

import { NumberTicker } from "@/components/money/NumberTicker";
import { Button, IconButton } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Screen } from "@/components/ui/Screen";
import { Text } from "@/components/ui/Text";
import { ICON_STROKE, iconSize, radius, space } from "@/constants/theme";
import { GOALS, type Goal } from "@/data/seed";
import { formatMoney } from "@/lib/format";
import { useMotion } from "@/hooks/useMotion";
import { useCurrency, useTheme } from "@/hooks/useTheme";

export default function GoalsScreen() {
  const router = useRouter();
  const currency = useCurrency();
  const { enter, enterList } = useMotion();

  const totalSaved = GOALS.reduce((s, g) => s + g.saved, 0);
  const totalTarget = GOALS.reduce((s, g) => s + g.target, 0);

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
        {GOALS.map((goal, i) => (
          <Animated.View key={goal.id} entering={enterList(i)}>
            <GoalCard goal={goal} delay={i * 60} />
          </Animated.View>
        ))}
      </View>

      <Animated.View entering={enterList(GOALS.length)} style={{ marginTop: space.xl }}>
        <Button full size="lg" variant="surface" icon={Plus} label="New goal" />
      </Animated.View>
    </Screen>
  );
}

function GoalCard({ goal, delay }: { goal: Goal; delay: number }) {
  const theme = useTheme();
  const currency = useCurrency();

  const Icon = goal.icon;
  const accent = theme.categories[goal.accentIndex];
  const progress = goal.saved / goal.target;
  const remaining = goal.target - goal.saved;
  const monthsLeft = Math.max(1, Math.ceil(remaining / goal.monthly));

  const eta = new Date();
  eta.setMonth(eta.getMonth() + monthsLeft);
  const etaLabel = eta.toLocaleDateString("en-US", { month: "short", year: "numeric" });

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
          <Icon size={iconSize.md} strokeWidth={ICON_STROKE} color={accent} />
        </View>

        <View style={{ flex: 1 }}>
          <Text variant="labelSb">{goal.title}</Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: space.xs, marginTop: 2 }}>
            <CalendarClock size={14} strokeWidth={ICON_STROKE} color={theme.fgMuted} />
            <Text variant="caption" tone="muted" tabular>
              {monthsLeft} mo · {etaLabel}
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
          bouncy
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
