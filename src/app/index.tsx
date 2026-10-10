import { ScrollView, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { colors, spacing } from "@/constants/theme";
import { Affirmation } from "@/components/Affirmation";
import { StreakCounter } from "@/components/StreakCounter";
import { useState } from "react";

// RANDOMLY CHOOSES AFFIRMATION FROM THESE
const affirmations = [
  "I am capable of handling whatever today brings.",
  "I am doing my best, and that is enough.",
  "Small steps still move me forward.",
];



export default function Home() {
  const [affirmation] = useState(
    () => affirmations[Math.floor(Math.random() * affirmations.length)]
  );


  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading}>Home</Text>
        <StreakCounter />
        <Affirmation text={affirmation} />
        <Card title="Test">
          <Text>TEST CARD.</Text>
          <Button title="Get started" onPress={() => console.log("pressed")} />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, gap: spacing.md },
  heading: { fontSize: 28, fontWeight: "800", color: colors.text },
});