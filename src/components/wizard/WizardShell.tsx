"use client";

import { useEffect, useMemo } from "react";
import { ProgressHeader } from "@/components/wizard/ProgressHeader";
import { StepSidebar } from "@/components/wizard/StepSidebar";
import { ValidationBar } from "@/components/wizard/ValidationBar";
import { ActiveStep } from "@/components/wizard/steps/ActiveStep";
import { isValidYTunnus } from "@/lib/format";
import { useWizardStore } from "@/store/wizard-store";

export function WizardShell() {
  const theme = useWizardStore((s) => s.theme);
  const activeStep = useWizardStore((s) => s.activeStep);
  const yritys = useWizardStore((s) => s.yritys);
  const reititys = useWizardStore((s) => s.reititys);
  const pankit = useWizardStore((s) => s.pankit);
  const laskelma = useWizardStore((s) => s.laskelma);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  }, [theme]);

  const messages = useMemo(() => {
    const m: string[] = [];
    if (activeStep === 0) {
      if (yritys.onOsakeyhtio === null) m.push("Valitse onko yhtiö osakeyhtiö.");
      if (reititys.onEnsimmainenTilikausi === null)
        m.push("Valitse 1. tilikausi vai jatkava.");
      if (reititys.onNollatoiminta === null) m.push("Valitse onko 0-toiminta.");
    }
    if (activeStep === 1) {
      if (!yritys.yTunnus) m.push("Syötä Y-tunnus.");
      else if (!isValidYTunnus(yritys.yTunnus))
        m.push("Y-tunnus ei läpäise tarkistusmerkkiä.");
      if (!yritys.nimi) m.push("Yrityksen nimi puuttuu.");
    }
    if (activeStep === 3) {
      for (const p of pankit) {
        const ero = p.loppusaldo - p.kirjanpidonSaldo;
        if (Math.abs(ero) >= 0.01) {
          m.push(`${p.nimi || "Tili"}: pankki ≠ kirjanpito (${ero.toFixed(2)} €).`);
        }
      }
    }
    if (activeStep === 8 && laskelma && !laskelma.taseKuluva.tasapainossa) {
      m.push(
        `Tase ei täsmää (erotus ${laskelma.taseKuluva.erotus.toFixed(2)} €).`,
      );
    }
    return m;
  }, [activeStep, yritys, reititys, pankit, laskelma]);

  return (
    <div className="flex h-dvh overflow-hidden bg-[var(--bg)] text-[var(--fg)]">
      <StepSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <ProgressHeader />
        <main className="min-h-0 flex-1">
          <ActiveStep />
        </main>
        <ValidationBar messages={messages} />
      </div>
    </div>
  );
}
