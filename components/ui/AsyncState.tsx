import { ActivityIndicator, View } from "react-native";

import { Button } from "@/components/ui/Button";
import { Text } from "@/components/ui/Text";
import { space } from "@/constants/theme";
import { useTheme } from "@/hooks/useTheme";

export function LoadingState() {
  const theme = useTheme();
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: space.xxl }}>
      <ActivityIndicator color={theme.primaryBright} />
    </View>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        gap: space.md,
        padding: space.xxl,
      }}
    >
      <Text variant="body" tone="muted" center>
        {message}
      </Text>
      <Button label="Try again" variant="surface" onPress={onRetry} />
    </View>
  );
}
