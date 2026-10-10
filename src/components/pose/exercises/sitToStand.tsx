import type { Exercise } from "./types";

// One rep is seated -> fully standing -> seated again. The rep angle is inverted
// (180 - knee angle), so "up" means seated (knee bent) and "down" means standing
// (knee straight). Same thresholds as the therapy plan version; tune by testing.
export const sitToStand: Exercise = {
  id: "sit-to-stand",
  name: "Sit-to-Stand",
  instructions:
    "Sit on a sturdy chair, sideways to the camera, with your hip, knee and ankle in frame. Start seated.",
  joints: {
    knee: ["hip", "knee", "ankle"],
    hip: ["shoulder", "hip", "knee"],
  },
  repAngle: { joint: "knee", downBelow: 25, upAbove: 60, invert: true },
  repChecks: [
    // At the top of the rep the hips should open up close to straight.
    { joint: "hip", stat: "max", atLeast: 160, message: "Stand up tall at the top." },
  ],
};
