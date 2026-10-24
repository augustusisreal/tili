"use client";

import { Checkbox, Field, MoneyInput, TextInput } from "@/components/ui/FormFields";
import { StepChrome } from "@/components/wizard/StepChrome";
import { cardRow } from "@/lib/ui-classes";
import { useWizardStore } from "@/store/wizard-store";

export function Step10Liitetiedot() {
  const l = useWizardStore((s) => s.liitetiedot);
  const yritys = useWizardStore((s) => s.yritys);
  const patch = useWizardStore((s) => s.patchLiitetiedot);

  const hallitusPohja = `HALLITUKSEN KOKOUKSEN PÖYTÄKIRJA

Aika: ${l.hallituksenKokousPvm || "[päivämäärä]"}
Paikka: ${yritys.kotipaikka || "[kotipaikka]"}
Läsnä: ${l.allekirjoittajat || "[hallituksen jäsenet]"}

1. Kokouksen avaus
2. Tilinpäätöksen ${yritys.nimi || "[yhtiö]"} hyväksyminen
3. Ehdotus yhtiökokoukselle
4. Kokouksen päättäminen

Allekirjoitukset: ${l.allekirjoittajat || "—"}
`;

  const ykPohja = `YHTIÖKOKOUKSEN PÖYTÄKIRJA

Aika: ${l.ykKokousPvm || "[päivämäärä]"}
Yhtiö: ${yritys.nimi || "[nimi]"} (${yritys.yTunnus || "Y-tunnus"})

1. Kokouksen avaus ja järjestäytyminen
2. Tilinpäätöksen vahvistaminen
3. Vastuuvapaus
4. Voitonjakoehdotus
5. Kokouksen päättäminen
`;

  return (
    <StepChrome
      checklist={[
        "PMA-liitetiedot (henkilöstö, palkat)",
        "Hallituksen pöytäkirjapohja",
        "Yhtiökokouksen pöytäkirjapohja",
      ]}
    >
      <div className={`grid gap-4 sm:grid-cols-2 ${cardRow}`}>
        <Field label="Henkilöstö keskimäärin">
          <MoneyInput
            value={l.henkilostoKeskimäärin}
            onChange={(v) => patch({ henkilostoKeskimäärin: v })}
          />
        </Field>
        <Field label="Palkat ja palkkiot (liitetieto)">
          <MoneyInput
            value={l.palkatJaPalkkiot}
            onChange={(v) => patch({ palkatJaPalkkiot: v })}
          />
        </Field>
        <Field label="Hallituksen kokous">
          <TextInput
            type="date"
            value={l.hallituksenKokousPvm}
            onChange={(v) => patch({ hallituksenKokousPvm: v })}
          />
        </Field>
        <Field label="Yhtiökokous">
          <TextInput
            type="date"
            value={l.ykKokousPvm}
            onChange={(v) => patch({ ykKokousPvm: v })}
          />
        </Field>
        <Field label="Allekirjoittajat" className="sm:col-span-2">
          <TextInput
            value={l.allekirjoittajat}
            onChange={(v) => patch({ allekirjoittajat: v })}
            placeholder="Maija Meikäläinen, Kalle Kallio"
          />
        </Field>
        <div className="sm:col-span-2">
          <Checkbox
            checked={l.tilintarkastus}
            onChange={(v) => patch({ tilintarkastus: v })}
            label="Tilintarkastus suoritettu / pakollinen"
          />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Pohja title="Hallituksen pöytäkirja (pohja)" text={hallitusPohja} />
        <Pohja title="Yhtiökokouksen pöytäkirja (pohja)" text={ykPohja} />
      </div>
    </StepChrome>
  );
}

function Pohja({ title, text }: { title: string; text: string }) {
  return (
    <div className={cardRow}>
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-[var(--fg)]">{title}</h3>
        <button
          type="button"
          className="text-xs font-medium text-[var(--accent)] hover:underline"
          onClick={() => navigator.clipboard.writeText(text)}
        >
          Kopioi
        </button>
      </div>
      <pre className="mt-3 max-h-56 overflow-auto whitespace-pre-wrap rounded-lg bg-[var(--input-bg)] p-3 text-xs leading-relaxed text-[var(--muted)]">
        {text}
      </pre>
    </div>
  );
}
