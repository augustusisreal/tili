"use client";

import { useCallback, useRef, useState } from "react";
import { FileUp, File as FileIcon, Trash2, Sparkles } from "lucide-react";
import type { UploadCategory } from "@/lib/types";
import { UPLOAD_CATEGORY_LABELS } from "@/lib/types";
import { formatFileSize } from "@/lib/uploads";
import { btnGhost } from "@/lib/ui-classes";
import { useWizardStore } from "@/store/wizard-store";

const ACCEPT =
  ".pdf,.csv,.xlsx,.xls,.xml,.txt,.jpg,.jpeg,.png,.webp,application/pdf,image/*";

type Props = {
  category: UploadCategory;
  hint?: string;
  multiple?: boolean;
};

export function FileDropZone({
  category,
  hint = "PDF, CSV, Excel, kuva — max 25 Mt",
  multiple = true,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const files = useWizardStore((s) =>
    s.uploadedFiles.filter((f) => f.category === category),
  );
  const addUploadedFiles = useWizardStore((s) => s.addUploadedFiles);
  const removeUploadedFile = useWizardStore((s) => s.removeUploadedFile);

  const ingest = useCallback(
    async (list: FileList | File[]) => {
      const arr = Array.from(list);
      if (arr.length === 0) return;
      setBusy(true);
      setError(null);
      const err = await addUploadedFiles(category, arr);
      if (err) setError(err);
      setBusy(false);
    },
    [addUploadedFiles, category],
  );

  return (
    <div className="space-y-3">
      <div
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
        onClick={() => inputRef.current?.click()}
        onDragEnter={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setDragging(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          if (e.dataTransfer.files?.length) void ingest(e.dataTransfer.files);
        }}
        className={`group relative cursor-pointer overflow-hidden rounded-xl border-2 border-dashed px-4 py-7 text-center transition ${
          dragging
            ? "border-[var(--accent)] bg-[var(--accent-soft)] scale-[1.01]"
            : "border-[var(--border)] bg-[var(--surface-2)] hover:border-[var(--accent)] hover:bg-[var(--surface-hover)]"
        }`}
      >
        <div
          className={`pointer-events-none absolute inset-0 opacity-0 transition group-hover:opacity-100 ${
            dragging ? "opacity-100" : ""
          }`}
          style={{
            background:
              "radial-gradient(ellipse at center, color-mix(in oklab, var(--accent) 12%, transparent), transparent 70%)",
          }}
        />
        <div className="relative mx-auto flex size-11 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[var(--accent)]">
          <FileUp className="size-5" />
        </div>
        <p className="relative mt-3 text-sm font-medium text-[var(--fg)]">
          {busy
            ? "Ladataan muistiin…"
            : `Vedä ja pudota: ${UPLOAD_CATEGORY_LABELS[category]}`}
        </p>
        <p className="relative mt-1 text-xs text-[var(--muted)]">
          tai klikkaa valitaksesi · {hint}
        </p>
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept={ACCEPT}
          multiple={multiple}
          onChange={(e) => {
            if (e.target.files) void ingest(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {error ? (
        <p className="text-xs text-[var(--status-yellow)]">{error}</p>
      ) : null}

      {files.length > 0 ? (
        <ul className="space-y-2">
          {files.map((f) => (
            <li
              key={f.id}
              className="flex items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5"
            >
              <FileIcon className="size-4 shrink-0 text-[var(--accent)]" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-[var(--fg)]">
                  {f.name}
                </p>
                <p className="flex items-center gap-1.5 text-[11px] text-[var(--muted)]">
                  {formatFileSize(f.size)} · {f.mimeType || "tiedosto"}
                  <span className="inline-flex items-center gap-0.5 rounded bg-[var(--accent-soft)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--accent)]">
                    <Sparkles className="size-2.5" />
                    Odottaa AI:ta
                  </span>
                </p>
              </div>
              <button
                type="button"
                className={btnGhost}
                aria-label={`Poista ${f.name}`}
                onClick={() => removeUploadedFile(f.id)}
              >
                <Trash2 className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
