import { loadData, saveData } from "@/lib/storage";

const DRAFT_KEY = "@shrks_app/therapy-plan/draft";
const SAVED_PLAN_KEY = "@shrks_app/therapy-plan/saved";

export type TherapyPlanInstruction = {
  id: string;
  exercise: string;
  dosage: string;
  pageNumber: number | null;
  supportingText: string;
  ambiguousNumbers: boolean;
  ambiguousExerciseName?: boolean;
  reviewed: boolean;
  pdfPicture?: { uri: string; width: number; height: number; pageNumber: number; kind: "section" | "page" };
};

export type TherapyPlanPage = {
  pageNumber: number | null;
  text: string;
};

export type TherapyPlanDraft = {
  fileName: string;
  title: string;
  content: string;
  sourceType?: "text" | "pdf" | "manual";
  pages?: TherapyPlanPage[];
  instructions?: TherapyPlanInstruction[];
};

export type TherapyPlan = TherapyPlanDraft & {
  savedAt: string;
};

export function saveTherapyPlanDraft(draft: TherapyPlanDraft) {
  return saveData(DRAFT_KEY, draft);
}

export function loadTherapyPlanDraft() {
  return loadData<TherapyPlanDraft>(DRAFT_KEY);
}

export function loadSavedTherapyPlan() {
  return loadData<TherapyPlan>(SAVED_PLAN_KEY);
}

export async function confirmTherapyPlan(draft: TherapyPlanDraft) {
  const instructions = draft.instructions ?? [];
  if (
    instructions.length === 0 ||
    instructions.some((instruction) =>
      !instruction.exercise.trim() || !instruction.reviewed,
    )
  ) {
    throw new Error("Review every exercise and dosage before saving.");
  }

  const plan: TherapyPlan = { ...draft, savedAt: new Date().toISOString() };
  await saveData(SAVED_PLAN_KEY, plan);
  await saveData<TherapyPlanDraft | null>(DRAFT_KEY, null);
  return plan;
}
// Attach pictures to the same source PDF without changing the reviewed prescription.
export async function attachSavedPlanPictures(pages: TherapyPlanPage[], extractedInstructions: TherapyPlanInstruction[], content: string) {
  const plan = await loadSavedTherapyPlan();
  if (!plan || plan.content !== content) throw new Error("Choose the same PDF used for this saved plan. A different PDF needs a new review.");
  const instructions = (plan.instructions ?? []).map(instruction => {
    const matching = extractedInstructions.find(item => item.id === instruction.id && item.pageNumber === instruction.pageNumber && item.supportingText === instruction.supportingText);
    return matching?.pdfPicture ? { ...instruction, pdfPicture: matching.pdfPicture } : instruction;
  });
  if (!instructions.some(item => item.pdfPicture)) throw new Error("Pictures could not be attached to this plan. Re-upload the PDF to review its pictures.");
  const updated = { ...plan, pages, instructions };
  await saveData(SAVED_PLAN_KEY, updated);
  return updated;
}
