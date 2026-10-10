import { Affirmation } from "@/components/Affirmation";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Directory } from "@/components/Directory";
import { StreakCounter } from "@/components/StreakCounter";
import { colors, spacing } from "@/constants/theme";
import { getRandomAffirmation } from "@/data/affirmations";
import { useState } from "react";
import { ScrollView, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Home() {
  // Picked once when the app launches; edit the list in src/data/affirmations.json.
  const [affirmation] = useState(getRandomAffirmation);


  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading}>Home</Text>
        <StreakCounter />
        {affirmation ? <Affirmation text={affirmation} /> : null}
        <Card title="Test">
          <Text>TEST CARD.</Text>
          <Button title="Get started" onPress={() => console.log("pressed")} />
        </Card>
      <Directory
        items={[
          {
            label: "Pose",
            href: "/pose"
          },
          {
            label: "Pathways",
            href: "/pathways"
          },
        ]}
      />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, gap: spacing.md },
  heading: { fontSize: 28, fontWeight: "800", color: colors.text },
});