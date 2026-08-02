import { type ReactNode } from "react";
import { ScrollView, View, type ScrollViewProps, type ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { space } from "@/constants/theme";
import { useTheme } from "@/hooks/useTheme";

/** Height of the floating tab bar + its bottom offset, so scroll content clears it. */
export const TAB_BAR_CLEARANCE = 96;

export type ScreenProps = {
  children: ReactNode;
  /** Renders a ScrollView; set false for screens that own their own list. */
  scroll?: boolean;
  /** Adds bottom inset for the floating tab bar. */
  hasTabBar?: boolean;
  /** Horizontal gutter; widens automatically on tablets. */
  gutter?: number;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  scrollProps?: Omit<ScrollViewProps, "children" | "style" | "contentContainerStyle">;
  /** Skip top safe-area padding when the screen draws its own header art. */
  edgeToEdgeTop?: boolean;
};

export function Screen({
  children,
  scroll = true,
  hasTabBar,
  gutter = space.lg,
  style,
  contentStyle,
  scrollProps,
  edgeToEdgeTop,
}: ScreenProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const padding: ViewStyle = {
    paddingTop: edgeToEdgeTop ? 0 : insets.top + space.sm,
    paddingLeft: gutter + insets.left,
    paddingRight: gutter + insets.right,
    paddingBottom:
      insets.bottom + space.xl + (hasTabBar ? TAB_BAR_CLEARANCE : 0),
  };

  if (!scroll) {
    return (
      <View style={[{ flex: 1, backgroundColor: theme.bg }, padding, style, contentStyle]}>
        {children}
      </View>
    );
  }

  return (
    <ScrollView
      style={[{ flex: 1, backgroundColor: theme.bg }, style]}
      contentContainerStyle={[padding, contentStyle]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      {...scrollProps}
    >
      {children}
    </ScrollView>
  );
}
