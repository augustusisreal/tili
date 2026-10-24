"use client";

import { useCallback, useRef, useState } from "react";
import {
  FileUp,
  File as FileIcon,
  Trash2,
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import type { TilioteExtract } from "@/lib/ai/tiliote-schema";
import type { UploadCategory } from "@/lib/types";
import { UPLOAD_CATEGORY_LABELS } from "@/lib/types";
import { formatFileSize } from "@/lib/uploads";
import { btnGhost } from "@/lib/ui-classes";
import { useWizardStore } from "@/store/wizard-store";

const ACCEPT =
  ".pdf,.csv,.xlsx,.xls,.xml,.txt,.jpg,.jpeg,.png,.webp,application/pdf,image/*";

type AiStatus = "idle" | "analyzing" | "done" | "error";

type Props = {
  category: UploadCategory;
  hint?: string;
  multiple?: boolean;
  /** Kun true (tiliote), lähetä PDF/teksti /api/parse-document -reittiin. */
  enableAiParse?: boolean;
  onAiParsed?: (data: TilioteExtract, fileName: string) => void;
};

function isParsable(file: File): boolean {
  const n = file.name.toLowerCase();
  return (
    file.type === "application/pdf" ||
    n.endsWith(".pdf") ||
    n.endsWith(".csv") ||
    n.endsWith(".txt") ||
    n.endsWith(".xml") ||
    file.type.startsWith("text/")
  );
}

export function FileDropZone({
  category,
  hint = "PDF, CSV, Excel, kuva — max 25 Mt",
  multiple = true,
  enableAiParse = false,
  onAiParsed,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiStatus, setAiStatus] = useState<AiStatus>("idle");
  const [aiMessage, setAiMessage] = useState<string | null>(null);

  const uploadedFiles = useWizardStore((s) => s.uploadedFiles);
  const files = uploadedFiles.filter((f) => f.category === category);
  const addUploadedFiles = useWizardStore((s) => s.addUploadedFiles);
  const removeUploadedFile = useWizardStore((s) => s.removeUploadedFile);

  const runAiParse = useCallback(
    async (file: File) => {
      if (!enableAiParse || category !== "tiliote") return;
      if (!isParsable(file)) {
        setAiStatus("error");
        setAiMessage(
          "AI-parsinta tukee PDF- ja tekstitiedostoja (csv/txt/xml). Kuva/Excel: lataa PDF-tiliote.",
        );
        return;
      }

      setAiStatus("analyzing");
      setAiMessage("Analysoidaan tekoälyllä…");

      try {
        const body = new FormData();
        body.append("file", file);
        body.append("kind", "tiliote");

        const res = await fetch("/api/parse-document", {
          method: "POST",
          body,
        });
        const json = (await res.json()) as {
          error?: string;
          code?: string;
          data?: TilioteExtract;
        };

        if (!res.ok || !json.data) {
          setAiStatus("error");
          setAiMessage(json.error || "AI-analyysi epäonnistui.");
          return;
        }

        onAiParsed?.(json.data, file.name);
        setAiStatus("done");
        const parts = [
          json.data.iban ? `IBAN ${json.data.iban}` : null,
          Number.isFinite(json.data.loppusaldo)
            ? `saldo ${json.data.loppusaldo.toFixed(2)} €`
            : null,
        ].filter(Boolean);
        setAiMessage(
          parts.length
            ? `Poimittu: ${parts.join(" · ")}`
            : json.data.huomautus || "AI valmis (ei selkeitä kenttiä).",
        );
      } catch {
        setAiStatus("error");
        setAiMessage("Verkkovirhe AI-analyysissä.");
      }
    },
    [category, enableAiParse, onAiParsed],
  );

  const ingest = useCallback(
    async (list: FileList | File[]) => {
      const arr = Array.from(list);
      if (arr.length === 0) return;
      setBusy(true);
      setError(null);
      setAiStatus("idle");
      setAiMessage(null);
      const err = await addUploadedFiles(category, arr);
      if (err) {
        setError(err);
        setBusy(false);
        return;
      }
      setBusy(false);

      if (enableAiParse && category === "tiliote") {
        // Analysoi ensimmäinen kelvollinen tiedosto (päätössaldo / IBAN)
        const target = arr.find(isParsable) ?? arr[0];
        if (target) await runAiParse(target);
      }
    },
    [addUploadedFiles, category, enableAiParse, runAiParse],
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
          {aiStatus === "analyzing" ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <FileUp className="size-5" />
          )}
        </div>
        <p className="relative mt-3 text-sm font-medium text-[var(--fg)]">
          {aiStatus === "analyzing"
            ? "Analysoidaan tekoälyllä…"
            : busy
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

      {aiMessage ? (
        <div
          className={`flex items-start gap-2 rounded-lg border px-3 py-2 text-xs ${
            aiStatus === "error"
              ? "border-[var(--status-yellow)]/40 text-[var(--status-yellow)]"
              : aiStatus === "done"
                ? "border-[var(--status-green)]/40 text-[var(--status-green)]"
                : "border-[var(--border)] text-[var(--muted)]"
          }`}
        >
          {aiStatus === "analyzing" ? (
            <Loader2 className="mt-0.5 size-3.5 shrink-0 animate-spin" />
          ) : aiStatus === "done" ? (
            <CheckCircle2 className="mt-0.5 size-3.5 shrink-0" />
          ) : aiStatus === "error" ? (
            <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
          ) : (
            <Sparkles className="mt-0.5 size-3.5 shrink-0" />
          )}
          <span>{aiMessage}</span>
        </div>
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
                <p className="flex flex-wrap items-center gap-1.5 text-[11px] text-[var(--muted)]">
                  {formatFileSize(f.size)} · {f.mimeType || "tiedosto"}
                  <span className="inline-flex items-center gap-0.5 rounded bg-[var(--accent-soft)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--accent)]">
                    <Sparkles className="size-2.5" />
                    {enableAiParse
                      ? aiStatus === "done"
                        ? "AI valmis"
                        : aiStatus === "analyzing"
                          ? "AI käynnissä"
                          : aiStatus === "error"
                            ? "AI epäonnistui"
                            : "Odottaa AI:ta"
                      : "Odottaa AI:ta"}
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
