import { useRouter } from "expo-router";
import { X } from "@/lib/lucide-icons";
import { useState } from "react";
import { View } from "react-native";
import Animated from "react-native-reanimated";

import { Button, IconButton } from "@/components/ui/Button";
import { Pressable } from "@/components/ui/Pressable";
import { Screen } from "@/components/ui/Screen";
import { Text } from "@/components/ui/Text";
import { TextField } from "@/components/ui/TextField";
import { radius, space } from "@/constants/theme";
import { GOALS } from "@/data/seed";
import { useAuth } from "@/lib/auth-context";
import { addGoal } from "@/lib/data/goals";
import { useHaptics } from "@/hooks/useHaptics";
import { useMotion } from "@/hooks/useMotion";
import { useTheme } from "@/hooks/useTheme";

// Mirrors onboarding's GOAL_ICON_KEY (app/onboarding/index.tsx) -- the 4
// template goals map to DB icon keys the same way in both places.
const GOAL_ICON_KEY: Record<string, string> = {
  g1: "piggy-bank",
  g2: "clapperboard",
  g3: "credit-card",
  g4: "home",
};

const OTHERS_ID = "others";

export default function NewGoalScreen() {
  const router = useRouter();
  const haptics = useHaptics();
  const { enter, enterList } = useMotion();
  const { session } = useAuth();

  const [selected, setSelected] = useState<string>(GOALS[0].id);
  const [customTitle, setCustomTitle] = useState("");
  const [customTarget, setCustomTarget] = useState("");
  const [customMonthly, setCustomMonthly] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isOthers = selected === OTHERS_ID;
  const targetNumeric = Number(customTarget) || 0;
  const canSave = isOthers ? customTitle.trim().length > 0 && targetNumeric > 0 : true;

  const save = async () => {
    if (!session || !canSave || saving) return;
    setError(null);
    setSaving(true);
    try {
      if (isOthers) {
        await addGoal({
          user_id: session.user.id,
          title: customTitle.trim(),
          target: targetNumeric,
          monthly: Number(customMonthly) || 0,
          icon: "target",
          accent_index: 0,
        });
      } else {
        const preset = GOALS.find((g) => g.id === selected);
        if (!preset) return;
        await addGoal({
          user_id: session.user.id,
          title: preset.title,
          target: preset.target,
          monthly: preset.monthly,
          icon: GOAL_ICON_KEY[preset.id] ?? "target",
          accent_index: preset.accentIndex,
        });
      }
      haptics.success();
      router.back();
    } catch (e) {
      haptics.error();
      setError(e instanceof Error ? e.message : "Couldn't save -- try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen gutter={space.lg}>
      <Animated.View
        entering={enter()}
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: space.xl,
        }}
      >
        <Text variant="h2">New goal</Text>
        <IconButton icon={X} label="Cancel" filled onPress={() => router.back()} />
      </Animated.View>

      <View style={{ gap: space.sm, marginBottom: space.xl }}>
        {GOALS.map((g) => (
          <GoalOption
            key={g.id}
            label={g.title}
            detail={`Target ${g.target.toLocaleString()}`}
            active={selected === g.id}
            onPress={() => {
              haptics.select();
              setSelected(g.id);
            }}
          />
        ))}
        <GoalOption
          label="Others"
          detail="Set your own goal name and target"
          active={isOthers}
          onPress={() => {
            haptics.select();
            setSelected(OTHERS_ID);
          }}
        />
      </View>

      {isOthers ? (
        <Animated.View entering={enterList(1)} style={{ gap: space.lg, marginBottom: space.xl }}>
          <TextField
            label="Goal name"
            value={customTitle}
            onChangeText={setCustomTitle}
            placeholder="e.g. New phone"
            maxLength={60}
          />
          <TextField
            label="Target amount"
            value={customTarget}
            onChangeText={setCustomTarget}
            keyboardType="numeric"
            placeholder="0"
          />
          <TextField
            label="Monthly contribution (optional)"
            value={customMonthly}
            onChangeText={setCustomMonthly}
            keyboardType="numeric"
            placeholder="0"
          />
        </Animated.View>
      ) : null}

      <View style={{ marginTop: "auto" }}>
        {error ? (
          <Text variant="label" tone="danger" style={{ marginBottom: space.sm }}>
            {error}
          </Text>
        ) : null}
        <Button
          full
          size="lg"
          label="Save goal"
          disabled={!canSave}
          loading={saving}
          onPress={() => void save()}
        />
      </View>
    </Screen>
  );
}

function GoalOption({
  label,
  detail,
  active,
  onPress,
}: {
  label: string;
  detail: string;
  active: boolean;
  onPress: () => void;
}) {
  const theme = useTheme();

  return (
    <Pressable
      dimOnly
      noMinSize
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ checked: active }}
      aria-checked={active}
      accessibilityLabel={`${label}. ${detail}`}
      style={{
        padding: space.lg,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: active ? theme.primaryBright : theme.border,
        backgroundColor: active ? `${theme.primary}14` : theme.surfaceElevated,
      }}
    >
      <Text variant="labelSb">{label}</Text>
      <Text variant="caption" tone="muted" style={{ marginTop: 2 }}>
        {detail}
      </Text>
    </Pressable>
  );
}
