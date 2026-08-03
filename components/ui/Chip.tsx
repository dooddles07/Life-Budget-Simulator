import { type IconComponent } from "@/lib/lucide-icons";
import { View } from "react-native";

import { Pressable } from "@/components/ui/Pressable";
import { Text } from "@/components/ui/Text";
import { ICON_STROKE, iconSize, radius, space } from "@/constants/theme";
import { useTheme } from "@/hooks/useTheme";

export type ChipProps = {
  label: string;
  icon?: IconComponent;
  active?: boolean;
  /** Overrides the active tint -- used for category filters. */
  activeColor?: string;
  onPress?: () => void;
  count?: number;
};

export function Chip({ label, icon: Icon, active, activeColor, onPress, count }: ChipProps) {
  const theme = useTheme();
  const tint = activeColor ?? theme.primaryBright;

  return (
    <Pressable
      noMinSize
      accessibilityRole="button"
      accessibilityState={{ selected: !!active }}
      aria-pressed={!!active}
      accessibilityLabel={count === undefined ? label : `${label}, ${count} items`}
      onPress={onPress}
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: space.sm,
        height: 40,
        paddingHorizontal: space.lg,
        borderRadius: radius.pill,
        borderWidth: 1,
        borderColor: active ? tint : theme.border,
        backgroundColor: active ? `${tint}22` : theme.surface,
      }}
    >
      {Icon ? (
        <Icon
          size={iconSize.sm}
          strokeWidth={ICON_STROKE}
          color={active ? tint : theme.fgMuted}
        />
      ) : null}
      <Text variant="labelSb" style={{ color: active ? tint : theme.fgMuted }}>
        {label}
      </Text>
      {count !== undefined ? (
        <View
          style={{
            minWidth: 20,
            paddingHorizontal: 6,
            height: 20,
            borderRadius: radius.pill,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: active ? tint : theme.surfacePressed,
          }}
        >
          <Text
            variant="captionSb"
            tabular
            style={{ color: active ? theme.onPrimary : theme.fgMuted }}
          >
            {count}
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
}
