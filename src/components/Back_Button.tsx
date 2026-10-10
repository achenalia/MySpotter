import { router } from "expo-router";
import { Pressable, StyleSheet, Text } from "react-native";
import { colors, spacing } from "@/constants/theme";

type BackButtonProps = {
  /** "back" shows an arrow; "close" shows an X for closing pop-ups. */
  variant?: "back" | "close";
};

export function BackButton({ variant = "back" }: BackButtonProps) {
  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/");
  };

  return (
    <Pressable
      onPress={goBack}
      hitSlop={12}
      accessibilityRole="button"
      accessibilityLabel={variant === "close" ? "Close" : "Go back"}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <Text style={styles.icon}>{variant === "close" ? "✕" : "←"}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { padding: spacing.sm / 2, minWidth: 36, alignItems: "center" },
  pressed: { opacity: 0.6 },
  icon: { fontSize: 26, color: colors.text },
});
