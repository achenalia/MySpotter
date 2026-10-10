import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { WebView } from "react-native-webview";
import { BackButton } from "@/components/Back_Button";
import { Button } from "@/components/Button";
import { Tags } from "@/components/Tags";
import { colors, spacing } from "@/constants/theme";
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
    <View style={styles.container}>
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
  name: { flex: 1, fontSize: 24, fontWeight: "700", color: colors.text },
  content: { padding: spacing.md, gap: spacing.md },
  description: { fontSize: 16, lineHeight: 24, color: colors.text },
  video: {
    width: "100%",
    aspectRatio: 16 / 9,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: colors.subtle,
  },
  webview: { width: "100%", height: "100%" },
});
