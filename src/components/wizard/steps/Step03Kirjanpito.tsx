"use client";

import { Checkbox, Field, MoneyInput } from "@/components/ui/FormFields";
import { FileDropZone } from "@/components/ui/FileDropZone";
import { StepChrome } from "@/components/wizard/StepChrome";
import { cardRow } from "@/lib/ui-classes";
import { useWizardStore } from "@/store/wizard-store";

export function Step03Kirjanpito() {
  const kp = useWizardStore((s) => s.kirjanpito);
  const reititys = useWizardStore((s) => s.reititys);
  const patch = useWizardStore((s) => s.patchKirjanpito);
  const nolla = reititys.onNollatoiminta === true || kp.nollatoiminta;
  const uploadedCount = useWizardStore(
    (s) =>
      s.uploadedFiles.filter((f) =>
        ["paakirja", "tuloslaskelma", "tase", "edellinen_tp", "kuitti"].includes(
          f.category,
        ),
      ).length,
  );

  return (
    <StepChrome
      checklist={[
        nolla
          ? "0-toiminta: tuloslaskelma voi olla nolla"
          : "Lataa pääkirja / tulos / tase tai syötä luvut käsin",
        "Tiedostot säilyvät selaimen muistissa (odottaa AI-käsittelyä)",
        "Jatkavalla tilikaudella tarvitaan edellisen vuoden TP",
      ]}
    >
      <div className={`${cardRow} space-y-3`}>
        <Checkbox
          checked={kp.nollatoiminta}
          onChange={(v) => patch({ nollatoiminta: v })}
          label="0-toiminta — ei liiketoimintaa tilikaudella"
        />
        <p className="text-xs text-[var(--muted)]">
          Ladattuja kirjanpitotiedostoja: {uploadedCount}
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className={cardRow}>
          <h3 className="mb-3 text-sm font-semibold text-[var(--fg)]">
            Pääkirja / päiväkirja
          </h3>
          <FileDropZone category="paakirja" />
        </div>
        <div className={cardRow}>
          <h3 className="mb-3 text-sm font-semibold text-[var(--fg)]">
            Tuloslaskelma
          </h3>
          <FileDropZone category="tuloslaskelma" />
        </div>
        <div className={cardRow}>
          <h3 className="mb-3 text-sm font-semibold text-[var(--fg)]">Tase</h3>
          <FileDropZone category="tase" />
        </div>
        <div className={cardRow}>
          <h3 className="mb-3 text-sm font-semibold text-[var(--fg)]">
            Kuitit (valinnainen)
          </h3>
          <FileDropZone
            category="kuitti"
            hint="Kuitit, tositteet — odottaa AI-käsittelyä"
          />
        </div>
        {reititys.onEnsimmainenTilikausi === false ? (
          <div className={`${cardRow} lg:col-span-2`}>
            <h3 className="mb-3 text-sm font-semibold text-[var(--fg)]">
              Edellisen vuoden vahvistettu tilinpäätös
            </h3>
            <FileDropZone category="edellinen_tp" />
          </div>
        ) : null}
      </div>

      <div className={`${cardRow} space-y-2`}>
        <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
          Lataustila (automaattinen)
        </p>
        <Checkbox
          checked={kp.paakirjaLadattu}
          onChange={(v) => patch({ paakirjaLadattu: v })}
          label="Pääkirja käsitelty"
        />
        <Checkbox
          checked={kp.tuloslaskelmaLadattu}
          onChange={(v) => patch({ tuloslaskelmaLadattu: v })}
          label="Tuloslaskelma saatavilla"
        />
        <Checkbox
          checked={kp.taseLadattu}
          onChange={(v) => patch({ taseLadattu: v })}
          label="Tase saatavilla"
        />
        {reititys.onEnsimmainenTilikausi === false ? (
          <Checkbox
            checked={kp.edellinenTpLadattu}
            onChange={(v) => patch({ edellinenTpLadattu: v })}
            label="Edellisen vuoden TP vertailuun"
          />
        ) : null}
      </div>

      {!nolla ? (
        <div className={`grid gap-4 sm:grid-cols-2 ${cardRow}`}>
          <Field label="Liikevaihto">
            <MoneyInput
              value={kp.liikevaihto}
              onChange={(v) => patch({ liikevaihto: v })}
            />
          </Field>
          <Field label="Materiaalit ja palvelut">
            <MoneyInput
              value={kp.materiaalitJaPalvelut}
              onChange={(v) => patch({ materiaalitJaPalvelut: v })}
            />
          </Field>
          <Field label="Henkilöstökulut">
            <MoneyInput
              value={kp.henkilostokulut}
              onChange={(v) => patch({ henkilostokulut: v })}
            />
          </Field>
          <Field label="Poistot (kirjanpito)">
            <MoneyInput
              value={kp.poistot}
              onChange={(v) => patch({ poistot: v })}
            />
          </Field>
          <Field label="Liiketoiminnan muut kulut">
            <MoneyInput
              value={kp.liiketoiminnanMuutKulut}
              onChange={(v) => patch({ liiketoiminnanMuutKulut: v })}
            />
          </Field>
          <Field label="Rahoitustuotot">
            <MoneyInput
              value={kp.rahoitustuotot}
              onChange={(v) => patch({ rahoitustuotot: v })}
            />
          </Field>
          <Field label="Rahoituskulut">
            <MoneyInput
              value={kp.rahoituskulut}
              onChange={(v) => patch({ rahoituskulut: v })}
            />
          </Field>
          <Field label="Tuloverot (kirjanpito)">
            <MoneyInput
              value={kp.verot}
              onChange={(v) => patch({ verot: v })}
            />
          </Field>
        </div>
      ) : (
        <p className="text-sm text-[var(--muted)]">
          0-toiminta: tuloslaskelma jätetään nollille. Pankkisaldot ja oma pääoma
          täytetään myöhemmissä vaiheissa.
        </p>
      )}
    </StepChrome>
  );
}
