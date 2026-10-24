"use client";

import { Field, MoneyInput } from "@/components/ui/FormFields";
import { StepChrome } from "@/components/wizard/StepChrome";
import { formatEuro } from "@/lib/format";
import { cardRow } from "@/lib/ui-classes";
import { useWizardStore } from "@/store/wizard-store";

export function Step07Verot() {
  const v = useWizardStore((s) => s.verot);
  const palkkoja = useWizardStore((s) => s.reititys.onPalkkoja);
  const patch = useWizardStore((s) => s.patchVerot);

  return (
    <StepChrome
      checklist={[
        "ALV: myynnit − ostot = maksettava",
        "Ennakkoverot ja vahvistetut tappiot 6B:lle",
        "Vähennyskelvottomat kulut (edustus yms.)",
      ]}
    >
      <div className={`grid gap-4 sm:grid-cols-2 ${cardRow}`}>
        <Field label="ALV myynneistä">
          <MoneyInput
            value={v.alvMyynnit}
            onChange={(n) => patch({ alvMyynnit: n })}
          />
        </Field>
        <Field label="ALV ostoista">
          <MoneyInput
            value={v.alvOstot}
            onChange={(n) => patch({ alvOstot: n })}
          />
        </Field>
        <Field label="ALV maksettava (laskettu)" className="sm:col-span-2">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--input-bg)] px-3 py-2 text-sm font-medium tabular-nums">
            {formatEuro(v.alvMaksettava)}
          </div>
        </Field>
      </div>

      <div className={`grid gap-4 sm:grid-cols-2 ${cardRow}`}>
        <Field label="Ennakkoverot">
          <MoneyInput
            value={v.ennakkoverot}
            onChange={(n) => patch({ ennakkoverot: n })}
          />
        </Field>
        <Field label="Vahvistetut tappiot">
          <MoneyInput
            value={v.vahvistetutTappiot}
            onChange={(n) => patch({ vahvistetutTappiot: n })}
          />
        </Field>
        <Field label="Vähennyskelvottomat (6B)">
          <MoneyInput
            value={v.vahennyskelvottomat}
            onChange={(n) => patch({ vahennyskelvottomat: n })}
          />
        </Field>
        {palkkoja !== false ? (
          <Field label="Palkat yhteensä">
            <MoneyInput
              value={v.palkatYhteensa}
              onChange={(n) => patch({ palkatYhteensa: n })}
            />
          </Field>
        ) : null}
      </div>
    </StepChrome>
  );
}
