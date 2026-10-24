"use client";

import { Search } from "lucide-react";
import { Field, TextInput } from "@/components/ui/FormFields";
import { StepChrome } from "@/components/wizard/StepChrome";
import { isValidYTunnus, normalizeYTunnus } from "@/lib/format";
import { btnPrimary, cardRow } from "@/lib/ui-classes";
import { useWizardStore } from "@/store/wizard-store";

export function Step02Perustiedot() {
  const yritys = useWizardStore((s) => s.yritys);
  const patchYritys = useWizardStore((s) => s.patchYritys);
  const prhLataa = useWizardStore((s) => s.prhLataa);
  const prhVirhe = useWizardStore((s) => s.prhVirhe);
  const setPrhLataa = useWizardStore((s) => s.setPrhLataa);
  const setPrhVirhe = useWizardStore((s) => s.setPrhVirhe);
  const markDone = useWizardStore((s) => s.markDone);
  const setStepStatus = useWizardStore((s) => s.setStepStatus);

  async function haePrh() {
    const y = normalizeYTunnus(yritys.yTunnus);
    patchYritys({ yTunnus: y });
    if (!isValidYTunnus(y)) {
      setPrhVirhe("Y-tunnuksen tarkistusmerkki ei täsmää.");
      return;
    }
    setPrhLataa(true);
    setPrhVirhe(null);
    try {
      const res = await fetch(`/api/prh/${encodeURIComponent(y)}`);
      const data = await res.json();
      if (!res.ok) {
        setPrhVirhe(data.error ?? "Haku epäonnistui");
        return;
      }
      patchYritys({
        yTunnus: data.yTunnus,
        nimi: data.nimi,
        kotipaikka: data.kotipaikka,
        toimiala: data.toimiala,
        perustamispaiva: data.perustamispaiva,
        onOsakeyhtio:
          data.onOsakeyhtio === true
            ? true
            : yritys.onOsakeyhtio,
      });
      setStepStatus(1, "valmis");
    } catch {
      setPrhVirhe("Verkkovirhe PRH-haussa.");
    } finally {
      setPrhLataa(false);
    }
  }

  return (
    <StepChrome
      checklist={[
        "Hae tiedot PRH:sta Y-tunnuksella",
        "Tarkista nimi, kotipaikka ja toimiala",
        "Varmista perustamispäivä",
      ]}
      onComplete={() => markDone(1)}
    >
      <div className={cardRow}>
        <Field
          label="Y-tunnus"
          hint="Muoto 1234567-8 — haku PRH/YTJ avoin data v3"
        >
          <div className="flex gap-2">
            <TextInput
              value={yritys.yTunnus}
              onChange={(v) => patchYritys({ yTunnus: v })}
              placeholder="1234567-8"
            />
            <button
              type="button"
              className={btnPrimary}
              disabled={prhLataa || !yritys.yTunnus}
              onClick={haePrh}
            >
              <Search className="size-4" />
              {prhLataa ? "Haetaan…" : "Hae PRH"}
            </button>
          </div>
        </Field>
        {prhVirhe ? (
          <p className="mt-2 text-sm text-[var(--status-yellow)]">{prhVirhe}</p>
        ) : null}
      </div>

      <div className={`grid gap-4 sm:grid-cols-2 ${cardRow}`}>
        <Field label="Yrityksen nimi" className="sm:col-span-2">
          <TextInput
            value={yritys.nimi}
            onChange={(v) => patchYritys({ nimi: v })}
          />
        </Field>
        <Field label="Kotipaikka">
          <TextInput
            value={yritys.kotipaikka}
            onChange={(v) => patchYritys({ kotipaikka: v })}
          />
        </Field>
        <Field label="Perustamispäivä">
          <TextInput
            type="date"
            value={yritys.perustamispaiva}
            onChange={(v) => patchYritys({ perustamispaiva: v })}
          />
        </Field>
        <Field label="Toimiala" className="sm:col-span-2">
          <TextInput
            value={yritys.toimiala}
            onChange={(v) => patchYritys({ toimiala: v })}
          />
        </Field>
      </div>
    </StepChrome>
  );
}
