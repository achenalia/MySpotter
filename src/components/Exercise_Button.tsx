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
      accessibilityLabel={[`Open ${exercise.name}`, exercise.time, exercise.difficulty, ...exercise.specialties]
        .filter(Boolean)
        .join(", ")}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <View style={styles.text}>
        <Text style={styles.name} numberOfLines={1}>
          {exercise.name}
        </Text>
        {exercise.time ? (
          <Text style={styles.details} numberOfLines={1}>
            {exercise.time}
          </Text>
        ) : null}
        <Tags difficulty={exercise.difficulty} specialties={exercise.specialties} />
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
  details: { fontSize: 14, color: colors.text, opacity: 0.6 },
  chevron: { fontSize: 24, color: colors.primary },
});
