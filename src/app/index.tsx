import { Image } from "expo-image";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { RangeSlider } from "@/components/Range_Slider";
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
const TILE_MAX_TAGS = 3;
const TILE_GAP = spacing.md;
// Used for the first frame, before the Browse area has been measured.
const FALLBACK_TILE = 300;
// Tiles smaller than this get a smaller title and one fewer tag.
const COMPACT_TILE = 220;
// Below this window width the home screen switches to the stacked mobile layout.
const MOBILE_BREAKPOINT = 768;
// On mobile, tiles never get narrower than this; fewer columns are used instead.
const MIN_MOBILE_TILE = 160;
// The time filter covers 0 days up to the longest pathway.
const MAX_DAYS = Math.max(1, ...pathways.map((pathway) => pathway.days));

type SortOption = {
  key: "length" | "difficulty" | "name";
  direction: "asc" | "desc";
  label: string;
};

const SORT_OPTIONS: SortOption[] = [
  { key: "length", direction: "asc", label: "Length: shortest first" },
  { key: "length", direction: "desc", label: "Length: longest first" },
  { key: "difficulty", direction: "asc", label: "Difficulty: easiest first" },
  { key: "difficulty", direction: "desc", label: "Difficulty: hardest first" },
  { key: "name", direction: "asc", label: "A–Z" },
  { key: "name", direction: "desc", label: "Z–A" },
];

type Sortable = { name: string; difficulty?: Difficulty; days?: number };

const byName = (a: Sortable, b: Sortable) => a.name.localeCompare(b.name);

function sortItems<T extends Sortable>(items: T[], { key, direction }: SortOption): T[] {
  const sign = direction === "asc" ? 1 : -1;
  return [...items].sort((a, b) => {
    if (key === "difficulty") {
      // Items without a difficulty always go last; ties fall back to A–Z.
      if (!a.difficulty || !b.difficulty) return Number(!a.difficulty) - Number(!b.difficulty);
      const diff = DIFFICULTIES.indexOf(a.difficulty) - DIFFICULTIES.indexOf(b.difficulty);
      return diff * sign || byName(a, b);
    }
    if (key === "length" && a.days !== undefined && b.days !== undefined) {
      return (a.days - b.days) * sign || byName(a, b);
    }
    // A–Z. Exercises have no length, so length sorts order them A–Z in the same direction.
    return byName(a, b) * sign;
  });
}

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
  /** Width and height of the square tile. */
  size: number;
  onPress: () => void;
};

function ContentCard({
  title,
  subtitle,
  typeLabel,
  categories = [],
  difficulty,
  specialties = [],
  size,
  onPress,
}: ContentCardProps) {
  // Smaller tiles get a smaller title and fewer tags so everything still fits.
  const compact = size < COMPACT_TILE;
  return (
    <Pressable
      onPress={onPress}
      style={[styles.card, { width: size, height: size }]}
      accessibilityRole="button"
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardType}>{typeLabel}</Text>
        <Text style={styles.cardMeta}>{subtitle}</Text>
      </View>
      <Text style={[styles.cardTitle, compact && styles.cardTitleCompact]} numberOfLines={2}>
        {title}
      </Text>
      <View style={styles.cardTags}>
        <Tags
          categories={categories}
          difficulty={difficulty}
          specialties={specialties}
          max={compact ? TILE_MAX_TAGS - 1 : TILE_MAX_TAGS}
        />
      </View>
    </Pressable>
  );
}

