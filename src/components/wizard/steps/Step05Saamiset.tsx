"use client";

import { Field, MoneyInput } from "@/components/ui/FormFields";
import { StepChrome } from "@/components/wizard/StepChrome";
import { cardRow } from "@/lib/ui-classes";
import { useWizardStore } from "@/store/wizard-store";

export function Step05Saamiset() {
  const s = useWizardStore((st) => st.saamisetVelat);
  const patch = useWizardStore((st) => st.patchSaamiset);

  return (
    <StepChrome
      checklist={[
        "Myyntisaamiset ja ostovelat tilinpäätöspäivänä",
        "Siirtosaamiset ja -velat (jaksotukset)",
        "Muut saamiset / velat tarvittaessa",
      ]}
    >
      <div className={`grid gap-4 sm:grid-cols-2 ${cardRow}`}>
        <Field label="Myyntisaamiset">
          <MoneyInput
            value={s.myyntisaamiset}
            onChange={(v) => patch({ myyntisaamiset: v })}
          />
        </Field>
        <Field label="Ostovelat">
          <MoneyInput
            value={s.ostovelat}
            onChange={(v) => patch({ ostovelat: v })}
          />
        </Field>
        <Field label="Siirtosaamiset">
          <MoneyInput
            value={s.siirtosaamiset}
            onChange={(v) => patch({ siirtosaamiset: v })}
          />
        </Field>
        <Field label="Siirtovelat">
          <MoneyInput
            value={s.siirtovelat}
            onChange={(v) => patch({ siirtovelat: v })}
          />
        </Field>
        <Field label="Muut saamiset">
          <MoneyInput
            value={s.muutSaamiset}
            onChange={(v) => patch({ muutSaamiset: v })}
          />
        </Field>
        <Field label="Muut velat">
          <MoneyInput
            value={s.muutVelat}
            onChange={(v) => patch({ muutVelat: v })}
          />
        </Field>
      </div>
    </StepChrome>
  );
}
