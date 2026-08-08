import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { ArrowRight, Check, Sparkles, Target, Wallet } from "@/lib/lucide-icons";
import { useState } from "react";
import { View } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Pressable } from "@/components/ui/Pressable";
import { Slider } from "@/components/ui/Slider";
import { Text } from "@/components/ui/Text";
import { ICON_STROKE, iconSize, radius, space } from "@/constants/theme";
import { GOALS, PERSONAS } from "@/data/seed";
import { formatMoney } from "@/lib/format";
import { reportError } from "@/lib/crash-reporter";
import { useAuth } from "@/lib/auth-context";
import { seedDefaultBudgets } from "@/lib/data/budgets";
import { recordGoalCreated } from "@/lib/data/gamification";
import { addGoal } from "@/lib/data/goals";
import { upsertProfile } from "@/lib/data/profiles";
import { useHaptics } from "@/hooks/useHaptics";
import { useMotion } from "@/hooks/useMotion";
import { useCurrency, useTheme } from "@/hooks/useTheme";

const STEPS = 3;

// The 4 template goals only exist here (onboarding's goal picker) -- maps
// each to the icon key stored in the DB (see lib/icons.ts).
const GOAL_ICON_KEY: Record<string, string> = {
  g1: "piggy-bank",
  g2: "clapperboard",
  g3: "credit-card",
  g4: "home",
};

