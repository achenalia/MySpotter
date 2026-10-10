import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, spacing } from "@/constants/theme";
import { getPathway } from "@/data/pathways";

type PathwayButtonProps = {
  /** The id of a pathway in src/data/pathways.ts. */
  id: string;
};

export function PathwayButton({ id }: PathwayButtonProps) {
  const pathway = getPathway(id);
  if (!pathway) return null;

  const openPathway = () => {
    router.push({ pathname: "/pathway/[id]", params: { id } });
  };

  return (
    <Pressable
      onPress={openPathway}
      accessibilityRole="button"
      accessibilityLabel={`Open ${pathway.name}, ${pathway.duration}, ${pathway.difficulty}`}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <View style={styles.text}>
        <Text style={styles.name} numberOfLines={1}>
          {pathway.name}
        </Text>
        <Text style={styles.details} numberOfLines={1}>
          {pathway.duration} · {pathway.difficulty}
        </Text>
        <Text style={styles.details}>
          {pathway.requiresClinicianPlan ? "Recovery · clinician plan required" : pathway.scheduleLabel}
        </Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: 12,
    gap: spacing.sm,
  },
  pressed: { opacity: 0.7 },
  text: { flex: 1, gap: 2 },
  name: { fontSize: 18, fontWeight: "600", color: colors.text },
  details: { fontSize: 16, lineHeight: 22, color: colors.text, opacity: 0.75 },
  chevron: { fontSize: 24, color: colors.primary },
});
