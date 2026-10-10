import { useCallback, useRef, useState } from "react";
import { SquatDemo } from "@/components/pose/SquatDemo";
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
import { colors } from "@/constants/theme";
import { useLocalSearchParams } from "expo-router";

// Matches app exercise ids ("push-up") to pose ids ("pushup"); unknown ones use the default.
const findPoseExercise = (id?: string) => {
  const key = id?.toLowerCase().replace(/[^a-z0-9]/g, "");
  return exercises.find((e) => e.id.replace(/[^a-z0-9]/g, "") === key) ?? exercises[0];
};

export default function PoseScreen() {
  const { demo } = useLocalSearchParams<{ demo?: string }>();
  return demo === "1" ? <SquatDemo /> : <PoseTest />;
}

function PoseTest() {
  const { exercise: exerciseParam } = useLocalSearchParams<{ exercise?: string }>();
  const [exercise, setExercise] = useState<Exercise>(() => findPoseExercise(exerciseParam));
  const [state, setState] = useState<ExerciseState>(initialState);
  const [voiceOn, setVoiceOn] = useState(false);
  const [showVoices, setShowVoices] = useState(false);
  const [voices, setVoices] = useState<VoiceOption[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string | undefined>();
  const [voicesLoaded, setVoicesLoaded] = useState(false);

  useSpokenFeedback(state, voiceOn);

  const analyzerRef = useRef<Analyzer | null>(null);
  if (analyzerRef.current == null) analyzerRef.current = createAnalyzer(exercise);

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
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 12,
    gap: 12,
  },

  top: {
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  picker: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  voiceActive: { backgroundColor: colors.success, borderColor: colors.success },
  chipText: { color: colors.text, fontWeight: "600", fontSize: 12 },

  voiceList: {
    maxHeight: 180,
    backgroundColor: colors.surfaceAlt,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  voiceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  voiceRowActive: { backgroundColor: colors.surface },
  voiceName: { color: colors.text, flexShrink: 1, fontWeight: "600" },
  voiceLang: { color: colors.muted, marginLeft: 8 },
  voiceEmpty: { color: colors.muted, padding: 12 },

  instructionsLabel: {
    color: colors.primary,
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginTop: 4,
    fontWeight: "700",
  },
  instructions: { color: colors.text, fontSize: 15, lineHeight: 22 },

  camera: {
    flex: 1,
    backgroundColor: colors.black,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
  },

  bottom: {
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
  },
  reps: { fontSize: 42, fontWeight: "800", color: colors.text },
  phase: { color: colors.muted },
  cue: { fontSize: 20, fontWeight: "700", color: colors.warning },
  good: { fontSize: 20, fontWeight: "700", color: colors.success },
});