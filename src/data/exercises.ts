export type Exercise = {
  id: string;
  name: string;
  description: string;
  /** A YouTube link or video ID. */
  videoUrl: string;
};

// TODO: replace these sample entries with the real exercise list.
export const exercises: Exercise[] = [
  {
    id: "push-up",
    name: "Push-Up",
    description:
      "A bodyweight exercise that works the chest, shoulders and triceps. Keep your body in a straight line from head to heels and lower your chest toward the floor.",
    videoUrl: "https://www.youtube.com/watch?v=IODxDxX7oi4",
  },
  {
    id: "squat",
    name: "Squat",
    description:
      "A lower-body exercise that works the quads, glutes and hamstrings. Keep your chest up and push your hips back as you bend your knees.",
    videoUrl: "",
  },
];

export function getExercise(id: string): Exercise | undefined {
  return exercises.find((exercise) => exercise.id === id);
}
