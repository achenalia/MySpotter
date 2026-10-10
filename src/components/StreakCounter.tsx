import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Button } from "@/components/Button";
import { colors, spacing } from "@/constants/theme";
import { checkIn, getStreak } from "@/lib/streak";

export function StreakCounter() {
  const [count, setCount] = useState(0);
  const [checkedInToday, setCheckedInToday] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStreak().then((s) => {
      setCount(s.count);
      setCheckedInToday(s.checkedInToday);
      setLoading(false);
    });
  }, []);

  const handleCheckIn = async () => {
    const result = await checkIn();
    setCount(result.count);
    setCheckedInToday(true);
  };

  if (loading) return null; // avoids flashing "0" before the saved value loads

  return (
    <View style={styles.container}>
      <Text style={styles.count}>🔥 {count}</Text>
      <Text style={styles.label}>{count === 1 ? "day streak" : "day streak"}</Text>
      {checkedInToday ? (
        <Text style={styles.done}>Done for today ✓</Text>
      ) : (
        <Button title="Check in" onPress={handleCheckIn} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.lg,
    alignItems: "center",
    gap: spacing.sm,
  },
  count: { fontSize: 48, fontWeight: "800", color: colors.text },
  label: { fontSize: 16, color: colors.text },
  done: { fontSize: 16, fontWeight: "600", color: colors.primary },
});