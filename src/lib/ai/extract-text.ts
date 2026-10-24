import { existsSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { PDFParse } from "pdf-parse";

const MAX_CHARS = 60_000;

let workerConfigured = false;

/**
 * Configure pdfjs worker for Next.js server runtime.
 * Without an absolute workerSrc, Turbopack resolves `pdf.worker.mjs` into
 * `.next/dev/server/chunks/` and fake-worker setup fails.
 */
function ensurePdfWorker(): void {
  if (workerConfigured) return;

  const candidates = [
    path.join(
      process.cwd(),
      "node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs",
    ),
    path.join(process.cwd(), "node_modules/pdfjs-dist/build/pdf.worker.mjs"),
    path.join(
      process.cwd(),
      "node_modules/pdf-parse/dist/pdf-parse/esm/pdf.worker.mjs",
    ),
    path.join(process.cwd(), "public/pdf.worker.mjs"),
  ];

  const workerFile = candidates.find((p) => existsSync(p));
  if (!workerFile) {
    throw new Error(
      "pdf.worker.mjs ei löydy (pdfjs-dist). Suorita npm install.",
    );
  }

  // Absolute file:// URL — works in Node API routes; avoids .next chunk paths.
  PDFParse.setWorker(pathToFileURL(workerFile).href);
  workerConfigured = true;
}

export async function extractDocumentText(
  buffer: Buffer,
  mimeType: string,
  fileName: string,
): Promise<{ text: string; method: "pdf" | "text" }> {
  const lower = fileName.toLowerCase();
  const isPdf =
    mimeType === "application/pdf" ||
    mimeType === "application/x-pdf" ||
    lower.endsWith(".pdf");

  if (isPdf) {
    ensurePdfWorker();
    // Copy buffer so pdfjs transferables cannot detach the original ArrayBuffer.
    const data = Uint8Array.from(buffer);
    const parser = new PDFParse({
      data,
      // Keep font/CMap loading on main thread in serverless/Node.
      useWorkerFetch: false,
      isEvalSupported: false,
      useSystemFonts: true,
    });
    try {
      const result = await parser.getText();
      const text = (result.text || "").trim();
      if (!text) {
        throw new Error(
          "PDF:stä ei saatu tekstiä (mahdollisesti skannattu kuva).",
        );
      }
      return { text: text.slice(0, MAX_CHARS), method: "pdf" };
    } finally {
      await parser.destroy().catch(() => undefined);
    }
  }

  // CSV / TXT / XML / MT940-tyylinen teksti
  const text = buffer.toString("utf8").trim();
  if (!text) {
    throw new Error("Tiedostosta ei saatu luettavaa tekstiä.");
  }
  return { text: text.slice(0, MAX_CHARS), method: "text" };
}
