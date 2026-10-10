import { StyleSheet, Text, View } from "react-native";
import { colors, spacing } from "@/constants/theme";

type AffirmationProps = {
  text: string;
};

export function Affirmation({ text }: AffirmationProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.lg,
    alignItems: "center",
  },
  text: {
    fontSize: 22,
    fontWeight: "600",
    fontStyle: "italic",
    textAlign: "center",
    color: colors.text,
    lineHeight: 32,
  },
});