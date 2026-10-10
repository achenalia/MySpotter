export type TrackItem = {
  exerciseId: string;
  allocation: string;
};

export type PathwayTrack = {
  id: string;
  name: string;
  duration: string;
  difficulty?: string;
  description: string;
  items: TrackItem[];
  restAndTransitions: string;
  complete: boolean;
};

export type Pathway = {
  id: string;
  name: string;
  description: string;
  days: number;
  difficulty: string;
  exerciseIds: (string | undefined)[];
  duration: string;
  frequency: string;
  goal: string;
  scheduleLabel: "Proposed app routine";
  requiresClinicianPlan: boolean;
  tracks: PathwayTrack[];
};

const item = (exerciseId: string, allocation: string): TrackItem => ({ exerciseId, allocation });

export const pathways: Pathway[] = [
  {
    id: "balance-stability",
    name: "Balance and Stability",
    description: "A four-week proposed routine focused on supported balance practice and controlled movement.",
    days: 28,
    duration: "4 weeks",
    frequency: "2–3 sessions per week",
    difficulty: "Beginner",
    goal: "Practice balance, stability, and confidence while standing and walking.",
    scheduleLabel: "Proposed app routine",
    requiresClinicianPlan: false,
    exerciseIds: [],
    tracks: [
      { id: "a", name: "Balance Basics", duration: "6–8 minutes", difficulty: "Beginner", description: "Introduces the two listed balance movements.", items: [item("heel-to-toe-walk", "2 min allocation"), item("single-leg-balance", "2 min allocation")], restAndTransitions: "2–4 minutes", complete: true },
      { id: "b", name: "Steady Steps", duration: "6–8 minutes", difficulty: "Beginner", description: "Repeats the balance movements with controlled steps and steady positioning.", items: [item("heel-to-toe-walk", "2 min allocation"), item("single-leg-balance", "2 min allocation")], restAndTransitions: "2–4 minutes", complete: true },
      { id: "c", name: "Balance Practice", duration: "8–10 minutes", difficulty: "Beginner", description: "Combines the listed movements in a slightly longer proposed session.", items: [item("heel-to-toe-walk", "2–3 min allocation"), item("single-leg-balance", "2–3 min allocation"), item("heel-to-toe-walk", "2 min repeat allocation")], restAndTransitions: "2 minutes", complete: true },
    ],
  },
  {
    id: "upper-body-strength",
    name: "Upper-Body Strength",
    description: "A six-week proposed routine with recovery between initial weekly sessions.",
    days: 42,
    duration: "6 weeks",
    frequency: "2 sessions per week initially, with recovery between sessions",
    difficulty: "Beginner",
    goal: "Practice upper-body movements for everyday reaching and pushing tasks.",
    scheduleLabel: "Proposed app routine",
    requiresClinicianPlan: false,
    exerciseIds: [],
    tracks: [
      { id: "a", name: "Strength Foundations", duration: "10–12 minutes", description: "Introduces the three listed strength movements.", items: [item("wall-pushups", "2 min allocation"), item("overhead-arm-raise", "2 min allocation"), item("chair-dip", "2 min allocation")], restAndTransitions: "4–6 minutes", complete: true },
      { id: "b", name: "Controlled Strength", duration: "10–12 minutes", description: "Practices the movements in a different order with rest.", items: [item("overhead-arm-raise", "2 min allocation"), item("wall-pushups", "2 min allocation"), item("chair-dip", "2 min allocation")], restAndTransitions: "4–6 minutes", complete: true },
      { id: "c", name: "Full Strength Routine", duration: "12–15 minutes", description: "Combines all three movements and a repeat of selected movements.", items: [item("wall-pushups", "2 min allocation"), item("overhead-arm-raise", "2 min allocation"), item("chair-dip", "2 min allocation"), item("wall-pushups", "2–3 min repeat allocation")], restAndTransitions: "4–6 minutes", complete: true },
    ],
  },
  {
    id: "flexibility-comfortable-movement",
    name: "Flexibility and Comfortable Movement",
    description: "A four-week proposed routine listing gentle ankle, back, and back-of-leg stretches.",
    days: 28,
    duration: "4 weeks",
    frequency: "3–5 sessions per week, as comfortable",
    difficulty: "Beginner",
    goal: "Practice comfortable movement in the ankles, back, and backs of the legs.",
    scheduleLabel: "Proposed app routine",
    requiresClinicianPlan: false,
    exerciseIds: [],
    tracks: [
      { id: "a", name: "Gentle Stretching", duration: "8–10 minutes", description: "Introduces the three stretches named in the submitted routine.", items: [item("ankle-stretch", "2 min allocation"), item("back-stretch", "2 min allocation"), item("back-of-leg-stretch", "2 min allocation")], restAndTransitions: "2–4 minutes", complete: true },
      { id: "b", name: "Lower-Body Flexibility", duration: "8–10 minutes", description: "Emphasizes the ankle and back-of-leg stretches.", items: [item("ankle-stretch", "2 min allocation"), item("back-of-leg-stretch", "3 min allocation"), item("back-stretch", "2 min allocation")], restAndTransitions: "1–3 minutes", complete: true },
      { id: "c", name: "Complete Stretching Routine", duration: "10–12 minutes", description: "Combines all three named movements; an optional repeat is listed.", items: [item("ankle-stretch", "2 min allocation"), item("back-stretch", "2–3 min allocation"), item("back-of-leg-stretch", "3 min allocation"), item("ankle-stretch", "1 min optional repeat")], restAndTransitions: "2–3 minutes", complete: true },
    ],
  },
  {
    id: "knee-leg-recovery",
    name: "Knee and Leg Recovery",
    description: "Recovery material only. Exercise selection and timing require an individualized plan from a healthcare professional.",
    days: 28,
    duration: "4 weeks, adjusted to recovery progress",
    frequency: "As approved by the healthcare professional",
    difficulty: "Individualized plan required",
    goal: "The submitted document describes knee mobility and leg-strength goals; suitability is not established here.",
    scheduleLabel: "Proposed app routine",
    requiresClinicianPlan: true,
    exerciseIds: [],
    tracks: [
      { id: "a", name: "Gentle Knee Mobility", duration: "6–8 minutes", difficulty: "Beginner", description: "Draft list from the submitted knee recovery routine.", items: [item("seated-knee-extension", "2 min allocation"), item("heel-slides", "2 min allocation")], restAndTransitions: "2–4 minutes", complete: true },
      { id: "b", name: "Leg Movement and Control", duration: "6–8 minutes", difficulty: "Beginner", description: "Draft list from the submitted knee recovery routine.", items: [item("seated-march", "2 min allocation"), item("seated-knee-extension", "2 min allocation")], restAndTransitions: "2–4 minutes", complete: true },
      { id: "c", name: "Functional Leg Strength", duration: "8–10 minutes", difficulty: "Beginner", description: "Draft list from the submitted knee recovery routine.", items: [item("seated-march", "2 min allocation"), item("sit-to-stand", "2–3 min allocation"), item("seated-knee-extension", "2 min allocation")], restAndTransitions: "2–3 minutes", complete: true },
    ],
  },
  {
    id: "shoulder-arm-recovery",
    name: "Shoulder and Arm Recovery",
    description: "Recovery material only. Exercise selection and timing require an individualized plan from a healthcare professional.",
    days: 28,
    duration: "4 weeks, adjusted to the injury and treatment plan",
    frequency: "As prescribed by the healthcare professional",
    difficulty: "Individualized plan required",
    goal: "The submitted document describes upper-body mobility and function goals; suitability is not established here.",
    scheduleLabel: "Proposed app routine",
    requiresClinicianPlan: true,
    exerciseIds: [],
    tracks: [
      { id: "a", name: "Gentle Shoulder Mobility", duration: "5–7 minutes", difficulty: "Beginner", description: "Draft list from the submitted shoulder recovery routine.", items: [item("pendulum-swings", "2 min allocation"), item("table-slides", "2 min allocation")], restAndTransitions: "1–3 minutes", complete: true },
      { id: "b", name: "Controlled Arm Movement", duration: "6–8 minutes", difficulty: "Beginner", description: "Draft list from the submitted shoulder recovery routine.", items: [item("elbow-bends", "2 min allocation"), item("table-slides", "2 min allocation")], restAndTransitions: "2–4 minutes", complete: true },
      { id: "c", name: "Shoulder Mobility Routine", duration: "8–10 minutes", difficulty: "Beginner", description: "Draft list from the submitted shoulder recovery routine.", items: [item("pendulum-swings", "2 min allocation"), item("supported-shoulder-rom", "2–3 min allocation"), item("elbow-bends", "2 min allocation")], restAndTransitions: "2–3 minutes", complete: true },
    ],
  },
  {
    id: "hip-mobility-recovery",
    name: "Hip Mobility and Recovery",
    description: "Recovery material only. Exercise selection and timing require an individualized plan from a healthcare professional.",
    days: 28,
    duration: "Individually determined by the injury and rehabilitation plan",
    frequency: "As prescribed by the healthcare professional",
    difficulty: "Individualized plan required",
    goal: "The submitted document describes hip mobility and strength goals; suitability is not established here.",
    scheduleLabel: "Proposed app routine",
    requiresClinicianPlan: true,
    exerciseIds: [],
    tracks: [
      { id: "a", name: "Supported Hip Strength", duration: "6–8 minutes", difficulty: "Beginner", description: "Draft list from the submitted hip recovery routine.", items: [item("hip-abduction", "2 min allocation"), item("supported-hip-extension", "2 min allocation")], restAndTransitions: "2–4 minutes", complete: true },
      { id: "b", name: "Hip Mobility and Daily Movement", duration: "8–10 minutes", difficulty: "Beginner", description: "Draft list from the submitted hip recovery routine.", items: [item("seated-march", "2 min allocation"), item("supported-hip-extension", "2 min allocation"), item("walking-practice", "2–3 min allocation")], restAndTransitions: "2–3 minutes", complete: true },
      { id: "c", name: "Track C not supplied", duration: "Not supplied", description: "The attached document ends before a Track C session is provided. No exercises or duration have been added.", items: [], restAndTransitions: "Not supplied", complete: false },
    ],
  },
];

export function getPathway(id: string): Pathway | undefined {
  return pathways.find((pathway) => pathway.id === id);
}
