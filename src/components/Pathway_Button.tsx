import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Tags } from "@/components/Tags";
import { colors, spacing } from "@/constants/theme";
import { getPathway } from "@/data/content";

type PathwayButtonProps = {
  /** The id of a pathway in src/data/content.json. */
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
<<<<<<< HEAD
      accessibilityLabel={`Open ${pathway.name}, ${pathway.duration}, ${pathway.difficulty}`}
=======
      accessibilityLabel={[`Open ${pathway.name}`, time, pathway.difficulty, ...pathway.specialties]
        .filter(Boolean)
        .join(", ")}
>>>>>>> origin/main
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <View style={styles.text}>
        <Text style={styles.name} numberOfLines={1}>
          {pathway.name}
        </Text>
        <Text style={styles.details} numberOfLines={1}>
<<<<<<< HEAD
          {pathway.duration} · {pathway.difficulty}
        </Text>
        <Text style={styles.details}>
          {pathway.requiresClinicianPlan ? "Recovery · clinician plan required" : pathway.scheduleLabel}
=======
          {time}
>>>>>>> origin/main
        </Text>
        <Tags difficulty={pathway.difficulty} specialties={pathway.specialties} />
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
  text: { flex: 1, gap: spacing.sm / 2 },
  name: { fontSize: 18, fontWeight: "600", color: colors.text },
  details: { fontSize: 16, lineHeight: 22, color: colors.text, opacity: 0.75 },
  chevron: { fontSize: 24, color: colors.primary },
});
