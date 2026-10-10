import { useCallback, useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
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
import {
  getSelectedVoice,
  getVoiceOptions,
  selectVoice,
  useSpokenFeedback,
  type VoiceOption,
} from "@/components/pose/useSpokenFeedback";

export default function PoseTest() {
  const [exercise, setExercise] = useState<Exercise>(exercises[0]);
  const [state, setState] = useState<ExerciseState>(initialState);
  const [voiceOn, setVoiceOn] = useState(false);
  const [showVoices, setShowVoices] = useState(false);
  const [voices, setVoices] = useState<VoiceOption[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string | undefined>();
  const [voicesLoaded, setVoicesLoaded] = useState(false);

  useSpokenFeedback(state, voiceOn);

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

  const toggleVoiceList = async () => {
    if (!showVoices) {
      const options = await getVoiceOptions();
      setVoices(options);
      setSelectedVoice(getSelectedVoice());
      setVoicesLoaded(true);
    }
    setShowVoices((s) => !s);
  };

  const pickVoice = async (id: string) => {
    setSelectedVoice(id);
    await selectVoice(id); // saves it and plays a sample
  };

  return (
    <View style={styles.screen}>
      {/* Top band: exercise picker, voice controls, and instructions */}
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
          <Pressable
            onPress={() => setVoiceOn((v) => !v)}
            style={[styles.chip, voiceOn && styles.voiceActive]}
          >
            <Text style={styles.chipText}>Voice: {voiceOn ? "On" : "Off"}</Text>
          </Pressable>
          <Pressable onPress={toggleVoiceList} style={styles.chip}>
            <Text style={styles.chipText}>
              {showVoices ? "Hide voices" : "Change voice"}
            </Text>
          </Pressable>
        </View>

        {showVoices && (
          <ScrollView style={styles.voiceList} nestedScrollEnabled>
            {voicesLoaded && voices.length === 0 && (
              <Text style={styles.voiceEmpty}>
                No English voices found on this device.
              </Text>
            )}
            {voices.map((v) => (
              <Pressable
                key={v.id}
                onPress={() => pickVoice(v.id)}
                style={[
                  styles.voiceRow,
                  v.id === selectedVoice && styles.voiceRowActive,
                ]}
              >
                <Text style={styles.voiceName}>
                  {v.id === selectedVoice ? "✓ " : ""}
                  {v.name}
                </Text>
                <Text style={styles.voiceLang}>{v.language}</Text>
              </Pressable>
            ))}
          </ScrollView>
        )}

        <Text style={styles.instructionsLabel}>How to set up</Text>
        <Text style={styles.instructions}>{exercise.instructions}</Text>
      </View>

      {/* Middle band: the camera takes all the remaining space */}
      <View style={styles.camera}>
        <PoseCamera onPose={handlePose} />
      </View>

      {/* Bottom band: reps and live feedback */}
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
  screen: { flex: 1, backgroundColor: "#111" },

  top: { padding: 12, gap: 6 },
  picker: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: "#27272a",
  },
  chipActive: { backgroundColor: "#4f46e5" },
  voiceActive: { backgroundColor: "#16a34a" },
  chipText: { color: "#fff", fontWeight: "600" },

  voiceList: {
    maxHeight: 180,
    backgroundColor: "#18181b",
    borderRadius: 10,
  },
  voiceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  voiceRowActive: { backgroundColor: "#27272a" },
  voiceName: { color: "#fff", flexShrink: 1 },
  voiceLang: { color: "#a1a1aa", marginLeft: 8 },
  voiceEmpty: { color: "#a1a1aa", padding: 12 },

  instructionsLabel: {
    color: "#a1a1aa",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginTop: 4,
  },
  instructions: { color: "#fff", fontSize: 16 },

  camera: { flex: 1, backgroundColor: "#000" },

  bottom: { padding: 12, alignItems: "center" },
  reps: { fontSize: 48, fontWeight: "800", color: "#fff" },
  phase: { color: "#d4d4d8" },
  cue: { fontSize: 22, fontWeight: "700", color: "#f87171" },
  good: { fontSize: 22, fontWeight: "700", color: "#4ade80" },
});