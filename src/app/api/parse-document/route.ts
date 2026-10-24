import { generateObject } from "ai";
import { NextResponse } from "next/server";
import { extractDocumentText } from "@/lib/ai/extract-text";
import { missingAiKeyMessage, resolveAiProvider } from "@/lib/ai/provider";
import {
  TILIOTE_SYSTEM_PROMPT,
  tilioteExtractSchema,
  type TilioteExtract,
} from "@/lib/ai/tiliote-schema";

export const maxDuration = 60;

const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;

function normalizeIban(raw: string): string {
  return raw.replace(/\s+/g, "").toUpperCase();
}

function sanitizeExtract(raw: TilioteExtract): TilioteExtract {
  return {
    ...raw,
    iban: normalizeIban(raw.iban ?? ""),
    loppusaldo: Number.isFinite(raw.loppusaldo) ? raw.loppusaldo : 0,
    tilinNimi: raw.tilinNimi?.trim() || undefined,
    paatospaiva: raw.paatospaiva?.trim() || undefined,
    huomautus: raw.huomautus?.trim() || undefined,
  };
}

export async function POST(req: Request) {
  const provider = resolveAiProvider();
  if (!provider) {
    return NextResponse.json(
      { error: missingAiKeyMessage(), code: "missing_api_key" },
      { status: 503 },
    );
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json(
      { error: "Virheellinen pyyntö (odotettiin multipart/form-data)." },
      { status: 400 },
    );
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "Tiedosto puuttuu (kenttä: file)." },
      { status: 400 },
    );
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json(
      { error: "Tiedosto on liian suuri (max 25 Mt)." },
      { status: 413 },
    );
  }

  const kind = String(form.get("kind") || "tiliote");
  if (kind !== "tiliote") {
    return NextResponse.json(
      { error: `Dokumenttityyppi „${kind}” ei ole vielä tuettu. Käytä kind=tiliote.` },
      { status: 400 },
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  let extracted: { text: string; method: "pdf" | "text" };
  try {
    extracted = await extractDocumentText(buffer, file.type, file.name);
  } catch (e) {
    return NextResponse.json(
      {
        error:
          e instanceof Error
            ? e.message
            : "Tekstin poiminta tiedostosta epäonnistui.",
        code: "extract_failed",
      },
      { status: 422 },
    );
  }

  try {
    const { object } = await generateObject({
      model: provider.model,
      schema: tilioteExtractSchema,
      schemaName: "TilioteExtract",
      schemaDescription:
        "Suomalaisen pankkitiliotteen IBAN ja tilikauden päätössaldo",
      system: TILIOTE_SYSTEM_PROMPT,
      prompt: `Tiedostonimi: ${file.name}\n\nTiliotteen teksti:\n\n${extracted.text}`,
      temperature: 0,
    });

    const data = sanitizeExtract(object);

    return NextResponse.json({
      ok: true,
      data,
      meta: {
        provider: provider.provider,
        model: provider.modelId,
        extractMethod: extracted.method,
        textChars: extracted.text.length,
        fileName: file.name,
      },
    });
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "AI-analyysi epäonnistui.";
    return NextResponse.json(
      { error: message, code: "ai_failed" },
      { status: 502 },
    );
  }
}
