import { PDFParse } from "pdf-parse";

const MAX_CHARS = 60_000;

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
    const parser = new PDFParse({ data: new Uint8Array(buffer) });
    try {
      const result = await parser.getText();
      const text = (result.text || "").trim();
      if (!text) {
        throw new Error("PDF:stä ei saatu tekstiä (mahdollisesti skannattu kuva).");
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
