"use client";

import { useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { FileText } from "lucide-react";
import { Checkbox, Field, TextInput } from "@/components/ui/FormFields";
import { StepChrome } from "@/components/wizard/StepChrome";
import { formatEuro, todayIso } from "@/lib/format";
import { cardRow } from "@/lib/ui-classes";
import { useWizardStore } from "@/store/wizard-store";

const DownloadTilinpaatosPdf = dynamic(
  () =>
    import("@/components/pdf/DownloadTilinpaatosPdf").then(
      (m) => m.DownloadTilinpaatosPdf,
    ),
  {
    ssr: false,
    loading: () => (
      <p className="text-sm text-[var(--muted)]">Ladataan PDF-moottoria…</p>
    ),
  },
);

export function Step11Hyvaksynta() {
  const h = useWizardStore((s) => s.hyvaksynta);
  const patch = useWizardStore((s) => s.patchHyvaksynta);
  const yritys = useWizardStore((s) => s.yritys);
  const reititys = useWizardStore((s) => s.reititys);
  const liitetiedot = useWizardStore((s) => s.liitetiedot);
  const pankit = useWizardStore((s) => s.pankit);
  const run = useWizardStore((s) => s.runEngine);
  const laskelma = useWizardStore((s) => s.laskelma);

  const pankkiYhteensa = useMemo(
    () => pankit.reduce((s, p) => s + p.loppusaldo, 0),
    [pankit],
  );

  // Aja moottori heti — käyttää mm. AI-täytettyjä pankkisaldoja Zustandista.
  useEffect(() => {
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once on mount / when banks change
  }, [pankkiYhteensa]);

  const fresh = laskelma;
  if (!fresh) {
    return (
      <StepChrome>
        <p className="text-sm text-[var(--muted)]">
          Laskentaa ajetaan wizard-tilasta…
        </p>
        <button
          type="button"
          className="mt-3 text-sm font-medium text-[var(--accent)] hover:underline"
          onClick={() => run()}
        >
          Aja laskenta nyt
        </button>
      </StepChrome>
    );
  }

  const t = fresh.kuluva;
  const bs = fresh.taseKuluva;

  return (
    <StepChrome
      checklist={[
        "Ristiintarkistus: tulos ↔ tase (Vastaavaa = Vastattavaa)",
        "Allekirjoitus ja hyväksyntä",
        "Lataa Tilinpäätös PDF moottorin luvuilla",
      ]}
    >
      {/* Prominent PDF CTA first */}
      <div
        className={`${cardRow} border-[var(--accent)]/40 bg-[var(--accent-soft)]/40`}
      >
        <div className="flex items-center gap-2 text-[var(--accent)]">
          <FileText className="size-5" />
          <h3 className="text-base font-semibold text-[var(--fg)]">
            Lataa Tilinpäätös PDF
          </h3>
        </div>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Muodostaa virallisen PMA-tilinpäätöksen (kansilehti, tuloslaskelma,
          tase, allekirjoitukset) juuri lasketuista Zustand-luvuista — sisältää
          AI-poimitun pankkisaldon ({formatEuro(pankkiYhteensa)}).
        </p>
        <div className="mt-4">
          <DownloadTilinpaatosPdf
            yritys={yritys}
            reititys={reititys}
            laskelma={fresh}
            liitetiedot={liitetiedot}
            hyvaksynta={h}
            pankkiYhteensa={pankkiYhteensa}
            refreshLaskelma={() => run()}
            onGenerated={() => patch({ pdfValmis: true })}
          />
        </div>
      </div>

      <div className={`${cardRow} space-y-3`}>
        <Checkbox
          checked={h.ristiintarkistusOk}
          onChange={(v) => patch({ ristiintarkistusOk: v })}
          label={`Ristiintarkistus OK (tase ${
            bs.tasapainossa ? "täsmää sentilleen" : "ei täsmää"
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
          label="PDF tarkistettu / ladattu"
        />
        <Field label="Hyväksyjä">
          <TextInput
            value={h.hyvaksyja}
            onChange={(v) => patch({ hyvaksyja: v })}
          />
        </Field>
      </div>

      <div className={`${cardRow} print:border-black`}>
        <h3 className="text-sm font-semibold text-[var(--fg)]">
          Esikatselu (moottorin luvut)
        </h3>
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
                <span>Rahat ja pankit</span>
                <span className="tabular-nums font-semibold text-[var(--accent)]">
                  {formatEuro(bs.rahatJaPankkisaamiset)}
                </span>
              </li>
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
      </div>
    </StepChrome>
  );
}
