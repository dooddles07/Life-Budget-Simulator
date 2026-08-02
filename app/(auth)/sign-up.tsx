import { Link } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

import { Button } from "@/components/ui/Button";
import { Pressable } from "@/components/ui/Pressable";
import { Screen } from "@/components/ui/Screen";
import { Text } from "@/components/ui/Text";
import { TextField } from "@/components/ui/TextField";
import { space } from "@/constants/theme";
import { useAuth } from "@/lib/auth-context";
import { useHaptics } from "@/hooks/useHaptics";

export default function SignUp() {
  const { signUp } = useAuth();
  const haptics = useHaptics();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);

  const submit = async () => {
    setError(null);
    setLoading(true);
    try {
      const { needsEmailConfirmation } = await signUp(email.trim(), password);
      haptics.success();
      if (needsEmailConfirmation) setNeedsConfirmation(true);
      // If a session came back immediately, the root layout's guard picks it
      // up via onAuthStateChange and routes to onboarding -- no navigation here.
    } catch (e) {
      haptics.error();
      setError(e instanceof Error ? e.message : "Sign up failed");
    } finally {
      setLoading(false);
    }
  };

  if (needsConfirmation) {
    return (
      <Screen scroll={false} style={{ justifyContent: "center" }}>
        <View style={{ gap: space.md }}>
          <Text variant="h1">Check your email</Text>
          <Text variant="body" tone="muted">
            We sent a confirmation link to {email}. Follow it to finish signing up.
          </Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen scroll={false} style={{ justifyContent: "center" }}>
      <View style={{ gap: space.xl }}>
        <View style={{ gap: space.xs }}>
          <Text variant="h1">Create an account</Text>
          <Text variant="body" tone="muted">
            Your data stays yours -- isolated per account, nobody else can see it.
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
            autoComplete="password-new"
          />
          {error ? (
            <Text variant="label" tone="danger">
              {error}
            </Text>
          ) : null}
          <Button
            label="Sign up"
            variant="primary"
            full
            size="lg"
            loading={loading}
            disabled={!email || password.length < 6}
            onPress={submit}
          />
        </View>

        <Link href="/(auth)/sign-in" asChild>
          <Pressable>
            <Text variant="label" tone="primary" center>
              Already have an account? Sign in
            </Text>
          </Pressable>
        </Link>
      </View>
    </Screen>
  );
}
