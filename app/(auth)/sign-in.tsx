import { Link } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, View } from "react-native";

import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import { Pressable } from "@/components/ui/Pressable";
import { Screen } from "@/components/ui/Screen";
import { Text } from "@/components/ui/Text";
import { TextField } from "@/components/ui/TextField";
import { space } from "@/constants/theme";
import { useAuth } from "@/lib/auth-context";
import { useHaptics } from "@/hooks/useHaptics";

export default function SignIn() {
  const { signIn } = useAuth();
  const haptics = useHaptics();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError(null);
    setLoading(true);
    try {
      await signIn(email.trim(), password);
      haptics.success();
    } catch (e) {
      haptics.error();
      setError(e instanceof Error ? e.message : "Sign in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen scroll={false} style={{ justifyContent: "center" }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1, justifyContent: "center" }}
      >
        <View style={{ gap: space.xl }}>
          <Logo size={72} style={{ alignSelf: "center" }} />
          <View style={{ gap: space.xs }}>
            <Text variant="h1">Welcome back</Text>
            <Text variant="body" tone="muted">
              Sign in to pick up where you left off.
            </Text>
          </View>

          <View style={{ gap: space.lg }}>
            <TextField
              label="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
            />
            <TextField
              label="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="password"
            />
            {error ? (
              <Text variant="label" tone="danger">
                {error}
              </Text>
            ) : null}
            <Button
              label="Sign in"
              variant="primary"
              full
              size="lg"
              loading={loading}
              disabled={!email || !password}
              onPress={submit}
            />
          </View>

          <Link href="/(auth)/sign-up" asChild>
            <Pressable>
              <Text variant="label" tone="primary" center>
                Don&apos;t have an account? Sign up
              </Text>
            </Pressable>
          </Link>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}
