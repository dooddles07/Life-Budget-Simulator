import {
  Outfit_600SemiBold,
  Outfit_700Bold,
  useFonts as useOutfit,
} from "@expo-google-fonts/outfit";
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  useFonts as useJakarta,
} from "@expo-google-fonts/plus-jakarta-sans";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { DeviceFrame } from "@/components/device-frame/DeviceFrame";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { PrefsProvider, useTheme, useThemeName } from "@/hooks/useTheme";

import "../global.css";

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [outfitLoaded] = useOutfit({ Outfit_600SemiBold, Outfit_700Bold });
  const [jakartaLoaded] = useJakarta({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
  });

  const fontsReady = outfitLoaded && jakartaLoaded;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <PrefsProvider>
            <DeviceFrame>
              <ErrorBoundary>
                <Gate fontsReady={fontsReady} />
              </ErrorBoundary>
            </DeviceFrame>
          </PrefsProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

/** Holds the splash until fonts AND the initial auth session are both resolved --
 *  avoids a system-font flash and a sign-in flash on first paint. */
function Gate({ fontsReady }: { fontsReady: boolean }) {
  const { isLoading: authLoading } = useAuth();
  const ready = fontsReady && !authLoading;

  useEffect(() => {
    if (ready) void SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;
  return <Shell />;
}

function Shell() {
  const theme = useTheme();
  const themeName = useThemeName();
  const { session, profile } = useAuth();
  const onboarded = !!profile?.persona_id;

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <StatusBar style={themeName === "dark" ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.bg },
          animation: "slide_from_right",
        }}
      >
        <Stack.Protected guard={!session}>
          <Stack.Screen name="(auth)" />
        </Stack.Protected>

        <Stack.Protected guard={!!session && !onboarded}>
          <Stack.Screen name="onboarding/index" options={{ animation: "fade" }} />
        </Stack.Protected>

        <Stack.Protected guard={!!session && onboarded}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="add/index"
            options={{ presentation: "modal", animation: "slide_from_bottom" }}
          />
          <Stack.Screen name="goals/index" />
          <Stack.Screen name="achievements/index" />
          <Stack.Screen name="simulator/index" />
          <Stack.Screen name="transactions/index" />
        </Stack.Protected>
      </Stack>
    </View>
  );
}
