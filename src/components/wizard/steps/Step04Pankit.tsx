"use client";

import { Plus, Trash2 } from "lucide-react";
import { Field, MoneyInput, TextInput } from "@/components/ui/FormFields";
import { FileDropZone } from "@/components/ui/FileDropZone";
import { StepChrome } from "@/components/wizard/StepChrome";
import { formatEuro } from "@/lib/format";
import { btnGhost, btnSoft, cardRow } from "@/lib/ui-classes";
import { useWizardStore } from "@/store/wizard-store";

export function Step04Pankit() {
  const pankit = useWizardStore((s) => s.pankit);
  const add = useWizardStore((s) => s.addPankki);
  const update = useWizardStore((s) => s.updatePankki);
  const remove = useWizardStore((s) => s.removePankki);
  const tilioteCount = useWizardStore(
    (s) => s.uploadedFiles.filter((f) => f.category === "tiliote").length,
  );

  return (
    <StepChrome
      checklist={[
        "Lataa tiliotteet (drag & drop) — säilytetään muistissa AI:lle",
        "Syötä IBAN ja tilikauden loppusaldo",
        "Täsmäytä kirjanpidon pankkitiliin",
      ]}
    >
      <div className={cardRow}>
        <h3 className="mb-1 text-sm font-semibold text-[var(--fg)]">
          Tiliotteet
        </h3>
        <p className="mb-3 text-xs text-[var(--muted)]">
          Vedä pankin tiliotteet tähän. {tilioteCount} tiedostoa muistissa.
        </p>
        <FileDropZone
          category="tiliote"
          hint="PDF / CSV / MT940 — max 25 Mt · odottaa AI-käsittelyä"
        />
      </div>

      <div className="flex justify-end">
        <button type="button" className={btnSoft} onClick={add}>
          <Plus className="size-4" />
          Lisää tili
        </button>
      </div>

      {pankit.map((p) => {
        const ero = p.loppusaldo - p.kirjanpidonSaldo;
        return (
          <div key={p.id} className={`${cardRow} space-y-3`}>
            <div className="flex items-start justify-between gap-2">
              <Field label="Tilin nimi" className="flex-1">
                <TextInput
                  value={p.nimi}
                  onChange={(v) => update(p.id, { nimi: v })}
                  placeholder="Käyttötili"
                />
              </Field>
              <button
                type="button"
                className={`${btnGhost} mt-6`}
                onClick={() => remove(p.id)}
                disabled={pankit.length <= 1}
              >
                <Trash2 className="size-4" />
              </button>
            </div>
            <Field label="IBAN">
              <TextInput
                value={p.iban}
                onChange={(v) => update(p.id, { iban: v })}
                placeholder="FI00 0000 0000 0000 00"
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Loppusaldo (pankki)">
                <MoneyInput
                  value={p.loppusaldo}
                  onChange={(v) => update(p.id, { loppusaldo: v })}
                />
              </Field>
              <Field label="Kirjanpidon saldo">
                <MoneyInput
                  value={p.kirjanpidonSaldo}
                  onChange={(v) => update(p.id, { kirjanpidonSaldo: v })}
                />
              </Field>
            </div>
            <p
              className={`text-xs ${
                Math.abs(ero) < 0.01
                  ? "text-[var(--status-green)]"
                  : "text-[var(--status-yellow)]"
              }`}
            >
              Erotus: {formatEuro(ero)}
            </p>
          </div>
        );
      })}
    </StepChrome>
  );
}
