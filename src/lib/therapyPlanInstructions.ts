import type { TherapyPlanInstruction, TherapyPlanPage } from "@/data/therapyPlan";

const CLEAR_DOSAGE_PATTERNS = [
  /\b\d+\s*(?:sets?|rounds?)\s*(?:of|x|×)\s*\d+\s*(?:reps?|repetitions?)\b/i,
  /\b\d+\s*(?:x|×)\s*\d+\s*(?:reps?|repetitions?|seconds?|minutes?)\b/i,
  /\b(?:hold(?:\s+for)?|for)\s+\d+(?:\.\d+)?\s*(?:seconds?|minutes?|secs?|mins?)\b/i,
  /\b\d+(?:\.\d+)?\s*(?:seconds?|minutes?|secs?|mins?|reps?|repetitions?|steps?|times?)\b/i,
];

const LIST_PREFIX = /^(?:[-*•▪●]\s+|\d+[.)]\s+)/;

const PDF_EXERCISE_HEADINGS = [
  "ankle pumps",
  "gluteal sets",
  "quad sets",
  "terminal knee extension",
  "hip abduction, back lying",
  "straight leg raise",
  "heel slides",
  "lower trunk rotation",
  "bridging",
  "sitting knee extension",
  "hip flexion",
  "hip abduction",
  "plantar flexion - toe raises",
  "quadriceps - squats",
  "hamstring flexion",
  "shoulder flexion",
  "shoulder abduction",
  "chest press outs",
  "elbow flexion",
  "finger flexion",
  "wrist extension",
  "sit to stand",
  "scapular retraction",
];

const PDF_DOSAGE_PATTERNS = [
  /\brepeat\s+\d+(?:\.\d+)?\s+(?:times?|reps?|repetitions?)\b/gi,
  /\bset\s+of\s+\d+(?:\.\d+)?\b/gi,
  /\b\d+(?:\.\d+)?\s*(?:to|[-–])\s*\d+(?:\.\d+)?\s+times?\s+(?:a|per)\s+(?:day|week)\b/gi,
  /\b\d+\s+sets?\s+of\s+\d+\s*(?:reps?|repetitions?)\b/gi,
  /\bhold\s+(?:for\s+)?\d+(?:\.\d+)?\s*(?:seconds?|secs?|minutes?|mins?)\b/gi,
  /\brest\s+for\s+(?:one|1)\s+minute\b/gi,
];

function normalizeHeading(line: string) {
  return line.toLowerCase().replace(/[–—]/g, "-").replace(/\s+/g, " ").trim();
}

function explicitPdfDosage(text: string) {
  const matches = PDF_DOSAGE_PATTERNS
    .flatMap((pattern) => [...text.matchAll(pattern)].map((match) => ({
      text: match[0],
      start: match.index ?? 0,
      end: (match.index ?? 0) + match[0].length,
    })))
    .sort((left, right) => left.start - right.start || right.text.length - left.text.length);
  const selected: typeof matches = [];

  for (const match of matches) {
    if (selected.some((existing) => match.start < existing.end && match.end > existing.start)) continue;
    selected.push(match);
  }

  return selected.sort((left, right) => left.start - right.start).map((match) => match.text).join("; ");
}

export function extractPdfInstructionCandidates(pages: TherapyPlanPage[]): TherapyPlanInstruction[] {
  const candidates: TherapyPlanInstruction[] = [];

  for (const page of pages) {
    const lines = page.text.split(/\r?\n/).map((line) => line.trim());
    const headings = lines.flatMap((line, lineIndex) => {
      const heading = PDF_EXERCISE_HEADINGS.find((name) => normalizeHeading(line) === normalizeHeading(name));
      return heading ? [{ lineIndex, name: heading }] : [];
    });
    const isGroupedHeadingRow = headings.length > 1 &&
      headings.every((heading, index) => index === 0 || heading.lineIndex === headings[index - 1].lineIndex + 1);
    const headingCounts = new Map<string, number>();

    for (let index = 0; index < headings.length; index += 1) {
      const heading = headings[index];
      const occurrence = headingCounts.get(heading.name) ?? 0;
      headingCounts.set(heading.name, occurrence + 1);

      const nextHeadingLine = headings[index + 1]?.lineIndex ?? lines.length;
      const sectionLines = isGroupedHeadingRow
        ? [lines[heading.lineIndex]]
        : lines.slice(heading.lineIndex, nextHeadingLine).filter(Boolean);
      const supportingText = sectionLines.join("\n");
      const dosage = isGroupedHeadingRow ? "" : explicitPdfDosage(supportingText);
      const unrecognizedDoseLine = sectionLines.some((line) =>
        /\d/.test(line) &&
        /\b(?:reps?|repetitions?|sets?|times?|seconds?|minutes?|days?|weeks?)\b/i.test(line) &&
        !PDF_DOSAGE_PATTERNS.some((pattern) => new RegExp(pattern.source, pattern.flags.replace("g", "")).test(line)),
      );

      candidates.push({
        id: `instruction-${candidates.length + 1}`,
        exercise: heading.name,
        dosage,
        pageNumber: page.pageNumber,
        supportingText,
        ambiguousNumbers: unrecognizedDoseLine,
        ambiguousExerciseName: occurrence > 0,
        reviewed: false,
      });
    }
  }

  return candidates;
}

export function extractInstructionCandidates(pages: TherapyPlanPage[]): TherapyPlanInstruction[] {
  const instructions: TherapyPlanInstruction[] = [];

  for (const page of pages) {
    for (const rawLine of page.text.split(/\r?\n/)) {
      const supportingText = rawLine.trim();
      if (!supportingText) continue;

      const clearDosage = CLEAR_DOSAGE_PATTERNS
        .map((pattern) => supportingText.match(pattern)?.[0] ?? "")
        .sort((left, right) => right.length - left.length)[0];
      const isCandidate = LIST_PREFIX.test(supportingText) || Boolean(clearDosage);
      if (!isCandidate) continue;

      const withoutPrefix = supportingText.replace(LIST_PREFIX, "").trim();
      const exercise = clearDosage
        ? withoutPrefix
            .replace(clearDosage, "")
            .replace(/^[\s:;,–—-]+|[\s:;,–—-]+$/g, "")
            .trim()
        : withoutPrefix;
      const numbers = withoutPrefix.match(/\d+(?:\.\d+)?/g) ?? [];
      const dosageNumbers = clearDosage.match(/\d+(?:\.\d+)?/g) ?? [];

      instructions.push({
        id: `instruction-${instructions.length + 1}`,
        exercise,
        dosage: clearDosage,
        pageNumber: page.pageNumber,
        supportingText,
        ambiguousNumbers: numbers.length > dosageNumbers.length,
        reviewed: false,
      });
    }
  }

  return instructions;
}

export function createManualInstruction(id: string): TherapyPlanInstruction {
  return {
    id,
    exercise: "",
    dosage: "",
    pageNumber: null,
    supportingText: "Manually entered by user",
    ambiguousNumbers: false,
    reviewed: false,
  };
}