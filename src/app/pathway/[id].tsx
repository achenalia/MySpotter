import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { BackButton } from "@/components/Back_Button";
import { ExerciseCalendar } from "@/components/Exercise_Calendar";
import { Sheet } from "@/components/Sheet";
import { Tags } from "@/components/Tags";
import { colors, spacing } from "@/constants/theme";
import { getPathway } from "@/data/content";

// The whole pop-up scrolls, so the calendar gets a fixed height of its own.
const CALENDAR_HEIGHT = 400;

export default function PathwayScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const pathway = getPathway(id);
  const [useAlternative, setUseAlternative] = useState(false);

  if (!pathway) {
    return (
      <Sheet>
        <View style={styles.notFound}>
          <Text style={styles.body}>Pathway not found.</Text>
        </View>
      </Sheet>
    );
  }

  const alternative = pathway.alternative;
  const showAlternative = useAlternative && !!alternative;
  // With the alternative on, every session day uses the alternative exercises instead.
  const schedule = showAlternative
    ? pathway.exerciseIds.map((day) => (day.length > 0 ? alternative.exerciseIds : day))
    : pathway.exerciseIds;

  return (
    <Sheet>
      <View style={styles.container}>
        <View style={styles.header}>
          <BackButton variant="close" />
          <Text style={styles.name} numberOfLines={2}>
            {pathway.name}
          </Text>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
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

          <ExerciseCalendar
            rows={pathway.days}
            height={CALENDAR_HEIGHT}
            exerciseIds={schedule}
            headerAction={
              alternative ? (
                <Pressable
                  onPress={() => setUseAlternative((on) => !on)}
                  accessibilityRole="switch"
                  accessibilityState={{ checked: showAlternative }}
                  style={[styles.toggle, showAlternative && styles.toggleOn]}
                >
                  <Text style={[styles.toggleText, showAlternative && styles.toggleTextOn]}>
                    {alternative.label}
                  </Text>
                </Pressable>
              ) : null
            }
          />
        </ScrollView>
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
  content: { padding: spacing.md, gap: spacing.md },
  body: { fontSize: 16, lineHeight: 24, color: colors.text },
  details: { gap: spacing.sm / 2 },
  detail: { fontSize: 16, color: colors.text },
  label: { fontWeight: "700" },
  // Matches the home page filter chips: pale when off, dark green when on.
  toggle: {
    borderRadius: 999,
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.overlaySoft,
    borderWidth: 1,
    borderColor: colors.overlayStrong,
  },
  toggleOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  toggleText: { fontSize: 12, fontWeight: "600", color: colors.text },
  toggleTextOn: { color: colors.primaryText },
  notFound: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },
});
