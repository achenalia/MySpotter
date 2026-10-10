import { Image } from "expo-image";
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
import { getRandomAffirmation } from "@/data/affirmations";
import {
  CATEGORIES,
  DIFFICULTIES,
  SPECIALTIES,
  exercises,
  pathways,
  type Category,
  type Difficulty,
  type Specialty,
} from "@/data/content";

const logo = require("@/constants/MySpotter_Logo.png");
const TITLE_SIZE = 24;
// Lines the affirmation up with the Browse column (sidebar width minus the bar's padding).
const BRAND_WIDTH = 240 - spacing.md;
const TILE_SIZE = 300;
const TILE_MAX_TAGS = 3;

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
  categories?: Category[];
  difficulty?: Difficulty;
  specialties?: Specialty[];
  onPress: () => void;
};

function ContentCard({
  title,
  subtitle,
  typeLabel,
  categories = [],
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
      <Text style={styles.cardTitle} numberOfLines={2}>
        {title}
      </Text>
      <View style={styles.cardTags}>
        <Tags
          categories={categories}
          difficulty={difficulty}
          specialties={specialties}
          max={TILE_MAX_TAGS}
        />
      </View>
    </Pressable>
  );
}

export default function Home() {
  // Picked once per load; edit the list in src/data/affirmations.json.
  const [affirmation] = useState(getRandomAffirmation);
  const [search, setSearch] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | null>(null);
  const [selectedSpecialties, setSelectedSpecialties] = useState<Specialty[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);

  const toggleSpecialty = (tag: Specialty) => {
    setSelectedSpecialties((current) =>
      current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag]
    );
  };

  const toggleCategory = (category: Category) => {
    setSelectedCategories((current) =>
      current.includes(category)
        ? current.filter((item) => item !== category)
        : [...current, category]
    );
  };

  const matchesCategory = (category?: Category) =>
    selectedCategories.length === 0 || (!!category && selectedCategories.includes(category));

  // A pathway's categories come from its exercises; it matches if any of them is selected.
  const pathwayMatchesCategory = (categories: Category[]) =>
    selectedCategories.length === 0 ||
    categories.some((category) => selectedCategories.includes(category));

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
      return (
        matchesSearch &&
        matchesSelectedTags(pathway) &&
        pathwayMatchesCategory(pathway.categories)
      );
    });
  }, [search, selectedDifficulty, selectedSpecialties, selectedCategories]);

  const filteredExercises = useMemo(() => {
    const query = search.trim().toLowerCase();
    return exercises.filter((exercise) => {
      const searchable = `${exercise.name} ${exercise.description}`.toLowerCase();
      const matchesSearch = !query || searchable.includes(query);
      return matchesSearch && matchesSelectedTags(exercise) && matchesCategory(exercise.category);
    });
  }, [search, selectedDifficulty, selectedSpecialties, selectedCategories]);

  const clearFilters = () => {
    setSearch("");
    setSelectedDifficulty(null);
    setSelectedSpecialties([]);
    setSelectedCategories([]);
  };

  const hasFilters = Boolean(
    search.trim() || selectedDifficulty || selectedSpecialties.length || selectedCategories.length
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.page}>
        <View style={styles.topBar}>
          <View style={styles.brand}>
            <Image source={logo} style={styles.logo} contentFit="contain" accessible={false} />
            <Text style={styles.title}>MySpotter</Text>
          </View>
          {affirmation ? <Text style={styles.affirmationText}>{affirmation}</Text> : null}
        </View>

        <View style={styles.shell}>
          <View style={styles.sidebar}>
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search pathways or exercises."
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
              <Text style={styles.sectionTitle}>Category</Text>
              <View style={styles.filterList}>
                {CATEGORIES.map((category) => (
                  <FilterTag
                    key={category}
                    label={category}
                    selected={selectedCategories.includes(category)}
                    onPress={() => toggleCategory(category)}
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

            {hasFilters ? (
              <Pressable onPress={clearFilters} style={styles.clearButton}>
                <Text style={styles.clearButtonText}>Clear filters</Text>
              </Pressable>
            ) : null}

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
                style={styles.quickActionButton}
                accessibilityRole="button"
              >
                <Text style={styles.quickActionText}>Safety</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  // TODO: hook up import.
                }}
                style={styles.quickActionButton}
                accessibilityRole="button"
              >
                <Text style={styles.quickActionText}>Import</Text>
              </Pressable>
            </View>
          </View>

          <ScrollView style={styles.contentArea} contentContainerStyle={styles.contentAreaInner}>
            <Text style={styles.heading}>Browse</Text>

            {filteredPathways.length > 0 ? (
              <View style={styles.group}>
                <Text style={styles.groupTitle}>Pathways</Text>
                <View style={styles.grid}>
                  {filteredPathways.map((pathway) => (
                    <ContentCard
                      key={pathway.id}
                      title={pathway.name}
                      subtitle={`${pathway.days} ${pathway.days === 1 ? "day" : "days"}`}
                      typeLabel="Pathway"
                      categories={pathway.categories}
                      difficulty={pathway.difficulty}
                      specialties={pathway.specialties}
                      onPress={() => router.push({ pathname: "/pathway/[id]", params: { id: pathway.id } })}
                    />
                  ))}
                </View>
              </View>
            ) : null}

            {filteredExercises.length > 0 ? (
              <View style={styles.group}>
                <Text style={styles.groupTitle}>Exercises</Text>
                <View style={styles.grid}>
                  {filteredExercises.map((exercise) => (
                    <ContentCard
                      key={exercise.id}
                      title={exercise.name}
                      subtitle="Bodyweight"
                      typeLabel="Exercise"
                      categories={exercise.category ? [exercise.category] : []}
                      difficulty={exercise.difficulty}
                      specialties={exercise.specialties}
                      onPress={() => router.push({ pathname: "/exercise/[id]", params: { id: exercise.id } })}
                    />
                  ))}
                </View>
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
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  page: {
    flex: 1,
    padding: spacing.md,
    gap: spacing.md,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: 6,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  brand: {
    width: BRAND_WIDTH,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  logo: {
    // 1.5× the title text height.
    width: TITLE_SIZE * 1.5,
    height: TITLE_SIZE * 1.5,
  },
  affirmationText: {
    flex: 1,
    fontSize: 16,
    fontStyle: "italic",
    fontWeight: "600",
    textAlign: "center",
    color: colors.background,
  },
  shell: {
    flex: 1,
    flexDirection: "row",
    gap: spacing.md,
  },
  sidebar: {
    width: 240,
    backgroundColor: colors.surface,
    // borderRadius: 2,
    padding: spacing.md,
    gap: spacing.md,
    shadowColor: colors.black,
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  title: {
    fontSize: TITLE_SIZE,
    lineHeight: TITLE_SIZE,
    fontWeight: "800",
    color: colors.background,
  },
  searchInput: {
    backgroundColor: colors.panel,
    borderRadius: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 12,
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
    // Same colors as the unselected filter chips.
    backgroundColor: colors.overlaySoft,
    borderWidth: 1,
    borderColor: colors.overlayStrong,
    borderRadius: 12,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    alignItems: "center",
  },
  quickActionText: {
    color: colors.text,
    fontWeight: "700",
  },
  clearButton: {
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
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  card: {
    width: TILE_SIZE,
    height: TILE_SIZE,
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
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
  },
  // Pins the tags to the bottom of the tile.
  cardTags: {
    marginTop: "auto",
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