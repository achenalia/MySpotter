<<<<<<< HEAD
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
=======
import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
>>>>>>> origin/main
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import { BackButton } from "@/components/Back_Button";
import { Button } from "@/components/Button";
import { Tags } from "@/components/Tags";
import { colors, spacing } from "@/constants/theme";
<<<<<<< HEAD
import type { Exercise } from "@/data/exercises";

type ExerciseCardProps = {
  exercise: Exercise;
};

export function ExerciseCard({ exercise }: ExerciseCardProps) {
  const videoId = exercise.video?.demonstrationVerified
    ? exercise.video.url.match(/[\w-]{11}/)?.[0]
    : null;
  const videoCandidates = [exercise.video, ...(exercise.additionalVideoCandidates ?? [])].filter(Boolean);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <BackButton />
          <Text style={styles.name}>
            {exercise.name}
          </Text>
        </View>

        <Text style={styles.category}>{exercise.category}</Text>
        <Text style={styles.description}>{exercise.description}</Text>

        <View style={exercise.verification === "draft" ? styles.draftNotice : styles.verifiedNotice}>
          <Text style={styles.noticeTitle}>
            {exercise.verification === "draft" ? "Draft · not available to start" : "Verified guidance"}
          </Text>
          {exercise.verificationNote ? <Text style={styles.noticeText}>{exercise.verificationNote}</Text> : null}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Equipment or support</Text>
          <Text style={styles.description}>{exercise.equipment}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Instructions</Text>
          {exercise.instructions.length ? exercise.instructions.map((instruction, index) => (
            <Text key={`${index}-${instruction}`} style={styles.instruction}>
              {index + 1}. {instruction}
            </Text>
          )) : <Text style={styles.description}>No instructions are available yet; this entry remains a draft.</Text>}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Demonstration video</Text>
          {videoId ? (
            <View style={styles.video}>
              <WebView
                source={{ uri: `https://www.youtube.com/embed/${videoId}?playsinline=1` }}
                allowsInlineMediaPlayback
                allowsFullscreenVideo
                mediaPlaybackRequiresUserAction
                style={styles.webview}
              />
            </View>
          ) : (
            <View style={styles.videoPending}>
              <Text style={styles.noticeTitle}>Not available pending footage review</Text>
              {videoCandidates.length ? videoCandidates.map((candidate) => candidate && (
                <Text key={candidate.url} style={styles.noticeText}>
                  Candidate: “{candidate.title}” by {candidate.creator}. Title and channel checked; demonstration not reviewed.
                </Text>
              )) : (
                <Text style={styles.noticeText}>No demonstration video was supplied for this entry.</Text>
              )}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sources</Text>
          {exercise.sources.length ? exercise.sources.map((source) => (
            <Pressable
              key={source.url}
              accessibilityRole="link"
              onPress={() => Linking.openURL(source.url)}
              style={styles.sourceButton}
            >
              <Text style={styles.sourceLink}>{source.label}</Text>
            </Pressable>
          )) : <Text style={styles.description}>No exercise-specific instructions were verified for this draft.</Text>}
        </View>
=======
import type { Difficulty } from "@/data/content";

type ExerciseCardProps = {
  name: string;
  description: string;
  /** A YouTube link (watch, youtu.be, shorts, or embed) or a bare video ID. */
  videoUrl: string;
  difficulty?: Difficulty;
  onContinue: () => void;
};

function getYouTubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/
  );
  if (match) return match[1];
  return /^[\w-]{11}$/.test(url) ? url : null;
}

export function ExerciseCard({
  name,
  description,
  videoUrl,
  difficulty,
  onContinue,
}: ExerciseCardProps) {
  const videoId = getYouTubeId(videoUrl);
  const [videoFailed, setVideoFailed] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <BackButton variant="close" />
        <Text style={styles.name} numberOfLines={2}>
          {name}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {description ? <Text style={styles.description}>{description}</Text> : null}

        <Tags difficulty={difficulty} />

        {/* Plain grey box when there's no video or it fails to load. */}
        <View style={styles.video}>
          {videoId && !videoFailed ? (
            <WebView
              source={{ uri: `https://www.youtube.com/embed/${videoId}?playsinline=1` }}
              allowsInlineMediaPlayback
              allowsFullscreenVideo
              mediaPlaybackRequiresUserAction
              onError={() => setVideoFailed(true)}
              onHttpError={() => setVideoFailed(true)}
              style={styles.webview}
            />
          ) : null}
        </View>

        <Button title="Continue" onPress={onContinue} />
>>>>>>> origin/main
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
<<<<<<< HEAD
  name: { flex: 1, fontSize: 26, lineHeight: 32, fontWeight: "800", color: colors.text },
  content: { padding: spacing.md, gap: spacing.md, maxWidth: 760, width: "100%", alignSelf: "center" },
  category: { fontSize: 15, fontWeight: "800", color: colors.primary, textTransform: "uppercase" },
  section: { gap: spacing.sm },
  sectionTitle: { fontSize: 20, lineHeight: 26, fontWeight: "800", color: colors.text },
  instruction: { fontSize: 17, lineHeight: 25, color: colors.text },
  draftNotice: { backgroundColor: "#fff0ec", borderLeftWidth: 5, borderLeftColor: "#a33e31", padding: spacing.md, gap: spacing.sm, borderRadius: 8 },
  verifiedNotice: { backgroundColor: "#eef3eb", borderLeftWidth: 5, borderLeftColor: colors.primary, padding: spacing.md, gap: spacing.sm, borderRadius: 8 },
  videoPending: { backgroundColor: colors.surface, padding: spacing.md, gap: spacing.sm, borderRadius: 8 },
  noticeTitle: { fontSize: 17, lineHeight: 23, fontWeight: "800", color: colors.text },
  noticeText: { fontSize: 16, lineHeight: 23, color: colors.text },
  sourceButton: { minHeight: 48, justifyContent: "center" },
  sourceLink: { fontSize: 16, lineHeight: 23, color: colors.primary, textDecorationLine: "underline" },
=======
  name: { flex: 1, fontSize: 24, fontWeight: "700", color: colors.text },
  content: { padding: spacing.md, gap: spacing.md },
  description: { fontSize: 16, lineHeight: 24, color: colors.text },
>>>>>>> origin/main
  video: {
    width: "100%",
    aspectRatio: 16 / 9,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: colors.subtle,
  },
  webview: { width: "100%", height: "100%" },
<<<<<<< HEAD
  description: { fontSize: 16, lineHeight: 24, color: colors.text },
=======
>>>>>>> origin/main
});
