import { Text as RNText, type TextProps as RNTextProps } from "react-native";

import { type as typeScale } from "@/constants/theme";
import { useTheme } from "@/hooks/useTheme";

export type TextVariant = keyof typeof typeScale;

export type TextTone =
  | "default"
  | "muted"
  | "faint"
  | "primary"
  | "accent"
  | "success"
  | "danger"
  | "warning"
  | "onPrimary"
  | "onAccent";

export type TextProps = RNTextProps & {
  variant?: TextVariant;
  tone?: TextTone;
  /** Locks digit width so counters and list amounts stop jittering. */
  tabular?: boolean;
  center?: boolean;
};

export function Text({
  variant = "body",
  tone = "default",
  tabular,
  center,
  style,
  ...rest
}: TextProps) {
  const theme = useTheme();

  const color =
    tone === "muted" ? theme.fgMuted
    : tone === "faint" ? theme.fgFaint
    : tone === "primary" ? theme.primaryBright
    : tone === "accent" ? theme.accent
    : tone === "success" ? theme.success
    : tone === "danger" ? theme.danger
    : tone === "warning" ? theme.warning
    : tone === "onPrimary" ? theme.onPrimary
    : tone === "onAccent" ? theme.onAccent
    : theme.fg;

  return (
    <RNText
      style={[
        typeScale[variant],
        { color },
        tabular && { fontVariant: ["tabular-nums"] as const },
        center && { textAlign: "center" as const },
        style,
      ]}
      {...rest}
    />
  );
}
