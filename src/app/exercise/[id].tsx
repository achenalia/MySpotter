import { Stack, useLocalSearchParams } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { ExerciseCard } from "@/components/Exercise_Card";
import { colors } from "@/constants/theme";
import { getExercise } from "@/data/exercises";

export default function ExerciseScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const exercise = getExercise(id);

  if (!exercise) {
    return (
      <View style={styles.notFound}>
        <Stack.Screen options={{ title: "Not found" }} />
        <Text style={styles.notFoundText}>Exercise not found.</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ExerciseCard
        name={exercise.name}
        description={exercise.description}
        videoUrl={exercise.videoUrl}
      />
    </>
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
