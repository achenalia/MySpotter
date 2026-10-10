import { router, Stack } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BackButton } from "@/components/Back_Button";
import { colors, spacing } from "@/constants/theme";
import { exercises, type ExerciseCategory } from "@/data/exercises";

const categories: ExerciseCategory[] = ["Balance", "Strength", "Flexibility", "Recovery"];

export default function ExercisesScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <BackButton />
          <Text accessibilityRole="header" style={styles.title}>Exercises</Text>
        </View>
        <Text style={styles.intro}>Browse exercises by focus. Draft entries are for review only and cannot be started.</Text>

        {categories.map((category) => {
          const items = exercises.filter((exercise) => exercise.category === category);
          return (
            <View key={category} style={styles.section}>
              <Text accessibilityRole="header" style={styles.sectionTitle}>{category}</Text>
              {items.map((exercise) => (
                <View key={exercise.id} style={styles.card}>
                  <View style={styles.cardHeading}>
                    <Text style={styles.cardTitle}>{exercise.name}</Text>
                    {exercise.verification === "draft" ? <Text style={styles.draft}>DRAFT</Text> : null}
                  </View>
                  <Text style={styles.description}>{exercise.description}</Text>
                  <Text style={styles.support}><Text style={styles.supportLabel}>Equipment or support: </Text>{exercise.equipment}</Text>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`View exercise: ${exercise.name}`}
                    onPress={() => router.push({ pathname: "/exercise/[id]", params: { id: exercise.id } })}
                    style={({ pressed }) => [styles.button, pressed && styles.pressed]}
                  >
                    <Text style={styles.buttonText}>View exercise</Text>
                  </Pressable>
                </View>
              ))}
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, gap: spacing.md, maxWidth: 860, width: "100%", alignSelf: "center" },
  header: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  title: { fontSize: 28, lineHeight: 34, fontWeight: "800", color: colors.text },
  intro: { fontSize: 17, lineHeight: 25, color: colors.text },
  section: { gap: spacing.md, paddingTop: spacing.sm },
  sectionTitle: { fontSize: 23, lineHeight: 30, fontWeight: "800", color: colors.text },
  card: { backgroundColor: colors.surface, borderWidth: 1, borderColor: "#dfe3d8", borderRadius: 8, padding: spacing.md, gap: spacing.sm },
  cardHeading: { flexDirection: "row", alignItems: "flex-start", gap: spacing.sm },
  cardTitle: { flex: 1, fontSize: 20, lineHeight: 27, fontWeight: "800", color: colors.text },
  draft: { fontSize: 14, lineHeight: 20, fontWeight: "800", color: "#8c3029" },
  description: { fontSize: 17, lineHeight: 24, color: colors.text },
  support: { fontSize: 16, lineHeight: 23, color: colors.text },
  supportLabel: { fontWeight: "700" },
  button: { minHeight: 50, paddingHorizontal: spacing.md, alignItems: "center", justifyContent: "center", alignSelf: "flex-start", backgroundColor: colors.primary, borderRadius: 8 },
  buttonText: { color: "#fff", fontSize: 17, lineHeight: 23, fontWeight: "800" },
  pressed: { opacity: 0.72 },
});
