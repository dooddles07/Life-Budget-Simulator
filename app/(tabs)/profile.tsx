import { useRouter } from "expo-router";
import {
  Accessibility,
  ChevronRight,
  Coins,
  LogOut,
  Moon,
  Sun,
  SunMoon,
  Target,
  Trophy,
  Vibrate,
  type IconComponent,
} from "@/lib/lucide-icons";
import { View } from "react-native";
import Animated from "react-native-reanimated";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Pressable } from "@/components/ui/Pressable";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Screen } from "@/components/ui/Screen";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Switch } from "@/components/ui/Switch";
import { Text } from "@/components/ui/Text";
import { CURRENCIES, levelFromXp, type CurrencyCode } from "@/constants/config";
import { ICON_STROKE, iconSize, radius, space } from "@/constants/theme";
import { useAchievements } from "@/hooks/useAchievements";
import { useGoals } from "@/hooks/useGoals";
import { useAuth } from "@/lib/auth-context";
import { useMotion } from "@/hooks/useMotion";
import { useSettings, useTheme } from "@/hooks/useTheme";

export default function ProfileScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { enter, enterList } = useMotion();
  const { profile, signOut } = useAuth();
  const { data: achievements } = useAchievements();
  const { data: goals } = useGoals();
  const {
    themeOverride,
    setThemeOverride,
    currency,
    setCurrency,
    reduceMotionOverride,
    setReduceMotionOverride,
    haptics,
    setHaptics,
  } = useSettings();

  if (!profile) return null;

  const level = levelFromXp(profile.xp);
  const unlockedCount = achievements?.filter((a) => a.unlocked).length ?? 0;
  const totalCount = achievements?.length ?? 0;

  return (
    <Screen hasTabBar>
      <Animated.View entering={enter()} style={{ marginBottom: space.xl }}>
        <Text variant="h1">You</Text>
      </Animated.View>

      <Animated.View entering={enterList(0)} style={{ marginBottom: space.xl }}>
        <Card padded="lg">
          <View style={{ flexDirection: "row", alignItems: "center", gap: space.lg }}>
            <View
              style={{
                width: 64,
                height: 64,
                borderRadius: radius.pill,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: theme.primaryMutedBg,
                borderWidth: 2,
                borderColor: theme.primary,
              }}
            >
              <Text variant="h2" tone="primary">
                {profile.name.charAt(0) || "?"}
              </Text>
            </View>

            <View style={{ flex: 1, gap: 2 }}>
              <Text variant="h3">{profile.name || "You"}</Text>
              <Text variant="caption" tone="muted">
                {profile.handle}
              </Text>
              <Text variant="captionSb" tone="accent" style={{ marginTop: space.xs }}>
                Lv {level.level} · {level.title}
              </Text>
            </View>
          </View>

          <View style={{ marginTop: space.lg, gap: space.sm }}>
            <ProgressBar
              progress={level.progress}
              color={theme.accent}
              bouncy
              delay={200}
              accessibilityLabel="Experience to next level"
            />
            <Text variant="caption" tone="muted" tabular>
              {(level.ceil - profile.xp).toLocaleString()} XP to Lv {level.level + 1}
            </Text>
          </View>
        </Card>
      </Animated.View>

      <SectionHeader title="Your progress" />
      <View style={{ flexDirection: "row", gap: space.md, marginBottom: space.xl }}>
        <Animated.View entering={enterList(1)} style={{ flex: 1 }}>
          <NavTile
            icon={Trophy}
            label="Achievements"
            value={`${unlockedCount} of ${totalCount}`}
            tone={theme.warning}
            onPress={() => router.push("/achievements")}
          />
        </Animated.View>
        <Animated.View entering={enterList(2)} style={{ flex: 1 }}>
          <NavTile
            icon={Target}
            label="Goals"
            value={`${goals?.length ?? 0} active`}
            tone={theme.accent}
            onPress={() => router.push("/goals")}
          />
        </Animated.View>
      </View>

      <SectionHeader title="Appearance" />
      <Animated.View entering={enterList(3)} style={{ marginBottom: space.xl }}>
        <Card padded="lg" style={{ gap: space.lg }}>
          <View style={{ gap: space.md }}>
            <Text variant="label" tone="muted">
              Theme
            </Text>
            <View style={{ flexDirection: "row", gap: space.sm, flexWrap: "wrap" }}>
              <Chip
                label="System"
                icon={SunMoon}
                active={themeOverride === null}
                onPress={() => setThemeOverride(null)}
              />
              <Chip
                label="Dark"
                icon={Moon}
                active={themeOverride === "dark"}
                onPress={() => setThemeOverride("dark")}
              />
              <Chip
                label="Light"
                icon={Sun}
                active={themeOverride === "light"}
                onPress={() => setThemeOverride("light")}
              />
            </View>
          </View>

          <View style={{ gap: space.md }}>
            <Text variant="label" tone="muted">
              Currency
            </Text>
            <View style={{ flexDirection: "row", gap: space.sm, flexWrap: "wrap" }}>
              {(Object.keys(CURRENCIES) as CurrencyCode[]).map((code) => (
                <Chip
                  key={code}
                  label={`${CURRENCIES[code].symbol} ${code}`}
                  active={currency === code}
                  onPress={() => setCurrency(code)}
                />
              ))}
            </View>
          </View>
        </Card>
      </Animated.View>

      <SectionHeader title="Accessibility" />
      <Animated.View entering={enterList(4)}>
        <Card padded="lg" style={{ gap: space.lg }}>
          <SettingRow
            icon={Accessibility}
            title="Reduce motion"
            detail="Removes springs, staggers, and counter rolls. Your system setting already forces this on."
            value={reduceMotionOverride}
            onChange={setReduceMotionOverride}
          />
          <View style={{ height: 1, backgroundColor: theme.border }} />
          <SettingRow
            icon={Vibrate}
            title="Haptics"
            detail="Short taps on confirmations and budget thresholds."
            value={haptics}
            onChange={setHaptics}
          />
        </Card>
      </Animated.View>

      <Animated.View entering={enterList(5)} style={{ marginTop: space.xl, gap: space.lg }}>
        <Button label="Sign out" variant="surface" icon={LogOut} full onPress={() => void signOut()} />
        <View style={{ flexDirection: "row", alignItems: "center", gap: space.sm, justifyContent: "center" }}>
          <Coins size={iconSize.sm} strokeWidth={ICON_STROKE} color={theme.fgFaint} />
          <Text variant="caption" tone="faint">
            Life Budget Simulator
          </Text>
        </View>
      </Animated.View>
    </Screen>
  );
}

