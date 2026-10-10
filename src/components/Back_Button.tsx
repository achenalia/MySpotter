import { router } from "expo-router";
import { Pressable, StyleSheet, Text } from "react-native";
import { colors, spacing } from "@/constants/theme";

export function BackButton() {
  const goBack = () => {
    if (router.canGoBack()) router.back();
  };

  return (
    <Pressable
      onPress={goBack}
      hitSlop={12}
      accessibilityRole="button"
      accessibilityLabel="Go back"
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <Text style={styles.arrow}>←</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { padding: spacing.sm / 2 },
  pressed: { opacity: 0.6 },
  arrow: { fontSize: 28, color: colors.text },
});
