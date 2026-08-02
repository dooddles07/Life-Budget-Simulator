import { useState } from "react";
import { TextInput, View, type TextInputProps } from "react-native";

import { Text } from "@/components/ui/Text";
import { radius, space } from "@/constants/theme";
import { useTheme } from "@/hooks/useTheme";

export type TextFieldProps = TextInputProps & {
  label: string;
  error?: string;
};

export function TextField({ label, error, style, onFocus, onBlur, ...rest }: TextFieldProps) {
  const theme = useTheme();
  const [focused, setFocused] = useState(false);

  return (
    <View style={{ gap: space.xs }}>
      <Text variant="label" tone="muted">
        {label}
      </Text>
      <TextInput
        placeholderTextColor={theme.fgFaint}
        style={[
          {
            height: 48,
            paddingHorizontal: space.lg,
            borderRadius: radius.md,
            borderWidth: 1,
            borderColor: error ? theme.danger : focused ? theme.primaryBright : theme.border,
            backgroundColor: theme.surfaceElevated,
            color: theme.fg,
            fontSize: 16,
          },
          style,
        ]}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        {...rest}
      />
      {error ? (
        <Text variant="caption" tone="danger">
          {error}
        </Text>
      ) : null}
    </View>
  );
}
