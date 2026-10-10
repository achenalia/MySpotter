import { extractPagePictures } from "./therapyPlanPictures.web";
import {
    extractInstructionCandidates,
    extractPdfInstructionCandidates,
} from "@/lib/therapyPlanInstructions";
import type { ExtractedPlanFile, ExtractionOptions } from "@/lib/therapyPlanText.types";
import { getFileExtension, throwIfExtractionCancelled } from "@/lib/therapyPlanText.types";
import type { DocumentPickerAsset } from "expo-document-picker";
import { GlobalWorkerOptions, PasswordException, getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";

const TEXT_EXTENSIONS = new Set([".txt", ".md", ".csv"]);
const MAX_TEXT_FILE_SIZE = 1_000_000;
const MAX_PDF_FILE_SIZE = 15 * 1024 * 1024;
const MAX_PDF_PAGES = 100;

GlobalWorkerOptions.workerSrc = "/pdf.worker.legacy.min.mjs";

// Embedded browsers can leave module-worker startup pending. Loading the same
// official worker module in-page lets PDF.js use its supported loopback fallback.
let inPageReader: Promise<void> | undefined;
function loadInPageReader() {
  return inPageReader ??= new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.type = "module";
    script.src = GlobalWorkerOptions.workerSrc;
    const timer = setTimeout(() => reject(new Error("The PDF reader could not load. Reload and try again.")), 10_000);
    script.onload = () => { clearTimeout(timer); resolve(); };
    script.onerror = () => { clearTimeout(timer); inPageReader = undefined; reject(new Error("The PDF reader could not load. Reload and try again.")); };
    document.head.appendChild(script);
  });
}

function isPasswordError(error: unknown) {
  return error instanceof PasswordException ||
    (typeof error === "object" && error !== null && "name" in error && error.name === "PasswordException");
}

function isInvalidPdfError(error: unknown) {
  return typeof error === "object" && error !== null && "name" in error &&
    ["InvalidPDFException", "FormatError"].includes(String(error.name));
}

type PdfTextRun = {
  str: string;
  transform: number[];
  width: number;
  height: number;
  hasEOL: boolean;
};

export function assemblePdfTextLines(items: PdfTextRun[]): string[] {
  const lines: string[] = [];
  let line = "";
  let previous: PdfTextRun | null = null;
  let lineFontHeight = 0;

  const finishLine = () => {
    if (line.trim()) lines.push(line.trim());
    line = "";
    previous = null;
    lineFontHeight = 0;
  };

  for (const item of items) {
    if (!item.str) continue;
    let text = item.str;
    if (previous) {
      const previousX = previous.transform[4] ?? 0;
      const previousY = previous.transform[5] ?? 0;
      const currentX = item.transform[4] ?? previousX + previous.width;
      const currentY = item.transform[5] ?? previousY;
      const fontSize = Math.max(Math.abs(item.height), Math.abs(previous.height), 1);
      const baselineTolerance = Math.max(2, fontSize * 0.35);

      if (Math.abs(currentY - previousY) > baselineTolerance) {
        finishLine();
      } else {
        const gap = currentX - (previousX + previous.width);
        const wordGap = Math.max(1.5, fontSize * 0.2);
        const contiguous = gap <= wordGap;
        if (
          !contiguous &&
          /[\p{L}\p{N}]$/u.test(line) &&
          /^[\p{L}\p{N}]/u.test(item.str)
        ) {
          line += " ";
        }
        if (
          contiguous &&
          /^[A-Z]$/.test(item.str) &&
          lineFontHeight > 0 &&
          item.height < lineFontHeight * 0.85 &&
          /[\p{L}\p{N}]$/u.test(line)
        ) {
          text = item.str.toLowerCase();
        }
      }
    }

    line += text;
    previous = item;
    lineFontHeight = Math.max(lineFontHeight, item.height);
    if (item.hasEOL) finishLine();
  }

  finishLine();
  return lines;
}

