import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import { BackButton } from "@/components/Back_Button";
import { colors, spacing } from "@/constants/theme";

type ExerciseCardProps = {
  name: string;
  description: string;
  /** A YouTube link (watch, youtu.be, shorts, or embed) or a bare video ID. */
  videoUrl: string;
};

function getYouTubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/
  );
  if (match) return match[1];
  return /^[\w-]{11}$/.test(url) ? url : null;
}

export function ExerciseCard({ name, description, videoUrl }: ExerciseCardProps) {
  const videoId = getYouTubeId(videoUrl);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.name} numberOfLines={2}>
          {name}
        </Text>
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

        <Text style={styles.description}>{description}</Text>
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
