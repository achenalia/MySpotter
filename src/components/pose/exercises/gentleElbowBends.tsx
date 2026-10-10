import type { Exercise } from "./types";

// One rep is arm straight -> bent -> straight. The bend threshold is gentle so a
// small, pain-free bend still counts, and there is no "bend deeper" feedback.
// Thresholds are rough starting points, so tune them by testing.
export const gentleElbowBends: Exercise = {
  id: "gentle-elbow-bends",
  name: "Gentle Elbow Bends",
  instructions:
    "Sit or stand sideways to the camera with your shoulder, elbow and wrist in frame. Start with your arm relaxed and straight.",
  joints: {
    elbow: ["shoulder", "elbow", "wrist"],
  },
  repAngle: { joint: "elbow", downBelow: 130, upAbove: 155 },
};
