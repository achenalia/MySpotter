import { colors } from "@/constants/theme";
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        contentStyle: { backgroundColor: colors.background },
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
      <Tabs.Screen name="pathways" options={{ href: null }} />
      <Tabs.Screen name="exercises" options={{ href: null }} />
      <Tabs.Screen name="affirmations" options={{ href: null }} />
      <Tabs.Screen name="pose" options={{ href: null }} />
      <Tabs.Screen name="exercise/[id]" options={{ href: null }} />
      <Tabs.Screen name="pathway/[id]" options={{ href: null }} />
    </Tabs>
  );
}
