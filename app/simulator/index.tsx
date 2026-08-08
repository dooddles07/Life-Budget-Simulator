import { useRouter } from "expo-router";
import {
  Coffee,
  Home,
  RotateCcw,
  Repeat,
  TrendingDown,
  TrendingUp,
  Wallet,
  X,
} from "@/lib/lucide-icons";
import { useMemo, useState } from "react";
import { View, useWindowDimensions } from "react-native";
import Animated from "react-native-reanimated";

import { LineChart } from "@/components/charts/LineChart";
import { NumberTicker } from "@/components/money/NumberTicker";
import { Button, IconButton } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Screen } from "@/components/ui/Screen";
import { Slider } from "@/components/ui/Slider";
import { Text } from "@/components/ui/Text";
import { ICON_STROKE, iconSize, radius, space } from "@/constants/theme";
import { PROFILE } from "@/data/seed";
import { reportError } from "@/lib/crash-reporter";
import { recordSimulatorRun } from "@/lib/data/gamification";
import { formatMoney } from "@/lib/format";
import {
  BASELINE,
  BASE_SCENARIO,
  projectAgainstBaseline,
  type Scenario,
} from "@/lib/simulate";
import { useHaptics } from "@/hooks/useHaptics";
import { useMotion } from "@/hooks/useMotion";
import { useCurrency, useTheme } from "@/hooks/useTheme";

