"use client";

import { Archive, CheckCircle2 } from "lucide-react";
import { Checkbox, Field, TextInput } from "@/components/ui/FormFields";
import { StepChrome } from "@/components/wizard/StepChrome";
import { btnSoft, cardRow } from "@/lib/ui-classes";
import { useWizardStore } from "@/store/wizard-store";

export function Step13Toimitus() {
  const t = useWizardStore((s) => s.toimitus);
  const patch = useWizardStore((s) => s.patchToimitus);
  const yritys = useWizardStore((s) => s.yritys);
  const markDone = useWizardStore((s) => s.markDone);

  function luoArkisto() {
    const id = `ARK-${yritys.yTunnus || "XXXXXXX-X"}-${new Date().getFullYear()}`;
    patch({
      arkistoLuotu: true,
      arkistoPolku: `/stub/arkisto/${id}.zip`,
      kuittausNumero: t.kuittausNumero || id,
    });
    markDone(12);
  }

  const allDone =
    t.ytjIlmoitettu && t.omaVeroLahetetty && t.arkistoLuotu;

  return (
    <StepChrome
      checklist={[
        "YTJ / kaupparekisteri -ilmoitus",
        "OmaVero 6B lähetys",
        "Arkistointipaketti (stub)",
      ]}
    >
      <div className={`${cardRow} space-y-3`}>
        <Checkbox
          checked={t.ytjIlmoitettu}
          onChange={(v) => patch({ ytjIlmoitettu: v })}
          label="Tilinpäätös ilmoitettu YTJ / PRH:lle (käsin — stub)"
        />
        <Checkbox
          checked={t.omaVeroLahetetty}
          onChange={(v) => patch({ omaVeroLahetetty: v })}
          label="Veroilmoitus 6B lähetetty OmaVeroon (käsin — stub)"
        />
        <Checkbox
          checked={t.arkistoLuotu}
          onChange={(v) => patch({ arkistoLuotu: v })}
          label="Arkistointipaketti luotu"
        />
        <Field label="Kuittausnumero / diaari">
          <TextInput
            value={t.kuittausNumero}
            onChange={(v) => patch({ kuittausNumero: v })}
            placeholder="esim. OV-2026-12345"
          />
        </Field>
      </div>

      <div className="flex flex-wrap gap-2">
        <button type="button" className={btnSoft} onClick={luoArkisto}>
          <Archive className="size-4" />
          Luo arkistointipaketti (stub)
        </button>
      </div>

      {t.arkistoPolku ? (
        <p className="text-sm text-[var(--muted)]">
          Stub-polku: <code className="text-[var(--accent)]">{t.arkistoPolku}</code>
        </p>
      ) : null}

      {allDone ? (
        <div
          className={`${cardRow} flex items-start gap-3 border-[var(--status-green)]/40`}
        >
          <CheckCircle2 className="mt-0.5 size-5 text-[var(--status-green)]" />
          <div>
            <p className="font-semibold text-[var(--fg)]">Valmis!</p>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Kaikki toimitusvaiheet merkitty. Onnittelut — tilinpäätösprosessi
              on paketissa.
            </p>
          </div>
        </div>
      ) : null}
    </StepChrome>
  );
}
