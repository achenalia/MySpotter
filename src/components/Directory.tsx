import { Href, useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, spacing } from "@/constants/theme";

export type DirectoryItem = {
  label: string;
  href: Href;
};

type DirectoryProps = {
  items: DirectoryItem[];
};

export function Directory({ items }: DirectoryProps) {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {items.map((item, index) => (
        <Pressable
          key={item.label}
          onPress={() => router.push(item.href)}
          style={({ pressed }) => [
            styles.row,
            index < items.length - 1 && styles.divider,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.label}>{item.label}</Text>
          <Text style={styles.chevron}>›</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  divider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#d4d4d8",
  },
  pressed: { opacity: 0.6 },
  label: { fontSize: 16, color: colors.text },
  chevron: { fontSize: 22, color: "#a1a1aa" },
});