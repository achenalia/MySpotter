import { StyleSheet, Text, View } from "react-native";
import { colors, spacing } from "@/constants/theme";

type CardProps = {
  title: string;
  children?: React.ReactNode;
};

export function Card({ title, children }: CardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    gap: spacing.sm,
  },
  title: { fontSize: 18, fontWeight: "700", color: colors.text },
});