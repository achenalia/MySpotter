import { router } from "expo-router";
import { useState } from "react";
import {
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, spacing } from "@/constants/theme";

const palette = {
  background: colors.background,
  surface: colors.panel,
  surfaceAlt: colors.surfaceAlt,
  sage: colors.surface,
  sageDark: colors.primary,
  ink: colors.text,
  muted: colors.muted,
  border: colors.border,
};

const sections = [
  {
    key: "prepare",
    icon: "⏱",
    title: "Prepare",
    takeaway: "Warm up first and build up gradually so activity feels manageable and safer.",
    tips: [
      {
        text: "Start with a 5–10 minute warm-up and an easy pace before harder movement.",
        source: {
          org: "NHS",
          title: "How to warm up before exercising",
          url: "https://www.nhs.uk/live-well/exercise/how-to-warm-up-before-exercising/",
        },
      },
      {
        text: "Increase only one variable at a time: time, intensity, or frequency.",
        source: {
          org: "NHS",
          title: "Physical activity guidelines for adults aged 19 to 64",
          url: "https://www.nhs.uk/live-well/exercise/physical-activity-guidelines-for-adults-aged-19-to-64/",
        },
      },
      {
        text: "Use equipment as directed and keep the space clear before you begin.",
        source: {
          org: "Johns Hopkins Medicine",
          title: "Exercise Safety",
          url: "https://www.hopkinsmedicine.org/health/wellness-and-prevention/exercise-safety",
        },
      },
    ],
    evidence: [
      {
        organization: "NHS",
        title: "How to warm up before exercising",
        url: "https://www.nhs.uk/live-well/exercise/how-to-warm-up-before-exercising/",
        date: "Page last reviewed: 24 June 2026",
        quote:
          "Warm up properly before exercising to prevent injury and make your workouts more effective.",
      },
      {
        organization: "NHS",
        title: "Physical activity guidelines for adults aged 19 to 64",
        url: "https://www.nhs.uk/live-well/exercise/physical-activity-guidelines-for-adults-aged-19-to-64/",
        date: "Page last reviewed: 22 May 2024",
        quote:
          "Adults should do some type of physical activity every day. Exercise just once or twice a week can reduce the risk of heart disease or stroke.",
      },
    ],
  },
  {
    key: "pause",
    icon: "⚠",
    title: "Pause",
    takeaway: "Stop and rest when something feels wrong; pain or dizziness is a signal to back off.",
    tips: [
      {
        text: "Stop if you feel sharp pain, dizziness, unusual shortness of breath, or chest discomfort.",
        source: {
          org: "Johns Hopkins Medicine",
          title: "Exercise Safety",
          url: "https://www.hopkinsmedicine.org/health/wellness-and-prevention/exercise-safety",
        },
      },
      {
        text: "Take a break, lower the intensity, and recover before starting again.",
        source: {
          org: "NHS",
          title: "How to stretch after exercising",
          url: "https://www.nhs.uk/live-well/exercise/how-to-stretch-after-exercising/",
        },
      },
      {
        text: "Seek urgent medical help for severe or ongoing symptoms rather than pushing through them.",
        source: {
          org: "WHO",
          title: "Physical activity fact sheet",
          url: "https://www.who.int/news-room/fact-sheets/detail/physical-activity",
        },
      },
    ],
    evidence: [
      {
        organization: "Johns Hopkins Medicine",
        title: "Exercise Safety",
        url: "https://www.hopkinsmedicine.org/health/wellness-and-prevention/exercise-safety",
        date: "Overview page",
        quote:
          "To promote safety during physical activity, health experts usually suggest moderation and regularity. Taking time to warm up and cool down allows the body to transition in and out of periods of activity safely.",
      },
      {
        organization: "WHO",
        title: "Physical activity fact sheet",
        url: "https://www.who.int/news-room/fact-sheets/detail/physical-activity",
        date: "Published 26 June 2024",
        quote:
          "Regular physical activity provides significant physical and mental health benefits. Physical inactivity is one of the leading risk factors for noncommunicable diseases mortality.",
      },
    ],
  },
  {
    key: "help",
    icon: "✚",
    title: "Get help",
    takeaway: "If you have injuries, a medical condition, or anything uncertain, ask a qualified health professional first.",
    tips: [
      {
        text: "Check with a clinician before starting a new routine if you have a chronic condition or recent injury.",
        source: {
          org: "Johns Hopkins Medicine",
          title: "Exercise Safety",
          url: "https://www.hopkinsmedicine.org/health/wellness-and-prevention/exercise-safety",
        },
      },
      {
        text: "If you are pregnant or have a condition that affects movement, adapt the exercise plan and ask for guidance.",
        source: {
          org: "NHS",
          title: "How to stretch after exercising",
          url: "https://www.nhs.uk/live-well/exercise/how-to-stretch-after-exercising/",
        },
      },
      {
        text: "A healthcare professional can help you choose an appropriate start point and pace.",
        source: {
          org: "NHS",
          title: "Physical activity guidelines for adults aged 19 to 64",
          url: "https://www.nhs.uk/live-well/exercise/physical-activity-guidelines-for-adults-aged-19-to-64/",
        },
      },
    ],
    evidence: [
      {
        organization: "Johns Hopkins Medicine",
        title: "Exercise Safety",
        url: "https://www.hopkinsmedicine.org/health/wellness-and-prevention/exercise-safety",
        date: "Overview page",
        quote:
          "Before starting an exercise routine, especially a potentially strenuous one, be sure to consult a health care professional for approval and safety guidelines.",
      },
      {
        organization: "NHS",
        title: "How to stretch after exercising",
        url: "https://www.nhs.uk/live-well/exercise/how-to-stretch-after-exercising/",
        date: "Page last reviewed: 16 March 2026",
        quote:
          "If you have an injury, medical condition or you’re pregnant, you may need to make changes to some stretches. Talk to a physiotherapist or healthcare professional about which ones are right for you.",
      },
    ],
  },
];

