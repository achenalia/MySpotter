import { router } from "expo-router";
import { useEffect } from "react";
import { Platform, Pressable, StyleSheet, useWindowDimensions } from "react-native";
import Animated, { Easing, FadeIn, SlideInDown } from "react-native-reanimated";
import { colors } from "@/constants/theme";

// Pop-up wrapper used by the pathway, exercise and safety screens. Draws a dark
// backdrop (tap to close) and a centered card that slides up from the bottom.
// The card is 2/3 of the screen height, and 2/3 of the width on wide screens
// (tablets, web); on phones it uses the full width minus a margin.
const WIDE_SCREEN = 768;
const PHONE_MARGIN = 16;

function close() {
  if (router.canGoBack()) router.back();
  else router.replace("/");
}

export function Sheet({ children }: { children: React.ReactNode }) {
  const { width, height } = useWindowDimensions();
  const cardWidth = width >= WIDE_SCREEN ? (width * 2) / 3 : width - PHONE_MARGIN * 2;

  useEffect(() => {
    if (Platform.OS !== "web") return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <Animated.View style={styles.root} entering={FadeIn.duration(250)}>
      <Pressable
        style={styles.backdrop}
        onPress={close}
        accessibilityRole="button"
        accessibilityLabel="Close"
      />
      <Animated.View
        style={[styles.card, { width: cardWidth, height: (height * 2) / 3 }]}
        entering={SlideInDown.duration(350).easing(Easing.out(Easing.cubic))}
      >
        {children}
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: "center", justifyContent: "center" },
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: "rgba(0, 0, 0, 0.4)" },
  card: {
    backgroundColor: colors.background,
    borderRadius: 20,
    overflow: "hidden",
  },
});
