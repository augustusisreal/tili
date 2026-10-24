"use client";

import { Field, MoneyInput } from "@/components/ui/FormFields";
import { StepChrome } from "@/components/wizard/StepChrome";
import { formatEuro } from "@/lib/format";
import { cardRow } from "@/lib/ui-classes";
import { useWizardStore } from "@/store/wizard-store";

export function Step08OmaPaaoma() {
  const o = useWizardStore((s) => s.omaPaaoma);
  const patch = useWizardStore((s) => s.patchOmaPaaoma);
  const yht =
    o.osakepaaoma + o.svop + o.edellinenVoittoTappio - o.osingot + o.tilikaudenTulos;

  return (
    <StepChrome
      checklist={[
        "Osakepääoma ja SVOP",
        "Edellisten tilikausien voitto/tappio",
        "OYL 20:23 § ja TVL 53a § jos oma pääoma negatiivinen",
      ]}
    >
      <div className={`grid gap-4 sm:grid-cols-2 ${cardRow}`}>
        <Field label="Osakepääoma">
          <MoneyInput
            value={o.osakepaaoma}
            onChange={(v) => patch({ osakepaaoma: v })}
          />
        </Field>
        <Field label="SVOP-rahasto">
          <MoneyInput value={o.svop} onChange={(v) => patch({ svop: v })} />
        </Field>
        <Field label="Edellisten tilikausien voitto (+) / tappio (−)">
          <MoneyInput
            value={o.edellinenVoittoTappio}
            onChange={(v) => patch({ edellinenVoittoTappio: v })}
          />
        </Field>
        <Field label="Osingot / varojenjako">
          <MoneyInput
            value={o.osingot}
            onChange={(v) => patch({ osingot: v })}
          />
        </Field>
        <Field label="Tilikauden tulos (moottorista)" className="sm:col-span-2">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--input-bg)] px-3 py-2 text-sm tabular-nums">
            {formatEuro(o.tilikaudenTulos)}
          </div>
        </Field>
      </div>

      <div
        className={`${cardRow} ${
          yht < 0 ? "border-[var(--status-yellow)]" : ""
        }`}
      >
        <div className="text-sm text-[var(--muted)]">Oma pääoma yhteensä</div>
        <div className="mt-1 text-xl font-semibold tabular-nums text-[var(--fg)]">
          {formatEuro(yht)}
        </div>
        {yht < 0 ? (
          <p className="mt-2 text-sm text-[var(--status-yellow)]">
            Negatiivinen oma pääoma: tarkista OYL 20:23 § (rekisteröinti) ja TVL
            53a § (tappion vähennysoikeus).
          </p>
        ) : null}
      </div>
    </StepChrome>
  );
}
