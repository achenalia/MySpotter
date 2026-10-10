import type { Landmark } from "@/components/pose/types";
import { angle } from "./angles";
import type { Exercise } from "./exercises/types";
import { LM, type Side } from "./landmarks";

export type ExerciseState = {
  phase: "up" | "down";
  reps: number;
  cues: string[];
  repFeedback: string | null;
  side: Side | null;
};

export const initialState: ExerciseState = {
  phase: "up",
  reps: 0,
  cues: [],
  repFeedback: null,
  side: null,
};

export type Analyzer = (lm: Landmark[]) => ExerciseState;

export function createAnalyzer(ex: Exercise): Analyzer {
  const ALPHA = 0.4; // smoothing: lower = smoother but laggier
  const CUE_FRAMES = 8; // frames a problem must persist before a cue shows
  const SWITCH_MARGIN = 0.5; // how much more visible the other side must be to switch

  const parts = [...new Set(Object.values(ex.joints).flat())];

  let side: Side | null = null;
  let smoothed: Record<string, number> = {};
  const cueCounts: Record<string, number> = {};
  let phase: "up" | "down" = "up";
  let reps = 0;
  let repFeedback: string | null = null;
  let repStats: Record<string, { min: number; max: number }> = {};

  const visibility = (lm: Landmark[], s: Side) =>
    parts.reduce((sum, p) => sum + (lm[LM[p][s]]?.visibility ?? 0), 0);

  return (lm) => {
    // 1. Pick (and mostly stick to) the side the camera sees best
    const vL = visibility(lm, "left");
    const vR = visibility(lm, "right");
    const best: Side = vL >= vR ? "left" : "right";
    if (side === null) side = best;
    else if (best !== side && Math.abs(vL - vR) > SWITCH_MARGIN) {
      side = best;
      smoothed = {};
    }
    const s = side;

    const snapshot = (cues: string[]): ExerciseState => ({
      phase,
      reps,
      cues,
      repFeedback,
      side: s,
    });

    // 2. Make sure the needed joints are actually visible
    if (parts.some((p) => (lm[LM[p][s]]?.visibility ?? 0) < 0.6)) {
      return snapshot(["Make sure your whole body is in frame"]);
    }

    // 3. Smoothed angles for every joint
    const angles: Record<string, number> = {};
    for (const [name, [a, b, c]] of Object.entries(ex.joints)) {
      const raw = angle(lm[LM[a][s]], lm[LM[b][s]], lm[LM[c][s]]);
      smoothed[name] =
        smoothed[name] === undefined
          ? raw
          : ALPHA * raw + (1 - ALPHA) * smoothed[name];
      angles[name] = smoothed[name];
    }

    // 4. Rep counting
    const { joint, downBelow, upAbove } = ex.repAngle;
    const a = angles[joint];

    if (phase === "up" && a < downBelow) {
      phase = "down";
      repFeedback = null;
      repStats = {};
    }
    if (phase === "down") {
      for (const [name, v] of Object.entries(angles)) {
        const st = repStats[name];
        repStats[name] = st
          ? { min: Math.min(st.min, v), max: Math.max(st.max, v) }
          : { min: v, max: v };
      }
      if (a > upAbove) {
        phase = "up";
        reps += 1;
        const failed = (ex.repChecks ?? []).find((c) => {
          const v = repStats[c.joint]?.[c.stat];
          if (v === undefined) return false;
          return (
            (c.atMost !== undefined && v > c.atMost) ||
            (c.atLeast !== undefined && v < c.atLeast)
          );
        });
        repFeedback = failed ? failed.message : "Good rep";
      }
    }

    // 5. Live cues, debounced
    const cues: string[] = [];
    for (const c of ex.checks ?? []) {
      const v = angles[c.joint];
      const inPhase = c.phase === "any" || c.phase === phase;
      const bad =
        inPhase &&
        ((c.min !== undefined && v < c.min) ||
          (c.max !== undefined && v > c.max));
      cueCounts[c.message] = bad ? (cueCounts[c.message] ?? 0) + 1 : 0;
      if (cueCounts[c.message] >= CUE_FRAMES) cues.push(c.message);
    }

    return snapshot(cues);
  };
}