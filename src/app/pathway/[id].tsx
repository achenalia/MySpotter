import { useLocalSearchParams } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { BackButton } from "@/components/Back_Button";
import { ExerciseCalendar } from "@/components/Exercise_Calendar";
import { Sheet } from "@/components/Sheet";
import { Tags } from "@/components/Tags";
import { colors, spacing } from "@/constants/theme";
import { getPathway } from "@/data/content";

export default function PathwayScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const pathway = getPathway(id);

  if (!pathway) {
    return (
      <Sheet>
        <View style={styles.notFound}>
          <Text style={styles.body}>Pathway not found.</Text>
        </View>
      </Sheet>
    );
  }

  return (
    <Sheet>
      <View style={styles.container}>
        <View style={styles.header}>
          <BackButton variant="close" />
          <Text style={styles.name} numberOfLines={2}>
            {pathway.name}
          </Text>
        </View>

        <View style={styles.content}>
          {pathway.description ? <Text style={styles.body}>{pathway.description}</Text> : null}

          <View style={styles.details}>
            <Text style={styles.detail}>
              <Text style={styles.label}>Time: </Text>
              {pathway.days} {pathway.days === 1 ? "day" : "days"}
            </Text>
            <Tags
              categories={pathway.categories}
              difficulty={pathway.difficulty}
              specialties={pathway.specialties}
            />
          </View>

          <ExerciseCalendar rows={pathway.days} exerciseIds={pathway.exerciseIds} />
        </View>
      </View>
    </Sheet>
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
  name: { flex: 1, fontSize: 24, fontWeight: "700", color: colors.text },
  content: { flex: 1, padding: spacing.md, gap: spacing.md },
  body: { fontSize: 16, lineHeight: 24, color: colors.text },
  details: { gap: spacing.sm / 2 },
  detail: { fontSize: 16, color: colors.text },
  label: { fontWeight: "700" },
  notFound: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },
});
