import { Pressable, StyleSheet, Text } from "react-native";
import { colors, spacing } from "@/constants/theme";

type ButtonProps = {
  title: string;
  onPress: () => void;
};

export function Button({ title, onPress }: ButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <Text style={styles.text}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm + 4,
    paddingHorizontal: spacing.lg,
    borderRadius: 10,
    alignItems: "center",
  },
  pressed: { opacity: 0.8 },
  text: { color: colors.primaryText, fontWeight: "600", fontSize: 16 },
});