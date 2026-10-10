import { useCallback, useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router, Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "@/constants/theme";
import { PoseCamera } from "./PoseCamera";
import { createAnalyzer, initialState, type Analyzer, type ExerciseState } from "./analyze";
import { squat } from "./exercises/squat";
import { LM } from "./landmarks";
import { angle } from "./angles";
import type { Landmark, PoseCameraStatus } from "./types";

// The demo detects movement cycles; it does not prescribe depth or assess safety.
const demoExercise = { ...squat, checks: [], repChecks: [] };
const GOAL = 3;
type Stage = "setup" | "running" | "paused" | "complete" | "stopped";

export function SquatDemo() {
  const [stage, setStage] = useState<Stage>("setup");
  const stageRef = useRef<Stage>("setup");
  const [state, setState] = useState<ExerciseState>(initialState);
  const stateRef = useRef(initialState);
  const analyzerRef = useRef<Analyzer>(createAnalyzer(demoExercise));
  const [status, setStatus] = useState<PoseCameraStatus>("requesting-camera");
  const [message, setMessage] = useState("Allow camera access to begin.");
  const [visible, setVisible] = useState(false);
  const [standing, setStanding] = useState(false);
  const [armed, setArmed] = useState(false);
  const armedRef = useRef(false);
  const [cameraAttempt, setCameraAttempt] = useState(0);

  const changeStage = (next: Stage) => {
    stageRef.current = next;
    setStage(next);
  };

  const handleStatus = useCallback((next: PoseCameraStatus, error?: string) => {
    setStatus(next);
    if (next === "error") {
      stageRef.current = "paused";
      setStage("paused");
      setVisible(false);
      setStanding(false);
      setMessage(error ?? "Camera could not start. Try again.");
    } else {
      setMessage(next === "ready" ? "Stand sideways with shoulders, hips, knees and feet in view."
        : next === "loading-tracker" || next === "preview-ready" ? "Loading movement tracker…" : "Allow camera access to begin.");
    }
  }, []);

  const handleFrame = useCallback((landmarks: Landmark[] | null, aspectRatio = 1) => {
    const parts = ["shoulder", "hip", "knee", "ankle"] as const;
    const side = landmarks && parts.every(p => (landmarks[LM[p].left]?.visibility ?? 0) >= 0.6)
      ? "left" : "right";
    const inFrame = Boolean(landmarks && parts.every(p => {
      const point = landmarks[LM[p][side]];
      return point && (point.visibility ?? 0) >= 0.6 && point.x >= 0 && point.x <= 1 && point.y >= 0 && point.y <= 1;
    }));
    setVisible(inFrame);
    if (!inFrame || !landmarks) {
      setStanding(false);
      if (stageRef.current === "running") {
        stageRef.current = "paused";
        setStage("paused");
        armedRef.current = false;
        setArmed(false);
        analyzerRef.current = createAnalyzer(demoExercise, stateRef.current.reps);
        setMessage("Counting paused. Bring your whole body back into view, then press Resume.");
      }
      return;
    }
    // Correct normalized image coordinates before measuring joint angles.
    const scaled = landmarks.map(p => ({ ...p, x: p.x * aspectRatio }));
    const upright = angle(scaled[LM.hip[side]], scaled[LM.knee[side]], scaled[LM.ankle[side]]) > demoExercise.repAngle.upAbove;
    setStanding(upright);
    if (stageRef.current !== "running") return;
    if (!armedRef.current) {
      if (!upright) return;
      armedRef.current = true;
      setArmed(true);
    }
    const next = analyzerRef.current(scaled);
    if (next.cues.length) {
      stageRef.current = "paused";
      setStage("paused");
      armedRef.current = false;
      setArmed(false);
      setMessage("Counting paused. Reposition sideways and press Resume.");
      return;
    }
    stateRef.current = next;
    setState(next);
    if (next.reps >= GOAL) {
      stageRef.current = "complete";
      setStage("complete");
    }
  }, []);

  function start() {
    if (status !== "ready" || !visible || !standing) return;
    analyzerRef.current = createAnalyzer(demoExercise, stateRef.current.reps);
    armedRef.current = false;
    setArmed(false);
    changeStage("running");
  }

  function reset() {
    stateRef.current = initialState;
    setState(initialState);
    analyzerRef.current = createAnalyzer(demoExercise);
    armedRef.current = false;
    setArmed(false);
    changeStage("setup");
  }

  const canStart = status === "ready" && visible && standing;
  const runningMessage = !armed ? "Stand upright to begin counting."
    : state.phase === "down" ? "Bent position detected" : state.reps ? "Return to standing detected — repetition counted" : "Ready for movement";

  return (
    <SafeAreaView style={styles.screen}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable accessibilityRole="button" onPress={() => router.back()}><Text style={styles.text}>← Back</Text></Pressable>
        <Text style={styles.title}>Squat counting demo</Text>
        <Text style={styles.text}>3 repetitions for demonstration only. Not a therapy prescription or a safety assessment.</Text>
        <Text style={styles.text}>Place the laptop on a stable surface. Stand sideways, far enough away to see your shoulders, hips, knees and feet. Start upright. Only demonstrate movement you can comfortably do.</Text>
        <View style={styles.camera}>
          <PoseCamera key={cameraAttempt} active={stage !== "complete" && stage !== "stopped"} onPoseFrame={handleFrame} onStatusChange={handleStatus} />
        </View>
        <Text style={styles.counter}>{state.reps} / {GOAL}</Text>
        <Text accessibilityLiveRegion="polite" style={styles.feedback}>
          {stage === "complete" ? "Demo complete — 3 movement cycles detected!" : stage === "stopped" ? "Session stopped. Camera off."
            : stage === "running" ? runningMessage : status !== "ready" ? message
            : !visible ? "Move back until your whole body is visible."
            : stage === "paused" ? `${message} Stand upright to resume.`
            : !standing ? "Stand upright before starting." : "Body visible. Ready to start."}
        </Text>
        {(stage === "setup" || stage === "paused") && <Pressable accessibilityRole="button" accessibilityState={{ disabled: !canStart }} disabled={!canStart} onPress={start} style={[styles.button, !canStart && styles.disabled]}><Text style={styles.buttonText}>{stage === "paused" ? "Resume counting" : "Start counting"}</Text></Pressable>}
        {stage === "running" && <Pressable accessibilityRole="button" style={styles.button} onPress={() => { setMessage("Paused by you."); changeStage("paused"); }}><Text style={styles.buttonText}>Pause</Text></Pressable>}
        {status === "error" && stage !== "stopped" && <Pressable accessibilityRole="button" style={styles.button} onPress={() => { reset(); setStatus("requesting-camera"); setCameraAttempt(n => n + 1); }}><Text style={styles.buttonText}>Retry camera</Text></Pressable>}
        <Pressable accessibilityRole="button" style={styles.secondary} onPress={reset}><Text style={styles.text}>Reset demo</Text></Pressable>
        {stage !== "complete" && stage !== "stopped" && <Pressable accessibilityRole="button" style={styles.secondary} onPress={() => changeStage("stopped")}><Text style={styles.text}>Stop and turn camera off</Text></Pressable>}
        <Text style={styles.text}>Counting uses visible knee movement. Partial movements, camera position and tracking errors can affect results. Stop if you feel pain or unwell.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, gap: 16, maxWidth: 850, width: "100%", alignSelf: "center" },
  title: { fontSize: 28, fontWeight: "800", color: colors.text },
  text: { fontSize: 16, lineHeight: 23, color: colors.muted },
  camera: { height: 360, position: "relative", backgroundColor: colors.black, borderRadius: 12, overflow: "hidden" },
  counter: { fontSize: 56, fontWeight: "800", color: colors.text, textAlign: "center" },
  feedback: { fontSize: 18, lineHeight: 25, fontWeight: "600", color: colors.text, textAlign: "center" },
  button: { minHeight: 50, padding: 14, backgroundColor: colors.primary, borderRadius: 10, alignItems: "center" },
  buttonText: { fontSize: 17, fontWeight: "700", color: colors.primaryText },
  disabled: { opacity: 0.45 },
  secondary: { minHeight: 48, padding: 12, borderWidth: 1, borderColor: colors.border, borderRadius: 10, alignItems: "center" },
});