export default function OnboardingScreen() {
  const theme = useTheme();
  const currency = useCurrency();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const haptics = useHaptics();
  const { enter } = useMotion();
  const { session, refetchProfile } = useAuth();

  const [step, setStep] = useState(0);
  const [persona, setPersona] = useState(PERSONAS[2].id);
  const [income, setIncome] = useState(PERSONAS[2].income);
  const [goal, setGoal] = useState(GOALS[0].id);
  const [finishing, setFinishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const finish = async () => {
    if (!session || finishing) return;
    setError(null);
    setFinishing(true);
    try {
      const selectedGoal = GOALS.find((g) => g.id === goal);
      await upsertProfile({ id: session.user.id, persona_id: persona, monthly_income: income });
      await seedDefaultBudgets(session.user.id, income);
      if (selectedGoal) {
        await addGoal({
          user_id: session.user.id,
          title: selectedGoal.title,
          target: selectedGoal.target,
          monthly: selectedGoal.monthly,
          icon: GOAL_ICON_KEY[selectedGoal.id] ?? "target",
          accent_index: selectedGoal.accentIndex,
        });
        try {
          await recordGoalCreated();
        } catch (achievementError) {
          reportError(
            achievementError instanceof Error ? achievementError : new Error(String(achievementError)),
            { where: "recordGoalCreated" },
          );
        }
      }
      await refetchProfile();
      haptics.success();
      router.replace("/(tabs)");
    } catch (e) {
      haptics.error();
      setError(e instanceof Error ? e.message : "Couldn't save your setup -- try again.");
    } finally {
      setFinishing(false);
    }
  };

  const next = () => {
    haptics.tap();
    if (step === STEPS - 1) void finish();
    else setStep((s) => s + 1);
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <LinearGradient
        colors={[`${theme.primary}33`, "transparent"]}
        style={{ position: "absolute", top: 0, left: 0, right: 0, height: 320 }}
      />

      <View
        style={{
          flex: 1,
          paddingTop: insets.top + space.lg,
          paddingHorizontal: space.lg,
          paddingBottom: insets.bottom + space.lg,
        }}
      >
        {/* Progress + skip. Skipping is always available (UX: user freedom). */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: space.md,
            marginBottom: space.xxl,
          }}
        >
          <View style={{ flex: 1, flexDirection: "row", gap: space.xs }}>
            {Array.from({ length: STEPS }).map((_, i) => (
              <View
                key={i}
                style={{
                  flex: 1,
                  height: 4,
                  borderRadius: radius.pill,
                  backgroundColor: i <= step ? theme.primary : theme.surfacePressed,
                }}
              />
            ))}
          </View>
          <Pressable
            noMinSize
            disabled={finishing}
            onPress={() => void finish()}
            accessibilityRole="button"
            accessibilityLabel="Skip setup"
            style={{ height: 44, justifyContent: "center", paddingHorizontal: space.sm }}
          >
            <Text variant="labelSb" tone="muted">
              Skip
            </Text>
          </Pressable>
        </View>

        {error ? (
          <Text variant="label" tone="danger" style={{ marginBottom: space.md }}>
            {error}
          </Text>
        ) : null}

        <View style={{ flex: 1 }}>
          {step === 0 ? (
            <Animated.View
              key="s0"
              entering={enter()}
              exiting={FadeOut.duration(120)}
              style={{ flex: 1 }}
            >
              <StepHeader
                icon={Sparkles}
                eyebrow="Step 1 of 3"
                title="Who are you right now?"
                blurb="Sets a starting budget you can change later."
              />
              <View style={{ gap: space.md }}>
                {PERSONAS.map((p) => {
                  const active = persona === p.id;
                  const Icon = p.icon;
                  return (
                    <Pressable
                      key={p.id}
                      dimOnly
                      noMinSize
                      onPress={() => {
                        haptics.select();
                        setPersona(p.id);
                        setIncome(p.income);
                      }}
                      accessibilityRole="radio"
                      accessibilityState={{ selected: active }}
                      aria-checked={active}
                      accessibilityLabel={`${p.label}. ${p.blurb}`}
                    >
                      <Card
                        padded="lg"
                        accent={active ? theme.primary : undefined}
                        style={{ flexDirection: "row", alignItems: "center", gap: space.md }}
                      >
                        <View
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: radius.md,
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: active ? theme.primaryMutedBg : theme.surfacePressed,
                          }}
                        >
                          <Icon
                            size={iconSize.md}
                            strokeWidth={ICON_STROKE}
                            color={active ? theme.primaryBright : theme.fgMuted}
                          />
                        </View>
                        <View style={{ flex: 1, gap: 2 }}>
                          <Text variant="labelSb">{p.label}</Text>
                          <Text variant="caption" tone="muted">
                            {p.blurb}
                          </Text>
                        </View>
                        {active ? (
                          <Animated.View entering={FadeIn.duration(140)}>
                            <Check
                              size={iconSize.md}
                              strokeWidth={ICON_STROKE}
                              color={theme.primaryBright}
                            />
                          </Animated.View>
                        ) : null}
                      </Card>
                    </Pressable>
                  );
                })}
              </View>
            </Animated.View>
          ) : null}

          {step === 1 ? (
            <Animated.View
              key="s1"
              entering={enter()}
              exiting={FadeOut.duration(120)}
              style={{ flex: 1 }}
            >
              <StepHeader
                icon={Wallet}
                eyebrow="Step 2 of 3"
                title="What lands each month?"
                blurb="Everything after tax, including side income."
              />
              <Card padded="lg" style={{ gap: space.xl }}>
                <View style={{ alignItems: "center", gap: space.xs }}>
                  <Text variant="caption" tone="muted">
                    Monthly income
                  </Text>
                  <Text variant="display" tabular tone="accent">
                    {formatMoney(income, currency)}
                  </Text>
                </View>
                <Slider
                  label="Adjust"
                  value={income}
                  min={5000}
                  max={200000}
                  step={1000}
                  format={(v) => formatMoney(v, currency, { compact: true })}
                  onChange={setIncome}
                  color={theme.accent}
                  onStepCross={haptics.select}
                />
              </Card>
            </Animated.View>
          ) : null}

          {step === 2 ? (
            <Animated.View
              key="s2"
              entering={enter()}
              exiting={FadeOut.duration(120)}
              style={{ flex: 1 }}
            >
              <StepHeader
                icon={Target}
                eyebrow="Step 3 of 3"
                title="What are you chasing?"
                blurb="Your first goal. Add more any time."
              />
              <View style={{ gap: space.md }}>
                {GOALS.map((g) => {
                  const active = goal === g.id;
                  const accent = theme.categories[g.accentIndex];
                  const Icon = g.icon;
                  return (
                    <Pressable
                      key={g.id}
                      dimOnly
                      noMinSize
                      onPress={() => {
                        haptics.select();
                        setGoal(g.id);
                      }}
                      accessibilityRole="radio"
                      accessibilityState={{ selected: active }}
                      aria-checked={active}
                      accessibilityLabel={`${g.title}, target ${formatMoney(g.target, currency)}`}
                    >
                      <Card
                        padded="lg"
                        accent={active ? accent : undefined}
                        style={{ flexDirection: "row", alignItems: "center", gap: space.md }}
                      >
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
                        <View style={{ flex: 1, gap: 2 }}>
                          <Text variant="labelSb">{g.title}</Text>
                          <Text variant="caption" tone="muted" tabular>
                            {formatMoney(g.target, currency, { compact: true })} target
                          </Text>
                        </View>
                        {active ? (
                          <Animated.View entering={FadeIn.duration(140)}>
                            <Check size={iconSize.md} strokeWidth={ICON_STROKE} color={accent} />
                          </Animated.View>
                        ) : null}
                      </Card>
                    </Pressable>
                  );
                })}
              </View>
            </Animated.View>
          ) : null}
        </View>

        <View style={{ flexDirection: "row", gap: space.md, marginTop: space.lg }}>
          {step > 0 ? (
            <Button
              size="lg"
              variant="surface"
              label="Back"
              disabled={finishing}
              onPress={() => {
                haptics.tap();
                setStep((s) => s - 1);
              }}
            />
          ) : null}
          <View style={{ flex: 1 }}>
            <Button
              full
              size="lg"
              variant="primary"
              iconRight={step === STEPS - 1 ? Check : ArrowRight}
              label={step === STEPS - 1 ? "Start simulating" : "Continue"}
              loading={step === STEPS - 1 && finishing}
              onPress={next}
            />
          </View>
        </View>
      </View>
    </View>
  );
}

function StepHeader({
  icon: Icon,
  eyebrow,
  title,
  blurb,
}: {
  icon: typeof Sparkles;
  eyebrow: string;
  title: string;
  blurb: string;
}) {
  const theme = useTheme();

  return (
    <View style={{ marginBottom: space.xl, gap: space.sm }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: space.sm }}>
        <Icon size={iconSize.sm} strokeWidth={ICON_STROKE} color={theme.primaryBright} />
        <Text variant="captionSb" tone="primary">
          {eyebrow}
        </Text>
      </View>
      <Text variant="h1">{title}</Text>
      <Text variant="body" tone="muted">
        {blurb}
      </Text>
    </View>
  );
}
