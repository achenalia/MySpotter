export type Pathway = {
  id: string;
  name: string;
  description: string;
  /** Total length in days. Also sets how many rows the calendar shows. */
  days: number;
  difficulty: string;
  /** Exercise id for each day, by day index. Leave a day undefined for rest. */
  exerciseIds: (string | undefined)[];
};

// TODO: replace this sample entry with the real pathway list.
export const pathways: Pathway[] = [
  {
    id: "beginner-strength",
    name: "Beginner Strength",
    description:
      "A two-week introduction to bodyweight strength training, alternating upper- and lower-body days with rest in between.",
    days: 14,
    difficulty: "Beginner",
    exerciseIds: [
      "push-up", "squat", undefined, "push-up", "squat", undefined, undefined,
      "push-up", "squat", undefined, "push-up", "squat", undefined, undefined,
    ],
  },
];

export function getPathway(id: string): Pathway | undefined {
  return pathways.find((pathway) => pathway.id === id);
}
