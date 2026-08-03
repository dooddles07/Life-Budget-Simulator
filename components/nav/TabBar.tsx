// expo-router v57 vendors react-navigation internally; this is the supported path.
import type { BottomTabBarProps } from "expo-router/js-tabs";
import { BlurView } from "expo-blur";
import { Plus, type IconComponent } from "@/lib/lucide-icons";
import { Platform, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Pressable } from "@/components/ui/Pressable";
import { Text } from "@/components/ui/Text";
import { ICON_STROKE, iconSize, radius, space } from "@/constants/theme";
import { useHaptics } from "@/hooks/useHaptics";
import { useMotion } from "@/hooks/useMotion";
import { useThemeName, useTheme } from "@/hooks/useTheme";

/**
 * Ported from 21st.dev "Bottom Nav Bar" (@arunachalam/bottom-nav-bar): pill
 * container, tinted active pill, and a label that expands out of the icon on
 * activation (original: spring stiffness 350 / damping 32, opacity 190ms).
 * Reproduced with Reanimated; the centre FAB is an addition for this app.
 */

// Budget: (bar 358 - FAB 52 - margins 8) / 2 = 149pt per side for two tabs.
// An active tab costs 8+24+8+LABEL+8; an inactive one costs 8+24+8. 56 keeps the
// pair inside 149 so the fourth tab is never pushed out of the pill.
const LABEL_WIDTH = 56;

export type TabMeta = { icon: IconComponent; label: string };

export function TabBar({
  state,
  navigation,
  tabMeta,
  onCenterPress,
}: BottomTabBarProps & {
  tabMeta: Record<string, TabMeta>;
  onCenterPress: () => void;
}) {
  const theme = useTheme();
  const themeName = useThemeName();
  const insets = useSafeAreaInsets();
  const haptics = useHaptics();

  const routes = state.routes.filter((r) => tabMeta[r.name]);
  const left = routes.slice(0, 2);
  const right = routes.slice(2);

  const renderTab = (route: (typeof routes)[number]) => {
    const index = state.routes.findIndex((r) => r.key === route.key);
    const focused = state.index === index;
    const meta = tabMeta[route.name];

    return (
      <Tab
        key={route.key}
        meta={meta}
        focused={focused}
        onPress={() => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });
          if (!focused && !event.defaultPrevented) {
            haptics.select();
            navigation.navigate(route.name);
          }
        }}
      />
    );
  };

  return (
    <View
      style={{
        pointerEvents: "box-none",
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        paddingBottom: insets.bottom + space.sm,
        paddingHorizontal: space.lg,
        alignItems: "center",
      }}
    >
      <View
        accessibilityRole="tablist"
        style={{
          flexDirection: "row",
          alignItems: "center",
          height: 64,
          paddingHorizontal: space.sm,
          borderRadius: radius.pill,
          borderWidth: 1,
          borderColor: theme.borderStrong,
          backgroundColor:
            Platform.OS === "web" ? theme.surfaceElevated : "transparent",
          overflow: "hidden",
          maxWidth: 460,
          width: "100%",
        }}
      >
        {Platform.OS !== "web" ? (
          <BlurView
            intensity={40}
            tint={themeName === "dark" ? "dark" : "light"}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: `${theme.surfaceElevated}D9`,
            }}
          />
        ) : null}

        <View
          style={{
            flex: 1,
            flexDirection: "row",
            justifyContent: "space-evenly",
            alignItems: "center",
            minWidth: 0,
          }}
        >
          {left.map(renderTab)}
        </View>

        <CenterButton onPress={onCenterPress} />

        <View
          style={{
            flex: 1,
            flexDirection: "row",
            justifyContent: "space-evenly",
            alignItems: "center",
            minWidth: 0,
          }}
        >
          {right.map(renderTab)}
        </View>
      </View>
    </View>
  );
}

function Tab({
  meta,
  focused,
  onPress,
}: {
  meta: TabMeta;
  focused: boolean;
  onPress: () => void;
}) {
  const theme = useTheme();
  const { reduce } = useMotion();
  const Icon = meta.icon;

  const active = useDerivedValue(() =>
    reduce
      ? withTiming(focused ? 1 : 0, { duration: 0 })
      : withSpring(focused ? 1 : 0, { stiffness: 350, damping: 32 })
  );

  const pillStyle = useAnimatedStyle(() => ({
    backgroundColor: theme.primaryMutedBg,
    opacity: active.value,
  }));

  const labelStyle = useAnimatedStyle(() => ({
    width: LABEL_WIDTH * active.value,
    opacity: active.value,
    marginLeft: space.sm * active.value,
  }));

  return (
    <Pressable
      noMinSize
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityState={{ selected: focused }}
      aria-selected={focused}
      accessibilityLabel={meta.label}
      style={{
        flexDirection: "row",
        alignItems: "center",
        height: 48,
        minWidth: 48,
        flexShrink: 1,
        paddingHorizontal: space.sm,
        borderRadius: radius.pill,
      }}
    >
      <Animated.View
        style={[
          { pointerEvents: "none", position: "absolute", top: 0, left: 0, right: 0, bottom: 0, borderRadius: radius.pill },
          pillStyle,
        ]}
      />
      <Icon
        size={iconSize.md}
        strokeWidth={ICON_STROKE}
        color={focused ? theme.primaryBright : theme.fgMuted}
      />
      <Animated.View style={[{ overflow: "hidden" }, labelStyle]}>
        <Text variant="captionSb" numberOfLines={1} style={{ color: theme.primaryBright }}>
          {meta.label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

function CenterButton({ onPress }: { onPress: () => void }) {
  const theme = useTheme();
  const haptics = useHaptics();

  return (
    <Pressable
      noMinSize
      onPress={() => {
        haptics.press();
        onPress();
      }}
      accessibilityRole="button"
      accessibilityLabel="Add a transaction"
      style={{
        width: 52,
        height: 52,
        borderRadius: radius.pill,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: theme.primary,
        marginHorizontal: space.xs,
        // Glow marks the tab bar's focal point. boxShadow is the cross-platform
        // form in RN 0.86; elevation still drives the Android shadow.
        boxShadow: `0 6px 14px ${theme.primary}80`,
        elevation: 8,
      }}
    >
      <Plus size={iconSize.lg - 4} strokeWidth={2.25} color={theme.onPrimary} />
    </Pressable>
  );
}
