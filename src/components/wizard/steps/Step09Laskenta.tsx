"use client";

import { Calculator } from "lucide-react";
import { StepChrome } from "@/components/wizard/StepChrome";
import { formatEuro } from "@/lib/format";
import { btnPrimary, cardRow } from "@/lib/ui-classes";
import { useWizardStore } from "@/store/wizard-store";

export function Step09Laskenta() {
  const run = useWizardStore((s) => s.runEngine);
  const laskelma = useWizardStore((s) => s.laskelma);

  return (
    <StepChrome
      checklist={[
        "PMA-tuloslaskelma (kuluva)",
        "Tase: Vastaavaa === Vastattavaa",
        "Kaikki luvut deterministisestä TypeScript-moottorista",
      ]}
      onComplete={run}
      completeLabel="Aja laskenta & merkitse"
    >
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" className={btnPrimary} onClick={run}>
          <Calculator className="size-4" />
          Aja laskentamoottori
        </button>
        <span className="text-xs text-[var(--muted)]">
          Ei LLM-lukuja — puhdasta aritmetiikkaa.
        </span>
      </div>

      {!laskelma ? (
        <p className="text-sm text-[var(--muted)]">
          Paina „Aja laskentamoottori” muodostaaksesi tuloslaskelman ja taseen.
        </p>
      ) : (
        <>
          {laskelma.varoitukset.length > 0 ? (
            <div className={`${cardRow} border-[var(--status-yellow)]/40`}>
              <h3 className="text-sm font-semibold text-[var(--status-yellow)]">
                Varoitukset
              </h3>
              <ul className="mt-2 space-y-1">
                {laskelma.varoitukset.map((w) => (
                  <li key={w} className="text-sm text-[var(--muted)]">
                    {w}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="grid gap-4 lg:grid-cols-2">
            <div className={cardRow}>
              <h3 className="text-sm font-semibold text-[var(--fg)]">
                Tuloslaskelma (PMA)
              </h3>
              <Table
                rows={[
                  ["Liikevaihto", laskelma.kuluva.liikevaihto],
                  ["Materiaalit ja palvelut", -laskelma.kuluva.materiaalitJaPalvelut],
                  ["Henkilöstökulut", -laskelma.kuluva.henkilostokulut],
                  ["Poistot", -laskelma.kuluva.poistot],
                  ["Liiketoiminnan muut kulut", -laskelma.kuluva.liiketoiminnanMuutKulut],
                  ["Liiketulos", laskelma.kuluva.liiketulos],
                  ["Rahoitustuotot", laskelma.kuluva.rahoitustuotot],
                  ["Rahoituskulut", -laskelma.kuluva.rahoituskulut],
                  ["Tulos ennen veroja", laskelma.kuluva.tulosEnnenVeroja],
                  ["Verot", -laskelma.kuluva.verot],
                  ["Tilikauden tulos", laskelma.kuluva.tilikaudenTulos],
                ]}
              />
            </div>

            <div className={cardRow}>
              <h3 className="text-sm font-semibold text-[var(--fg)]">
                Tase{" "}
                <span
                  className={
                    laskelma.taseKuluva.tasapainossa
                      ? "text-[var(--status-green)]"
                      : "text-[var(--status-yellow)]"
                  }
                >
                  {laskelma.taseKuluva.tasapainossa
                    ? "· tasapainossa"
                    : `· erotus ${formatEuro(laskelma.taseKuluva.erotus)}`}
                </span>
              </h3>
              <p className="mt-3 text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
                Vastaavaa
              </p>
              <Table
                rows={[
                  ["Aineelliset hyödykkeet", laskelma.taseKuluva.aineellisetHyodykkeet],
                  ["Vaihto-omaisuus", laskelma.taseKuluva.vaihtoOmaisuus],
                  ["Myyntisaamiset", laskelma.taseKuluva.myyntisaamiset],
                  ["Muut saamiset", laskelma.taseKuluva.muutSaamiset],
                  ["Rahat ja pankkisaamiset", laskelma.taseKuluva.rahatJaPankkisaamiset],
                  ["Vastaavaa yhteensä", laskelma.taseKuluva.vastaavaaYhteensa],
                ]}
              />
              <p className="mt-4 text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
                Vastattavaa
              </p>
              <Table
                rows={[
                  ["Osakepääoma", laskelma.taseKuluva.osakepaaoma],
                  ["SVOP", laskelma.taseKuluva.svop],
                  ["Ed. voitto/tappio", laskelma.taseKuluva.edellistenTilienVoitto],
                  ["Tilikauden tulos", laskelma.taseKuluva.tilikaudenTulos],
                  ["Ostovelat", laskelma.taseKuluva.ostovelat],
                  ["Siirtovelat", laskelma.taseKuluva.siirtovelat],
                  ["Muut velat", laskelma.taseKuluva.muutVelat],
                  ["Vastattavaa yhteensä", laskelma.taseKuluva.vastattavaaYhteensa],
                ]}
              />
            </div>
          </div>
        </>
      )}
    </StepChrome>
  );
}

function Table({ rows }: { rows: [string, number][] }) {
  return (
    <dl className="mt-2 divide-y divide-[var(--border)]">
      {rows.map(([label, value], i) => (
        <div
          key={label}
          className={`flex items-center justify-between gap-3 py-1.5 text-sm ${
            i === rows.length - 1 ? "font-semibold" : ""
          }`}
        >
          <dt className="text-[var(--muted)]">{label}</dt>
          <dd className="tabular-nums text-[var(--fg)]">{formatEuro(value)}</dd>
        </div>
      ))}
    </dl>
  );
}
