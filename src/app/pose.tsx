import { useCallback, useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
<<<<<<< HEAD
import { SafeAreaView } from "react-native-safe-area-context";
=======
>>>>>>> origin/main
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
<<<<<<< HEAD
import { BackButton } from "@/components/Back_Button";
=======
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
>>>>>>> origin/main

export default function PoseTest() {
  const { exercise: exerciseParam } = useLocalSearchParams<{ exercise?: string }>();
  const [exercise, setExercise] = useState<Exercise>(() => findPoseExercise(exerciseParam));
  const [state, setState] = useState<ExerciseState>(initialState);
<<<<<<< HEAD
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
=======
  const [voiceOn, setVoiceOn] = useState(false);
  const [showVoices, setShowVoices] = useState(false);
  const [voices, setVoices] = useState<VoiceOption[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string | undefined>();
  const [voicesLoaded, setVoicesLoaded] = useState(false);

  useSpokenFeedback(state, voiceOn);
>>>>>>> origin/main

  const analyzerRef = useRef<Analyzer | null>(null);
  if (analyzerRef.current == null) analyzerRef.current = createAnalyzer(exercise);

  const selectExercise = (ex: Exercise) => {
    setExercise(ex);
    analyzerRef.current = createAnalyzer(ex);
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

<<<<<<< HEAD
  const handleStartCamera = () => {
    setCameraEnabled(true);
    setIsPaused(false);
    setState(initialState);
  };

  const handleStop = () => {
    setCameraEnabled(false);
    setIsPaused(false);
    setState(initialState);
  };

  const liveViewActive = cameraEnabled && !isPaused;

  if (!cameraEnabled) {
    return (
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.headerRow}>
            <BackButton />
            <Text style={styles.title}>Exercises</Text>
          </View>

          <View style={styles.infoPanel}>
            <Text style={styles.sectionLabel}>Before the camera</Text>
            <Text style={styles.instructions}>{exercise.instructions}</Text>

            <Text style={styles.bodyText}>
              The camera is used to detect your body position in real time so the app can
              guide posture and repetition feedback. In this version, the video stream is processed
              locally in your browser with MediaPipe Pose Landmarker. It is not uploaded to a
              server or saved to storage. This tool can help you follow movement cues, but it does
              not guarantee safety, diagnose conditions, or prevent injuries.
            </Text>

            <View style={styles.listBox}>
              <Text style={styles.listTitle}>Before you begin</Text>
              <Text style={styles.listItem}>• Stand where your full body is visible.</Text>
              <Text style={styles.listItem}>• Keep the room well lit and avoid hazards around you.</Text>
              <Text style={styles.listItem}>• Stop if you feel pain, dizziness, or unusual shortness of breath.</Text>
            </View>
          </View>

          <View style={styles.pickerWrap}>
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

          <Pressable onPress={handleStartCamera} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Start camera</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.screen}>
      <PoseCamera onPose={handlePose} enabled={liveViewActive} />

=======
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
>>>>>>> origin/main
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

<<<<<<< HEAD
=======
      {/* Middle band: the camera takes all the remaining space */}
      <View style={styles.camera}>
        <PoseCamera onPose={handlePose} />
      </View>

      {/* Bottom band: reps and live feedback */}
>>>>>>> origin/main
      <View style={styles.bottom}>
        <Text style={styles.reps}>{state.reps}</Text>
        <Text style={styles.phase}>reps ({state.phase})</Text>
        {state.cues[0] ? (
          <Text style={styles.cue}>{state.cues[0]}</Text>
        ) : state.repFeedback ? (
          <Text style={styles.good}>{state.repFeedback}</Text>
        ) : null}

        <View style={styles.controlRow}>
          <Pressable onPress={() => setIsPaused((current) => !current)} style={styles.controlButton}>
            <Text style={styles.controlText}>{isPaused ? "Resume" : "Pause"}</Text>
          </Pressable>
          <Pressable onPress={handleStop} style={[styles.controlButton, styles.stopButton]}>
            <Text style={styles.controlText}>Stop</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
<<<<<<< HEAD
  safe: {
    flex: 1,
    backgroundColor: "#f9f4ea",
  },
  content: {
    padding: 20,
    gap: 18,
    maxWidth: 780,
    width: "100%",
    alignSelf: "center",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1b2b1d",
  },
  infoPanel: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#dfe3d8",
    padding: 20,
    gap: 14,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
    color: "#506b51",
  },
  instructions: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: "700",
    color: "#1b2b1d",
  },
  bodyText: {
    fontSize: 17,
    lineHeight: 25,
    color: "#1b2b1d",
  },
  listBox: {
    backgroundColor: "#eef3eb",
    borderRadius: 16,
    padding: 16,
    gap: 6,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1b2b1d",
  },
  listItem: {
    fontSize: 16,
    lineHeight: 24,
    color: "#1b2b1d",
  },
  pickerWrap: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  primaryButton: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#506b51",
    borderRadius: 14,
    minHeight: 52,
    paddingHorizontal: 20,
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "700",
  },
  screen: { flex: 1, backgroundColor: "#000" },
  top: { position: "absolute", top: 12, left: 12, right: 12, gap: 8 },
=======
  screen: { flex: 1, backgroundColor: colors.dark },

  top: { padding: 12, gap: 6 },
>>>>>>> origin/main
  picker: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: colors.darkTertiary,
  },
<<<<<<< HEAD
  chipActive: { backgroundColor: "#506b51" },
  chipText: { color: "#fff", fontWeight: "600", fontSize: 16 },
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
  phase: { color: "#d4d4d8", fontSize: 16 },
  cue: { fontSize: 22, fontWeight: "700", color: "#f87171" },
  good: { fontSize: 22, fontWeight: "700", color: "#4ade80" },
  controlRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
  controlButton: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    minHeight: 48,
    minWidth: 120,
    paddingHorizontal: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  stopButton: {
    backgroundColor: "#d84f4f",
  },
  controlText: {
    color: "#1b2b1d",
    fontWeight: "800",
    fontSize: 18,
  },
=======
  chipActive: { backgroundColor: colors.primary },
  voiceActive: { backgroundColor: colors.success },
  chipText: { color: colors.white, fontWeight: "600" },

  voiceList: {
    maxHeight: 180,
    backgroundColor: colors.darkSecondary,
    borderRadius: 10,
  },
  voiceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  voiceRowActive: { backgroundColor: colors.darkTertiary },
  voiceName: { color: colors.white, flexShrink: 1 },
  voiceLang: { color: colors.subtle, marginLeft: 8 },
  voiceEmpty: { color: colors.subtle, padding: 12 },

  instructionsLabel: {
    color: colors.subtle,
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginTop: 4,
  },
  instructions: { color: colors.white, fontSize: 16 },

  camera: { flex: 1, backgroundColor: colors.black },

  bottom: { padding: 12, alignItems: "center" },
  reps: { fontSize: 48, fontWeight: "800", color: colors.white },
  phase: { color: colors.primaryText },
  cue: { fontSize: 22, fontWeight: "700", color: colors.warning },
  good: { fontSize: 22, fontWeight: "700", color: colors.success },
>>>>>>> origin/main
});