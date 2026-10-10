import { PlanPicture } from "@/components/pose/PlanPicture";
import { BackButton } from "@/components/Back_Button";
import { colors, spacing } from "@/constants/theme";
import {
    loadTherapyPlanDraft,
    saveTherapyPlanDraft,
    type TherapyPlanDraft,
    type TherapyPlanInstruction,
} from "@/data/therapyPlan";
import {
    createManualInstruction,
    extractInstructionCandidates,
    extractPdfInstructionCandidates,
} from "@/lib/therapyPlanInstructions";
import { router, Stack } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const DEMO_SAMPLE_DOSAGES: Record<string, string> = {
  "ankle pumps": "10 repetitions",
  "gluteal sets": "10 repetitions; hold for 5 seconds",
  "quad sets": "10 repetitions; hold for 5 seconds",
  "terminal knee extension": "10 repetitions",
  "hip abduction, back lying": "8 repetitions per side",
  "straight leg raise": "8 repetitions",
  "heel slides": "10 repetitions",
  "lower trunk rotation": "8 repetitions per side",
  bridging: "8 repetitions",
  "sitting knee extension": "10 repetitions per leg",
  "hip flexion": "8 repetitions per side",
  "hip abduction": "8 repetitions per side",
  "plantar flexion - toe raises": "10 repetitions",
  "quadriceps - squats": "8 repetitions",
  "hamstring flexion": "8 repetitions per leg",
  "shoulder flexion": "8 repetitions",
  "shoulder abduction": "8 repetitions",
  "chest press outs": "8 repetitions",
  "elbow flexion": "10 repetitions per arm",
  "finger flexion": "10 repetitions",
  "wrist extension": "10 repetitions per wrist",
  "sit to stand": "5 repetitions",
  "scapular retraction": "8 repetitions; hold for 3 seconds",
};