function SourceLink({ label, url }: { label: string; url: string }) {
  return (
    <Pressable onPress={() => Linking.openURL(url)}>
      <Text style={styles.linkText}>{label}</Text>
    </Pressable>
  );
}

function SafetyCard({
  section,
  expanded,
  onToggle,
}: {
  section: (typeof sections)[number];
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <View style={styles.card}>
      <Pressable onPress={onToggle} style={styles.cardHeader}>
        <View style={styles.iconBubble}>
          <Text style={styles.iconText}>{section.icon}</Text>
        </View>
        <View style={styles.headerTextWrap}>
          <Text style={styles.cardTitle}>{section.title}</Text>
          <Text style={styles.takeaway}>{section.takeaway}</Text>
        </View>
        <Text style={styles.chevron}>{expanded ? "−" : "+"}</Text>
      </Pressable>

      <View style={styles.tipList}>
        {section.tips.map((tip) => (
          <View key={`${section.key}-${tip.text}`} style={styles.tipRow}>
            <View style={styles.bullet} />
            <View style={styles.tipTextWrap}>
              <Text style={styles.tipText}>{tip.text}</Text>
              <SourceLink
                label={`Source: ${tip.source.org} — ${tip.source.title}`}
                url={tip.source.url}
              />
            </View>
          </View>
        ))}
      </View>

      {expanded && (
        <View style={styles.evidenceBlock}>
          <Text style={styles.evidenceTitle}>Evidence and sources</Text>
          {section.evidence.map((item) => (
            <View key={`${item.organization}-${item.title}`} style={styles.evidenceItem}>
              <Text style={styles.evidenceMeta}>
                {item.organization} — {item.title}
              </Text>
              <Text style={styles.evidenceDate}>{item.date}</Text>
              <Text style={styles.evidenceQuote}>“{item.quote}”</Text>
              <SourceLink label="Open source" url={item.url} />
            </View>
          ))}
          <Text style={styles.checkedNote}>Date checked: 2026-10-09</Text>
        </View>
      )}
    </View>
  );
}

