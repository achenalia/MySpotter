import { pushup } from "./pushup";
import { therapyMovements } from "./therapyMovements";
import { squat } from "./squat";
import type { Exercise } from "./types";

// To add an exercise: create a file like squat.ts, import it, add it here.
export const exercises: Exercise[] = [squat, pushup];

export const getExercise = (id: string) => exercises.find((e) => e.id === id);

// Plan feedback describes measurements rather than prescribing a deeper range.
const planSquat: Exercise = {
  ...squat,
  repChecks: [],
  checks: [{ joint: "torso", phase: "down", min: 50, message: "Forward torso lean detected. Compare your position with the source instructions." }],
  repSuccessMessage: "Bend and return detected - repetition counted",
};
const planPushup: Exercise = {
  ...pushup,
  repChecks: [],
  checks: [{ joint: "bodyLine", phase: "any", min: 160, message: "Body alignment changed. Compare your position with the source instructions." }],
  repSuccessMessage: "Bend and return detected - repetition counted",
};

const TRACKED_PLAN_IDS: Record<string, string> = {
	squat: "squat",
	squats: "squat",
	quadricepssquats: "squat",
	pushup: "pushup",
	pushups: "pushup",
	elbowflexion: "elbow-flexion",
	shoulderflexion: "shoulder-flexion",
	shoulderabduction: "shoulder-abduction",
	sittingkneeextension: "sitting-knee-extension",
	hamstringflexion: "hamstring-flexion",
	sittostand: "sit-to-stand",
};

export function getTrackedPlanExercise(name: string) {
	const normalizedName = name.toLowerCase().replace(/[^a-z0-9]/g, "");
	const trackerId = TRACKED_PLAN_IDS[normalizedName];
	return trackerId === "squat" ? planSquat : trackerId === "pushup" ? planPushup : therapyMovements.find(exercise => exercise.id === trackerId);
}