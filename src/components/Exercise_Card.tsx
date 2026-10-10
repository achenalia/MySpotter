import * as WebBrowser from "expo-web-browser";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { BackButton } from "@/components/Back_Button";
import { Button } from "@/components/Button";
import { Tags } from "@/components/Tags";
import { colors, spacing } from "@/constants/theme";
import type { Exercise } from "@/data/content";

type ExerciseCardProps = {
  exercise: Exercise;
  onContinue: () => void;
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle} accessibilityRole="header">
        {title}
      </Text>
      {children}
    </View>
  );
}

export function ExerciseCard({ exercise, onContinue }: ExerciseCardProps) {
  const { name, category, description, equipment, instructions, videoUrl, sources, difficulty } =
    exercise;
  const hasVideo = /^https?:\/\//.test(videoUrl.trim());

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <BackButton variant="close" />
        <View style={styles.titleBlock}>
          <Text style={styles.name} numberOfLines={2}>
            {name}
          </Text>
          {category || difficulty ? (
            <View style={styles.subtitleRow}>
              {category ? <Text style={styles.category}>{category}</Text> : null}
              <Tags difficulty={difficulty} />
            </View>
          ) : null}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {description ? (
          <Section title="Description">
            <Text style={styles.body}>{description}</Text>
          </Section>
        ) : null}

        <Section title="Equipment">
          {equipment.length > 0 ? (
            equipment.map((item) => (
              <View key={item} style={styles.listRow}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.listText}>{item}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.body}>Bodyweight</Text>
          )}
        </Section>

        {instructions.length > 0 ? (
          <Section title="Instructions">
            {instructions.map((step, i) => (
              <View key={i} style={styles.listRow}>
                <Text style={styles.stepNumber}>{i + 1}.</Text>
                <Text style={styles.listText}>{step}</Text>
              </View>
            ))}
          </Section>
        ) : null}

        {hasVideo ? (
          <Pressable
            onPress={() => WebBrowser.openBrowserAsync(videoUrl.trim())}
            accessibilityRole="link"
            accessibilityLabel={`Watch a video of ${name}`}
            style={({ pressed }) => pressed && styles.pressed}
          >
            <Text style={styles.videoLink}>▶ Watch video</Text>
          </Pressable>
        ) : null}

        {sources.length > 0 ? (
          <Section title="Sources">
            {sources.map((source) => (
              <Pressable
                key={source.url}
                onPress={() => WebBrowser.openBrowserAsync(source.url)}
                accessibilityRole="link"
                style={({ pressed }) => pressed && styles.pressed}
              >
                <Text style={styles.link}>{source.title}</Text>
              </Pressable>
            ))}
          </Section>
        ) : null}

        <Button title="Continue" onPress={onContinue} />
      </ScrollView>
    </View>
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
  titleBlock: { flex: 1, gap: spacing.xs },
  name: { fontSize: 24, fontWeight: "700", color: colors.text },
  subtitleRow: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: spacing.sm },
  category: { fontSize: 15, fontWeight: "600", color: colors.muted },
  content: { padding: spacing.md, gap: spacing.lg },
  section: { gap: spacing.sm },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: colors.text },
  body: { fontSize: 16, lineHeight: 24, color: colors.text },
  listRow: { flexDirection: "row", gap: spacing.sm },
  bullet: { fontSize: 16, lineHeight: 24, color: colors.text, width: 12 },
  stepNumber: { fontSize: 16, lineHeight: 24, fontWeight: "700", color: colors.text, minWidth: 20 },
  listText: { flex: 1, fontSize: 16, lineHeight: 24, color: colors.text },
  videoLink: { fontSize: 17, fontWeight: "600", color: colors.primary, textDecorationLine: "underline" },
  link: { fontSize: 15, lineHeight: 22, color: colors.primary, textDecorationLine: "underline" },
  pressed: { opacity: 0.6 },
});
