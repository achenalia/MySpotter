import { BackButton } from "@/components/Back_Button";
import { Button } from "@/components/Button";
import { colors, spacing } from "@/constants/theme";
import {
    confirmTherapyPlan,
    loadSavedTherapyPlan,
    loadTherapyPlanDraft,
    type TherapyPlanDraft,
} from "@/data/therapyPlan";
import { router, Stack } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TherapyPlanConfirmScreen() {
  const [draft, setDraft] = useState<TherapyPlanDraft | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [replacingPlan, setReplacingPlan] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    Promise.all([loadTherapyPlanDraft(), loadSavedTherapyPlan()])
      .then(([savedDraft, savedPlan]) => {
        if (!active) return;
        if (!savedDraft) {
          router.replace("/therapy-plan");
          return;
        }
        setDraft(savedDraft);
        setReplacingPlan(savedPlan !== null);
      })
      .catch(() => {
        if (active) setError("The plan could not be loaded for confirmation.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  async function savePlan() {
    if (!draft || saving) return;
    setSaving(true);
    setError(null);
    try {
      await confirmTherapyPlan(draft);
      router.replace("/therapy-plan/saved");
    } catch {
      setError("The plan could not be saved. Please try again.");
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.headerTitle}>Confirm plan</Text>
      </View>

      {loading ? (
        <Text style={styles.body}>Loading plan...</Text>
      ) : draft ? (
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.title}>{draft.title}</Text>
          <Text style={styles.body}>File: {draft.fileName}</Text>
          <Text style={styles.label}>Reviewed exercises and dosage</Text>
          {(draft.instructions ?? []).map((instruction, index) => (
            <View key={instruction.id} style={styles.instruction}>
              <Text style={styles.instructionTitle}>{index + 1}. {instruction.exercise}</Text>
              <Text style={styles.body}>
                Dosage: {instruction.dosage.trim() || "Not specified in source"}
              </Text>
              {instruction.pageNumber ? <Text style={styles.page}>Source page: {instruction.pageNumber}</Text> : null}
              <Text style={styles.sourceLabel}>Supporting text</Text>
              <Text selectable style={styles.sourceText}>{instruction.supportingText}</Text>
            </View>
          ))}
          {replacingPlan ? (
            <Text style={styles.body}>Confirming will replace the plan currently saved on this device.</Text>
          ) : null}
          <Text style={styles.body}>Confirm to save this plan on this device.</Text>
          {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
          <Button title={saving ? "Saving..." : "Confirm and save"} onPress={savePlan} />
        </ScrollView>
      ) : (
        <Text accessibilityRole="alert" style={styles.error}>{error ?? "No plan is ready to confirm."}</Text>
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
  body: { color: colors.muted, fontSize: 15, lineHeight: 22 },
  label: { color: colors.text, fontSize: 14, fontWeight: "700" },
  instruction: { padding: spacing.md, gap: spacing.xs, borderWidth: 1, borderColor: colors.border, borderRadius: 6, backgroundColor: colors.panel },
  instructionTitle: { color: colors.text, fontSize: 16, fontWeight: "700" },
  page: { color: colors.primary, fontSize: 13, fontWeight: "700" },
  sourceLabel: { marginTop: spacing.xs, color: colors.muted, fontSize: 12, fontWeight: "700" },
  sourceText: { color: colors.text, fontSize: 14, lineHeight: 20 },
  error: { color: colors.warning, fontSize: 15 },
});