export default function SimulatorScreen() {
  const theme = useTheme();
  const currency = useCurrency();
  const router = useRouter();
  const haptics = useHaptics();
  const { enter, enterList } = useMotion();
  const { width } = useWindowDimensions();

  const [scenario, setScenario] = useState<Scenario>(BASE_SCENARIO);

  const result = useMemo(() => projectAgainstBaseline(scenario), [scenario]);
  const touched = useMemo(
    () => (Object.keys(BASE_SCENARIO) as (keyof Scenario)[]).some(
      (k) => scenario[k] !== BASE_SCENARIO[k]
    ),
    [scenario]
  );

  const set = <K extends keyof Scenario>(key: K) => (value: Scenario[K]) =>
    setScenario((prev) => ({ ...prev, [key]: value }));

  const chartWidth = Math.min(width, 460) - space.lg * 2 - space.lg * 2;
  const better = result.delta >= 0;

  const close = () => {
    // Fire-and-forget: closing must never block on the network. Progress
    // just won't tick this time if it fails -- no user-visible consequence.
    if (touched) {
      recordSimulatorRun(scenario.coffeeCut).catch((e) =>
        reportError(e instanceof Error ? e : new Error(String(e)), {
          where: "recordSimulatorRun",
        })
      );
    }
    router.back();
  };

  return (
    <Screen>
      <Animated.View
        entering={enter()}
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: space.xl,
        }}
      >
        <View style={{ flex: 1 }}>
          <Text variant="h1">Simulator</Text>
          <Text variant="caption" tone="muted" style={{ marginTop: space.xs }}>
            Change a habit. Watch 12 months react.
          </Text>
        </View>
        <IconButton icon={X} label="Close simulator" filled onPress={close} />
      </Animated.View>

      {/* Verdict + projection */}
      <Animated.View entering={enterList(0)} style={{ marginBottom: space.xl }}>
        <Card padded="lg">
          <View
            style={{
              flexDirection: "row",
              alignItems: "flex-start",
              justifyContent: "space-between",
              marginBottom: space.lg,
            }}
          >
            <View style={{ flex: 1 }}>
              <Text variant="caption" tone="muted">
                Net worth in 12 months
              </Text>
              <NumberTicker value={result.finalValue} variant="h1" />
            </View>

            <View
              accessible
              accessibilityLabel={`${
                better ? "Ahead of" : "Behind"
              } baseline by ${formatMoney(Math.abs(result.delta), currency)}`}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: space.xs,
                paddingHorizontal: space.md,
                height: 32,
                borderRadius: radius.pill,
                backgroundColor: better ? `${theme.success}1F` : `${theme.danger}1F`,
              }}
            >
              {better ? (
                <TrendingUp size={iconSize.sm} strokeWidth={ICON_STROKE} color={theme.success} />
              ) : (
                <TrendingDown size={iconSize.sm} strokeWidth={ICON_STROKE} color={theme.danger} />
              )}
              <Text
                variant="captionSb"
                tabular
                style={{ color: better ? theme.success : theme.danger }}
              >
                {better ? "+" : "−"}
                {formatMoney(Math.abs(result.delta), currency, { compact: true }).replace("−", "")}
              </Text>
            </View>
          </View>

          <LineChart
            data={result.points}
            baseline={touched ? BASELINE.points : undefined}
            width={chartWidth}
            height={190}
            color={better ? theme.accent : theme.danger}
            markIndex={result.points.length - 1}
          />

          <View
            style={{
              flexDirection: "row",
              gap: space.lg,
              marginTop: space.lg,
              paddingTop: space.lg,
              borderTopWidth: 1,
              borderTopColor: theme.border,
            }}
          >
            <Stat
              label="Monthly surplus"
              value={formatMoney(result.monthlySurplus, currency)}
              tone={result.monthlySurplus >= 0 ? theme.success : theme.danger}
            />
            <Stat
              label={touched ? "vs. no change" : "Baseline"}
              value={
                touched
                  ? `${better ? "+" : "−"}${formatMoney(
                      Math.abs(result.delta),
                      currency,
                      { compact: true }
                    ).replace("−", "")}`
                  : formatMoney(BASELINE.finalValue, currency, { compact: true })
              }
              tone={touched ? (better ? theme.success : theme.danger) : theme.fgMuted}
            />
          </View>

          {result.breakEvenMonth !== null ? (
            <View
              style={{
                marginTop: space.lg,
                padding: space.md,
                borderRadius: radius.sm,
                backgroundColor: `${theme.danger}1A`,
              }}
            >
              <Text variant="captionSb" tone="danger">
                You run dry in month {result.breakEvenMonth}. Dial something back.
              </Text>
            </View>
          ) : null}
        </Card>
      </Animated.View>

      {/* Levers */}
      <Animated.View entering={enterList(1)}>
        <Card padded="lg" style={{ gap: space.xl }}>
          <LeverHeader
            icon={Coffee}
            title="Cut coffee runs"
            detail={`${formatMoney(PROFILE.coffeePerMonth, currency)}/mo today`}
          />
          <Slider
            label="Runs skipped"
            value={scenario.coffeeCut}
            min={0}
            max={100}
            step={5}
            format={(v) => `${v}%`}
            onChange={set("coffeeCut")}
            color={theme.categories[0]}
            onStepCross={haptics.select}
          />

          <LeverHeader
            icon={Home}
            title="Move house"
            detail={`Rent is ${formatMoney(16000, currency)}/mo`}
          />
          <Slider
            label="Rent change"
            value={scenario.rentDelta}
            min={-20}
            max={30}
            step={5}
            format={(v) => `${v > 0 ? "+" : ""}${v}%`}
            onChange={set("rentDelta")}
            color={theme.categories[2]}
            onStepCross={haptics.select}
          />

          <LeverHeader icon={Wallet} title="Side hustle" detail="Extra income each month" />
          <Slider
            label="Monthly extra"
            value={scenario.sideHustle}
            min={0}
            max={20000}
            step={1000}
            format={(v) => formatMoney(v, currency, { compact: true })}
            onChange={set("sideHustle")}
            color={theme.accent}
            onStepCross={haptics.select}
          />

          <LeverHeader
            icon={Repeat}
            title="Subscriptions"
            detail={`${PROFILE.subscriptions.length} active`}
          />
          <Slider
            label="Keep"
            value={scenario.subscriptions}
            min={0}
            max={PROFILE.subscriptions.length}
            step={1}
            format={(v) => `${v} of ${PROFILE.subscriptions.length}`}
            onChange={set("subscriptions")}
            color={theme.categories[4]}
            onStepCross={haptics.select}
          />

          <LeverHeader
            icon={TrendingUp}
            title="Savings discipline"
            detail="Share of surplus you actually keep"
          />
          <Slider
            label="Saved"
            value={scenario.savingsRate}
            min={0}
            max={100}
            step={5}
            format={(v) => `${v}%`}
            onChange={set("savingsRate")}
            color={theme.primaryBright}
            onStepCross={haptics.select}
          />
        </Card>
      </Animated.View>

      <Animated.View entering={enterList(2)} style={{ marginTop: space.xl }}>
        <Button
          full
          size="lg"
          variant={touched ? "surface" : "ghost"}
          icon={RotateCcw}
          label="Reset to today"
          disabled={!touched}
          onPress={() => {
            haptics.warning();
            setScenario(BASE_SCENARIO);
          }}
        />
      </Animated.View>
    </Screen>
  );
}

function LeverHeader({
  icon: Icon,
  title,
  detail,
}: {
  icon: typeof Coffee;
  title: string;
  detail: string;
}) {
  const theme = useTheme();

  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: space.md }}>
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: radius.sm,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: theme.surfacePressed,
        }}
      >
        <Icon size={iconSize.sm} strokeWidth={ICON_STROKE} color={theme.fgMuted} />
      </View>
      <View style={{ flex: 1, gap: 1 }}>
        <Text variant="labelSb">{title}</Text>
        <Text variant="caption" tone="muted">
          {detail}
        </Text>
      </View>
    </View>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <View style={{ flex: 1, gap: 2 }}>
      <Text variant="caption" tone="muted">
        {label}
      </Text>
      <Text variant="labelSb" tabular style={{ color: tone }}>
        {value}
      </Text>
    </View>
  );
}
