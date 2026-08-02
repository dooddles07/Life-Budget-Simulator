import { useRouter } from "expo-router";
import { ArrowDownLeft, ArrowUpRight, Check, Delete, X } from "lucide-react-native";
import { useState } from "react";
import { View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";

import { Button, IconButton } from "@/components/ui/Button";
import { Pressable } from "@/components/ui/Pressable";
import { Screen } from "@/components/ui/Screen";
import { Text } from "@/components/ui/Text";
import { CURRENCIES } from "@/constants/config";
import { ICON_STROKE, iconSize, radius, space } from "@/constants/theme";
import { CATEGORIES, type CategoryId } from "@/data/seed";
import { useHaptics } from "@/hooks/useHaptics";
import { useMotion } from "@/hooks/useMotion";
import { useCurrency, useTheme } from "@/hooks/useTheme";

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "back"] as const;

export default function AddScreen() {
  const theme = useTheme();
  const currency = useCurrency();
  const router = useRouter();
  const haptics = useHaptics();
  const { enter, enterList } = useMotion();

  const [amount, setAmount] = useState("0");
  const [category, setCategory] = useState<CategoryId>("food");
  const [isIncome, setIsIncome] = useState(false);
  const [saved, setSaved] = useState(false);

  const numeric = Number(amount) || 0;
  const canSave = numeric > 0;

  const press = (key: (typeof KEYS)[number]) => {
    haptics.tap();
    setAmount((prev) => {
      if (key === "back") return prev.length <= 1 ? "0" : prev.slice(0, -1);
      if (key === ".") return prev.includes(".") ? prev : `${prev}.`;
      if (prev === "0") return key;
      // Cap at 2 decimal places so the display never overflows its line.
      const [, frac] = prev.split(".");
      if (frac && frac.length >= 2) return prev;
      return prev + key;
    });
  };

  const save = () => {
    haptics.success();
    setSaved(true);
    // Demo build: the entry is acknowledged, then the sheet closes. No store to write to.
    setTimeout(() => router.back(), 850);
  };

  return (
    <Screen scroll={false} gutter={space.lg}>
      <Animated.View
        entering={enter()}
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: space.lg,
        }}
      >
        <Text variant="h2">New entry</Text>
        <IconButton icon={X} label="Cancel" filled onPress={() => router.back()} />
      </Animated.View>

      {/* Direction */}
      <Animated.View
        entering={enterList(0)}
        style={{ flexDirection: "row", gap: space.sm, marginBottom: space.xl }}
      >
        <DirectionTab
          label="Expense"
          icon={ArrowUpRight}
          active={!isIncome}
          tone={theme.danger}
          onPress={() => {
            haptics.select();
            setIsIncome(false);
          }}
        />
        <DirectionTab
          label="Income"
          icon={ArrowDownLeft}
          active={isIncome}
          tone={theme.success}
          onPress={() => {
            haptics.select();
            setIsIncome(true);
          }}
        />
      </Animated.View>

      {/* Amount */}
      <Animated.View
        entering={enterList(1)}
        style={{ alignItems: "center", marginBottom: space.xl }}
      >
        <Text variant="caption" tone="muted">
          {isIncome ? "Money in" : "Money out"}
        </Text>
        <View
          accessible
          accessibilityLabel={`Amount ${CURRENCIES[currency].symbol}${amount}`}
          style={{ flexDirection: "row", alignItems: "flex-start", gap: 2 }}
        >
          <Text variant="h2" tone="muted" style={{ marginTop: 8 }}>
            {CURRENCIES[currency].symbol}
          </Text>
          <Text
            variant="display"
            tabular
            tone={isIncome ? "success" : "default"}
            numberOfLines={1}
            adjustsFontSizeToFit
            style={{ fontSize: 52, lineHeight: 58 }}
          >
            {amount}
          </Text>
        </View>
      </Animated.View>

      {/* Categories */}
      <Animated.View entering={enterList(2)} style={{ marginBottom: space.xl }}>
        <Text variant="label" tone="muted" style={{ marginBottom: space.md }}>
          Category
        </Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: space.sm }}>
          {CATEGORIES.map((cat) => {
            const active = category === cat.id;
            const swatch = theme.categories[cat.swatch];
            const Icon = cat.icon;
            return (
              <Pressable
                key={cat.id}
                noMinSize
                onPress={() => {
                  haptics.select();
                  setCategory(cat.id);
                }}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                aria-pressed={active}
                accessibilityLabel={cat.label}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: space.sm,
                  height: 44,
                  paddingHorizontal: space.md,
                  borderRadius: radius.pill,
                  borderWidth: 1,
                  borderColor: active ? swatch : theme.border,
                  backgroundColor: active ? `${swatch}22` : theme.surface,
                }}
              >
                <Icon
                  size={iconSize.sm}
                  strokeWidth={ICON_STROKE}
                  color={active ? swatch : theme.fgMuted}
                />
                <Text variant="labelSb" style={{ color: active ? swatch : theme.fgMuted }}>
                  {cat.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </Animated.View>

      {/* Keypad */}
      <Animated.View
        entering={enterList(3)}
        style={{ flexDirection: "row", flexWrap: "wrap", marginTop: "auto" }}
      >
        {KEYS.map((key) => (
          <View key={key} style={{ width: "33.333%", padding: space.xs }}>
            <Pressable
              noMinSize
              onPress={() => press(key)}
              accessibilityRole="button"
              accessibilityLabel={key === "back" ? "Delete last digit" : key}
              style={{
                height: 56,
                alignItems: "center",
                justifyContent: "center",
                borderRadius: radius.md,
                backgroundColor: theme.surface,
                borderWidth: 1,
                borderColor: theme.border,
              }}
            >
              {key === "back" ? (
                <Delete size={iconSize.md} strokeWidth={ICON_STROKE} color={theme.fgMuted} />
              ) : (
                <Text variant="h3" tabular>
                  {key}
                </Text>
              )}
            </Pressable>
          </View>
        ))}
      </Animated.View>

      <View style={{ marginTop: space.lg }}>
        {saved ? (
          <Animated.View entering={FadeIn.duration(160)}>
            <View
              accessibilityLiveRegion="polite"
              style={{
                height: 56,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: space.sm,
                borderRadius: radius.md,
                backgroundColor: `${theme.success}22`,
              }}
            >
              <Check size={iconSize.md} strokeWidth={ICON_STROKE} color={theme.success} />
              <Text variant="h3" tone="success">
                Logged +12 XP
              </Text>
            </View>
          </Animated.View>
        ) : (
          <Button
            full
            size="lg"
            variant={isIncome ? "accent" : "primary"}
            label={canSave ? "Log it" : "Enter an amount"}
            disabled={!canSave}
            onPress={save}
          />
        )}
      </View>
    </Screen>
  );
}

function DirectionTab({
  label,
  icon: Icon,
  active,
  tone,
  onPress,
}: {
  label: string;
  icon: typeof ArrowUpRight;
  active: boolean;
  tone: string;
  onPress: () => void;
}) {
  const theme = useTheme();

  return (
    <Pressable
      noMinSize
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      aria-selected={active}
      accessibilityLabel={label}
      style={{
        flex: 1,
        height: 48,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: space.sm,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: active ? tone : theme.border,
        backgroundColor: active ? `${tone}1F` : theme.surface,
      }}
    >
      <Icon
        size={iconSize.sm}
        strokeWidth={ICON_STROKE}
        color={active ? tone : theme.fgMuted}
      />
      <Text variant="labelSb" style={{ color: active ? tone : theme.fgMuted }}>
        {label}
      </Text>
    </Pressable>
  );
}
