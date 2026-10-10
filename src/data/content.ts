// Loads exercises and pathways from content.json. Only `name` is required;
// every other field falls back to a blank placeholder. Ids are generated from
// names ("Push-Up" -> "push-up"), and pathway schedules list exercise names,
// with "rest" for rest days. Tags must be one of the options below.
import content from "./content.json";

export const DIFFICULTIES = ["Beginner", "Intermediate", "Advanced"] as const;
export const SPECIALTIES = ["For Seniors", "For Injury Recovery"] as const;
export const CATEGORIES = ["Balance", "Strength", "Flexibility", "Mobility", "Cardio"] as const;

export const DEFAULT_SAFETY =
  "Move slowly and stay in control. Stop right away if you feel sharp pain, dizziness or shortness of breath. If you have an injury or medical condition, check with a healthcare professional before starting.";

export type Difficulty = (typeof DIFFICULTIES)[number];
export type Specialty = (typeof SPECIALTIES)[number];
export type Category = (typeof CATEGORIES)[number];

export type Source = { title: string; url: string };

export type Exercise = {
  id: string;
  name: string;
  category?: Category;
  description: string;
  /** Items needed. Empty means bodyweight only. */
  equipment: string[];
  /** Steps, in order. */
  instructions: string[];
  /** Link to a video, opened in the browser. Blank if the exercise has no video. */
  videoUrl: string;
  /** Text for the video link. Blank means the default "▶ Watch video". */
  videoLabel: string;
  sources: Source[];
  /** Shown on the safety pop-up before starting. Falls back to DEFAULT_SAFETY if blank. */
  safety: string;
  difficulty?: Difficulty;
  specialties: Specialty[];
};

export type Pathway = {
  id: string;
  name: string;
  description: string;
  /** Total length in days, taken from the schedule. */
  days: number;
  /** The pathway's own difficulty, or else its hardest exercise's. */
  difficulty?: Difficulty;
  /** Every category among its exercises. */
  categories: Category[];
  /** Its own specialties, plus any that every one of its exercises has. */
  specialties: Specialty[];
  /** Exercise id for each day. Undefined means a rest day. */
  exerciseIds: (string | undefined)[];
};

type RawEntry = Record<string, unknown>;

function toId(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function text(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function warn(message: string) {
  if (__DEV__) console.warn(`[content.json] ${message}`);
}

function hasName(entry: RawEntry, kind: string, index: number): entry is RawEntry & { name: string } {
  if (typeof entry.name === "string" && entry.name.trim()) return true;
  warn(`${kind} #${index + 1} has no name and was skipped.`);
  return false;
}

function matchOption<T extends string>(options: readonly T[], value: string): T | undefined {
  const wanted = value.trim().toLowerCase();
  return options.find((option) => option.toLowerCase() === wanted);
}

function difficultyTag(value: unknown, owner: string): Difficulty | undefined {
  const raw = text(value);
  if (!raw.trim()) return undefined;
  const match = matchOption(DIFFICULTIES, raw);
  if (!match) {
    warn(`${owner}: "${raw}" is not a difficulty (use ${DIFFICULTIES.join(", ")}).`);
  }
  return match;
}

function categoryTag(value: unknown, owner: string): Category | undefined {
  const raw = text(value);
  if (!raw.trim()) return undefined;
  const match = matchOption(CATEGORIES, raw);
  if (!match) {
    warn(`${owner}: "${raw}" is not a category (use ${CATEGORIES.join(", ")}).`);
  }
  return match;
}

/** A list of text items; a single string counts as a one-item list. Blanks are dropped. */
function textList(value: unknown): string[] {
  const raw = Array.isArray(value) ? value : [value];
  return raw.map((item) => text(item).trim()).filter(Boolean);
}

function sourceList(value: unknown, owner: string): Source[] {
  const raw = Array.isArray(value) ? value : value === undefined ? [] : [value];
  const sources: Source[] = [];
  for (const item of raw) {
    const entry = typeof item === "string" ? { url: item } : ((item ?? {}) as RawEntry);
    const url = text(entry.url).trim();
    if (!/^https?:\/\//.test(url)) {
      warn(`${owner}: source ${JSON.stringify(item)} needs a "url" starting with http:// or https://.`);
      continue;
    }
    sources.push({ title: text(entry.title).trim() || url, url });
  }
  return sources;
}

function specialtyTags(value: unknown, owner: string): Specialty[] {
  const raw = Array.isArray(value) ? value : value === undefined ? [] : [value];
  const found = new Set<Specialty>();
  for (const item of raw) {
    const match = matchOption(SPECIALTIES, text(item));
    if (match) found.add(match);
    else warn(`${owner}: "${String(item)}" is not a specialty (use ${SPECIALTIES.join(", ")}).`);
  }
  return SPECIALTIES.filter((specialty) => found.has(specialty));
}

function dedupe<T extends { id: string; name: string }>(items: T[], kind: string): T[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.id)) {
      warn(`Duplicate ${kind} "${item.name}" was skipped.`);
      return false;
    }
    seen.add(item.id);
    return true;
  });
}

