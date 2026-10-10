export type ExerciseCategory = "Balance" | "Strength" | "Flexibility" | "Recovery";

export type ExerciseSource = {
  label: string;
  url: string;
};

export type ExerciseVideo = {
  url: string;
  title: string;
  creator: string;
  metadataVerified: boolean;
  demonstrationVerified: boolean;
};

export type Exercise = {
  id: string;
  name: string;
  description: string;
  category: ExerciseCategory;
  equipment: string;
  instructions: string[];
  sources: ExerciseSource[];
  verification: "verified" | "draft";
  verificationNote?: string;
  video?: ExerciseVideo;
  additionalVideoCandidates?: ExerciseVideo[];
  /** A YouTube link or video ID, retained for the existing detail component. */
  videoUrl: string;
};

export const exercises: Exercise[] = [
  {
    id: "heel-to-toe-walk",
    name: "Heel-to-toe walk",
    category: "Balance",
    description: "Walk in a straight line, placing each heel in front of the opposite toes.",
    equipment: "A clear, level path; stand near a stable support if needed.",
    instructions: ["Walk in a line, placing one foot directly in front of the other, heel to toe, for a short distance."],
    sources: [{ label: "Mayo Clinic: Balance exercises", url: "https://www.mayoclinic.org/healthy-lifestyle/fitness/in-depth/balance-exercises/art-20546836" }],
    verification: "draft",
    verificationNote: "The written movement is source-backed. The submitted demonstration video has not been visually reviewed.",
    video: { url: "https://www.youtube.com/watch?v=z_GKdFf3qv4", title: "Heel-to-Toe Walk Balance Exercise for Older Adults", creator: "National Institute on Aging", metadataVerified: true, demonstrationVerified: false },
    videoUrl: "",
  },
  {
    id: "single-leg-balance",
    name: "Stand on one foot",
    category: "Balance",
    description: "Practice standing balance on one leg, using support when needed.",
    equipment: "A sturdy table or counter for optional support.",
    instructions: [
      "Stand with feet hip-width apart and weight even on both legs.",
      "Lift one foot, bending the knee; hold only while maintaining good form, up to 30 seconds.",
      "Return to the starting position and repeat on the other side. Use a sturdy support if needed.",
    ],
    sources: [{ label: "Mayo Clinic: Balance exercises", url: "https://www.mayoclinic.org/healthy-lifestyle/fitness/in-depth/balance-exercises/art-20546836" }],
    verification: "draft",
    verificationNote: "The written movement is source-backed. The submitted demonstration video has not been visually reviewed.",
    video: { url: "https://www.youtube.com/watch?v=QT5d4tTXW6U", title: "Stand on One Foot Balance Exercise for Older Adults", creator: "National Institute on Aging", metadataVerified: true, demonstrationVerified: false },
    videoUrl: "",
  },
  {
    id: "wall-pushups",
    name: "Wall push-ups",
    category: "Strength",
    description: "A supported upper-body strength movement performed facing a wall.",
    equipment: "A clear wall.",
    instructions: [
      "Stand about 3 feet from a wall with feet shoulder-width apart.",
      "Place hands flat on the wall at shoulder height, keeping the spine straight.",
      "Lower the body toward the wall, then push back. Healthline describes 10 repetitions.",
    ],
    sources: [{ label: "Healthline: Exercise plan for older adults", url: "https://www.healthline.com/health/everyday-fitness/senior-workouts" }],
    verification: "draft",
    verificationNote: "Instructions are source-backed. The submitted demonstration video has not been visually reviewed.",
    video: { url: "https://www.youtube.com/watch?v=751E9kAdkwg", title: "Wall Pushups Strength Exercise for Older Adults", creator: "National Institute on Aging", metadataVerified: true, demonstrationVerified: false },
    videoUrl: "",
  },
  {
    id: "overhead-arm-raise",
    name: "Overhead arm raise",
    category: "Strength",
    description: "A standing upper-body movement described in the submitted routine.",
    equipment: "Not confirmed; draft.",
    instructions: [],
    sources: [],
    verification: "draft",
    verificationNote: "No written instructions or external exercise guidance were verified; the video demonstration is also pending review.",
    video: { url: "https://www.youtube.com/watch?v=VPiawRHRpmY", title: "Overhead Arm Raise Strength Exercise for Older Adults", creator: "National Institute on Aging", metadataVerified: true, demonstrationVerified: false },
    videoUrl: "",
  },
  {
    id: "chair-dip",
    name: "Chair dip",
    category: "Strength",
    description: "A seated upper-body strength movement listed in the submitted routine.",
    equipment: "A sturdy chair; suitability not established.",
    instructions: [],
    sources: [],
    verification: "draft",
    verificationNote: "No written instructions or suitability guidance were verified; the video demonstration is pending review.",
    video: { url: "https://www.youtube.com/watch?v=LVRcXDEdC5U", title: "Chair Dip Strength Exercise for Older Adults", creator: "National Institute on Aging", metadataVerified: true, demonstrationVerified: false },
    videoUrl: "",
  },
  {
    id: "ankle-stretch",
    name: "Ankle stretch",
    category: "Flexibility",
    description: "An ankle movement listed in the submitted stretching routine.",
    equipment: "Not confirmed; draft.",
    instructions: [],
    sources: [],
    verification: "draft",
    verificationNote: "The title and creator metadata match the submitted video; its demonstration and instructions have not been reviewed.",
    video: { url: "https://www.youtube.com/watch?v=87BeiyTFZyU", title: "Ankle Stretch for Older Adults", creator: "National Institute on Aging", metadataVerified: true, demonstrationVerified: false },
    videoUrl: "",
  },
  {
    id: "back-stretch",
    name: "Back stretch",
    category: "Flexibility",
    description: "A back stretch listed in the submitted routine; the specific movement is unverified.",
    equipment: "Not confirmed; draft.",
    instructions: [],
    sources: [],
    verification: "draft",
    verificationNote: "The title and creator metadata match the submitted video; its demonstration and instructions have not been reviewed.",
    video: { url: "https://www.youtube.com/watch?v=FpIfMyfpCk0", title: "Back Stretch for Older Adults", creator: "National Institute on Aging", metadataVerified: true, demonstrationVerified: false },
    videoUrl: "",
  },
  {
    id: "back-of-leg-stretch",
    name: "Back-of-leg stretch",
    category: "Flexibility",
    description: "A leg stretch listed in the submitted routine; the specific movement is unverified.",
    equipment: "Not confirmed; draft.",
    instructions: [],
    sources: [],
    verification: "draft",
    verificationNote: "The title and creator metadata match the submitted video; its demonstration and instructions have not been reviewed.",
    video: { url: "https://www.youtube.com/watch?v=guOj99WPZnw", title: "Back Of Leg Stretch for Older Adults", creator: "National Institute on Aging", metadataVerified: true, demonstrationVerified: false },
    videoUrl: "",
  },
  {
    id: "seated-knee-extension",
    name: "Seated knee extension",
    category: "Recovery",
    description: "A knee movement listed in the submitted recovery routines.",
    equipment: "A chair; use only if included in an individualized recovery plan.",
    instructions: [],
    sources: [],
    verification: "draft",
    verificationNote: "Requires an individualized healthcare professional's plan; instructions and video demonstration are pending review.",
    video: { url: "https://www.youtube.com/watch?v=VuJZ6dqMf8M", title: "Seated Knee Extension (LAQ) - Ask Doctor Jo", creator: "AskDoctorJo", metadataVerified: true, demonstrationVerified: false },
    videoUrl: "",
  },
  {
    id: "heel-slides",
    name: "Heel slides",
    category: "Recovery",
    description: "A movement listed in the submitted knee and leg recovery routine.",
    equipment: "Not confirmed; use only if included in an individualized recovery plan.",
    instructions: [],
    sources: [],
    verification: "draft",
    verificationNote: "Requires an individualized healthcare professional's plan; instructions and video demonstration are pending review.",
    video: { url: "https://www.youtube.com/watch?v=6-anByqnKp8", title: "Core Exercise: Heel Slide", creator: "Children's Hospital Colorado", metadataVerified: true, demonstrationVerified: false },
    videoUrl: "",
  },
  {
    id: "seated-march",
    name: "Seated march",
    category: "Recovery",
    description: "A seated leg movement listed in the submitted recovery routines.",
    equipment: "A stable chair; use only if included in an individualized recovery plan.",
    instructions: [],
    sources: [],
    verification: "draft",
    verificationNote: "Requires an individualized healthcare professional's plan; instructions and video demonstration are pending review.",
    video: { url: "https://www.youtube.com/watch?v=xxf93bq9-vA", title: "Seated March", creator: "Institute of Sports and Spines", metadataVerified: true, demonstrationVerified: false },
    videoUrl: "",
  },
  {
    id: "sit-to-stand",
    name: "Sit-to-stand",
    category: "Recovery",
    description: "A functional movement listed in the submitted knee and leg recovery routine.",
    equipment: "A stable chair; use only if included in an individualized recovery plan.",
    instructions: [],
    sources: [],
    verification: "draft",
    verificationNote: "Requires an individualized healthcare professional's plan; instructions and video demonstration are pending review.",
    video: { url: "https://www.youtube.com/watch?v=ITv-_BkcrD0", title: "Sit to Stand", creator: "Baptist Health", metadataVerified: true, demonstrationVerified: false },
    videoUrl: "",
  },
  {
    id: "pendulum-swings",
    name: "Pendulum swings",
    category: "Recovery",
    description: "A shoulder movement listed in the submitted recovery routines.",
    equipment: "Not confirmed; use only if included in an individualized recovery plan.",
    instructions: [],
    sources: [],
    verification: "draft",
    verificationNote: "Requires an individualized healthcare professional's plan; instructions and video demonstration are pending review.",
    video: { url: "https://www.youtube.com/watch?v=wD3jQJ-dGnY", title: "Pendulum Exercises Done Correctly!", creator: "Ortho Eval Pal with Paul Marquis PT", metadataVerified: true, demonstrationVerified: false },
    additionalVideoCandidates: [{ url: "https://www.youtube.com/watch?v=zY5nq68IxwA", title: "Shoulder Exercises: Shoulder Pendulum", creator: "University Orthopedics", metadataVerified: true, demonstrationVerified: false }],
    videoUrl: "",
  },
  {
    id: "table-slides",
    name: "Table slides",
    category: "Recovery",
    description: "A shoulder movement listed in the submitted recovery routines.",
    equipment: "A table; use only if included in an individualized recovery plan.",
    instructions: [],
    sources: [],
    verification: "draft",
    verificationNote: "Requires an individualized healthcare professional's plan; instructions and video demonstration are pending review.",
    video: { url: "https://www.youtube.com/watch?v=hN4r5srqnHg", title: "Shoulder Rehabilitation Exercise - Table Slides Demonstration", creator: "TSAOG Orthopaedics & Spine", metadataVerified: true, demonstrationVerified: false },
    videoUrl: "",
  },
  {
    id: "elbow-bends",
    name: "Gentle elbow bends",
    category: "Recovery",
    description: "An elbow movement listed in the submitted shoulder and arm recovery routine.",
    equipment: "None listed; use only if included in an individualized recovery plan.",
    instructions: [],
    sources: [],
    verification: "draft",
    verificationNote: "Requires an individualized healthcare professional's plan; instructions and video demonstration are pending review.",
    video: { url: "https://www.youtube.com/watch?v=WFuSCvtEdq0", title: "Elbow Flexion and Extension Range of Motion", creator: "E3 Rehab Exercise Library", metadataVerified: true, demonstrationVerified: false },
    videoUrl: "",
  },
  {
    id: "supported-shoulder-rom",
    name: "Supported shoulder range of motion",
    category: "Recovery",
    description: "A supported shoulder movement listed in the submitted recovery routine.",
    equipment: "Not confirmed; use only if included in an individualized recovery plan.",
    instructions: [],
    sources: [],
    verification: "draft",
    verificationNote: "Requires an individualized healthcare professional's plan; instructions and video demonstration are pending review.",
    video: { url: "https://www.youtube.com/watch?v=Jt4CB1xk3YU", title: "Shoulder stretching and range of motion exercises", creator: "Prisma Health", metadataVerified: true, demonstrationVerified: false },
    videoUrl: "",
  },
  {
    id: "hip-abduction",
    name: "Gentle hip abduction",
    category: "Recovery",
    description: "A hip movement listed in the submitted hip recovery routine.",
    equipment: "Stable support; use only if included in an individualized recovery plan.",
    instructions: [],
    sources: [],
    verification: "draft",
    verificationNote: "Requires an individualized healthcare professional's plan; instructions and video demonstration are pending review.",
    video: { url: "https://www.youtube.com/watch?v=LzuvLW_gJ8w", title: "Standing Hip Abduction Extension", creator: "MU Health", metadataVerified: true, demonstrationVerified: false },
    videoUrl: "",
  },
  {
    id: "supported-hip-extension",
    name: "Supported hip extension",
    category: "Recovery",
    description: "A supported hip movement listed in the submitted recovery routines.",
    equipment: "Stable support; use only if included in an individualized recovery plan.",
    instructions: [],
    sources: [],
    verification: "draft",
    verificationNote: "Requires an individualized healthcare professional's plan; instructions and video demonstration are pending review.",
    video: { url: "https://www.youtube.com/watch?v=7WrpeftqVPQ", title: "Standing Hip Extension | Physical Therapy Exercises", creator: "Visiting Nurse Association Health Group", metadataVerified: true, demonstrationVerified: false },
    additionalVideoCandidates: [{ url: "https://www.youtube.com/watch?v=ysG2GAdq2Uw", title: "Standing hip extension - Fit Family Physical Therapy", creator: "Fit Family Physical Therapy", metadataVerified: true, demonstrationVerified: false }],
    videoUrl: "",
  },
  {
    id: "walking-practice",
    name: "Prescribed walking practice",
    category: "Recovery",
    description: "Walking practice listed in the submitted hip recovery routine.",
    equipment: "As specified by the healthcare professional's plan.",
    instructions: [],
    sources: [],
    verification: "draft",
    verificationNote: "Requires an individualized healthcare professional's plan. The supplied candidate is a general hip-surgery recovery video, not a verified walking demonstration.",
    video: { url: "https://www.youtube.com/watch?v=i3X5HQhoq60", title: "Hip Surgery Recovery: Safe Movements & Techniques", creator: "Moffitt Cancer Center", metadataVerified: true, demonstrationVerified: false },
    videoUrl: "",
  },
];

export function getExercise(id: string): Exercise | undefined {
  return exercises.find((exercise) => exercise.id === id);
}
