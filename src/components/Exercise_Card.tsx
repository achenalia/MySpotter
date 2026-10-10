import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import { BackButton } from "@/components/Back_Button";
import { Tags } from "@/components/Tags";
import { colors, spacing } from "@/constants/theme";
import type { Difficulty, Specialty } from "@/data/content";

type ExerciseCardProps = {
  name: string;
  description: string;
  /** A YouTube link (watch, youtu.be, shorts, or embed) or a bare video ID. */
  videoUrl: string;
  time?: string;
  difficulty?: Difficulty;
  specialties?: Specialty[];
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
  time = "",
  difficulty,
  specialties = [],
}: ExerciseCardProps) {
  const videoId = getYouTubeId(videoUrl);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <BackButton />
        <View style={styles.titleBlock}>
          <Text style={styles.name} numberOfLines={2}>
            {name}
          </Text>
          {time ? <Text style={styles.details}>{time}</Text> : null}
          <Tags difficulty={difficulty} specialties={specialties} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.video}>
          {videoId ? (
            <WebView
              source={{ uri: `https://www.youtube.com/embed/${videoId}?playsinline=1` }}
              allowsInlineMediaPlayback
              allowsFullscreenVideo
              mediaPlaybackRequiresUserAction
              style={styles.webview}
            />
          ) : (
            <Text style={styles.videoError}>Video unavailable</Text>
          )}
        </View>

        {description ? <Text style={styles.description}>{description}</Text> : null}
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
  titleBlock: { flex: 1, gap: spacing.sm / 2 },
  name: { fontSize: 24, fontWeight: "700", color: colors.text },
  details: { fontSize: 14, color: colors.text, opacity: 0.6 },
  content: { padding: spacing.md, gap: spacing.md },
  video: {
    width: "100%",
    aspectRatio: 16 / 9,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  webview: { width: "100%", height: "100%" },
  videoError: { color: colors.text, opacity: 0.6 },
  description: { fontSize: 16, lineHeight: 24, color: colors.text },
});
