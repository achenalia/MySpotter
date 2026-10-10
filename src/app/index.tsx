import { ScrollView, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { colors, spacing } from "@/constants/theme";

export default function Home() {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading}>Home</Text>
        <Card title="Welcome">
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