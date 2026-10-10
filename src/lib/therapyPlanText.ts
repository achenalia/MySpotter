import { extractInstructionCandidates } from "@/lib/therapyPlanInstructions";
import type { ExtractedPlanFile, ExtractionOptions } from "@/lib/therapyPlanText.types";
import { getFileExtension, throwIfExtractionCancelled } from "@/lib/therapyPlanText.types";
import type { DocumentPickerAsset } from "expo-document-picker";
import { File } from "expo-file-system";

const TEXT_EXTENSIONS = new Set([".txt", ".md", ".csv"]);
const MAX_TEXT_FILE_SIZE = 1_000_000;

export async function extractTherapyPlanFile(
  asset: DocumentPickerAsset,
  { onProgress, signal }: ExtractionOptions = {},
): Promise<ExtractedPlanFile> {
  const extension = getFileExtension(asset.name);
  if (extension === ".pdf") {
    throw new Error("PDF text extraction is available in the laptop browser only.");
  }
  if (!TEXT_EXTENSIONS.has(extension)) {
    throw new Error("Choose a TXT, Markdown, or CSV file.");
  }
  if (asset.size !== undefined && asset.size > MAX_TEXT_FILE_SIZE) {
    throw new Error("Choose a text plan smaller than 1 MB.");
  }

  throwIfExtractionCancelled(signal);
  onProgress?.({ message: "Reading text file...", percent: 25 });
  const content = await new File(asset.uri).text();
  throwIfExtractionCancelled(signal);
  if (!content.trim()) throw new Error("The selected file is empty.");
  if (content.includes("\u0000")) throw new Error("This file does not contain readable plain text.");

  const pages = [{ pageNumber: null, text: content.trim() }];
  onProgress?.({ message: "Preparing exercises for review...", percent: 100 });
  return {
    content: content.trim(),
    pages,
    instructions: extractInstructionCandidates(pages),
    sourceType: "text",
  };
}