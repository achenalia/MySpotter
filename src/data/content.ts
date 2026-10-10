// Loads exercises and pathways from content.json. Only `name` is required;
// every other field falls back to a blank placeholder. Ids are generated from
// names ("Push-Up" -> "push-up"), and pathway schedules list exercise names,
// with "rest" for rest days. Tags must be one of the options below.
import content from "./content.json";

export const DIFFICULTIES = ["Beginner", "Intermediate", "Advanced"] as const;
export const SPECIALTIES = ["For Seniors", "For Injury Recovery"] as const;

export type Difficulty = (typeof DIFFICULTIES)[number];
export type Specialty = (typeof SPECIALTIES)[number];

export type Exercise = {
  id: string;
  name: string;
  description: string;
  /** A YouTube link or video ID. Blank if the exercise has no video. */
  videoUrl: string;
  /** Free text, e.g. "24 Days" or "1 Month". */
  time: string;
  difficulty?: Difficulty;
  specialties: Specialty[];
};

export type Pathway = {
  id: string;
  name: string;
  description: string;
  /** Total length in days, taken from the schedule. */
  days: number;
  difficulty?: Difficulty;
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
        description: text(entry.description),
        videoUrl: text(entry.videoUrl),
        time: text(entry.time),
        difficulty: difficultyTag(entry.difficulty, owner),
        specialties: specialtyTags(entry.specialties, owner),
      };
    }),
  "exercise"
);

const exerciseIds = new Set(exercises.map((exercise) => exercise.id));

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
      return {
        id: toId(name),
        name,
        description: text(entry.description),
        days: ids.length,
        difficulty: difficultyTag(entry.difficulty, `Pathway "${name}"`),
        specialties: specialtyTags(entry.specialties, `Pathway "${name}"`),
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
