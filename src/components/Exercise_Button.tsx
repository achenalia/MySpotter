import { router } from "expo-router";
import { Pressable, StyleSheet, Text } from "react-native";
import { colors, spacing } from "@/constants/theme";
import { getExercise } from "@/data/exercises";

type ExerciseButtonProps = {
  /** The id of an exercise in src/data/exercises.ts. */
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
      accessibilityLabel={`Open ${exercise.name}`}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <Text style={styles.name} numberOfLines={1}>
        {exercise.name}
      </Text>
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
  name: { flex: 1, fontSize: 18, fontWeight: "600", color: colors.text },
  chevron: { fontSize: 24, color: colors.primary },
});
