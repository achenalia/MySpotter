import { router, useLocalSearchParams } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BackButton } from "@/components/Back_Button";
import { Button } from "@/components/Button";
import { colors, spacing } from "@/constants/theme";
import { DEFAULT_SAFETY, getExercise } from "@/data/content";

export default function ExerciseSafetyScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const exercise = getExercise(id);

  const begin = () => {
    // Close the pop-ups first so the webcam opens as a normal full screen.
    router.dismissAll();
    router.push({ pathname: "/pose", params: { exercise: id } });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <BackButton />
        {/* Centered across the full width, independent of the back arrow. */}
        <View style={styles.titleWrap} pointerEvents="none">
          <Text style={styles.title} accessibilityRole="header">
            ⚠️ SAFETY ⚠️
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.description}>{exercise?.safety ?? DEFAULT_SAFETY}</Text>
        <Button title="Begin" onPress={begin} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 52,
  },
  titleWrap: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { fontSize: 24, fontWeight: "800", letterSpacing: 1, color: colors.text },
  content: { padding: spacing.md, gap: spacing.lg },
  description: { fontSize: 17, lineHeight: 26, color: colors.text },
});