export default function Safety() {
  const [expandedKey, setExpandedKey] = useState<string>("prepare");

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} style={styles.backButton} accessibilityRole="button">
            <Text style={styles.backButtonText}>← Back</Text>
          </Pressable>
        </View>
        <Text accessibilityRole="header" style={styles.heading}>
          Safety
        </Text>
        <Text style={styles.generalNote}>
          Sources checked on 2026-10-09. This is general information and not personal medical advice.
        </Text>

        <View style={styles.diagramCard}>
          <Text style={styles.diagramTitle}>Quick safety check</Text>
          <View style={styles.diagramRow}>
            <View style={styles.diagramItem}>
              <Text style={styles.diagramIcon}>⏱</Text>
              <Text style={styles.diagramLabel}>Prepare</Text>
            </View>
            <Text style={styles.arrow}>→</Text>
            <View style={styles.diagramItem}>
              <Text style={styles.diagramIcon}>⚠</Text>
              <Text style={styles.diagramLabel}>Pause</Text>
            </View>
            <Text style={styles.arrow}>→</Text>
            <View style={styles.diagramItem}>
              <Text style={styles.diagramIcon}>✚</Text>
              <Text style={styles.diagramLabel}>Get help</Text>
            </View>
          </View>
        </View>

        {sections.map((section) => (
          <SafetyCard
            key={section.key}
            section={section}
            expanded={expandedKey === section.key}
            onToggle={() =>
              setExpandedKey((current) =>
                current === section.key ? "" : section.key
              )
            }
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: palette.background,
  },
  content: {
    padding: spacing.md,
    gap: spacing.md,
    maxWidth: 920,
    width: "100%",
    alignSelf: "center",
  },
  heading: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: "800",
    color: palette.ink,
    marginTop: spacing.sm,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  generalNote: {
    fontSize: 14,
    lineHeight: 20,
    color: palette.muted,
    backgroundColor: palette.surfaceAlt,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: palette.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  diagramCard: {
    backgroundColor: palette.surface,
    borderRadius: 20,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: palette.border,
    shadowColor: colors.black,
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  diagramTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: palette.ink,
    marginBottom: spacing.sm,
  },
  diagramRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    justifyContent: "space-between",
    flexWrap: "wrap",
  },
  diagramItem: {
    alignItems: "center",
    minWidth: 90,
    flex: 1,
    backgroundColor: palette.surfaceAlt,
    borderRadius: 14,
    paddingVertical: spacing.sm,
  },
  diagramIcon: {
    fontSize: 24,
  },
  diagramLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: palette.ink,
    marginTop: 4,
  },
  arrow: {
    fontSize: 22,
    color: palette.sageDark,
    fontWeight: "700",
  },
  card: {
    backgroundColor: palette.surface,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: palette.border,
    padding: spacing.md,
    gap: spacing.sm,
    shadowColor: colors.black,
    shadowOpacity: 0.03,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  iconBubble: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: palette.sage,
    alignItems: "center",
    justifyContent: "center",
  },
  iconText: {
    fontSize: 24,
    color: palette.sageDark,
  },
  headerTextWrap: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: palette.ink,
  },
  takeaway: {
    fontSize: 15,
    lineHeight: 22,
    color: palette.muted,
    marginTop: 4,
  },
  chevron: {
    fontSize: 28,
    color: palette.sageDark,
    fontWeight: "700",
  },
  tipList: {
    gap: spacing.sm,
  },
  tipRow: {
    flexDirection: "row",
    gap: spacing.sm,
    alignItems: "flex-start",
  },
  bullet: {
    width: 8,
    height: 8,
    borderRadius: 99,
    backgroundColor: palette.sageDark,
    marginTop: 8,
  },
  tipTextWrap: {
    flex: 1,
    gap: 4,
  },
  tipText: {
    fontSize: 15,
    lineHeight: 22,
    color: palette.ink,
  },
  linkText: {
    fontSize: 13,
    lineHeight: 18,
    color: palette.sageDark,
    textDecorationLine: "underline",
  },
  evidenceBlock: {
    backgroundColor: palette.surfaceAlt,
    borderRadius: 16,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: palette.border,
    gap: spacing.sm,
  },
  evidenceTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: palette.ink,
  },
  evidenceItem: {
    gap: 4,
  },
  evidenceMeta: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "700",
    color: palette.sageDark,
  },
  evidenceDate: {
    fontSize: 12,
    lineHeight: 18,
    color: palette.muted,
  },
  evidenceQuote: {
    fontSize: 14,
    lineHeight: 20,
    color: palette.ink,
    fontStyle: "italic",
  },
  checkedNote: {
    fontSize: 12,
    lineHeight: 18,
    color: palette.muted,
    marginTop: 4,
  },
  backButton: {
    alignSelf: "flex-start",
    backgroundColor: palette.surface,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: palette.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  backButtonText: {
    fontSize: 16,
    color: palette.sageDark,
    fontWeight: "700",
  },
});