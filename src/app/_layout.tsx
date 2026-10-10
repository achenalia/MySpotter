import { colors } from "@/constants/theme";
import { Stack } from "expo-router";
import type { ComponentProps } from "react";

type ScreenOptions = NonNullable<ComponentProps<typeof Stack.Screen>["options"]>;

// Pop-ups: shown over the current screen with a transparent background so
// <Sheet> can draw the dark backdrop and slide the card up. Closing fades out.
const sheet: ScreenOptions = {
  presentation: "transparentModal",
  animation: "fade",
  contentStyle: { backgroundColor: "transparent" },
};

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

      <Stack.Screen name="pathway/[id]" options={sheet} />
      <Stack.Screen name="exercise/[id]/index" options={sheet} />
      <Stack.Screen name="exercise/[id]/safety" options={sheet} />
    </Stack>
  );
}
