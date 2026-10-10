import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Tags } from "@/components/Tags";
import { colors, spacing } from "@/constants/theme";
import { getExercise } from "@/data/content";

type ExerciseButtonProps = {
  /** The id of an exercise in src/data/content.json. */
  id: string;
};

export function ExerciseButton({ id }: ExerciseButtonProps) {
  const exercise = getExercise(id);
  if (!exercise) return null;

  const openExercise = () => {
    router.push({ pathname: "/exercise/[id]", params: { id } });
  };

  return (
    <Pressable
      onPress={openExercise}
      accessibilityRole="button"
      accessibilityLabel={[`Open ${exercise.name}`, exercise.difficulty].filter(Boolean).join(", ")}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <View style={styles.text}>
        <Text style={styles.name} numberOfLines={1}>
          {exercise.name}
        </Text>
        <Tags difficulty={exercise.difficulty} />
      </View>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: 12,
    gap: spacing.sm,
  },
  pressed: { opacity: 0.7 },
  text: { flex: 1, gap: spacing.sm / 2 },
  name: { fontSize: 18, fontWeight: "600", color: colors.text },
  chevron: { fontSize: 24, color: colors.primary },
});
