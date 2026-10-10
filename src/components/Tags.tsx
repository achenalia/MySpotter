import { StyleSheet, Text, View } from "react-native";
import { colors, spacing } from "@/constants/theme";
import type { Difficulty, Specialty } from "@/data/content";

type TagsProps = {
  difficulty?: Difficulty;
  specialties?: Specialty[];
};

export function Tags({ difficulty, specialties = [] }: TagsProps) {
  const tags = difficulty ? [difficulty, ...specialties] : specialties;
  if (tags.length === 0) return null;

  return (
    <View style={styles.row}>
      {tags.map((tag) => (
        <View key={tag} style={styles.pill}>
          <Text style={styles.text}>{tag}</Text>
        </View>
      ))}
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
