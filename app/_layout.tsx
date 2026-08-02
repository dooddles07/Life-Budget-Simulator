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

  const ready = outfitLoaded && jakartaLoaded;

  useEffect(() => {
    if (ready) void SplashScreen.hideAsync();
  }, [ready]);

  // Holding the splash until fonts resolve avoids a system-font flash on first paint.
  if (!ready) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <PrefsProvider>
          <DeviceFrame>
            <Shell />
          </DeviceFrame>
        </PrefsProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function Shell() {
  const theme = useTheme();
  const themeName = useThemeName();

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
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="onboarding/index" options={{ animation: "fade" }} />
        <Stack.Screen
          name="add/index"
          options={{ presentation: "modal", animation: "slide_from_bottom" }}
        />
      </Stack>
    </View>
  );
}
