import type { TherapyPlanInstruction, TherapyPlanPage } from "@/data/therapyPlan";

export type ExtractionProgress = {
  message: string;
  percent: number;
  pageNumber?: number;
  totalPages?: number;
};

export type ExtractedPlanFile = {
  content: string;
  pages: TherapyPlanPage[];
  instructions: TherapyPlanInstruction[];
  sourceType: "text" | "pdf";
};

export type ExtractionOptions = {
  onProgress?: (progress: ExtractionProgress) => void;
  signal?: AbortSignal;
};

export function getFileExtension(fileName: string) {
  const dot = fileName.lastIndexOf(".");
  return dot < 0 ? "" : fileName.slice(dot).toLowerCase();
}

export function throwIfExtractionCancelled(signal?: AbortSignal) {
  if (signal?.aborted) throw new Error("EXTRACTION_CANCELLED");
}