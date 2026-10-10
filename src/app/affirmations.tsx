import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BackButton } from "@/components/Back_Button";
import { router } from "expo-router";

const affirmationList = [
  "I am making progress, even if it is small.",
  "I can begin gently and still do well.",
  "My effort counts, and I can keep going.",
  "I choose movement that supports my energy today.",
  "I can pause, breathe, and continue with care.",
];

export default function AffirmationsScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <BackButton />
          <Text style={styles.heading}>Affirmations</Text>
        </View>

        <Text style={styles.intro}>Find encouragement for your day.</Text>

        {affirmationList.map((item, index) => (
          <View key={item} style={styles.card}>
            <Text style={styles.badge}>#{index + 1}</Text>
            <Text style={styles.text}>{item}</Text>
          </View>
        ))}

        <Pressable onPress={() => router.push("/")} style={styles.button}>
          <Text style={styles.buttonText}>Back to Home</Text>
        </Pressable>
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
    padding: 20,
    gap: 16,
    maxWidth: 720,
    width: "100%",
    alignSelf: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  heading: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1b2b1d",
  },
  intro: {
    fontSize: 18,
    lineHeight: 26,
    color: "#1b2b1d",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#dfe3d8",
    padding: 18,
    gap: 10,
  },
  badge: {
    fontSize: 12,
    fontWeight: "700",
    color: "#506b51",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  text: {
    fontSize: 18,
    lineHeight: 26,
    color: "#1b2b1d",
  },
  button: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#506b51",
    borderRadius: 14,
    minHeight: 48,
    paddingHorizontal: 20,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "700",
  },
});