// Loads the home page affirmations from affirmations.json. Blank or non-text
// entries are skipped.
import content from "./affirmations.json";

const raw: unknown[] = Array.isArray(content.affirmations) ? content.affirmations : [];

export const affirmations: string[] = raw.filter((entry): entry is string => {
  if (typeof entry === "string" && entry.trim()) return true;
  if (__DEV__) console.warn(`[affirmations.json] Skipped an entry that isn't text: ${JSON.stringify(entry)}`);
  return false;
});

export function getRandomAffirmation(): string {
  if (affirmations.length === 0) return "";
  return affirmations[Math.floor(Math.random() * affirmations.length)].trim();
}
