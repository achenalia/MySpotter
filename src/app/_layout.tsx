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
      <Stack.Screen name="index" />
      <Stack.Screen name="safety" options={{ headerShown: true, title: "Safety Guidelines" }} />
      <Stack.Screen name="pose" options={{ headerShown: true, title: "Workout" }} />
      <Stack.Screen name="pathways" />

      {/* Pop-ups: slide up over the current screen and close with their X / back arrow. */}
      <Stack.Screen name="pathway/[id]" options={{ presentation: "modal" }} />
      <Stack.Screen name="exercise/[id]/index" options={{ presentation: "modal" }} />
      <Stack.Screen name="exercise/[id]/safety" options={{ presentation: "modal" }} />
    </Stack>
  );
}
