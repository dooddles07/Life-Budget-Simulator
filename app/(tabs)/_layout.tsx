import { useRouter } from "expo-router";
import { Tabs } from "expo-router/js-tabs";
import { ChartPie, House, User, Wallet } from "lucide-react-native";

import { TabBar, type TabMeta } from "@/components/nav/TabBar";
import { useTheme } from "@/hooks/useTheme";

// 4 tabs + a centre FAB stays under the 5-destination limit for bottom nav.
const TAB_META: Record<string, TabMeta> = {
  index: { icon: House, label: "Home" },
  budgets: { icon: Wallet, label: "Budgets" },
  insights: { icon: ChartPie, label: "Insights" },
  profile: { icon: User, label: "You" },
};

export default function TabsLayout() {
  const theme = useTheme();
  const router = useRouter();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: theme.bg },
      }}
      tabBar={(props) => (
        <TabBar
          {...props}
          tabMeta={TAB_META}
          onCenterPress={() => router.push("/add")}
        />
      )}
    >
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="budgets" options={{ title: "Budgets" }} />
      <Tabs.Screen name="insights" options={{ title: "Insights" }} />
      <Tabs.Screen name="profile" options={{ title: "You" }} />
    </Tabs>
  );
}
