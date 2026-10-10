import type { Exercise } from "./types";

// Thresholds are rough starting points, so tune them by testing.
export const squat: Exercise = {
  id: "squat",
  name: "Squat",
  instructions: "Stand sideways to the camera with your whole body in frame.",
  joints: {
    knee: ["hip", "knee", "ankle"],
    torso: ["shoulder", "hip", "knee"],
  },
  repAngle: { joint: "knee", downBelow: 120, upAbove: 160 },
  repChecks: [
    { joint: "knee", stat: "min", atMost: 100, message: "Try going a bit deeper." },
  ],
  checks: [
    { joint: "torso", phase: "down", min: 50, message: "Keep your chest up." },
  ],
};