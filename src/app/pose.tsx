import { useCallback, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { PoseCamera } from "@/components/pose/PoseCamera";
import type { Landmark } from "@/components/pose/types";
import {
  createAnalyzer,
  initialState,
  type Analyzer,
  type ExerciseState,
} from "@/components/pose/analyze";
import { exercises } from "@/components/pose/exercises";
import type { Exercise } from "@/components/pose/exercises/types";

export default function PoseTest() {
  const [exercise, setExercise] = useState<Exercise>(exercises[0]);
  const [state, setState] = useState<ExerciseState>(initialState);

  const analyzerRef = useRef<Analyzer | null>(null);
  if (!analyzerRef.current) analyzerRef.current = createAnalyzer(exercises[0]);

  const selectExercise = (ex: Exercise) => {
    setExercise(ex);
    analyzerRef.current = createAnalyzer(ex); // fresh reps, smoothing, and side
    setState(initialState);
  };

  const handlePose = useCallback((lms: Landmark[]) => {
    const next = analyzerRef.current!(lms);
    setState((prev) =>
      prev.reps === next.reps &&
      prev.phase === next.phase &&
      prev.repFeedback === next.repFeedback &&
      prev.side === next.side &&
      prev.cues.join() === next.cues.join()
        ? prev
        : next
    );
  }, []);

  return (
    <View style={styles.screen}>
      {/* Camera fills the whole screen */}
      <PoseCamera onPose={handlePose} />

      {/* Top overlay: exercise picker and instructions */}
      <View style={styles.top}>
        <View style={styles.picker}>
          {exercises.map((ex) => (
            <Pressable
              key={ex.id}
              onPress={() => selectExercise(ex)}
              style={[styles.chip, ex.id === exercise.id && styles.chipActive]}
            >
              <Text style={styles.chipText}>{ex.name}</Text>
            </Pressable>
          ))}
        </View>
        <Text style={styles.instructions}>{exercise.instructions}</Text>
      </View>

      {/* Bottom overlay: reps and live feedback */}
      <View style={styles.bottom}>
        <Text style={styles.reps}>{state.reps}</Text>
        <Text style={styles.phase}>reps ({state.phase})</Text>
        {state.cues[0] ? (
          <Text style={styles.cue}>{state.cues[0]}</Text>
        ) : state.repFeedback ? (
          <Text style={styles.good}>{state.repFeedback}</Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#000" },
  top: { position: "absolute", top: 12, left: 12, right: 12, gap: 8 },
  picker: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  chipActive: { backgroundColor: "#4f46e5" },
  chipText: { color: "#fff", fontWeight: "600" },
  instructions: {
    color: "#fff",
    backgroundColor: "rgba(0,0,0,0.5)",
    alignSelf: "flex-start",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  bottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  reps: { fontSize: 56, fontWeight: "800", color: "#fff" },
  phase: { color: "#d4d4d8" },
  cue: { fontSize: 22, fontWeight: "700", color: "#f87171" },
  good: { fontSize: 22, fontWeight: "700", color: "#4ade80" },
});