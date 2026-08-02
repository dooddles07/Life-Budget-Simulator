import { View, type ViewProps, type ViewStyle } from "react-native";

import { radius, space } from "@/constants/theme";
import { useTheme } from "@/hooks/useTheme";

export type CardProps = ViewProps & {
  elevated?: boolean;
  padded?: boolean | keyof typeof space;
  /** Tints the border -- used to signal an over-budget or alert state. */
  accent?: string;
  radiusSize?: keyof typeof radius;
};

export function Card({
  elevated,
  padded = true,
  accent,
  radiusSize = "lg",
  style,
  ...rest
}: CardProps) {
  const theme = useTheme();
  const pad = padded === true ? space.lg : padded === false ? 0 : space[padded];

  const base: ViewStyle = {
    backgroundColor: elevated ? theme.surfaceElevated : theme.surface,
    borderRadius: radius[radiusSize],
    borderWidth: 1,
    borderColor: accent ?? theme.border,
    padding: pad,
  };

  return <View style={[base, style]} {...rest} />;
}