function NavTile({
  icon: Icon,
  label,
  value,
  tone,
  onPress,
}: {
  icon: IconComponent;
  label: string;
  value: string;
  tone: string;
  onPress: () => void;
}) {
  const theme = useTheme();

  return (
    <Pressable
      dimOnly
      noMinSize
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${label}, ${value}`}
    >
      <Card padded="lg" style={{ gap: space.md }}>
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
        <View style={{ gap: 2 }}>
          <Text variant="labelSb">{label}</Text>
          <Text variant="caption" tone="muted">
            {value}
          </Text>
        </View>
        <ChevronRight
          size={iconSize.sm}
          strokeWidth={ICON_STROKE}
          color={theme.fgFaint}
          style={{ position: "absolute", top: space.lg, right: space.lg }}
        />
      </Card>
    </Pressable>
  );
}

function SettingRow({
  icon: Icon,
  title,
  detail,
  value,
  onChange,
}: {
  icon: IconComponent;
  title: string;
  detail: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  const theme = useTheme();

  return (
    <View style={{ flexDirection: "row", alignItems: "flex-start", gap: space.md }}>
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: radius.sm,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: theme.surfacePressed,
        }}
      >
        <Icon size={iconSize.md} strokeWidth={ICON_STROKE} color={theme.fgMuted} />
      </View>

      <View style={{ flex: 1, gap: 2 }}>
        <Text variant="labelSb">{title}</Text>
        <Text variant="caption" tone="muted">
          {detail}
        </Text>
      </View>

      <Switch value={value} onChange={onChange} label={title} />
    </View>
  );
}
