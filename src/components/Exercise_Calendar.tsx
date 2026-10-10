import { ScrollView, StyleSheet, Text, View } from "react-native";
import { ExerciseButton } from "@/components/Exercise_Button";
import { colors, spacing } from "@/constants/theme";

type ExerciseCalendarProps = {
  /** How many day rows to show. */
  rows: number;
  /** Height of the scrollable window, in points. Fills the available space if omitted. */
  height?: number;
  /** Exercise ids for each day, by row index. Days without any are left empty. */
  exerciseIds?: string[][];
  /** Shown at the top right of the calendar's header row, e.g. a toggle button. */
  headerAction?: React.ReactNode;
};

export function ExerciseCalendar({
  rows,
  height,
  exerciseIds = [],
  headerAction,
}: ExerciseCalendarProps) {
  const days = Array.from({ length: Math.max(0, rows) }, (_, i) => i);

  return (
    <View style={[styles.container, height === undefined ? styles.fill : { height }]}>
      <View style={[styles.row, styles.headerRow]}>
        <Text style={[styles.dayCell, styles.headerText]}>Day</Text>
        <Text style={[styles.exerciseCell, styles.headerText]}>Exercise</Text>
        {headerAction}
      </View>

      <ScrollView nestedScrollEnabled>
        {days.map((i) => {
          const dayExercises = exerciseIds[i] ?? [];
          return (
            <View key={i} style={[styles.row, i < rows - 1 && styles.divider]}>
              <Text style={[styles.dayCell, styles.dayText]}>{i + 1}</Text>
              <View style={styles.exerciseCell}>
                {dayExercises.length > 0 ? (
                  dayExercises.map((id, j) => <ExerciseButton key={`${id}-${j}`} id={id} />)
                ) : (
                  <Text style={styles.emptyText}>—</Text>
                )}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.surface,
    overflow: "hidden",
    backgroundColor: colors.background,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    gap: spacing.md,
  },
  fill: { flex: 1 },
  headerRow: { backgroundColor: colors.surface },
  headerText: { fontSize: 14, fontWeight: "700", color: colors.text },
  divider: { borderBottomWidth: 1, borderBottomColor: colors.surface },
  dayCell: { width: 48 },
  dayText: { fontSize: 16, fontWeight: "600", color: colors.text },
  exerciseCell: { flex: 1, gap: spacing.sm },
  emptyText: { fontSize: 16, color: colors.text, opacity: 0.4 },
});
