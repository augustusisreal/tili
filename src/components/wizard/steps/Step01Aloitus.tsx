"use client";

import { Field, TextInput, YesNo } from "@/components/ui/FormFields";
import { StepChrome } from "@/components/wizard/StepChrome";
import { cardRow } from "@/lib/ui-classes";
import { useWizardStore } from "@/store/wizard-store";

export function Step01Aloitus() {
  const yritys = useWizardStore((s) => s.yritys);
  const reititys = useWizardStore((s) => s.reititys);
  const patchYritys = useWizardStore((s) => s.patchYritys);
  const patchReititys = useWizardStore((s) => s.patchReititys);

  return (
    <StepChrome
      checklist={[
        "Varmista, että yhtiömuoto on osakeyhtiö (Oy/Oyj)",
        "Valitse 1. tilikausi vs. jatkava",
        "Merkitse 0-toiminta, palkat ja varasto",
      ]}
    >
      <div className={cardRow}>
        <Field label="Onko yhtiö osakeyhtiö (Oy / Oyj)?">
          <YesNo
            value={yritys.onOsakeyhtio}
            onChange={(v) => patchYritys({ onOsakeyhtio: v })}
          />
        </Field>
        {yritys.onOsakeyhtio === false ? (
          <p className="mt-3 text-sm text-[var(--status-yellow)]">
            Tämä apuri on suunniteltu osakeyhtiöille (6B). Muut yhtiömuodot
            vaativat eri lomakkeet.
          </p>
        ) : null}
      </div>

      <div className={`grid gap-4 sm:grid-cols-2 ${cardRow}`}>
        <Field label="1. tilikausi?">
          <YesNo
            value={reititys.onEnsimmainenTilikausi}
            onChange={(v) => patchReititys({ onEnsimmainenTilikausi: v })}
            yesLabel="1. tilikausi"
            noLabel="2.–100. tilikausi"
          />
        </Field>
        <Field label="0-toiminta (ei liiketoimintaa)?">
          <YesNo
            value={reititys.onNollatoiminta}
            onChange={(v) => patchReititys({ onNollatoiminta: v })}
          />
        </Field>
        <Field label="Onko palkkoja tilikaudella?">
          <YesNo
            value={reititys.onPalkkoja}
            onChange={(v) => patchReititys({ onPalkkoja: v })}
          />
        </Field>
        <Field label="Onko vaihto-omaisuutta (varasto)?">
          <YesNo
            value={reititys.onVarastoa}
            onChange={(v) => patchReititys({ onVarastoa: v })}
          />
        </Field>
      </div>

      <div className={`grid gap-4 sm:grid-cols-2 ${cardRow}`}>
        <Field label="Tilikauden alku">
          <TextInput
            type="date"
            value={reititys.tilikausiAlku}
            onChange={(v) => patchReititys({ tilikausiAlku: v })}
          />
        </Field>
        <Field label="Tilikauden loppu">
          <TextInput
            type="date"
            value={reititys.tilikausiLoppu}
            onChange={(v) => patchReititys({ tilikausiLoppu: v })}
          />
        </Field>
      </div>
    </StepChrome>
  );
}
