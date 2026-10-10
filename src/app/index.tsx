import { router } from "expo-router";
import { useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Tags } from "@/components/Tags";
import { colors, spacing } from "@/constants/theme";
import {
  DIFFICULTIES,
  SPECIALTIES,
  exercises,
  pathways,
  type Difficulty,
  type Specialty,
} from "@/data/content";

type FilterTagProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
};

function FilterTag({ label, selected, onPress }: FilterTagProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.filterTag, selected && styles.filterTagSelected]}
      accessibilityRole="button"
      accessibilityState={{ selected }}
    >
      <Text style={[styles.filterTagText, selected && styles.filterTagTextSelected]}>{label}</Text>
    </Pressable>
  );
}

type ContentCardProps = {
  title: string;
  subtitle: string;
  typeLabel: string;
  difficulty?: Difficulty;
  specialties?: Specialty[];
  onPress: () => void;
};

function ContentCard({
  title,
  subtitle,
  typeLabel,
  difficulty,
  specialties = [],
  onPress,
}: ContentCardProps) {
  return (
    <Pressable onPress={onPress} style={styles.card} accessibilityRole="button">
      <View style={styles.cardHeader}>
        <Text style={styles.cardType}>{typeLabel}</Text>
        <Text style={styles.cardMeta}>{subtitle}</Text>
      </View>
      <Text style={styles.cardTitle}>{title}</Text>
      <Tags difficulty={difficulty} specialties={specialties} />
    </Pressable>
  );
}

