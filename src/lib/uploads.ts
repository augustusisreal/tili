import type { UploadCategory, UploadedFileMeta } from "./types";
import { todayIso } from "./format";

const MAX_BYTES = 25 * 1024 * 1024; // 25 Mt

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} kt`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mt`;
}

export async function fileToUploadedMeta(
  file: File,
  category: UploadCategory,
): Promise<UploadedFileMeta> {
  if (file.size > MAX_BYTES) {
    throw new Error(`Tiedosto „${file.name}” on liian suuri (max 25 Mt).`);
  }
  const data = await file.arrayBuffer();
  return {
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    category,
    name: file.name,
    size: file.size,
    mimeType: file.type || "application/octet-stream",
    addedAt: todayIso(),
    data,
  };
}

export { MAX_BYTES };
