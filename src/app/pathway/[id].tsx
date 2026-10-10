import { router, Stack, useLocalSearchParams } from "expo-router";
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BackButton } from "@/components/Back_Button";
<<<<<<< HEAD
import { colors, spacing } from "@/constants/theme";
import { getPathway } from "@/data/pathways";
import { getExercise } from "@/data/exercises";
=======
import { ExerciseCalendar } from "@/components/Exercise_Calendar";
import { Tags } from "@/components/Tags";
import { colors, spacing } from "@/constants/theme";
import { getPathway } from "@/data/content";
>>>>>>> origin/main

export default function PathwayScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const pathway = getPathway(id);

  if (!pathway) {
    return (
      <View style={styles.notFound}>
        <Stack.Screen options={{ title: "Not found" }} />
        <Text style={styles.body}>Pathway not found.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <BackButton variant="close" />
        <Text style={styles.name} numberOfLines={2}>
          {pathway.name}
        </Text>
      </View>

<<<<<<< HEAD
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.body}>{pathway.description}</Text>
=======
      <View style={styles.content}>
        {pathway.description ? <Text style={styles.body}>{pathway.description}</Text> : null}
>>>>>>> origin/main

        <View style={pathway.requiresClinicianPlan ? styles.recoveryNotice : styles.proposedNotice}>
          <Text style={styles.noticeTitle}>
            {pathway.requiresClinicianPlan ? "Recovery · clinician plan required" : pathway.scheduleLabel}
          </Text>
<<<<<<< HEAD
          <Text style={styles.body}>
            {pathway.requiresClinicianPlan
              ? "These draft tracks are not a rehabilitation prescription. Use only movements selected and timed in an individualized plan from your healthcare professional."
              : "The attached document's schedule is a proposed app routine, not an individualized prescription."}
          </Text>
=======
          <Tags difficulty={pathway.difficulty} specialties={pathway.specialties} />
>>>>>>> origin/main
        </View>

        <View style={styles.details}>
          <Text style={styles.detail}><Text style={styles.label}>Pathway length: </Text>{pathway.duration}</Text>
          <Text style={styles.detail}><Text style={styles.label}>Frequency: </Text>{pathway.frequency}</Text>
          <Text style={styles.detail}><Text style={styles.label}>Goal: </Text>{pathway.goal}</Text>
        </View>

        <Text style={styles.timeNote}>
          Session time is the full estimate, including rest and transitions. Per-movement allocations are not continuous exercise or stretch-hold times; follow verified instructions instead.
        </Text>

        <Text style={styles.sectionTitle}>Tracks</Text>
        {pathway.tracks.map((track) => (
          <View key={track.id} style={styles.track}>
            <View style={styles.trackHeader}>
              <View style={styles.trackHeading}>
                <Text style={styles.trackTitle}>Track {track.id.toUpperCase()}: {track.name}</Text>
                <Text style={styles.trackDuration}>{track.duration}</Text>
              </View>
              {!track.complete && <Text style={styles.draftBadge}>INCOMPLETE</Text>}
            </View>
            <Text style={styles.body}>{track.description}</Text>
            {track.items.map((trackItem, index) => {
              const exercise = getExercise(trackItem.exerciseId);
              return (
                <Pressable
                  key={`${track.id}-${index}`}
                  accessibilityRole="button"
                  accessibilityLabel={`View ${exercise?.name ?? "exercise draft"}, ${trackItem.allocation}`}
                  onPress={() => exercise && router.push({ pathname: "/exercise/[id]", params: { id: exercise.id } })}
                  style={styles.trackItem}
                >
                  <View style={styles.trackItemText}>
                    <Text style={styles.itemName}>{exercise?.name ?? "Exercise not supplied"}</Text>
                    <Text style={styles.itemAllocation}>{trackItem.allocation}</Text>
                  </View>
                  <Text style={styles.itemAction}>View</Text>
                </Pressable>
              );
            })}
            {track.items.length === 0 && <Text style={styles.body}>No session details were supplied.</Text>}
            <Text style={styles.restText}>Rest and transitions: {track.restAndTransitions}</Text>
            <Text style={styles.draftText}>Draft · exercises are unavailable to start until their instructions and demonstrations are verified.</Text>
          </View>
        ))}

        <View style={styles.sourceSection}>
          <Text style={styles.sectionTitle}>Guideline context</Text>
          <Text style={styles.body}>CDC guidance covers weekly activity categories for adults 65 and older; it does not verify these proposed track schedules.</Text>
          <Pressable onPress={() => Linking.openURL("https://www.cdc.gov/physical-activity-basics/guidelines/older-adults.html")} accessibilityRole="link">
            <Text style={styles.sourceLink}>CDC: Older Adult Activity: An Overview</Text>
          </Pressable>
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
  name: { flex: 1, fontSize: 24, fontWeight: "700", color: colors.text },
  content: { padding: spacing.md, gap: spacing.md, maxWidth: 820, width: "100%", alignSelf: "center" },
  body: { fontSize: 16, lineHeight: 24, color: colors.text },
  details: { gap: spacing.sm / 2 },
  detail: { fontSize: 16, color: colors.text },
  label: { fontWeight: "700" },
  proposedNotice: { backgroundColor: "#eef3eb", borderLeftWidth: 5, borderLeftColor: colors.primary, padding: spacing.md, gap: spacing.sm, borderRadius: 8 },
  recoveryNotice: { backgroundColor: "#fff0ec", borderLeftWidth: 5, borderLeftColor: "#a33e31", padding: spacing.md, gap: spacing.sm, borderRadius: 8 },
  noticeTitle: { fontSize: 18, lineHeight: 24, fontWeight: "800", color: colors.text },
  timeNote: { fontSize: 16, lineHeight: 24, color: colors.text, backgroundColor: colors.surface, padding: spacing.md, borderRadius: 8 },
  sectionTitle: { fontSize: 22, lineHeight: 28, fontWeight: "800", color: colors.text, marginTop: spacing.sm },
  track: { paddingVertical: spacing.md, borderTopWidth: 1, borderTopColor: colors.surface, gap: spacing.sm },
  trackHeader: { flexDirection: "row", alignItems: "flex-start", gap: spacing.sm },
  trackHeading: { flex: 1, gap: 4 },
  trackTitle: { fontSize: 19, lineHeight: 25, fontWeight: "800", color: colors.text },
  trackDuration: { fontSize: 17, lineHeight: 23, fontWeight: "700", color: colors.primary },
  draftBadge: { color: "#8c3029", fontSize: 14, fontWeight: "800" },
  trackItem: { flexDirection: "row", alignItems: "center", minHeight: 56, gap: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.surface },
  trackItemText: { flex: 1, gap: 2 },
  itemName: { fontSize: 17, lineHeight: 23, color: colors.text, fontWeight: "700" },
  itemAllocation: { fontSize: 15, lineHeight: 21, color: colors.text },
  itemAction: { fontSize: 16, fontWeight: "800", color: colors.primary },
  restText: { fontSize: 16, lineHeight: 22, color: colors.text, fontWeight: "700" },
  draftText: { fontSize: 15, lineHeight: 21, color: "#8c3029" },
  sourceSection: { paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.surface, gap: spacing.sm },
  sourceLink: { fontSize: 16, lineHeight: 23, color: colors.primary, textDecorationLine: "underline" },
  notFound: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },
});