export default function Home() {
  const [search, setSearch] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | null>(null);
  const [selectedSpecialties, setSelectedSpecialties] = useState<Specialty[]>([]);

  const toggleSpecialty = (tag: Specialty) => {
    setSelectedSpecialties((current) =>
      current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag]
    );
  };

  const matchesSelectedTags = (item: { difficulty?: Difficulty; specialties: Specialty[] }) => {
    const matchesDifficulty = !selectedDifficulty || item.difficulty === selectedDifficulty;
    const matchesSpecialty =
      selectedSpecialties.length === 0 ||
      item.specialties.some((specialty) => selectedSpecialties.includes(specialty));

    return matchesDifficulty && matchesSpecialty;
  };

  const filteredPathways = useMemo(() => {
    const query = search.trim().toLowerCase();
    return pathways.filter((pathway) => {
      const searchable = `${pathway.name} ${pathway.description}`.toLowerCase();
      const matchesSearch = !query || searchable.includes(query);
      return matchesSearch && matchesSelectedTags(pathway);
    });
  }, [search, selectedDifficulty, selectedSpecialties]);

  const filteredExercises = useMemo(() => {
    const query = search.trim().toLowerCase();
    return exercises.filter((exercise) => {
      const searchable = `${exercise.name} ${exercise.description}`.toLowerCase();
      const matchesSearch = !query || searchable.includes(query);
      return matchesSearch && matchesSelectedTags(exercise);
    });
  }, [search, selectedDifficulty, selectedSpecialties]);

  const clearFilters = () => {
    setSearch("");
    setSelectedDifficulty(null);
    setSelectedSpecialties([]);
  };

  const hasFilters = Boolean(search.trim() || selectedDifficulty || selectedSpecialties.length);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.shell}>
        <View style={styles.sidebar}>
          <Text style={styles.title}>Find your rhythm</Text>

          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search pathways or exercises"
            placeholderTextColor={colors.placeholder}
            style={styles.searchInput}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <View style={styles.filterSection}>
            <Text style={styles.sectionTitle}>Difficulty</Text>
            <View style={styles.filterList}>
              <FilterTag
                label="All"
                selected={!selectedDifficulty}
                onPress={() => setSelectedDifficulty(null)}
              />
              {DIFFICULTIES.map((level) => (
                <FilterTag
                  key={level}
                  label={level}
                  selected={selectedDifficulty === level}
                  onPress={() =>
                    setSelectedDifficulty((current) => (current === level ? null : level))
                  }
                />
              ))}
            </View>
          </View>

          <View style={styles.filterSection}>
            <Text style={styles.sectionTitle}>Focus</Text>
            <View style={styles.filterList}>
              {SPECIALTIES.map((tag) => (
                <FilterTag
                  key={tag}
                  label={tag}
                  selected={selectedSpecialties.includes(tag)}
                  onPress={() => toggleSpecialty(tag)}
                />
              ))}
            </View>
          </View>

          <View style={styles.quickActions}>
            <Pressable
              onPress={() => router.push("/pose")}
              style={styles.quickActionButton}
              accessibilityRole="button"
            >
              <Text style={styles.quickActionText}>Open Pose</Text>
            </Pressable>
            <Pressable
              onPress={() => router.push("/safety")}
              style={[styles.quickActionButton, styles.quickActionSecondary]}
              accessibilityRole="button"
            >
              <Text style={styles.quickActionText}>Safety</Text>
            </Pressable>
          </View>

          {hasFilters ? (
            <Pressable onPress={clearFilters} style={styles.clearButton}>
              <Text style={styles.clearButtonText}>Clear filters</Text>
            </Pressable>
          ) : null}
        </View>

        <ScrollView style={styles.contentArea} contentContainerStyle={styles.contentAreaInner}>
          <Text style={styles.heading}>Browse</Text>

          {filteredPathways.length > 0 ? (
            <View style={styles.group}>
              <Text style={styles.groupTitle}>Pathways</Text>
              {filteredPathways.map((pathway) => (
                <ContentCard
                  key={pathway.id}
                  title={pathway.name}
                  subtitle={`${pathway.days} ${pathway.days === 1 ? "day" : "days"}`}
                  typeLabel="Pathway"
                  difficulty={pathway.difficulty}
                  specialties={pathway.specialties}
                  onPress={() => router.push({ pathname: "/pathway/[id]", params: { id: pathway.id } })}
                />
              ))}
            </View>
          ) : null}

          {filteredExercises.length > 0 ? (
            <View style={styles.group}>
              <Text style={styles.groupTitle}>Exercises</Text>
              {filteredExercises.map((exercise) => (
                <ContentCard
                  key={exercise.id}
                  title={exercise.name}
                  subtitle="Bodyweight"
                  typeLabel="Exercise"
                  difficulty={exercise.difficulty}
                  specialties={exercise.specialties}
                  onPress={() => router.push({ pathname: "/exercise/[id]", params: { id: exercise.id } })}
                />
              ))}
            </View>
          ) : null}

          {!filteredPathways.length && !filteredExercises.length ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No results match your filters.</Text>
              <Text style={styles.emptyText}>Try adjusting the search or clearing a tag.</Text>
            </View>
          ) : null}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  shell: {
    flex: 1,
    flexDirection: "row",
    padding: spacing.md,
    gap: spacing.md,
  },
  sidebar: {
    width: 240,
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: spacing.md,
    gap: spacing.md,
    shadowColor: colors.black,
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.text,
  },
  searchInput: {
    backgroundColor: colors.panel,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 14,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.outline,
  },
  filterSection: {
    gap: spacing.sm,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: colors.primary,
  },
  filterList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm / 2,
  },
  filterTag: {
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.overlaySoft,
    borderWidth: 1,
    borderColor: colors.overlayStrong,
  },
  filterTagSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterTagText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "600",
  },
  filterTagTextSelected: {
    color: colors.primaryText,
  },
  quickActions: {
    marginTop: "auto",
    gap: spacing.sm,
  },
  quickActionButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    alignItems: "center",
  },
  quickActionSecondary: {
    backgroundColor: colors.overlayStrong,
  },
  quickActionText: {
    color: colors.primaryText,
    fontWeight: "700",
  },
  clearButton: {
    marginTop: "auto",
    backgroundColor: colors.overlay,
    borderRadius: 12,
    paddingVertical: spacing.sm,
    alignItems: "center",
  },
  clearButtonText: {
    color: colors.text,
    fontWeight: "700",
  },
  contentArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentAreaInner: {
    paddingBottom: spacing.lg,
    gap: spacing.md,
  },
  heading: {
    fontSize: 30,
    fontWeight: "800",
    color: colors.text,
    paddingTop: spacing.sm,
  },
  group: {
    gap: spacing.sm,
  },
  groupTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
    marginBottom: spacing.xs,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: spacing.md,
    gap: spacing.sm,
    shadowColor: colors.black,
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.sm,
  },
  cardType: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.9,
    color: colors.primary,
    textTransform: "uppercase",
  },
  cardMeta: {
    fontSize: 12,
    color: colors.text,
    opacity: 0.7,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
  },
  emptyState: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: spacing.md,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 180,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
  },
  emptyText: {
    color: colors.text,
    opacity: 0.7,
    marginTop: spacing.sm,
    textAlign: "center",
  },
});