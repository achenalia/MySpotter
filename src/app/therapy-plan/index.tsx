import { BackButton } from "@/components/Back_Button";
import { colors, spacing } from "@/constants/theme";
import { loadSavedTherapyPlan, saveTherapyPlanDraft } from "@/data/therapyPlan";
import type { ExtractionProgress } from "@/lib/therapyPlanText.types";
import * as DocumentPicker from "expo-document-picker";
import { router, Stack } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { extractTherapyPlanFile } from "../../lib/therapyPlanText";

const TEXT_FILE_TYPES = ["text/plain", "text/markdown", "text/csv"];
const GENERIC_IMPORT_ERROR = "The file could not be opened or read. Choose another file or enter the plan manually.";

function getImportErrorMessage(error: unknown) {
  if (!(error instanceof Error)) return GENERIC_IMPORT_ERROR;
  if (error.name === "NotAllowedError" || error.name === "SecurityError") {
    return "The browser blocked access to this file. Check its permissions and try again.";
  }
  if (/worker|pdfjs|wasm/i.test(error.message)) {
    return "This file could not be processed in this browser. Try a TXT file or enter the plan manually.";
  }
  return error.message.trim() || GENERIC_IMPORT_ERROR;
}

export default function TherapyPlanUploadScreen() {
  const [isChoosing, setIsChoosing] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [progress, setProgress] = useState<ExtractionProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savedTitle, setSavedTitle] = useState<string | null>(null);
  const extractionController = useRef<AbortController | null>(null);

  useEffect(() => {
    let active = true;
    loadSavedTherapyPlan()
      .then((plan) => {
        if (active) setSavedTitle(plan?.title ?? null);
      })
      .catch(() => {
        if (active) setError("Your saved plan could not be loaded.");
      });

    return () => {
      active = false;
    };
  }, []);

  async function choosePlan() {
    setError(null);
    setIsChoosing(true);

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: Platform.OS === "web" ? [...TEXT_FILE_TYPES, "application/pdf"] : TEXT_FILE_TYPES,
        copyToCacheDirectory: true,
        multiple: false,
      });
      if (result.canceled) return;

      const asset = result.assets[0];
      const controller = new AbortController();
      extractionController.current = controller;
      setIsChoosing(false);
      setIsExtracting(true);
      setProgress({ message: "Starting extraction...", percent: 0 });
      const extracted = await extractTherapyPlanFile(asset, {
        signal: controller.signal,
        onProgress: setProgress,
      });
      const title = asset.name.replace(/\.[^.]+$/, "").trim() || "My therapy plan";
      await saveTherapyPlanDraft({
        fileName: asset.name,
        title,
        ...extracted,
      });
      router.push("/therapy-plan/review");
    } catch (caught) {
      if (caught instanceof Error && (caught.message === "EXTRACTION_CANCELLED" || caught.name === "AbortError")) return;
      setError(getImportErrorMessage(caught));
    } finally {
      extractionController.current = null;
      setIsChoosing(false);
      setIsExtracting(false);
      setProgress(null);
    }
  }

  async function enterManually() {
    setError(null);
    try {
      await saveTherapyPlanDraft({
        fileName: "Manual entry",
        title: "My therapy plan",
        content: "",
        sourceType: "manual",
        pages: [],
        instructions: [],
      });
      router.push("/therapy-plan/review");
    } catch {
      setError("Manual entry could not be started. Please try again.");
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.headerTitle}>Therapy plan</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Upload your plan</Text>
        <Text style={styles.body}>
          TXT, Markdown, and CSV files work on this device. Text-based PDF extraction works locally
          in the laptop browser. Scanned PDFs need manual entry. Files are not sent to a server.
        </Text>

        <Pressable
          onPress={choosePlan}
          disabled={isChoosing || isExtracting}
          accessibilityRole="button"
          style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed, (isChoosing || isExtracting) && styles.disabled]}
        >
          <Text style={styles.primaryButtonText}>{isChoosing ? "Choose a file..." : "Choose a plan file"}</Text>
        </Pressable>

        {isExtracting && progress ? (
          <View style={styles.progressSection}>
            <View style={styles.progressHeading}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={styles.body}>{progress.message}</Text>
            </View>
            <View style={styles.progressTrack} accessibilityRole="progressbar">
              <View style={[styles.progressFill, { width: `${progress.percent}%` }]} />
            </View>
            <Pressable
              onPress={() => extractionController.current?.abort()}
              accessibilityRole="button"
              style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
            >
              <Text style={styles.secondaryButtonText}>Cancel extraction</Text>
            </Pressable>
          </View>
        ) : null}

        <Pressable
          onPress={enterManually}
          disabled={isChoosing || isExtracting}
          accessibilityRole="button"
          style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
        >
          <Text style={styles.secondaryButtonText}>Enter plan manually</Text>
        </Pressable>

        {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}

        {savedTitle ? (
          <Pressable onPress={() => router.push("/therapy-plan/saved")} accessibilityRole="button">
            <Text style={styles.savedLink}>View saved plan: {savedTitle}</Text>
          </Pressable>
        ) : null}
      </ScrollView>
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
  title: { fontSize: 26, fontWeight: "700", color: colors.text },
  body: { fontSize: 16, lineHeight: 24, color: colors.muted },
  primaryButton: {
    minHeight: 48,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
    backgroundColor: colors.primary,
  },
  primaryButtonText: { color: colors.primaryText, fontSize: 16, fontWeight: "700" },
  progressSection: { gap: spacing.sm },
  progressHeading: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  progressTrack: { height: 8, overflow: "hidden", borderRadius: 4, backgroundColor: colors.surface },
  progressFill: { height: "100%", backgroundColor: colors.primary },
  secondaryButton: {
    minHeight: 44,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.panel,
  },
  secondaryButtonText: { color: colors.primary, fontSize: 15, fontWeight: "700" },
  pressed: { opacity: 0.8 },
  disabled: { opacity: 0.55 },
  error: { color: colors.warning, fontSize: 15 },
  savedLink: { paddingVertical: spacing.sm, color: colors.primary, fontSize: 16, fontWeight: "600" },
});