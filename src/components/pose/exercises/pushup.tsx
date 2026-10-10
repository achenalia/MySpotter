import type { Exercise } from "./types";

export const pushup: Exercise = {
  id: "pushup",
  name: "Push-up",
  instructions: "Place the camera at floor level, to your side, with your whole body in frame.",
  joints: {
    elbow: ["shoulder", "elbow", "wrist"],
    bodyLine: ["shoulder", "hip", "ankle"],
  },
  repAngle: { joint: "elbow", downBelow: 110, upAbove: 155 },
  repChecks: [
    { joint: "elbow", stat: "min", atMost: 90, message: "Lower your chest a bit more." },
  ],
  checks: [
    { joint: "bodyLine", phase: "any", min: 160, message: "Keep your body in a straight line." },
  ],
};