async function extractTextFile(
  asset: DocumentPickerAsset,
  { onProgress, signal }: ExtractionOptions,
): Promise<ExtractedPlanFile> {
  if (!TEXT_EXTENSIONS.has(getFileExtension(asset.name))) {
    throw new Error("Choose a TXT, Markdown, CSV, or text-based PDF file.");
  }
  if (asset.size !== undefined && asset.size > MAX_TEXT_FILE_SIZE) {
    throw new Error("Choose a text plan smaller than 1 MB.");
  }
  if (!asset.file) throw new Error("The selected file could not be read in this browser.");

  throwIfExtractionCancelled(signal);
  onProgress?.({ message: "Reading text file...", percent: 25 });
  const content = await asset.file.text();
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

async function extractPdfFile(
  asset: DocumentPickerAsset,
  { onProgress, signal }: ExtractionOptions,
): Promise<ExtractedPlanFile> {
  if (asset.size !== undefined && asset.size > MAX_PDF_FILE_SIZE) {
    throw new Error("This PDF is too large. Choose a PDF smaller than 15 MB.");
  }
  if (!asset.file) throw new Error("The selected PDF could not be read in this browser.");

  throwIfExtractionCancelled(signal);
  onProgress?.({ message: "Reading PDF locally...", percent: 5 });
  const data = new Uint8Array(await asset.file.arrayBuffer());
  throwIfExtractionCancelled(signal);

  onProgress?.({ message: "Preparing PDF...", percent: 10 });
  const createReader = () => getDocument({
    data: data.slice(),
    stopAtErrors: true,
    useSystemFonts: true,
    useWasm: false,
  });
  let loadingTask = createReader();
  const destroyOnCancel = () => {
    void loadingTask.destroy();
  };
  signal?.addEventListener("abort", destroyOnCancel, { once: true });

  try {
    loadingTask.onProgress = ({ loaded, total }: { loaded: number; total: number }) => {
      const percent = total ? Math.min(25, Math.round((loaded / total) * 25)) : 10;
      onProgress?.({ message: "Preparing PDF...", percent });
    };

    let startupTimer: ReturnType<typeof setTimeout> | undefined;
    const initial = await Promise.race([
      loadingTask.promise,
      new Promise<null>(resolve => { startupTimer = setTimeout(() => resolve(null), 3_000); }),
    ]).finally(() => clearTimeout(startupTimer));
    if (!initial) {
      void loadingTask.destroy().catch(() => {});
      onProgress?.({ message: "Preparing compatible PDF reader...", percent: 10 });
      await loadInPageReader();
      throwIfExtractionCancelled(signal);
      loadingTask = createReader();
    }
    const document = initial ?? await loadingTask.promise;
    throwIfExtractionCancelled(signal);
    if (document.numPages > MAX_PDF_PAGES) {
      throw new Error("This PDF has too many pages. Choose a PDF with 100 pages or fewer.");
    }

    const pages = [];
    const pageTexts: string[] = [];
    for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
      throwIfExtractionCancelled(signal);
      const page = await document.getPage(pageNumber);
      const textContent = await page.getTextContent();
      const textRuns: PdfTextRun[] = [];
      for (const item of textContent.items) {
        if (!("str" in item) || !item.str) continue;
        textRuns.push({
          str: item.str,
          transform: item.transform,
          width: item.width,
          height: item.height,
          hasEOL: item.hasEOL,
        });
      }
      const lines = assemblePdfTextLines(textRuns);

      const text = lines.join("\n").trim();
      pages.push({ pageNumber, text });
      if (text) pageTexts.push(`Page ${pageNumber}\n${text}`);
      onProgress?.({
        message: `Extracting page ${pageNumber} of ${document.numPages}...`,
        percent: 25 + Math.round((pageNumber / document.numPages) * 70),
        pageNumber,
        totalPages: document.numPages,
      });
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    }

    if (!pageTexts.length) {
      throw new Error(
        "No selectable text was found. This PDF may be scanned or image-only; local OCR is not available. Enter the plan manually or choose a text-based PDF.",
      );
    }

    const instructions = extractPdfInstructionCandidates(pages);
    if (!instructions.length) {
      throw new Error(
        "PDF text was extracted, but no exercise lines were identified. Enter exercises and dosage manually in review.",
      );
    }

    const pictureBudget = { remaining: 1_800_000 };
    for (const pageInfo of pages) {
      const pageInstructions = instructions.filter(item => item.pageNumber === pageInfo.pageNumber);
      if (!pageInstructions.length || pictureBudget.remaining <= 0) continue;
      throwIfExtractionCancelled(signal);
      onProgress?.({ message: `Extracting pictures from page ${pageInfo.pageNumber}...`, percent: 95 });
      const page = await document.getPage(pageInfo.pageNumber);
      const content = await page.getTextContent();
      const runs = content.items.filter(item => "str" in item) as PdfTextRun[];
      try { await extractPagePictures(page, runs, pageInstructions, pictureBudget, signal); }
      catch { throwIfExtractionCancelled(signal); } // Keep readable text if a drawing cannot render.
    }

    onProgress?.({ message: "Preparing exercises for review...", percent: 100 });
    return {
      content: pageTexts.join("\n\n"),
      pages,
      instructions,
      sourceType: "pdf",
    };
  } catch (error) {
    if (signal?.aborted) throw new Error("EXTRACTION_CANCELLED");
    if (isPasswordError(error)) {
      throw new Error("This PDF is password-protected. Unlock it before importing.");
    }
    if (isInvalidPdfError(error)) {
      throw new Error("This PDF is corrupt or unreadable. Try another file or enter the plan manually.");
    }
    throw error;
  } finally {
    signal?.removeEventListener("abort", destroyOnCancel);
    void loadingTask.destroy().catch(() => {});
  }
}

export function extractTherapyPlanFile(
  asset: DocumentPickerAsset,
  options: ExtractionOptions = {},
): Promise<ExtractedPlanFile> {
  const extension = getFileExtension(asset.name);
  if (extension === ".pdf") return extractPdfFile(asset, options);
  return extractTextFile(asset, options);
}