const rawExercises = (content.exercises ?? []) as RawEntry[];
const rawPathways = (content.pathways ?? []) as RawEntry[];

export const exercises: Exercise[] = dedupe(
  rawExercises
    .filter((entry, i) => hasName(entry, "Exercise", i))
    .map((entry) => {
      const name = entry.name.trim();
      const owner = `Exercise "${name}"`;
      return {
        id: toId(name),
        name,
        category: categoryTag(entry.category, owner),
        description: text(entry.description),
        equipment: textList(entry.equipment),
        instructions: textList(entry.instructions),
        videoUrl: text(entry.videoUrl),
        videoLabel: text(entry.videoLabel).trim(),
        sources: sourceList(entry.sources, owner),
        safety: text(entry.safety).trim() || DEFAULT_SAFETY,
        difficulty: difficultyTag(entry.difficulty, owner),
        specialties: specialtyTags(entry.specialties, owner),
      };
    }),
  "exercise"
);

const exerciseIds = new Set(exercises.map((exercise) => exercise.id));
const exercisesById = new Map(exercises.map((exercise) => [exercise.id, exercise]));

/** Tags a pathway picks up from the exercises in its schedule. */
function tagsFromExercises(ids: (string | undefined)[]) {
  const included = [...new Set(ids)]
    .map((id) => (id ? exercisesById.get(id) : undefined))
    .filter((exercise): exercise is Exercise => !!exercise);

  const categories = CATEGORIES.filter((category) =>
    included.some((exercise) => exercise.category === category)
  );
  const sharedSpecialties = SPECIALTIES.filter(
    (specialty) =>
      included.length > 0 && included.every((exercise) => exercise.specialties.includes(specialty))
  );
  const hardest = [...DIFFICULTIES]
    .reverse()
    .find((level) => included.some((exercise) => exercise.difficulty === level));

  return { categories, sharedSpecialties, hardest };
}

export const pathways: Pathway[] = dedupe(
  rawPathways
    .filter((entry, i) => hasName(entry, "Pathway", i))
    .map((entry) => {
      const name = entry.name.trim();
      const schedule = Array.isArray(entry.schedule) ? entry.schedule : [];
      const ids = schedule.map((day, i) => {
        const dayName = text(day).trim();
        if (!dayName || dayName.toLowerCase() === "rest") return undefined;
        const id = toId(dayName);
        if (!exerciseIds.has(id)) {
          warn(`Pathway "${name}" day ${i + 1}: no exercise named "${dayName}".`);
        }
        return id;
      });
      const owner = `Pathway "${name}"`;
      const fromExercises = tagsFromExercises(ids);
      const ownSpecialties = specialtyTags(entry.specialties, owner);
      return {
        id: toId(name),
        name,
        description: text(entry.description),
        days: ids.length,
        difficulty: difficultyTag(entry.difficulty, owner) ?? fromExercises.hardest,
        categories: fromExercises.categories,
        specialties: SPECIALTIES.filter(
          (specialty) =>
            ownSpecialties.includes(specialty) || fromExercises.sharedSpecialties.includes(specialty)
        ),
        exerciseIds: ids,
      };
    }),
  "pathway"
);

export function getExercise(id: string): Exercise | undefined {
  return exercises.find((exercise) => exercise.id === id);
}

export function getPathway(id: string): Pathway | undefined {
  return pathways.find((pathway) => pathway.id === id);
}
