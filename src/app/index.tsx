import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, spacing } from "@/constants/theme";
import { Affirmation } from "@/components/Affirmation";
import { StreakCounter } from "@/components/StreakCounter";
import { router } from "expo-router";
import { useMemo } from "react";

const affirmations = [
  "I am doing my best, and that is enough.",
  "Small steps still move me forward.",
  "I can take the next step one breath at a time.",
  "Today I can move with intention and care.",
];

const cards = [
  {
    key: "pathway",
    icon: "🧭",
    label: "My Pathway",
    description: "Follow a guided exercise plan.",
    route: "/pathways",
  },
  {
    key: "exercise",
    icon: "🏃",
    label: "Exercise library",
    description: "Browse exercises, instructions, and sources.",
    route: "/exercises",
  },
  {
    key: "affirmations",
    icon: "✨",
    label: "Affirmations",
    description: "Find encouragement for your day.",
    route: "/affirmations",
  },
  {
    key: "safety",
    icon: "🛡",
    label: "Safety",
    description: "Learn how to prepare and when to pause.",
    route: "/safety",
  },
];

export default function Home() {
  const { width } = useWindowDimensions();
  const isPhone = width < 640;
  const affirmation = useMemo(
    () => affirmations[Math.floor(Math.random() * affirmations.length)],
    []
  );

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text accessibilityRole="header" style={styles.heading}>
          Move with confidence
        </Text>
        <Text style={styles.intro}>
          Choose a guided plan, explore exercises, or find encouragement and safety tips.
        </Text>

        <View style={[styles.grid, isPhone && styles.gridPhone]}>
          {cards.map((card) => (
            <Pressable
              key={card.key}
              accessibilityRole="button"
              accessibilityLabel={card.label}
              onPress={() => router.push(card.route as any)}
              style={({ pressed }) => [
                styles.card,
                isPhone ? styles.cardPhone : styles.cardLaptop,
                pressed && styles.cardPressed,
              ]}
            >
              <Text style={styles.icon}>{card.icon}</Text>
              <Text style={styles.cardTitle}>{card.label}</Text>
              <Text style={styles.cardDescription}>{card.description}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.secondarySection}>
          <Text style={styles.secondaryTitle}>Quick encouragement</Text>
          <Affirmation text={affirmation} />
          <StreakCounter />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#f9f4ea",
  },
  content: {
    padding: spacing.md,
    gap: spacing.md,
    maxWidth: 960,
    width: "100%",
    alignSelf: "center",
  },
  heading: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: "800",
    color: colors.text,
    marginTop: spacing.sm,
  },
  intro: {
    fontSize: 18,
    lineHeight: 28,
    color: colors.text,
    maxWidth: 680,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  gridPhone: {
    flexDirection: "column",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#dfe3d8",
    padding: spacing.md,
    justifyContent: "center",
    minHeight: 172,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  cardLaptop: {
    flexBasis: "48%",
  },
  cardPhone: {
    width: "100%",
  },
  cardPressed: {
    borderColor: "#506b51",
    backgroundColor: "#f3f7f0",
  },
  icon: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  cardTitle: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "800",
    color: colors.text,
    marginBottom: 6,
  },
  cardDescription: {
    fontSize: 18,
    lineHeight: 24,
    color: colors.text,
  },
  secondarySection: {
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  secondaryTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "700",
    color: colors.text,
  },
});