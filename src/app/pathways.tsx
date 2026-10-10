import { Stack } from "expo-router";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BackButton } from "@/components/Back_Button";
import { PathwayButton } from "@/components/Pathway_Button";
import { colors, spacing } from "@/constants/theme";
import { pathways } from "@/data/pathways";

const pathwaysByLength = [...pathways].sort((a, b) => a.days - b.days);

export default function PathwaysScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <BackButton />
        <Text style={styles.title}>Pathways</Text>
      </View>

      <FlatList
        data={pathwaysByLength}
        keyExtractor={(pathway) => pathway.id}
        renderItem={({ item }) => <PathwayButton id={item.id} />}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>No pathways yet.</Text>}
      />
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
  list: { padding: spacing.md, gap: spacing.md },
  empty: { fontSize: 16, color: colors.text, opacity: 0.6, textAlign: "center" },
});
