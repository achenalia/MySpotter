import type { BodyPart } from "../landmarks";

// The angle is measured at the middle part
export type Joint = [BodyPart, BodyPart, BodyPart];

export type Exercise = {
  id: string;
  name: string;
  instructions: string; // shown to the user, e.g. where to put the camera
  joints: Record<string, Joint>;

  // Defines what counts as one rep (goes "down" below one angle, "up" above another)
  repAngle: { joint: string; downBelow: number; upAbove: number };

  // Judged at the end of each rep, using the lowest/highest angle reached
  repChecks?: {
    joint: string;
    stat: "min" | "max";
    atMost?: number;
    atLeast?: number;
    message: string;
  }[];

  // Judged live, frame by frame (debounced)
  checks?: {
    joint: string;
    phase: "up" | "down" | "any";
    min?: number;
    max?: number;
    message: string;
  }[];
};