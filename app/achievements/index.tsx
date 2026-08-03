import { useRouter } from "expo-router";
import { ChevronLeft, Lock } from "@/lib/lucide-icons";
import { createElement, useEffect } from "react";
import { View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
} from "react-native-reanimated";

import { IconButton } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Screen } from "@/components/ui/Screen";
import { Text } from "@/components/ui/Text";
import { ErrorState, LoadingState } from "@/components/ui/AsyncState";
import { levelFromXp } from "@/constants/config";
import { ICON_STROKE, iconSize, radius, space } from "@/constants/theme";
import { useAchievements, type AchievementWithProgress } from "@/hooks/useAchievements";
import { iconForKey } from "@/lib/icons";
import { useAuth } from "@/lib/auth-context";
import { useMotion } from "@/hooks/useMotion";
import { useTheme } from "@/hooks/useTheme";

export default function AchievementsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { enter, enterList } = useMotion();
  const { profile } = useAuth();
  const { data: achievements, loading, error, refetch } = useAchievements();

  if (loading) return <LoadingState />;
  if (error || !achievements || !profile) {
    return <ErrorState message={error ?? "Couldn't load your achievements."} onRetry={refetch} />;
  }

  const level = levelFromXp(profile.xp);
  const unlocked = achievements.filter((a) => a.unlocked);
  const locked = achievements.filter((a) => !a.unlocked);

  return (
    <Screen>
      <Animated.View
        entering={enter()}
        style={{ flexDirection: "row", alignItems: "center", gap: space.sm, marginBottom: space.xl }}
      >
        <IconButton icon={ChevronLeft} label="Go back" filled onPress={() => router.back()} />
        <View style={{ flex: 1 }}>
          <Text variant="h2">Achievements</Text>
          <Text variant="caption" tone="muted" tabular>
            {unlocked.length} of {achievements.length} unlocked
          </Text>
        </View>
      </Animated.View>

      <Animated.View entering={enterList(0)} style={{ marginBottom: space.xl }}>
        <Card padded="lg">
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: space.md,
            }}
          >
            <View>
              <Text variant="h3">Level {level.level}</Text>
              <Text variant="caption" tone="accent">
                {level.title}
              </Text>
            </View>
            <Text variant="labelSb" tone="muted" tabular>
              {profile.xp.toLocaleString()} XP
            </Text>
          </View>
          <ProgressBar
            progress={level.progress}
            color={theme.accent}
            bouncy
            height={10}
            delay={200}
            accessibilityLabel="Experience to next level"
          />
        </Card>
      </Animated.View>

      <Text variant="h3" style={{ marginBottom: space.md }}>
        Earned
      </Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: space.md, marginBottom: space.xl }}>
        {unlocked.map((item, i) => (
          <BadgeTile key={item.id} achievement={item} index={i} />
        ))}
      </View>

      <Text variant="h3" style={{ marginBottom: space.md }}>
        In progress
      </Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: space.md }}>
        {locked.map((item, i) => (
          <BadgeTile key={item.id} achievement={item} index={unlocked.length + i} />
        ))}
      </View>
    </Screen>
  );
}

function BadgeTile({ achievement, index }: { achievement: AchievementWithProgress; index: number }) {
  const theme = useTheme();
  const { toSpring, reduce, enterList } = useMotion();

  const Icon = iconForKey(achievement.icon);
  const tone = achievement.unlocked ? theme.warning : theme.fgFaint;

  const burst = useSharedValue(1);

  useEffect(() => {
    if (!achievement.unlocked || reduce) return;
    // One-shot pop on mount so earned badges feel granted, not just listed.
    burst.value = withDelay(
      200 + index * 60,
      withSequence(toSpring(1.14), toSpring(1))
    );
  }, [achievement.unlocked, index, reduce, toSpring, burst]);

  const style = useAnimatedStyle(() => ({ transform: [{ scale: burst.value }] }));

  return (
    <Animated.View
      entering={enterList(index)}
      style={[{ width: "47%", flexGrow: 1 }, style]}
    >
      <Card
        padded="lg"
        accent={achievement.unlocked ? `${theme.warning}44` : undefined}
        style={{ gap: space.md, opacity: achievement.unlocked ? 1 : 0.72 }}
      >
        <View
          accessible
          accessibilityLabel={
            achievement.unlocked
              ? `${achievement.title}, unlocked, ${achievement.detail}, ${achievement.xp} XP`
              : `${achievement.title}, locked, ${Math.round(
                  achievement.progress * 100
                )} percent complete, ${achievement.detail}`
          }
          style={{ gap: space.md }}
        >
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: radius.md,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: `${tone}1F`,
            }}
          >
            {achievement.unlocked ? (
              createElement(Icon, { size: iconSize.md, strokeWidth: ICON_STROKE, color: tone })
            ) : (
              <Lock size={iconSize.md} strokeWidth={ICON_STROKE} color={tone} />
            )}
          </View>

          <View style={{ gap: 2 }}>
            <Text variant="labelSb" numberOfLines={1}>
              {achievement.title}
            </Text>
            <Text variant="caption" tone="muted" numberOfLines={2}>
              {achievement.detail}
            </Text>
          </View>

          {achievement.unlocked ? (
            <Text variant="captionSb" style={{ color: theme.warning }}>
              +{achievement.xp} XP
            </Text>
          ) : (
            <View style={{ gap: space.xs }}>
              <ProgressBar
                progress={achievement.progress}
                color={theme.primaryBright}
                height={6}
                delay={index * 40}
              />
              <Text variant="caption" tone="faint" tabular>
                {Math.round(achievement.progress * 100)}%
              </Text>
            </View>
          )}
        </View>
      </Card>
    </Animated.View>
  );
}
