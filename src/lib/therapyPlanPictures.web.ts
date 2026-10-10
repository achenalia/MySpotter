import type { PDFPageProxy } from "pdfjs-dist";
import type { TherapyPlanInstruction } from "@/data/therapyPlan";
import { throwIfExtractionCancelled } from "./therapyPlanText.types";

type TextRun = { str: string; transform: number[]; width: number; height: number };
const key = (text: string) => text.toLowerCase().replace(/[^a-z0-9]/g, "");

// Render the source exercise section: this also works for vector illustrations,
// which cannot be extracted as embedded bitmap objects.
export async function extractPagePictures(
  page: PDFPageProxy,
  runs: TextRun[],
  instructions: TherapyPlanInstruction[],
  budget: { remaining: number },
  signal?: AbortSignal,
) {
  if (!instructions.length || budget.remaining <= 0) return;
  const viewport = page.getViewport({ scale: 1 });
  const rows: { y: number; runs: TextRun[] }[] = [];
  for (const run of runs) {
    const y = viewport.convertToViewportPoint(run.transform[4], run.transform[5])[1];
    let row = rows.find(item => Math.abs(item.y - y) <= Math.max(2, run.height * 0.3));
    if (!row) { row = { y, runs: [] }; rows.push(row); }
    row.runs.push(run);
  }
  const headings = instructions.map(instruction => {
    const row = rows.find(item => key(item.runs.sort((a, b) => a.transform[4] - b.transform[4]).map(run => run.str).join(" ")).includes(key(instruction.exercise)));
    return { instruction, y: row ? Math.max(0, row.y - Math.max(...row.runs.map(run => Math.abs(run.height)), 14) - 8) : null };
  });
  // Missing or side-by-side headings are ambiguous: show the labeled source page.
  const ambiguous = headings.some(item => item.y === null) || headings.some((item, i) => headings.some((other, j) => i !== j && Math.abs((item.y ?? 0) - (other.y ?? 0)) < 25));
  const scale = Math.min(900 / viewport.width, 1400 / viewport.height, 2);
  const renderedViewport = page.getViewport({ scale });
  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(renderedViewport.width);
  canvas.height = Math.ceil(renderedViewport.height);
  const context = canvas.getContext("2d");
  if (!context) return;
  throwIfExtractionCancelled(signal);
  const task = page.render({ canvas, canvasContext: context, viewport: renderedViewport, background: "white" });
  const cancel = () => task.cancel();
  signal?.addEventListener("abort", cancel, { once: true });
  try { await task.promise; } finally { signal?.removeEventListener("abort", cancel); }
  throwIfExtractionCancelled(signal);
  const ordered = headings.sort((a, b) => (a.y ?? 0) - (b.y ?? 0));
  for (let i = 0; i < ordered.length; i++) {
    const { instruction, y } = ordered[i];
    const top = ambiguous ? 0 : Math.round((y ?? 0) * scale);
    const bottom = ambiguous ? canvas.height : Math.min(canvas.height, Math.round((ordered[i + 1]?.y ?? viewport.height - 28) * scale));
    const crop = document.createElement("canvas");
    crop.width = canvas.width;
    crop.height = Math.max(1, bottom - top);
    crop.getContext("2d")?.drawImage(canvas, 0, top, canvas.width, crop.height, 0, 0, crop.width, crop.height);
    const uri = crop.toDataURL("image/jpeg", 0.72);
    if (uri.length <= budget.remaining) {
      instruction.pdfPicture = { uri, width: crop.width, height: crop.height, pageNumber: page.pageNumber, kind: ambiguous ? "page" : "section" };
      budget.remaining -= uri.length;
    }
    crop.width = crop.height = 0;
  }
  canvas.width = canvas.height = 0;
}
