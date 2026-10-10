import { Image, StyleSheet, Text, View } from "react-native";
import type { TherapyPlanInstruction } from "@/data/therapyPlan";
import { colors } from "@/constants/theme";

export function PlanPicture({ instruction }: { instruction: TherapyPlanInstruction }) {
  const picture = instruction.pdfPicture;
  if (!picture) return null;
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{picture.kind === "section" ? "Exercise illustration and instructions" : "Source page - check the matching exercise"} · PDF page {picture.pageNumber}</Text>
      <Image source={{ uri: picture.uri }} accessibilityLabel={`Original PDF ${picture.kind} for ${instruction.exercise}, page ${picture.pageNumber}`} resizeMode="contain" style={{ width: "100%", aspectRatio: picture.width / picture.height }} />
    </View>
  );
}
const styles = StyleSheet.create({
  container: { padding: 8, gap: 8, borderRadius: 8, backgroundColor: colors.panel, borderWidth: 1, borderColor: colors.border },
  label: { color: colors.muted, fontSize: 13, lineHeight: 18 },
});
