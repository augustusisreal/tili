"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { STEP_COUNT, STEP_TITLES } from "@/lib/types";
import { btnGhost, btnPrimary, sectionDesc, sectionTitle } from "@/lib/ui-classes";
import { useWizardStore } from "@/store/wizard-store";

export function StepChrome({
  children,
  checklist,
  onComplete,
  completeLabel = "Merkitse valmiiksi",
}: {
  children: React.ReactNode;
  checklist?: string[];
  onComplete?: () => void;
  completeLabel?: string;
}) {
  const activeStep = useWizardStore((s) => s.activeStep);
  const setActiveStep = useWizardStore((s) => s.setActiveStep);
  const markDone = useWizardStore((s) => s.markDone);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="mx-auto max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--accent)]">
            Vaihe {activeStep + 1} / {STEP_COUNT}
          </p>
          <h2 className={`${sectionTitle} mt-1`}>{STEP_TITLES[activeStep]}</h2>
          <p className={sectionDesc}>
            Täytä tiedot huolellisesti — laskenta on determinististä TypeScriptiä.
          </p>

          <div className="mt-6 space-y-5 animate-step-in">{children}</div>

          {checklist && checklist.length > 0 ? (
            <div className="mt-8 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
              <h3 className="text-sm font-semibold text-[var(--fg)]">
                Tarkistuslista
              </h3>
              <ul className="mt-2 space-y-1.5">
                {checklist.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2 text-sm text-[var(--muted)]"
                  >
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-[var(--border)] px-6 py-3">
        <button
          type="button"
          className={btnGhost}
          disabled={activeStep === 0}
          onClick={() => setActiveStep(activeStep - 1)}
        >
          <ChevronLeft className="size-4" />
          Edellinen
        </button>
        <div className="flex gap-2">
          <button
            type="button"
            className={btnGhost}
            onClick={() => {
              onComplete?.();
              markDone(activeStep);
            }}
          >
            {completeLabel}
          </button>
          <button
            type="button"
            className={btnPrimary}
            disabled={activeStep >= STEP_COUNT - 1}
            onClick={() => {
              onComplete?.();
              markDone(activeStep);
              setActiveStep(activeStep + 1);
            }}
          >
            Seuraava
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
