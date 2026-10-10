import { colors } from "@/constants/theme";
import { Tabs } from "expo-router";

export default function RootLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.text,
        tabBarStyle: { backgroundColor: colors.background },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: "Home", tabBarAccessibilityLabel: "Home tab" }}
      />
      <Tabs.Screen
        name="safety"
        options={{ title: "Safety", tabBarAccessibilityLabel: "Safety tab" }}
      />
    </Tabs>
  );
}