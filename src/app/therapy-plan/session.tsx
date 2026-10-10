import { PlanPicture } from "@/components/pose/PlanPicture";
import { BackButton } from "@/components/Back_Button";
import { PoseCamera } from "@/components/pose/PoseCamera";
import { createAnalyzer, initialState, type Analyzer, type ExerciseState } from "@/components/pose/analyze";
import { getTrackedPlanExercise } from "@/components/pose/exercises";
import { LM, type BodyPart } from "@/components/pose/landmarks";
import type { Landmark, PoseCameraStatus } from "@/components/pose/types";
import { useSpokenFeedback } from "@/components/pose/useSpokenFeedback";
import { colors, spacing } from "@/constants/theme";
import { loadSavedTherapyPlan, type TherapyPlan, type TherapyPlanInstruction } from "@/data/therapyPlan";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function cameraSetupCue(id: string, fallback: string) {
  const cues: Record<string, string> = {
    "sitting-knee-extension": "Sit sideways to the camera with your hip, knee and ankle visible. Start with your knee bent.",
    "shoulder-abduction": "Face the camera with your hips and arms visible. Start with your arms lowered.",
    "shoulder-flexion": "Face sideways with your hip and arm visible. Start with your arm lowered.",
    "elbow-flexion": "Face sideways with your shoulder, elbow and wrist visible. Start with your arm lowered.",
    "hamstring-flexion": "Stand sideways with your hip, knee and ankle visible. Use the support shown in your plan.",
    "sit-to-stand": "Place the camera to your side. Keep your hip, knee and ankle visible. Start seated.",
  };
  return cues[id] ?? fallback;
}

type SessionStage = "setup" | "running" | "paused" | "set-complete" | "exercise-complete" | "complete" | "stopped";
type RepTarget = { sets: number; repsPerSet: number; label: string };

const DEMO_TARGET: RepTarget = { sets: 1, repsPerSet: 2, label: "2 repetitions (demo only)" };

const GENERAL_VISIBLE_PARTS: BodyPart[] = ["shoulder", "hip", "knee", "ankle"];

function getRepTarget(dosage: string): RepTarget | null {
  const setMatch = dosage.match(/\b(\d+)\s+sets?\s+of\s+(\d+)\s*(?:reps?|repetitions?)\b/i)
    ?? dosage.match(/\b(\d+)\s*[x×]\s*(\d+)\s*(?:reps?|repetitions?)\b/i);
  if (setMatch) {
    const sets = Number(setMatch[1]);
    const repsPerSet = Number(setMatch[2]);
    if (sets > 0 && repsPerSet > 0) return { sets, repsPerSet, label: `${sets} sets of ${repsPerSet} reps` };
  }

  // Ranges, decimal quantities and session frequency are not exact rep targets.
  const exactDosage = dosage.replace(/\b\d+(?:\.\d+)?\s*(?:to|[-–])\s*\d+(?:\.\d+)?\s*(?:reps?|repetitions?|times)\b/gi, "")
    .replace(/\b\d+(?:\.\d+)?\s+times?\s+(?:(?:a|per)\s+)?(?:day|week|daily|weekly)\b/gi, "")
    .replace(/\b\d+\.\d+\s*(?:reps?|repetitions?|times)\b/gi, "");
  const repeatMatch = exactDosage.match(/\brepeat\s+(\d+)\s+(?:times?|reps?|repetitions?)\b/i)
    ?? exactDosage.match(/\b(\d+)\s*(?:reps?|repetitions?|times)\b/i);
  if (repeatMatch) {
    const repsPerSet = Number(repeatMatch[1]);
    if (repsPerSet > 0) return { sets: 1, repsPerSet, label: `${repsPerSet} repetitions` };
  }
  return null;
}

