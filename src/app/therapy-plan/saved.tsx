import { getTrackedPlanExercise } from "@/components/pose/exercises";
import { PlanPicture } from "@/components/pose/PlanPicture";
import { BackButton } from "@/components/Back_Button";
import { colors, spacing } from "@/constants/theme";
import { attachSavedPlanPictures, loadSavedTherapyPlan, type TherapyPlan } from "@/data/therapyPlan";
import * as DocumentPicker from "expo-document-picker";
import { extractTherapyPlanFile } from "../../lib/therapyPlanText";
import { router, Stack } from "expo-router";
import { useEffect, useState } from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SavedTherapyPlanScreen() {
  const [plan, setPlan] = useState<TherapyPlan | null>(null);
  const [addingPictures, setAddingPictures] = useState(false);
  const [pictureProgress, setPictureProgress] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    loadSavedTherapyPlan()
      .then((savedPlan) => {
        if (!active) return;
        if (!savedPlan) {
          router.replace("/therapy-plan");
          return;
        }
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
  }, []);

  async function addPdfPictures() {
    if (addingPictures) return;
    setError(null);
    setAddingPictures(true);
    try {
      const selected = await DocumentPicker.getDocumentAsync({ type: "application/pdf", multiple: false, copyToCacheDirectory: true });
      if (selected.canceled) return;
      const extracted = await extractTherapyPlanFile(selected.assets[0], { onProgress: progress => setPictureProgress(progress.message) });
      const updated = await attachSavedPlanPictures(extracted.pages, extracted.instructions, extracted.content);
      setPlan(updated);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "PDF pictures could not be added. Try again.");
    } finally { setAddingPictures(false); setPictureProgress(""); }
  }

  const trackedInstructions = (plan?.instructions ?? []).filter(item => getTrackedPlanExercise(item.exercise));
  const startTrackedExercise = (instructionId: string) => router.push({
    pathname: "/therapy-plan/session",
    params: { instruction: instructionId, single: "1" },
  });

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.headerTitle}>Saved therapy plan</Text>
      </View>

      {loading ? (
        <Text style={styles.body}>Loading saved plan...</Text>
      ) : plan ? (
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.title}>{plan.title}</Text>
          <Text style={styles.meta}>From {plan.fileName}</Text>
          {Platform.OS === "web" && plan.sourceType === "pdf" && (
            <Pressable accessibilityRole="button" disabled={addingPictures} onPress={addPdfPictures} style={[styles.uploadButton, addingPictures && styles.pressed]}>
              <Text style={styles.uploadButtonText}>{addingPictures ? pictureProgress || "Choose your original PDF…" : "Add pictures from original PDF"}</Text>
            </Pressable>
          )}
          {error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
          <Pressable accessibilityRole="button" onPress={() => router.push({ pathname: "/therapy-plan/session", params: { demo: "two-reps" } })} style={styles.startButton}>
            <Text style={styles.startButtonText}>Start camera demo - 2 reps each</Text>
          </Pressable>
          <Text style={styles.meta}>Demo targets only. Camera counts supported movements; skip unsupported ones. Saved dosage stays unchanged.</Text>
          <Text style={styles.meta}>Saved {new Date(plan.savedAt).toLocaleString()}</Text>
          <Text style={styles.instructionTitle}>{trackedInstructions.length} camera-supported exercise{trackedInstructions.length === 1 ? "" : "s"} in this plan</Text>
          {trackedInstructions.length > 0 && (
            <Pressable accessibilityRole="button" onPress={() => startTrackedExercise(trackedInstructions[0].id)} style={styles.startButton}>
              <Text style={styles.startButtonText}>Start counting from this PDF</Text>
            </Pressable>
          )}
          <Text style={styles.meta}>Choose a supported exercise below for counting and movement feedback. Other exercises remain manual.</Text>
          {(plan.instructions ?? []).map((instruction, index) => (
            <View key={instruction.id} style={styles.instruction}>
              <Text style={styles.instructionTitle}>{index + 1}. {instruction.exercise}</Text>
              <PlanPicture instruction={instruction} />
              <Text style={styles.meta}>
                Dosage: {instruction.dosage.trim() || "Not specified in source"}
              </Text>
              {instruction.pageNumber ? <Text style={styles.page}>Source page: {instruction.pageNumber}</Text> : null}
              <Text style={styles.sourceLabel}>Supporting text</Text>
              <Text selectable style={styles.sourceText}>{instruction.supportingText}</Text>
              <Text style={styles.page}>{getTrackedPlanExercise(instruction.exercise) ? "Camera counting and movement feedback available" : "Manual exercise - camera counting unavailable"}</Text>
              {getTrackedPlanExercise(instruction.exercise) && (
                <Pressable accessibilityRole="button" onPress={() => startTrackedExercise(instruction.id)} style={styles.startButton}>
                  <Text style={styles.startButtonText}>Start counting this exercise</Text>
                </Pressable>
              )}
            </View>
          ))}
          <Pressable
            onPress={() => router.push("/therapy-plan/session")}
            accessibilityRole="button"
            style={({ pressed }) => [styles.startButton, pressed && styles.pressed]}
          >
            <Text style={styles.startButtonText}>Start guided session</Text>
          </Pressable>
          <Pressable
            onPress={() => router.push("/therapy-plan")}
            accessibilityRole="button"
            style={({ pressed }) => [styles.uploadButton, pressed && styles.pressed]}
          >
            <Text style={styles.uploadButtonText}>Upload another plan</Text>
          </Pressable>
        </ScrollView>
      ) : (
        <Text accessibilityRole="alert" style={styles.error}>{error ?? "No saved plan was found."}</Text>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  headerTitle: { flex: 1, fontSize: 20, fontWeight: "700", color: colors.text },
  content: { padding: spacing.md, gap: spacing.md },
  title: { color: colors.text, fontSize: 24, fontWeight: "700" },
  meta: { color: colors.muted, fontSize: 14 },
  instruction: { padding: spacing.md, gap: spacing.xs, borderWidth: 1, borderColor: colors.border, borderRadius: 6, backgroundColor: colors.panel },
  instructionTitle: { color: colors.text, fontSize: 16, fontWeight: "700" },
  page: { color: colors.primary, fontSize: 13, fontWeight: "700" },
  sourceLabel: { marginTop: spacing.xs, color: colors.muted, fontSize: 12, fontWeight: "700" },
  sourceText: { color: colors.text, fontSize: 14, lineHeight: 20 },
  uploadButton: {
    minHeight: 48,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
    backgroundColor: colors.primary,
  },
  uploadButtonText: { color: colors.primaryText, fontSize: 16, fontWeight: "700" },
  startButton: {
    minHeight: 48,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
    backgroundColor: colors.primary,
  },
  startButtonText: { color: colors.primaryText, fontSize: 16, fontWeight: "700" },
  pressed: { opacity: 0.8 },
  body: { padding: spacing.md, color: colors.muted, fontSize: 16 },
  error: { padding: spacing.md, color: colors.warning, fontSize: 15 },
});