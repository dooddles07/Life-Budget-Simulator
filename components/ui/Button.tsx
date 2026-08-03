import { type IconComponent } from "@/lib/lucide-icons";
import { ActivityIndicator, View } from "react-native";

import { Pressable } from "@/components/ui/Pressable";
import { Text } from "@/components/ui/Text";
import { ICON_STROKE, iconSize, radius, space } from "@/constants/theme";
import { useTheme } from "@/hooks/useTheme";

export type ButtonProps = {
  label: string;
  onPress?: () => void;
  variant?: "primary" | "accent" | "surface" | "ghost" | "danger";
  icon?: IconComponent;
  iconRight?: IconComponent;
  disabled?: boolean;
  loading?: boolean;
  full?: boolean;
  size?: "md" | "lg";
};

export function Button({
  label,
  onPress,
  variant = "primary",
  icon: Icon,
  iconRight: IconRight,
  disabled,
  loading,
  full,
  size = "md",
}: ButtonProps) {
  const theme = useTheme();

  const bg =
    variant === "primary" ? theme.primary
    : variant === "accent" ? theme.accent
    : variant === "danger" ? theme.danger
    : variant === "surface" ? theme.surfaceElevated
    : "transparent";

  const fg =
    variant === "primary" ? theme.onPrimary
    : variant === "accent" ? theme.onAccent
    : variant === "danger" ? theme.onPrimary
    : variant === "ghost" ? theme.primaryBright
    : theme.fg;

  const height = size === "lg" ? 56 : 48;

  return (
    <Pressable
      noMinSize
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!(disabled || loading), busy: !!loading }}
      aria-busy={!!loading}
      disabled={disabled || loading}
      onPress={onPress}
      style={{
        height,
        alignSelf: full ? "stretch" : "flex-start",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: space.sm,
        paddingHorizontal: size === "lg" ? space.xl : space.lg,
        borderRadius: radius.md,
        backgroundColor: bg,
        borderWidth: variant === "surface" || variant === "ghost" ? 1 : 0,
        borderColor: variant === "ghost" ? "transparent" : theme.border,
      }}
    >
      {loading ? (
        <ActivityIndicator color={fg} size="small" />
      ) : (
        <>
          {Icon ? <Icon size={iconSize.md} strokeWidth={ICON_STROKE} color={fg} /> : null}
          <Text variant={size === "lg" ? "h3" : "labelSb"} style={{ color: fg }}>
            {label}
          </Text>
          {IconRight ? (
            <IconRight size={iconSize.md} strokeWidth={ICON_STROKE} color={fg} />
          ) : null}
        </>
      )}
    </Pressable>
  );
}

/** Circular icon-only control. Always needs an explicit label. */
export function IconButton({
  icon: Icon,
  onPress,
  label,
  tone,
  size = 44,
  filled,
}: {
  icon: IconComponent;
  onPress?: () => void;
  label: string;
  tone?: string;
  size?: number;
  filled?: boolean;
}) {
  const theme = useTheme();
  const color = tone ?? theme.fg;

  return (
    <Pressable
      noMinSize
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={{
        width: size,
        height: size,
        borderRadius: radius.pill,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: filled ? theme.surfaceElevated : "transparent",
        borderWidth: filled ? 1 : 0,
        borderColor: theme.border,
      }}
    >
      <View>
        <Icon size={iconSize.md} strokeWidth={ICON_STROKE} color={color} />
      </View>
    </Pressable>
  );
}