export default function Home() {
  const { width: windowWidth } = useWindowDimensions();
  const isMobile = windowWidth < MOBILE_BREAKPOINT;

  // Picked once per load; edit the list in src/data/affirmations.json.
  const [affirmation] = useState(getRandomAffirmation);
  const [search, setSearch] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | null>(null);
  const [selectedSpecialties, setSelectedSpecialties] = useState<Specialty[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
  const [sort, setSort] = useState<SortOption>(SORT_OPTIONS[0]);
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const [minDays, setMinDays] = useState(0);
  const [maxDays, setMaxDays] = useState(MAX_DAYS);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [browseWidth, setBrowseWidth] = useState(0);
  // Exercises have no length, so any narrowed time range hides them.
  const timeRangeNarrowed = minDays > 0 || maxDays < MAX_DAYS;

  // Desktop always fits 4 tiles across the Browse area; phones fit as many as stay readable.
  const columns = isMobile
    ? Math.min(4, Math.max(1, Math.floor((browseWidth + TILE_GAP) / (MIN_MOBILE_TILE + TILE_GAP))))
    : 4;
  const tileSize =
    browseWidth > 0 ? Math.floor((browseWidth - TILE_GAP * (columns - 1)) / columns) : FALLBACK_TILE;

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
    // Every selected Focus tag must be present (e.g. For Seniors AND For Injury Recovery).
    const matchesSpecialty = selectedSpecialties.every((specialty) =>
      item.specialties.includes(specialty)
    );

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
        pathwayMatchesCategory(pathway.categories) &&
        pathway.days >= minDays &&
        pathway.days <= maxDays
      );
    });
  }, [search, selectedDifficulty, selectedSpecialties, selectedCategories, minDays, maxDays]);

  const filteredExercises = useMemo(() => {
    if (timeRangeNarrowed) return [];
    const query = search.trim().toLowerCase();
    return exercises.filter((exercise) => {
      const searchable = `${exercise.name} ${exercise.description}`.toLowerCase();
      const matchesSearch = !query || searchable.includes(query);
      return matchesSearch && matchesSelectedTags(exercise) && matchesCategory(exercise.category);
    });
  }, [search, selectedDifficulty, selectedSpecialties, selectedCategories, timeRangeNarrowed]);

  const clearFilters = () => {
    setSearch("");
    setSelectedDifficulty(null);
    setSelectedSpecialties([]);
    setSelectedCategories([]);
    setMinDays(0);
    setMaxDays(MAX_DAYS);
  };

  const hasFilters = Boolean(
    search.trim() ||
      selectedDifficulty ||
      selectedSpecialties.length ||
      selectedCategories.length ||
      timeRangeNarrowed
  );

  // Shown on the mobile "Filters" button.
  const activeFilterCount =
    (selectedDifficulty ? 1 : 0) +
    selectedCategories.length +
    selectedSpecialties.length +
    (timeRangeNarrowed ? 1 : 0);

  const searchBox = (
    <TextInput
      value={search}
      onChangeText={setSearch}
      placeholder="Search pathways or exercises."
      placeholderTextColor={colors.placeholder}
      style={styles.searchInput}
      autoCapitalize="none"
      autoCorrect={false}
    />
  );

  const filterSections = (
    <>
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

      <View style={styles.filterSection}>
        <Text style={styles.sectionTitle}>Time (days)</Text>
        <RangeSlider
          min={0}
          max={MAX_DAYS}
          low={minDays}
          high={maxDays}
          onChange={(low, high) => {
            setMinDays(low);
            setMaxDays(high);
          }}
        />
      </View>

      {hasFilters ? (
        <Pressable onPress={clearFilters} style={styles.clearButton}>
          <Text style={styles.clearButtonText}>Clear filters</Text>
        </Pressable>
      ) : null}
    </>
  );

  const quickButtons = (buttonStyle?: object) => (
    <>
      <Pressable
        onPress={() => router.push("/pose")}
        style={[styles.quickActionButton, buttonStyle]}
        accessibilityRole="button"
      >
        <Text style={styles.quickActionText}>Open Pose</Text>
      </Pressable>
      <Pressable
        onPress={() => router.push("/safety")}
        style={[styles.quickActionButton, buttonStyle]}
        accessibilityRole="button"
      >
        <Text style={styles.quickActionText}>Safety</Text>
      </Pressable>
      <Pressable
        onPress={() => router.push("/therapy-plan")}
        style={[styles.quickActionButton, buttonStyle]}
        accessibilityRole="button"
      >
        <Text style={styles.quickActionText}>Import</Text>
      </Pressable>
    </>
  );

  const browse = (
    <>
      <View
        style={styles.browseHeader}
        onLayout={(event) => setBrowseWidth(event.nativeEvent.layout.width)}
      >
        <Text style={styles.heading}>Browse</Text>
        <View>
          <Pressable
            onPress={() => setSortMenuOpen((open) => !open)}
            style={({ pressed }) => [styles.sortButton, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityLabel={`Sort, currently ${sort.label}`}
            accessibilityState={{ expanded: sortMenuOpen }}
          >
            <Text style={styles.sortButtonText}>
              {isMobile ? "Sort" : `Sort: ${sort.label}`} ▾
            </Text>
          </Pressable>
          {sortMenuOpen ? (
            <View style={styles.sortMenu} accessibilityRole="menu">
              {SORT_OPTIONS.map((option) => {
                const selected = option === sort;
                return (
                  <Pressable
                    key={option.label}
                    onPress={() => {
                      setSort(option);
                      setSortMenuOpen(false);
                    }}
                    style={({ pressed }) => [styles.sortOption, pressed && styles.pressed]}
                    accessibilityRole="menuitem"
                    accessibilityState={{ selected }}
                  >
                    <Text style={[styles.sortOptionText, selected && styles.sortOptionSelected]}>
                      {selected ? "✓ " : ""}
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          ) : null}
        </View>
      </View>

      {filteredPathways.length > 0 ? (
        <View style={styles.group}>
          <Text style={styles.groupTitle}>Pathways</Text>
          <View style={styles.grid}>
            {sortItems(filteredPathways, sort).map((pathway) => (
              <ContentCard
                key={pathway.id}
                title={pathway.name}
                subtitle={`${pathway.days} ${pathway.days === 1 ? "day" : "days"}`}
                typeLabel="Pathway"
                categories={pathway.categories}
                difficulty={pathway.difficulty}
                specialties={pathway.specialties}
                size={tileSize}
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
            {sortItems(filteredExercises, sort).map((exercise) => (
              <ContentCard
                key={exercise.id}
                title={exercise.name}
                subtitle="Bodyweight"
                typeLabel="Exercise"
                categories={exercise.category ? [exercise.category] : []}
                difficulty={exercise.difficulty}
                specialties={exercise.specialties}
                size={tileSize}
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
    </>
  );

  if (isMobile) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.mobilePage}>
          <View style={styles.topBarMobile}>
            <View style={styles.brandMobile}>
              <Image source={logo} style={styles.logo} contentFit="contain" accessible={false} />
              <Text style={styles.title}>MySpotter</Text>
            </View>
            {affirmation ? (
              <Text style={styles.affirmationTextMobile}>{affirmation}</Text>
            ) : null}
          </View>

          {searchBox}

          <Pressable
            onPress={() => setFiltersOpen((open) => !open)}
            style={({ pressed }) => [styles.quickActionButton, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityState={{ expanded: filtersOpen }}
          >
            <Text style={styles.quickActionText}>
              Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""} {filtersOpen ? "▴" : "▾"}
            </Text>
          </Pressable>

          {filtersOpen ? <View style={styles.filterPanelMobile}>{filterSections}</View> : null}

          <View style={styles.quickActionsMobile}>{quickButtons(styles.quickActionMobile)}</View>

          <View style={styles.contentAreaInner}>{browse}</View>
        </ScrollView>
      </SafeAreaView>
    );
  }

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
            <Text style={styles.sidebarTitle} accessibilityRole="header">
              Filters
            </Text>
            {searchBox}
            {filterSections}
            <View style={styles.quickActions}>{quickButtons()}</View>
          </View>

          <ScrollView style={styles.contentArea} contentContainerStyle={styles.contentAreaInner}>
            {browse}
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
  // Mobile layout: one scrolling column. Desktop styles above are unchanged.
  mobilePage: {
    padding: spacing.md,
    gap: spacing.md,
  },
  topBarMobile: {
    gap: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: 6,
    paddingVertical: spacing.sm + 4,
    paddingHorizontal: spacing.md,
  },
  brandMobile: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  affirmationTextMobile: {
    fontSize: 15,
    lineHeight: 21,
    fontStyle: "italic",
    fontWeight: "600",
    color: colors.background,
  },
  filterPanelMobile: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    gap: spacing.md,
  },
  quickActionsMobile: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  quickActionMobile: {
    flex: 1,
    paddingHorizontal: spacing.sm,
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
  // Raised so the sort menu draws over the tiles below it.
  browseHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
    zIndex: 10,
    elevation: 10,
  },
  sortButton: {
    backgroundColor: colors.overlaySoft,
    borderWidth: 1,
    borderColor: colors.overlayStrong,
    borderRadius: 12,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  sortButtonText: {
    color: colors.text,
    fontWeight: "700",
  },
  sortMenu: {
    position: "absolute",
    top: "100%",
    right: 0,
    marginTop: spacing.xs,
    minWidth: 230,
    backgroundColor: colors.panel,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.outline,
    paddingVertical: spacing.xs,
    shadowColor: colors.black,
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 10,
  },
  sortOption: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  sortOptionText: {
    fontSize: 14,
    color: colors.text,
  },
  sortOptionSelected: {
    fontWeight: "700",
    color: colors.primary,
  },
  pressed: { opacity: 0.6 },
  sidebarTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.text,
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
  cardTitleCompact: {
    fontSize: 16,
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