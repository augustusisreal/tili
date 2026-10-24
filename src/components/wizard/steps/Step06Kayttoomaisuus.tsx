"use client";

import { Plus, Trash2 } from "lucide-react";
import {
  Checkbox,
  Field,
  MoneyInput,
  TextInput,
} from "@/components/ui/FormFields";
import { StepChrome } from "@/components/wizard/StepChrome";
import { PIENHANKINTA_RAJA, laskePoistot } from "@/lib/accounting";
import { formatEuro } from "@/lib/format";
import { btnGhost, btnSoft, cardRow, inputCls, labelCls } from "@/lib/ui-classes";
import { useWizardStore } from "@/store/wizard-store";

export function Step06Kayttoomaisuus() {
  const items = useWizardStore((s) => s.kayttoomaisuus);
  const pct = useWizardStore((s) => s.poistoProsentti);
  const add = useWizardStore((s) => s.addKayttoomaisuus);
  const update = useWizardStore((s) => s.updateKayttoomaisuus);
  const remove = useWizardStore((s) => s.removeKayttoomaisuus);
  const setPct = useWizardStore((s) => s.setPoistoProsentti);

  const preview = laskePoistot(items, pct);

  return (
    <StepChrome
      checklist={[
        `Menojäännöspoisto oletuksena ${pct} % (K&K)`,
        `Varoitus alle ${PIENHANKINTA_RAJA} € hankinnoista`,
        "Pienhankinnat voidaan kirjata kuluksi heti",
      ]}
    >
      <div className={cardRow}>
        <label className="block max-w-xs">
          <span className={labelCls}>Poistoprosentti (menojäännös)</span>
          <input
            type="number"
            min={0}
            max={100}
            step={1}
            className={inputCls}
            value={pct}
            onChange={(e) => setPct(Number(e.target.value) || 0)}
          />
        </label>
        <p className="mt-3 text-sm text-[var(--muted)]">
          Laskettu poisto:{" "}
          <strong className="text-[var(--fg)]">
            {formatEuro(preview.poistotYhteensa)}
          </strong>
          {" · "}
          Menojäännös lopussa:{" "}
          <strong className="text-[var(--fg)]">
            {formatEuro(preview.menojannosLoppu)}
          </strong>
        </p>
      </div>

      <div className="flex justify-end">
        <button type="button" className={btnSoft} onClick={add}>
          <Plus className="size-4" />
          Lisää hyödyke
        </button>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">
          Ei käyttöomaisuutta. Lisää erä tai jatka eteenpäin.
        </p>
      ) : null}

      {items.map((erä) => (
        <div key={erä.id} className={`${cardRow} space-y-3`}>
          <div className="flex gap-2">
            <Field label="Nimi" className="flex-1">
              <TextInput
                value={erä.nimi}
                onChange={(v) => update(erä.id, { nimi: v })}
                placeholder="Kannettava tietokone"
              />
            </Field>
            <button
              type="button"
              className={`${btnGhost} mt-6`}
              onClick={() => remove(erä.id)}
            >
              <Trash2 className="size-4" />
            </button>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Hankintahinta">
              <MoneyInput
                value={erä.hankintahinta}
                onChange={(v) => update(erä.id, { hankintahinta: v })}
              />
            </Field>
            <Field label="Menojäännös kauden alussa">
              <MoneyInput
                value={erä.menojannosAlku}
                onChange={(v) => update(erä.id, { menojannosAlku: v })}
              />
            </Field>
            <Field label="Hankintapäivä">
              <TextInput
                type="date"
                value={erä.hankintapaiva}
                onChange={(v) => update(erä.id, { hankintapaiva: v })}
              />
            </Field>
          </div>
          <Checkbox
            checked={erä.onPienhankinta}
            onChange={(v) => update(erä.id, { onPienhankinta: v })}
            label={`Pienhankinta (kuluksi heti, raja ${PIENHANKINTA_RAJA} €)`}
          />
          {erä.hankintahinta > 0 &&
          erä.hankintahinta < PIENHANKINTA_RAJA &&
          !erä.onPienhankinta ? (
            <p className="text-xs text-[var(--status-yellow)]">
              Hankintahinta alle {PIENHANKINTA_RAJA} € — harkitse pienhankintaa.
            </p>
          ) : null}
        </div>
      ))}
    </StepChrome>
  );
}
