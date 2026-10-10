import { pushup } from "./pushup";
import { squat } from "./squat";
import type { Exercise } from "./types";

// To add an exercise: create a file like squat.ts, import it, add it here.
export const exercises: Exercise[] = [squat, pushup];

export const getExercise = (id: string) => exercises.find((e) => e.id === id);