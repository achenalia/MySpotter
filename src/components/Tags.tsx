import { StyleSheet, Text, View } from "react-native";
import { colors, spacing } from "@/constants/theme";
import type { Category, Difficulty, Specialty } from "@/data/content";

type TagsProps = {
  categories?: Category[];
  difficulty?: Difficulty;
  specialties?: Specialty[];
  /** Show at most this many tags, then a "+N" chip for the rest. */
  max?: number;
};

export function Tags({ categories = [], difficulty, specialties = [], max }: TagsProps) {
  const tags = [...categories, ...(difficulty ? [difficulty] : []), ...specialties];
  if (tags.length === 0) return null;

  const visible = max !== undefined && tags.length > max ? tags.slice(0, max) : tags;
  const hidden = tags.length - visible.length;

  return (
    <View style={styles.row}>
      {visible.map((tag) => (
        <View key={tag} style={styles.pill}>
          <Text style={styles.text}>{tag}</Text>
        </View>
      ))}
      {hidden > 0 ? (
        <View style={styles.pill} accessibilityLabel={`${hidden} more tags`}>
          <Text style={styles.text}>+{hidden}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm / 2 },
  pill: {
    backgroundColor: colors.primary,
    borderRadius: 999,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 3,
  },
  text: { fontSize: 12, fontWeight: "600", color: colors.primaryText },
});
