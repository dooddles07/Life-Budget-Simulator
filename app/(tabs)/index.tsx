import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  Bell,
  ChevronRight,
  Flame,
  TrendingUp,
  Wand2,
} from "lucide-react-native";
import { useMemo } from "react";
import { View } from "react-native";
import Animated from "react-native-reanimated";

import { NumberTicker } from "@/components/money/NumberTicker";
import { TransactionRow } from "@/components/money/TransactionRow";
import { IconButton } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Pressable } from "@/components/ui/Pressable";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { Screen } from "@/components/ui/Screen";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Text } from "@/components/ui/Text";
import { levelFromXp } from "@/constants/config";
import { ICON_STROKE, iconSize, radius, space } from "@/constants/theme";
import { BUDGETS, PROFILE, TRANSACTIONS } from "@/data/seed";
import { formatMoney, greeting } from "@/lib/format";
import { useMotion } from "@/hooks/useMotion";
import { useCurrency, useTheme } from "@/hooks/useTheme";

export default function HomeScreen() {
  const theme = useTheme();
  const currency = useCurrency();
  const router = useRouter();
  const { enter, enterList } = useMotion();

  const level = levelFromXp(PROFILE.xp);

  const { spent, limit, safeToSpend, daysLeft } = useMemo(() => {
    const totalLimit = BUDGETS.reduce((s, b) => s + b.limit, 0);
    const totalSpent = BUDGETS.reduce((s, b) => s + b.spent, 0);
    const now = new Date();
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const remaining = Math.max(1, end - now.getDate());
    return {
      spent: totalSpent,
      limit: totalLimit,
      safeToSpend: Math.max(0, Math.round((totalLimit - totalSpent) / remaining)),
      daysLeft: remaining,
    };
  }, []);

  const burn = Math.min(1, spent / limit);
  const recent = TRANSACTIONS.slice(0, 4);

  return (
    <Screen hasTabBar>
      <Animated.View entering={enter()}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: space.xl,
          }}
        >
          <View style={{ flex: 1 }}>
            <Text variant="caption" tone="muted">
              {greeting()}
            </Text>
            <Text variant="h2" numberOfLines={1}>
              {PROFILE.name}
            </Text>
          </View>

          <View style={{ flexDirection: "row", alignItems: "center", gap: space.sm }}>
            <StreakBadge days={PROFILE.streakDays} />
            <IconButton
              icon={Bell}
              label="Notifications"
              filled
              onPress={() => router.push("/achievements")}
            />
          </View>
        </View>
      </Animated.View>

      {/* Level + XP */}
      <Animated.View entering={enterList(0)}>
        <Pressable
          dimOnly
          noMinSize
          onPress={() => router.push("/achievements")}
          accessibilityRole="button"
          accessibilityLabel={`Level ${level.level}, ${level.title}. ${PROFILE.xp} of ${level.ceil} XP. View achievements.`}
          style={{ marginBottom: space.lg }}
        >
          <Card padded="lg">
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: space.md,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: space.sm, flex: 1 }}>
                <View
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: radius.sm,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: theme.primaryMutedBg,
                  }}
                >
                  <Text variant="captionSb" tone="primary" tabular>
                    {level.level}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text variant="labelSb" numberOfLines={1}>
                    {level.title}
                  </Text>
                  <Text variant="caption" tone="muted" tabular>
                    {PROFILE.xp.toLocaleString()} / {level.ceil.toLocaleString()} XP
                  </Text>
                </View>
              </View>
              <ChevronRight
                size={iconSize.sm}
                strokeWidth={ICON_STROKE}
                color={theme.fgMuted}
              />
            </View>
            <ProgressBar
              progress={level.progress}
              color={theme.accent}
              bouncy
              height={10}
              delay={220}
              accessibilityLabel="Experience to next level"
            />
          </Card>
        </Pressable>
      </Animated.View>

      {/* Net worth hero */}
      <Animated.View entering={enterList(1)} style={{ marginBottom: space.lg }}>
        <Card padded={false} radiusSize="xl" style={{ overflow: "hidden" }}>
          <LinearGradient
            colors={[`${theme.primary}3D`, "transparent"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ padding: space.xl }}
          >
            <Text variant="caption" tone="muted">
              Net worth
            </Text>
            <NumberTicker value={PROFILE.netWorth} variant="display" />

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: space.xs,
                marginTop: space.sm,
              }}
            >
              <TrendingUp size={iconSize.sm} strokeWidth={ICON_STROKE} color={theme.success} />
              <Text variant="captionSb" tone="success" tabular>
                +{formatMoney(15500, currency, { compact: true })}
              </Text>
              <Text variant="caption" tone="muted">
                this month
              </Text>
            </View>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: space.xl,
                marginTop: space.xl,
              }}
            >
              <ProgressRing
                progress={burn}
                size={104}
                thickness={10}
                sweep={260}
                gradientId="burnRing"
                color={burn > 0.9 ? theme.danger : theme.primary}
                colorEnd={burn > 0.9 ? theme.warning : theme.primaryBright}
                delay={260}
              >
                <View style={{ alignItems: "center" }}>
                  <Text variant="h3" tabular>
                    {Math.round(burn * 100)}%
                  </Text>
                  <Text variant="caption" tone="muted">
                    of budget
                  </Text>
                </View>
              </ProgressRing>

              <View style={{ flex: 1, gap: space.xs }}>
                <Text variant="caption" tone="muted">
                  Safe to spend daily
                </Text>
                <NumberTicker value={safeToSpend} variant="h1" tone="accent" />
                <Text variant="caption" tone="muted" tabular>
                  {daysLeft} days left in the month
                </Text>
              </View>
            </View>
          </LinearGradient>
        </Card>
      </Animated.View>

      {/* Simulator CTA -- the app's signature screen gets a front-door entry. */}
      <Animated.View entering={enterList(2)} style={{ marginBottom: space.xl }}>
        <Pressable
          dimOnly
          noMinSize
          onPress={() => router.push("/simulator")}
          accessibilityRole="button"
          accessibilityLabel="Open the what-if simulator"
        >
          <Card
            padded="lg"
            accent={`${theme.accent}55`}
            style={{ flexDirection: "row", alignItems: "center", gap: space.md }}
          >
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: radius.md,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: `${theme.accent}1F`,
              }}
            >
              <Wand2 size={iconSize.md} strokeWidth={ICON_STROKE} color={theme.accent} />
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <Text variant="labelSb">Run a what-if</Text>
              <Text variant="caption" tone="muted">
                Cut coffee, move rent, add a hustle. See 12 months ahead.
              </Text>
            </View>
            <ChevronRight size={iconSize.md} strokeWidth={ICON_STROKE} color={theme.accent} />
          </Card>
        </Pressable>
      </Animated.View>

      <SectionHeader
        title="Recent"
        actionLabel="See all"
        onAction={() => router.push("/transactions")}
      />
      {recent.map((t, i) => (
        <TransactionRow key={t.id} transaction={t} index={i + 3} />
      ))}
    </Screen>
  );
}

function StreakBadge({ days }: { days: number }) {
  const theme = useTheme();

  return (
    <View
      accessible
      accessibilityLabel={`${days} day logging streak`}
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: space.xs,
        height: 44,
        paddingHorizontal: space.md,
        borderRadius: radius.pill,
        borderWidth: 1,
        borderColor: `${theme.warning}44`,
        backgroundColor: `${theme.warning}14`,
      }}
    >
      <Flame size={iconSize.sm} strokeWidth={ICON_STROKE} color={theme.warning} />
      <Text variant="labelSb" tabular style={{ color: theme.warning }}>
        {days}
      </Text>
    </View>
  );
}
