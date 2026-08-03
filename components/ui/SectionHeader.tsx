import { ChevronRight } from "@/lib/lucide-icons";
import { View } from "react-native";

import { Pressable } from "@/components/ui/Pressable";
import { Text } from "@/components/ui/Text";
import { ICON_STROKE, iconSize, space } from "@/constants/theme";
import { useTheme } from "@/hooks/useTheme";

export function SectionHeader({
  title,
  actionLabel,
  onAction,
  subtitle,
}: {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  const theme = useTheme();

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: space.md,
        gap: space.md,
      }}
    >
      <View style={{ flex: 1 }}>
        <Text variant="h3">{title}</Text>
        {subtitle ? (
          <Text variant="caption" tone="muted" style={{ marginTop: 2 }}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      {actionLabel && onAction ? (
        <Pressable
          noMinSize
          onPress={onAction}
          accessibilityRole="button"
          accessibilityLabel={`${actionLabel}, ${title}`}
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 2,
            height: 36,
            paddingLeft: space.sm,
          }}
        >
          <Text variant="labelSb" tone="primary">
            {actionLabel}
          </Text>
          <ChevronRight
            size={iconSize.sm}
            strokeWidth={ICON_STROKE}
            color={theme.primaryBright}
          />
        </Pressable>
      ) : null}
    </View>
  );
}