function hasConfidentPose(landmarks: Landmark[] | null, exercise?: ReturnType<typeof getTrackedPlanExercise>) {
  if (!landmarks) return false;
  const parts = exercise
    ? [...new Set(Object.values(exercise.joints).flat())]
    : GENERAL_VISIBLE_PARTS;
  const leftScore = parts.reduce((sum, part) => sum + (landmarks[LM[part].left]?.visibility ?? 0), 0);
  const rightScore = parts.reduce((sum, part) => sum + (landmarks[LM[part].right]?.visibility ?? 0), 0);
  const side = leftScore >= rightScore ? "left" : "right";
  return parts.every((part) => {
    const point = landmarks[LM[part][side]];
    return point && (point.visibility ?? 0) >= 0.6 && point.x >= 0 && point.x <= 1 && point.y >= 0 && point.y <= 1;
  });
}

function sourceInstructions(plan: TherapyPlan, instruction: TherapyPlanInstruction) {
  const page = plan.pages?.find((item) => item.pageNumber === instruction.pageNumber);
  return page?.text || instruction.supportingText;
}

export default function TherapyPlanSessionScreen() {
  const { instruction: selectedInstructionId, single, demo } = useLocalSearchParams<{ instruction?: string; single?: string; demo?: string }>();
  const singleExercise = single === "1";
  const demoMode = demo === "two-reps";
  const [plan, setPlan] = useState<TherapyPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [stage, setStage] = useState<SessionStage>("setup");
  const [cameraStatus, setCameraStatus] = useState<PoseCameraStatus>(Platform.OS === "web" ? "requesting-camera" : "error");
  const [cameraError, setCameraError] = useState<string | null>(
    Platform.OS === "web" ? null : "The existing camera motion tracker is available in a web browser only.",
  );
  const [personVisible, setPersonVisible] = useState(false);
  const [manualOnly, setManualOnly] = useState(Platform.OS !== "web");
  const [pauseReason, setPauseReason] = useState("");
  const [trackerState, setTrackerState] = useState<ExerciseState>(initialState);
  const [manualTargetText, setManualTargetText] = useState("");
  const [manualDosageText, setManualDosageText] = useState("");
  const [setsCompleted, setSetsCompleted] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [skippedCount, setSkippedCount] = useState(0);
  const [sourceExpanded, setSourceExpanded] = useState(false);
  const [voiceOn, setVoiceOn] = useState(false);

  const stageRef = useRef(stage);
  const trackerStateRef = useRef(trackerState);
  const setsCompletedRef = useRef(setsCompleted);
  const analyzerRef = useRef<Analyzer | null>(null);

  const updateStage = useCallback((nextStage: SessionStage) => {
    stageRef.current = nextStage;
    setStage(nextStage);
  }, []);

  useEffect(() => {
    let active = true;
    loadSavedTherapyPlan()
      .then((savedPlan) => {
        if (!active) return;
        if (!savedPlan || !savedPlan.instructions?.length) {
          router.replace("/therapy-plan/saved");
          return;
        }
        if (savedPlan.instructions.some((item) => !item.reviewed || !item.exercise.trim())) {
          setError("This plan has unconfirmed exercises. Review and confirm it before starting a session.");
          return;
        }
        const availableInstructions = demoMode ? savedPlan.instructions.filter(item => getTrackedPlanExercise(item.exercise)) : savedPlan.instructions;
        if (!availableInstructions.length) {
          setError("This plan has no exercises supported by the camera tracker yet.");
          return;
        }
        const selectedIndex = selectedInstructionId
          ? availableInstructions.findIndex(item => item.id === selectedInstructionId) : 0;
        if (selectedIndex < 0) {
          setError("This exercise is no longer in the saved plan. Return to the plan and choose again.");
          return;
        }
        setCurrentIndex(selectedIndex);
        setPlan(savedPlan);
      })
      .catch(() => {
        if (active) setError("The saved plan could not be loaded.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [selectedInstructionId, demoMode]);

  const sourceInstructionsList = plan?.instructions ?? [];
  const instructions = demoMode ? sourceInstructionsList.filter(item => getTrackedPlanExercise(item.exercise)) : sourceInstructionsList;
  const instruction = instructions[currentIndex];
  const trackedExercise = instruction ? getTrackedPlanExercise(instruction.exercise) : undefined;
  const trackingEnabled = Boolean(trackedExercise && !manualOnly && Platform.OS === "web");
  const planTarget = instruction ? getRepTarget(instruction.dosage) : null;
  const manualReps = /^\d+$/.test(manualTargetText.trim()) ? Number(manualTargetText) : Number.NaN;
  const manualTarget = Number.isFinite(manualReps) && manualReps > 0
    ? { sets: 1, repsPerSet: manualReps, label: `${manualReps} repetitions (entered for this session)` }
    : null;
  const activeTarget = trackingEnabled ? demoMode ? DEMO_TARGET : planTarget ?? manualTarget : null;
  const repsInCurrentSet = activeTarget
    ? Math.max(0, trackerState.reps - setsCompleted * activeTarget.repsPerSet)
    : trackerState.reps;

  const pauseForTracking = useCallback((reason: string) => {
    if (stageRef.current !== "running") return;
    updateStage("paused");
    setPauseReason(reason);
    const reps = trackerStateRef.current.reps;
    analyzerRef.current = trackedExercise ? createAnalyzer(trackedExercise, reps) : null;
    const resetState = { ...trackerStateRef.current, phase: "up" as const, cues: [], repFeedback: null };
    trackerStateRef.current = resetState;
    setTrackerState(resetState);
  }, [trackedExercise, updateStage]);

  const handlePoseFrame = useCallback((landmarks: Landmark[] | null, aspectRatio = 1) => {
    const visible = hasConfidentPose(landmarks, trackedExercise);
    setPersonVisible((current) => current === visible ? current : visible);

    if (!visible) {
      if (trackingEnabled) pauseForTracking("Tracking paused because the person is not clearly visible. Move back into frame to resume.");
      return;
    }
    if (stageRef.current !== "running" || !trackingEnabled || !trackedExercise || !landmarks) return;

    const corrected = landmarks.map(point => ({ ...point, x: point.x * aspectRatio }));
    const next = analyzerRef.current?.(corrected);
    if (!next) return;
    if (next.cues.includes("Make sure your whole body is in frame!")) {
      pauseForTracking("Tracking paused because landmark confidence is too low. Reposition so the required joints are visible.");
      return;
    }

    trackerStateRef.current = next;
    setTrackerState((current) =>
      current.reps === next.reps && current.phase === next.phase &&
      current.repFeedback === next.repFeedback && current.cues.join() === next.cues.join()
        ? current
        : next,
    );

    if (activeTarget) {
      const repsInSet = next.reps - setsCompletedRef.current * activeTarget.repsPerSet;
      if (repsInSet >= activeTarget.repsPerSet) {
        const done = setsCompletedRef.current + 1;
        setsCompletedRef.current = done;
        setSetsCompleted(done);
        const nextStage = done >= activeTarget.sets ? "exercise-complete" : "set-complete";
          updateStage(nextStage);
        setPauseReason("");
      }
    }
  }, [activeTarget, pauseForTracking, trackedExercise, trackingEnabled, updateStage]);

  const cameraStatusChanged = useCallback((status: PoseCameraStatus, message?: string) => {
    setCameraStatus(status);
    setCameraError(status === "error" ? message ?? "Camera or motion tracker could not start." : null);
  }, []);

  useSpokenFeedback(
    trackerState,
    voiceOn && stage === "running" && trackingEnabled && personVisible,
  );

  function startCurrentExercise() {
    if (!(demoMode && !trackingEnabled) && !manualOnly && !(cameraStatus === "ready" && personVisible)) return;
    analyzerRef.current = trackingEnabled && trackedExercise
      ? createAnalyzer(trackedExercise, trackerStateRef.current.reps)
      : null;
    setPauseReason("");
    updateStage("running");
  }

  function pauseSession() {
    if (stageRef.current !== "running") return;
    updateStage("paused");
    setPauseReason("Paused by you.");
    if (trackingEnabled && trackedExercise) {
      analyzerRef.current = createAnalyzer(trackedExercise, trackerStateRef.current.reps);
      const resetState = { ...trackerStateRef.current, phase: "up" as const, cues: [], repFeedback: null };
      trackerStateRef.current = resetState;
      setTrackerState(resetState);
    }
  }

  function resumeSession() {
    if (!(demoMode && !trackingEnabled) && !manualOnly && !personVisible) return;
    if (trackingEnabled && trackedExercise) {
      analyzerRef.current = createAnalyzer(trackedExercise, trackerStateRef.current.reps);
    }
    setPauseReason("");
    updateStage("running");
  }

  function startNextSet() {
    if (!personVisible && !manualOnly) return;
    if (trackingEnabled && trackedExercise) {
      analyzerRef.current = createAnalyzer(trackedExercise, trackerStateRef.current.reps);
    }
    updateStage("running");
  }

  function finishCurrentExercise(skipped = false) {
    if (skipped) setSkippedCount((count) => count + 1);
    else setCompletedCount((count) => count + 1);

    if (singleExercise || currentIndex + 1 >= instructions.length) {
      updateStage("complete");
      return;
    }
    const nextInstruction = instructions[currentIndex + 1];
    const nextTracker = getTrackedPlanExercise(nextInstruction.exercise);
    analyzerRef.current = nextTracker ? createAnalyzer(nextTracker) : null;
    trackerStateRef.current = initialState;
    setsCompletedRef.current = 0;
    setTrackerState(initialState);
    setSetsCompleted(0);
    setManualTargetText("");
    setManualDosageText("");
    setPersonVisible(false);
    setPauseReason("");
    setSourceExpanded(false);
    setCurrentIndex((index) => index + 1);
    updateStage("setup");
  }

  function stopSession() {
    updateStage("stopped");
    setPauseReason("Session stopped by you.");
  }

  const isTerminal = stage === "complete" || stage === "stopped";
  const cameraMessage = cameraStatus === "requesting-camera"
    ? "Requesting camera permission…"
    : cameraStatus === "preview-ready"
      ? "Camera preview ready; preparing the pose tracker…"
      : cameraStatus === "loading-tracker"
        ? "Loading the pose tracker…"
        : cameraStatus === "ready"
          ? personVisible
            ? "Person visible. Ready to begin."
            : "Camera ready. Move into frame with the required joints visible."
          : cameraError ?? "Preparing camera…";
  const cameraReadyToStart = (demoMode && !trackingEnabled) || manualOnly || (cameraStatus === "ready" && personVisible);
  const currentTargetLabel = activeTarget?.label ?? planTarget?.label ?? manualTarget?.label;
  const displayedDosage = instruction?.dosage.trim()
    ? instruction.dosage
    : manualDosageText.trim()
      ? `${manualDosageText.trim()} (session only; not saved)`
      : "Not specified in source";

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.headerTitle}>Guided session</Text>
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator color={colors.primary} /><Text style={styles.body}>Loading saved plan…</Text></View>
      ) : error || !plan || !instruction ? (
        <View style={styles.center}>
          <Text accessibilityRole="alert" style={styles.error}>{error ?? "No saved exercises are available for this session."}</Text>
          <Pressable onPress={() => router.replace("/therapy-plan/saved")} style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Return to saved plan</Text>
          </Pressable>
        </View>
      ) : isTerminal ? (
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.title}>{stage === "complete" ? "Session complete" : "Session stopped"}</Text>
          <Text style={styles.body}>{completedCount} completed · {skippedCount} skipped</Text>
          <Text style={styles.disclaimer}>Camera feedback has limits and does not guarantee safety. Stop if you feel pain or unwell.</Text>
          <Pressable onPress={() => router.replace("/therapy-plan/saved")} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Return to saved plan</Text>
          </Pressable>
        </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.progress}>{singleExercise ? "Selected exercise from your PDF" : `Exercise ${currentIndex + 1} of ${instructions.length}`}</Text>
          <Text style={styles.title}>{instruction.exercise}</Text>
          <PlanPicture instruction={instruction} />
          {!demoMode && displayedDosage !== "Not specified in source" && <Text style={styles.body}>Dosage: {displayedDosage}</Text>}
          {demoMode && <Text style={styles.meta}>Demo · 2 reps each · not prescribed</Text>}
          {trackedExercise && manualOnly ? (
            <Text style={styles.unsupported}>Manual-only mode. The supported tracker is off; repetitions and movement feedback are not counted.</Text>
          ) : !trackedExercise ? (
            <Text style={styles.unsupported}>Camera counting unavailable for this exercise.</Text>
          ) : null}
          {trackedExercise && !manualOnly && <Text style={styles.body}>{cameraSetupCue(trackedExercise.id, trackedExercise.instructions)}</Text>}
          <Text style={styles.disclaimer}>
            Follow your therapist’s plan. Stop if you feel pain or unwell. Camera feedback is an estimate.
          </Text>

          <View style={styles.cameraPanel}>
            {Platform.OS === "web" && !manualOnly ? (
              <View style={styles.cameraPreview}>
                <PoseCamera onPoseFrame={handlePoseFrame} onStatusChange={cameraStatusChanged} />
              </View>
            ) : (
              <View style={styles.cameraUnavailable}>
                <Text style={styles.cameraStatusText}>
                  {manualOnly
                    ? "Manual-only session. Camera tracking and movement feedback are off."
                    : "Camera motion tracking is available in a web browser only in this app version."}
                </Text>
                {!manualOnly ? (
                  <Pressable onPress={() => setManualOnly(true)} style={styles.secondaryButton}>
                    <Text style={styles.secondaryButtonText}>Continue manually without camera</Text>
                  </Pressable>
                ) : null}
              </View>
            )}
            {Platform.OS === "web" && !manualOnly ? (
              <View style={styles.cameraStatus}>
                {cameraStatus === "requesting-camera" || cameraStatus === "loading-tracker"
                  ? <ActivityIndicator size="small" color={colors.primary} />
                  : null}
                <Text style={cameraStatus === "error" ? styles.error : personVisible ? styles.supported : styles.cameraStatusText}>
                  {cameraMessage}
                </Text>
              </View>
            ) : null}
          </View>

          {trackedExercise && !planTarget && !demoMode && stage === "setup" ? (
            <View style={styles.targetEntry}>
              <Text style={styles.fieldLabel}>Therapist-provided repetition target (optional)</Text>
              <TextInput
                value={manualTargetText}
                onChangeText={setManualTargetText}
                keyboardType="number-pad"
                maxLength={3}
                accessibilityLabel="Therapist-provided repetition target"
                placeholder="Leave blank for an untargeted session"
                style={styles.targetInput}
              />
              <Text style={styles.meta}>This session-only value is not added to your saved therapy plan.</Text>
            </View>
          ) : null}
          {!trackedExercise && !demoMode && !instruction.dosage.trim() && stage === "setup" ? (
            <View style={styles.targetEntry}>
              <Text style={styles.fieldLabel}>Therapist-provided dosage for this manual step (optional)</Text>
              <TextInput
                value={manualDosageText}
                onChangeText={setManualDosageText}
                accessibilityLabel="Therapist-provided manual dosage"
                placeholder="Enter only values from your therapist"
                style={styles.targetInput}
                multiline
              />
              <Text style={styles.meta}>This session-only note is not added to your saved therapy plan.</Text>
            </View>
          ) : null}

          {trackingEnabled && ["setup", "running", "paused", "set-complete", "exercise-complete"].includes(stage) ? (
            <View style={styles.counter}>
              <Text style={styles.repCount}>{trackerState.reps}</Text>
              <Text style={styles.body}>
                {activeTarget
                  ? `Set ${Math.min(setsCompleted + 1, activeTarget.sets)} of ${activeTarget.sets} · ${repsInCurrentSet} of ${activeTarget.repsPerSet} reps`
                  : "Repetitions counted · no target set"}
              </Text>
              {trackerState.cues[0] ? <Text style={styles.error}>{trackerState.cues[0]}</Text> : null}
              {trackerState.repFeedback ? <Text style={styles.feedback}>{trackerState.repFeedback}</Text> : null}
              <Pressable onPress={() => setVoiceOn((enabled) => !enabled)} style={styles.secondaryButton}>
                <Text style={styles.secondaryButtonText}>Voice feedback: {voiceOn ? "On" : "Off"}</Text>
              </Pressable>
            </View>
          ) : null}

          {demoMode && !trackedExercise && <Text style={styles.warning}>Automatic counting is unavailable for this movement. Skip it to continue to a supported exercise.</Text>}
          {stage === "paused" ? <Text style={styles.warning}>{pauseReason || "Paused."}</Text> : null}
          {stage === "set-complete" ? (
            <Text style={styles.body}>Set complete. Rest according to your therapist’s plan before continuing.</Text>
          ) : null}
          {stage === "exercise-complete" ? (
            <Text style={styles.supported}>Target reached. The counter is an estimate; verify your movement yourself.</Text>
          ) : null}

          <View style={styles.sourceSection}>
            <Pressable onPress={() => setSourceExpanded((expanded) => !expanded)} style={styles.sourceToggle}>
              <Text style={styles.sourceToggleText}>
                {sourceExpanded ? "Hide source instructions" : `Show source instructions${instruction.pageNumber ? ` · page ${instruction.pageNumber}` : ""}`}
              </Text>
            </Pressable>
            {sourceExpanded ? (
              <ScrollView style={styles.sourcePreview} nestedScrollEnabled>
                <Text selectable style={styles.sourceText}>{sourceInstructions(plan, instruction)}</Text>
              </ScrollView>
            ) : null}
          </View>

          <View style={styles.controls}>
            {stage === "setup" ? (
              <Pressable
                onPress={startCurrentExercise}
                disabled={!cameraReadyToStart || (demoMode && !trackingEnabled)}
                accessibilityRole="button"
                style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed, (!cameraReadyToStart || (demoMode && !trackingEnabled)) && styles.disabled]}
              >
                <Text style={styles.primaryButtonText}>
                  {trackingEnabled
                    ? currentTargetLabel ? `Start · ${currentTargetLabel}` : "Start untargeted exercise"
                    : "Start manual exercise"}
                </Text>
              </Pressable>
            ) : null}
            {Platform.OS === "web" && !manualOnly && !demoMode && stage === "setup" ? (
              <Pressable onPress={() => setManualOnly(true)} style={styles.secondaryButton} accessibilityRole="button">
                <Text style={styles.secondaryButtonText}>Continue manually without camera</Text>
              </Pressable>
            ) : null}
            {stage === "running" ? (
              <Pressable onPress={pauseSession} style={styles.secondaryButton} accessibilityRole="button">
                <Text style={styles.secondaryButtonText}>Pause</Text>
              </Pressable>
            ) : null}
            {stage === "paused" ? (
              <Pressable
                onPress={resumeSession}
                disabled={!cameraReadyToStart || (demoMode && !trackingEnabled)}
                style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed, (!cameraReadyToStart || (demoMode && !trackingEnabled)) && styles.disabled]}
                accessibilityRole="button"
              >
                <Text style={styles.primaryButtonText}>Resume</Text>
              </Pressable>
            ) : null}
            {stage === "set-complete" ? (
              <Pressable onPress={startNextSet} disabled={!cameraReadyToStart || (demoMode && !trackingEnabled)} style={styles.primaryButton} accessibilityRole="button">
                <Text style={styles.primaryButtonText}>Start next set</Text>
              </Pressable>
            ) : null}
            {stage === "exercise-complete" ? (
              <Pressable onPress={() => finishCurrentExercise(false)} style={styles.primaryButton} accessibilityRole="button">
                <Text style={styles.primaryButtonText}>{singleExercise || currentIndex + 1 === instructions.length ? "Finish session" : "Next exercise"}</Text>
              </Pressable>
            ) : null}
            {stage === "running" && !demoMode && (!trackingEnabled || !activeTarget) ? (
              <Pressable onPress={() => finishCurrentExercise(false)} style={styles.secondaryButton} accessibilityRole="button">
                <Text style={styles.secondaryButtonText}>Mark exercise complete</Text>
              </Pressable>
            ) : null}
            {stage !== "exercise-complete" ? (
              <Pressable onPress={() => finishCurrentExercise(true)} style={styles.secondaryButton} accessibilityRole="button">
                <Text style={styles.secondaryButtonText}>Skip exercise</Text>
              </Pressable>
            ) : null}
            <Pressable onPress={stopSession} style={styles.stopButton} accessibilityRole="button">
              <Text style={styles.stopButtonText}>Stop session</Text>
            </Pressable>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: spacing.md, paddingVertical: spacing.sm, gap: spacing.sm },
  headerTitle: { flex: 1, fontSize: 20, fontWeight: "700", color: colors.text },
  content: { padding: spacing.md, gap: spacing.md },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.lg, gap: spacing.md },
  progress: { color: colors.primary, fontSize: 14, fontWeight: "700" },
  title: { color: colors.text, fontSize: 24, fontWeight: "700" },
  body: { color: colors.muted, fontSize: 15, lineHeight: 22 },
  meta: { color: colors.muted, fontSize: 13, lineHeight: 19 },
  supported: { color: colors.primary, fontSize: 15, fontWeight: "700", lineHeight: 21 },
  unsupported: { color: colors.warning, fontSize: 15, fontWeight: "700", lineHeight: 21 },
  disclaimer: { color: colors.muted, fontSize: 13, lineHeight: 19 },
  cameraPanel: { gap: spacing.sm },
  cameraPreview: { height: 360, position: "relative", overflow: "hidden", borderRadius: 8, backgroundColor: colors.black },
  cameraUnavailable: { minHeight: 140, justifyContent: "center", padding: spacing.md, gap: spacing.sm, borderRadius: 8, backgroundColor: colors.surfaceAlt },
  cameraStatus: { minHeight: 32, flexDirection: "row", alignItems: "center", gap: spacing.sm, flexWrap: "wrap" },
  cameraStatusText: { color: colors.muted, fontSize: 14, lineHeight: 20 },
  targetEntry: { gap: spacing.xs },
  fieldLabel: { color: colors.text, fontSize: 14, fontWeight: "700" },
  targetInput: { minHeight: 46, paddingHorizontal: spacing.md, borderWidth: 1, borderColor: colors.border, borderRadius: 6, backgroundColor: colors.panel, color: colors.text, fontSize: 16 },
  counter: { alignItems: "center", gap: spacing.xs, padding: spacing.md, borderRadius: 6, backgroundColor: colors.panel, borderWidth: 1, borderColor: colors.border },
  repCount: { color: colors.text, fontSize: 40, fontWeight: "800" },
  feedback: { color: colors.primary, fontSize: 17, fontWeight: "700" },
  warning: { color: colors.warning, fontSize: 15, fontWeight: "700", lineHeight: 21 },
  sourceSection: { gap: spacing.xs },
  sourceToggle: { minHeight: 42, justifyContent: "center" },
  sourceToggleText: { color: colors.primary, fontSize: 14, fontWeight: "700" },
  sourcePreview: { maxHeight: 180, padding: spacing.md, borderWidth: 1, borderColor: colors.border, borderRadius: 6, backgroundColor: colors.panel },
  sourceText: { color: colors.text, fontSize: 14, lineHeight: 20 },
  controls: { gap: spacing.sm },
  primaryButton: { minHeight: 48, justifyContent: "center", alignItems: "center", paddingHorizontal: spacing.lg, borderRadius: 8, backgroundColor: colors.primary },
  primaryButtonText: { color: colors.primaryText, fontSize: 16, fontWeight: "700", textAlign: "center" },
  secondaryButton: { minHeight: 44, justifyContent: "center", alignItems: "center", paddingHorizontal: spacing.md, borderRadius: 8, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.panel },
  secondaryButtonText: { color: colors.primary, fontSize: 15, fontWeight: "700", textAlign: "center" },
  stopButton: { minHeight: 44, justifyContent: "center", alignItems: "center", paddingHorizontal: spacing.md },
  stopButtonText: { color: colors.warning, fontSize: 15, fontWeight: "700" },
  pressed: { opacity: 0.8 },
  disabled: { opacity: 0.5 },
  error: { color: colors.warning, fontSize: 15, lineHeight: 21 },
});
