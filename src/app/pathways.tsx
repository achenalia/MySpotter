import { Stack } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BackButton } from "@/components/Back_Button";
import { PathwayButton } from "@/components/Pathway_Button";
import { colors, spacing } from "@/constants/theme";
import { pathways } from "@/data/content";

const generalPathways = pathways.filter((pathway) => !pathway.requiresClinicianPlan);
const recoveryPathways = pathways.filter((pathway) => pathway.requiresClinicianPlan);

export default function PathwaysScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <BackButton />
        <Text style={styles.title}>Pathways</Text>
      </View>

      <ScrollView contentContainerStyle={styles.list}>
        <Text style={styles.intro}>
          Routine timings are proposals, not individual exercise prescriptions.
        </Text>

        <View style={styles.section}>
          <Text accessibilityRole="header" style={styles.sectionTitle}>General movement routines</Text>
          {generalPathways.map((pathway) => <PathwayButton key={pathway.id} id={pathway.id} />)}
        </View>

        <View style={styles.recoverySection}>
          <Text accessibilityRole="header" style={styles.recoveryTitle}>Recovery pathways</Text>
          <Text style={styles.recoveryNote}>
            These drafts require an individualized plan from a healthcare professional. They are not available to start.
          </Text>
          {recoveryPathways.map((pathway) => <PathwayButton key={pathway.id} id={pathway.id} />)}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  title: { flex: 1, fontSize: 24, fontWeight: "700", color: colors.text },
  list: { padding: spacing.md, gap: spacing.lg, maxWidth: 860, width: "100%", alignSelf: "center" },
  intro: { fontSize: 17, lineHeight: 25, color: colors.text },
  section: { gap: spacing.md },
  sectionTitle: { fontSize: 21, lineHeight: 28, fontWeight: "800", color: colors.text },
  recoverySection: { gap: spacing.md, paddingTop: spacing.md, borderTopWidth: 2, borderTopColor: "#d5a39a" },
  recoveryTitle: { fontSize: 21, lineHeight: 28, fontWeight: "800", color: "#8c3029" },
  recoveryNote: { fontSize: 16, lineHeight: 23, color: colors.text, backgroundColor: "#fff0ec", padding: spacing.md, borderRadius: 8 },
});
