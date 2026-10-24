"use client";

import { FileText } from "lucide-react";
import { Checkbox, Field, TextInput } from "@/components/ui/FormFields";
import { StepChrome } from "@/components/wizard/StepChrome";
import { formatEuro, todayIso } from "@/lib/format";
import { cardRow } from "@/lib/ui-classes";
import { useWizardStore } from "@/store/wizard-store";

export function Step11Hyvaksynta() {
  const h = useWizardStore((s) => s.hyvaksynta);
  const patch = useWizardStore((s) => s.patchHyvaksynta);
  const laskelma = useWizardStore((s) => s.laskelma);
  const yritys = useWizardStore((s) => s.yritys);
  const reititys = useWizardStore((s) => s.reititys);
  const run = useWizardStore((s) => s.runEngine);

  if (!laskelma) {
    return (
      <StepChrome>
        <p className="text-sm text-[var(--muted)]">
          Aja ensin laskentamoottori (vaihe 9).
        </p>
        <button
          type="button"
          className="text-sm font-medium text-[var(--accent)] hover:underline"
          onClick={run}
        >
          Aja laskenta nyt
        </button>
      </StepChrome>
    );
  }

  const t = laskelma.kuluva;
  const bs = laskelma.taseKuluva;

  return (
    <StepChrome
      checklist={[
        "Ristiintarkistus: tulos ↔ tase ↔ 6B",
        "Allekirjoitus ja hyväksyntä",
        "Tulostusvalmis TP-näkymä (HTML, ei PDF-generaattoria)",
      ]}
    >
      <div className={`${cardRow} space-y-3`}>
        <Checkbox
          checked={h.ristiintarkistusOk}
          onChange={(v) => patch({ ristiintarkistusOk: v })}
          label={`Ristiintarkistus OK (tase ${
            bs.tasapainossa ? "täsmää" : "ei täsmää"
          })`}
        />
        <Checkbox
          checked={h.allekirjoitettu}
          onChange={(v) =>
            patch({
              allekirjoitettu: v,
              hyvaksyttyPvm: v ? todayIso() : "",
            })
          }
          label="Hallitus on allekirjoittanut tilinpäätöksen"
        />
        <Checkbox
          checked={h.pdfValmis}
          onChange={(v) => patch({ pdfValmis: v })}
          label="Tulostusvalmis näkymä tarkistettu"
        />
        <Field label="Hyväksyjä">
          <TextInput
            value={h.hyvaksyja}
            onChange={(v) => patch({ hyvaksyja: v })}
          />
        </Field>
      </div>

      <div className={`${cardRow} print:border-black`}>
        <div className="flex items-center gap-2 text-[var(--accent)]">
          <FileText className="size-4" />
          <h3 className="text-sm font-semibold">
            Tilinpäätös — tulostusnäkymä
          </h3>
        </div>
        <div className="mt-4 space-y-1 text-sm">
          <p className="text-lg font-semibold text-[var(--fg)]">
            {yritys.nimi || "—"}
          </p>
          <p className="text-[var(--muted)]">
            Y-tunnus {yritys.yTunnus || "—"} · {yritys.kotipaikka || "—"}
          </p>
          <p className="text-[var(--muted)]">
            Tilikausi {reititys.tilikausiAlku} – {reititys.tilikausiLoppu}
          </p>
        </div>
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
              Tuloslaskelma
            </h4>
            <ul className="mt-2 space-y-1 text-sm">
              <li className="flex justify-between">
                <span>Liikevaihto</span>
                <span className="tabular-nums">{formatEuro(t.liikevaihto)}</span>
              </li>
              <li className="flex justify-between">
                <span>Tilikauden tulos</span>
                <span className="tabular-nums font-semibold">
                  {formatEuro(t.tilikaudenTulos)}
                </span>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
              Tase
            </h4>
            <ul className="mt-2 space-y-1 text-sm">
              <li className="flex justify-between">
                <span>Vastaavaa</span>
                <span className="tabular-nums">
                  {formatEuro(bs.vastaavaaYhteensa)}
                </span>
              </li>
              <li className="flex justify-between">
                <span>Vastattavaa</span>
                <span className="tabular-nums font-semibold">
                  {formatEuro(bs.vastattavaaYhteensa)}
                </span>
              </li>
            </ul>
          </div>
        </div>
        <p className="mt-6 text-xs text-[var(--muted)]">
          Stub: oikea PDF-vienti (esim. @react-pdf) voidaan lisätä myöhemmin.
          Käytä selaimen Tulosta → PDF.
        </p>
      </div>
    </StepChrome>
  );
}