export default function TherapyPlanReviewScreen() {
  const [draft, setDraft] = useState<TherapyPlanDraft | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDemoSamples, setShowDemoSamples] = useState(false);

  useEffect(() => {
    let active = true;
    loadTherapyPlanDraft()
      .then((savedDraft) => {
        if (!active) return;
        if (!savedDraft) {
          router.replace("/therapy-plan");
          return;
        }
        const sourceType = savedDraft.sourceType ?? (/\.pdf$/i.test(savedDraft.fileName) ? "pdf" : "text");
        const pages = savedDraft.pages ?? [];
        setDraft({
          ...savedDraft,
          pages,
          instructions: savedDraft.instructions ?? (sourceType === "pdf"
            ? extractPdfInstructionCandidates(pages)
            : extractInstructionCandidates([{ pageNumber: null, text: savedDraft.content }])),
          sourceType,
        });
      })
      .catch(() => {
        if (active) setError("The uploaded plan could not be loaded.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  async function continueToConfirmation() {
    const instructions = draft?.instructions ?? [];
    if (!draft?.title.trim() || instructions.length === 0) {
      setError("Add at least one exercise before continuing.");
      return;
    }
    if (instructions.some((instruction) => !instruction.exercise.trim())) {
      setError("Add an exercise name or remove each incomplete row before continuing.");
      return;
    }
    if (instructions.some((instruction) => !instruction.reviewed)) {
      setError("Mark every exercise and dosage as reviewed before continuing.");
      return;
    }

    setError(null);
    try {
      await saveTherapyPlanDraft({ ...draft, title: draft.title.trim() });
      router.push("/therapy-plan/confirm");
    } catch {
      setError("The reviewed plan could not be saved. Please try again.");
    }
  }

  function updateInstruction(id: string, changes: Partial<TherapyPlanInstruction>) {
    setDraft((current) => current ? {
      ...current,
      instructions: (current.instructions ?? []).map((instruction) =>
        instruction.id === id
          ? {
              ...instruction,
              ...changes,
              reviewed: "exercise" in changes || "dosage" in changes
                ? false
                : changes.reviewed ?? instruction.reviewed,
            }
          : instruction,
      ),
    } : current);
  }

  function addManualInstruction() {
    setDraft((current) => current ? {
      ...current,
      instructions: [
        ...(current.instructions ?? []),
        createManualInstruction(`manual-${Date.now()}`),
      ],
    } : current);
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.headerTitle}>Review plan</Text>
      </View>

      {loading ? (
        <Text style={styles.body}>Loading plan...</Text>
      ) : draft ? (
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.fileName}>{draft.fileName}</Text>
          <Text style={styles.label}>Plan name</Text>
          <TextInput
            value={draft.title}
            onChangeText={(title) => setDraft((current) => current ? { ...current, title } : current)}
            style={styles.titleInput}
            accessibilityLabel="Plan name"
            maxLength={100}
          />
          {draft.sourceType === "pdf" ? (
            <View style={styles.sourceBlock}>
              <Text style={styles.label}>Extracted text by page</Text>
              <ScrollView
                style={styles.sourcePreview}
                contentContainerStyle={styles.sourcePreviewContent}
                nestedScrollEnabled
                showsVerticalScrollIndicator
                accessibilityLabel="Scrollable extracted PDF text"
              >
                <Text selectable style={styles.sourceText}>{draft.content}</Text>
              </ScrollView>
            </View>
          ) : (
            <>
              <Text style={styles.label}>Plan text</Text>
              <TextInput
                value={draft.content}
                onChangeText={(content) => setDraft((current) => current ? { ...current, content } : current)}
                style={styles.contentInput}
                accessibilityLabel="Plan text"
                multiline
                textAlignVertical="top"
              />
            </>
          )}

          <Text style={styles.sectionTitle}>Exercises and dosage</Text>
          <Text style={styles.body}>
            Check each exercise against its source. Enter only dosage supplied by your therapist; imported values are never replaced by examples.
          </Text>
          {(draft.instructions ?? []).some((instruction) =>
            !instruction.dosage.trim() && DEMO_SAMPLE_DOSAGES[instruction.exercise],
          ) ? (
            <View style={styles.demoSection}>
              <Pressable
                onPress={() => setShowDemoSamples((visible) => !visible)}
                accessibilityRole="button"
                accessibilityState={{ expanded: showDemoSamples }}
                style={({ pressed }) => [styles.demoButton, pressed && styles.pressed]}
              >
                <Text style={styles.demoButtonText}>
                  {showDemoSamples ? "Hide demo-only sample dosages" : "Show demo-only sample dosages"}
                </Text>
              </Pressable>
              <Text style={styles.demoNote}>
                Examples only. They are not prescribed, do not change imported data, and are never saved.
              </Text>
            </View>
          ) : null}
          {(draft.instructions ?? []).map((instruction, index) => {
            const warnings = [
              !instruction.exercise.trim() ? "Exercise name missing." : null,
              !instruction.dosage.trim()
                ? "Dosage is not specified in the source; confirm it rather than guessing."
                : null,
              instruction.ambiguousExerciseName
                ? "This exercise label appears more than once on the page. Verify which movement it describes."
                : null,
              instruction.ambiguousNumbers
                ? "Numbers in this source line need interpretation; verify the dosage manually."
                : null,
            ].filter((warning): warning is string => warning !== null);

            return (
              <View key={instruction.id} style={styles.instruction}>
                <View style={styles.instructionHeading}>
                  <Text style={styles.label}>Exercise {index + 1}</Text>
                  {instruction.pageNumber ? (
                    <Text style={styles.pageLabel}>Page {instruction.pageNumber}</Text>
                  ) : null}
                </View>
                <PlanPicture instruction={instruction} />
                <Text style={styles.sourceLabel}>Supporting text</Text>
                <Text selectable style={styles.supportingText}>{instruction.supportingText}</Text>
                <Text style={styles.fieldLabel}>Exercise name</Text>
                <TextInput
                  value={instruction.exercise}
                  onChangeText={(exercise) => updateInstruction(instruction.id, { exercise })}
                  style={styles.titleInput}
                  accessibilityLabel={`Exercise ${index + 1} name`}
                  placeholder="Enter exercise name"
                />
                <Text style={styles.fieldLabel}>Dosage</Text>
                <TextInput
                  value={instruction.dosage}
                  onChangeText={(dosage) => updateInstruction(instruction.id, { dosage })}
                  style={styles.titleInput}
                  accessibilityLabel={`Exercise ${index + 1} dosage`}
                  placeholder="Sets, reps, time, or distance"
                />
                {showDemoSamples && !instruction.dosage.trim() && DEMO_SAMPLE_DOSAGES[instruction.exercise] ? (
                  <Text style={styles.demoSample}>
                    Sample— not prescribed: {DEMO_SAMPLE_DOSAGES[instruction.exercise]}
                  </Text>
                ) : null}
                {warnings.map((warning) => (
                  <Text key={warning} style={styles.warning}>{warning}</Text>
                ))}
                <View style={styles.instructionActions}>
                  <Pressable
                    onPress={() => updateInstruction(instruction.id, { reviewed: true })}
                    disabled={!instruction.exercise.trim() || instruction.reviewed}
                    accessibilityRole="button"
                    accessibilityLabel={`Mark exercise ${index + 1} as reviewed`}
                    style={({ pressed }) => [
                      styles.reviewButton,
                      instruction.reviewed && styles.reviewedButton,
                      pressed && styles.pressed,
                      (!instruction.exercise.trim() || instruction.reviewed) && styles.disabled,
                    ]}
                  >
                    <Text style={styles.reviewButtonText}>
                      {instruction.reviewed
                        ? "Reviewed"
                        : instruction.dosage.trim()
                          ? "Mark reviewed"
                          : "Confirm dosage not specified"}
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => setDraft((current) => current ? {
                      ...current,
                      instructions: (current.instructions ?? []).filter((entry) => entry.id !== instruction.id),
                    } : current)}
                    accessibilityRole="button"
                    accessibilityLabel={`Remove exercise ${index + 1}`}
                    style={styles.removeButton}
                  >
                    <Text style={styles.removeButtonText}>Remove</Text>
                  </Pressable>
                </View>
              </View>
            );
          })}

          <Pressable
            onPress={addManualInstruction}
            accessibilityRole="button"
            style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}
          >
            <Text style={styles.addButtonText}>Add exercise manually</Text>
          </Pressable>
          {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
          <Pressable
            onPress={continueToConfirmation}
            accessibilityRole="button"
            style={({ pressed }) => [styles.continueButton, pressed && styles.pressed]}
          >
            <Text style={styles.continueButtonText}>Continue to confirmation</Text>
          </Pressable>
        </ScrollView>
      ) : (
        <Text accessibilityRole="alert" style={styles.error}>{error ?? "No plan is ready to review."}</Text>
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
  content: { padding: spacing.md, gap: spacing.sm },
  sectionTitle: { marginTop: spacing.md, fontSize: 20, fontWeight: "700", color: colors.text },
  demoSection: { gap: spacing.xs, alignItems: "flex-start" },
  demoButton: { minHeight: 40, justifyContent: "center", paddingHorizontal: spacing.md, borderWidth: 1, borderColor: colors.primary, borderRadius: 6 },
  demoButtonText: { color: colors.primary, fontSize: 14, fontWeight: "700" },
  demoNote: { color: colors.muted, fontSize: 13, lineHeight: 18 },
  demoSample: { color: colors.muted, fontSize: 14, fontStyle: "italic", lineHeight: 20 },
  fileName: { color: colors.muted, fontSize: 14 },
  label: { marginTop: spacing.sm, color: colors.text, fontSize: 14, fontWeight: "700" },
  fieldLabel: { marginTop: spacing.xs, color: colors.text, fontSize: 13, fontWeight: "600" },
  sourceLabel: { color: colors.muted, fontSize: 12, fontWeight: "700" },
  pageLabel: { color: colors.primary, fontSize: 13, fontWeight: "700" },
  instructionHeading: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  instruction: {
    padding: spacing.md,
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    backgroundColor: colors.surfaceAlt,
  },
  sourceBlock: { width: "100%", minWidth: 0, flexShrink: 1, gap: spacing.xs },
  sourcePreview: {
    width: "100%",
    height: 220,
    flexGrow: 0,
    flexShrink: 0,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    backgroundColor: colors.panel,
  },
  sourcePreviewContent: { padding: spacing.md },
  sourceText: {
    width: "100%",
    flexShrink: 1,
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
  },
  supportingText: { color: colors.muted, fontSize: 14, lineHeight: 20 },
  titleInput: {
    minHeight: 48,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    backgroundColor: colors.panel,
    color: colors.text,
    fontSize: 16,
  },
  contentInput: {
    minHeight: 240,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    backgroundColor: colors.panel,
    color: colors.text,
    fontSize: 15,
    lineHeight: 22,
  },
  warning: { color: colors.warning, fontSize: 13, lineHeight: 18 },
  instructionActions: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginTop: spacing.xs },
  reviewButton: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderRadius: 6, backgroundColor: colors.primary },
  reviewedButton: { backgroundColor: colors.text },
  reviewButtonText: { color: colors.primaryText, fontSize: 14, fontWeight: "700" },
  removeButton: { padding: spacing.sm },
  removeButtonText: { color: colors.warning, fontSize: 14, fontWeight: "600" },
  addButton: { minHeight: 44, justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: colors.primary, borderRadius: 6 },
  addButtonText: { color: colors.primary, fontWeight: "700" },
  continueButton: { minHeight: 48, justifyContent: "center", alignItems: "center", paddingHorizontal: spacing.lg, borderRadius: 8, backgroundColor: colors.primary },
  continueButtonText: { color: colors.primaryText, fontSize: 16, fontWeight: "700" },
  pressed: { opacity: 0.8 },
  disabled: { opacity: 0.5 },
  body: { padding: spacing.md, color: colors.muted, fontSize: 16 },
  error: { color: colors.warning, fontSize: 15 },
});