import { router, useLocalSearchParams } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { ExerciseCard } from "@/components/Exercise_Card";
import { Sheet } from "@/components/Sheet";
import { colors } from "@/constants/theme";
import { getExercise } from "@/data/content";

export default function ExerciseScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const exercise = getExercise(id);

  if (!exercise) {
    return (
      <Sheet>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Exercise not found.</Text>
        </View>
      </Sheet>
    );
  }

  return (
    <Sheet>
      <ExerciseCard
        name={exercise.name}
        description={exercise.description}
        videoUrl={exercise.videoUrl}
        difficulty={exercise.difficulty}
        onContinue={() =>
          router.push({ pathname: "/exercise/[id]/safety", params: { id: exercise.id } })
        }
      />
    </Sheet>
  );
}

const styles = StyleSheet.create({
  notFound: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },
  notFoundText: { fontSize: 16, color: colors.text },
});
