import type { Exercise } from "./types";

// Prototype movement-cycle detectors. Thresholds detect visible movement only;
// they are not prescribed ranges or a clinical assessment of form.
const feedback = "Movement and return detected - repetition counted";

export const therapyMovements: Exercise[] = [
  {
    id: "elbow-flexion", name: "Elbow flexion",
    instructions: "Face sideways to the camera. Keep your shoulder, elbow and wrist visible. Begin with your arm lowered and elbow extended. Follow the source instructions for bending and returning.",
    joints: { elbow: ["shoulder", "elbow", "wrist"] },
    repAngle: { joint: "elbow", downBelow: 110, upAbove: 155 },
    repSuccessMessage: feedback,
  },
  {
    id: "shoulder-flexion", name: "Shoulder flexion",
    instructions: "Face sideways to the camera. Keep your hip, shoulder, elbow and wrist visible. Begin with your arm lowered. Follow the source instructions for raising your arm forward and returning.",
    joints: { shoulder: ["hip", "shoulder", "elbow"], elbow: ["shoulder", "elbow", "wrist"] },
    repAngle: { joint: "shoulder", downBelow: 120, upAbove: 160, invert: true },
    checks: [{ joint: "elbow", phase: "down", min: 145, message: "Elbow bend detected. Compare your arm position with the source instructions." }],
    repSuccessMessage: feedback,
  },
  {
    id: "shoulder-abduction", name: "Shoulder abduction",
    instructions: "Face the camera. Keep your hips, shoulders, elbows and wrists visible. Begin with your arms lowered. Follow the source instructions for raising an arm to the side and returning.",
    joints: { shoulder: ["hip", "shoulder", "elbow"], elbow: ["shoulder", "elbow", "wrist"] },
    repAngle: { joint: "shoulder", downBelow: 120, upAbove: 160, invert: true },
    checks: [{ joint: "elbow", phase: "down", min: 145, message: "Elbow bend detected. Compare your arm position with the source instructions." }],
    repSuccessMessage: feedback,
  },
  {
    id: "sitting-knee-extension", name: "Sitting knee extension",
    instructions: "Sit as directed in the source instructions, sideways to the camera. Keep your hip, knee and ankle visible. Begin with your knee bent. Follow the source instructions for extending your knee and returning.",
    joints: { knee: ["hip", "knee", "ankle"] },
    repAngle: { joint: "knee", downBelow: 30, upAbove: 65, invert: true },
    repSuccessMessage: feedback,
  },
  {
    id: "hamstring-flexion", name: "Hamstring flexion",
    instructions: "Stand sideways as directed in the source instructions, with your hip, knee and ankle visible. Begin with your leg lowered. Follow the source instructions for bending your knee and returning. Use any support specified in your plan.",
    joints: { knee: ["hip", "knee", "ankle"] },
    repAngle: { joint: "knee", downBelow: 125, upAbove: 160 },
    repSuccessMessage: feedback,
  },
  {
    id: "sit-to-stand", name: "Sit to stand",
    instructions: "Use the chair and support described in your source instructions. Position the camera sideways with your hip, knee and ankle visible. Begin seated. One repetition is a rise and return to sitting.",
    joints: { knee: ["hip", "knee", "ankle"] },
    repAngle: { joint: "knee", downBelow: 25, upAbove: 60, invert: true },
    repSuccessMessage: feedback,
  },
];
