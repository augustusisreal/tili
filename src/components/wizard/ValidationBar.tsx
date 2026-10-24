"use client";

import { AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { STEP_TITLES } from "@/lib/types";
import { useWizardStore } from "@/store/wizard-store";

export function ValidationBar({ messages }: { messages: string[] }) {
  const activeStep = useWizardStore((s) => s.activeStep);
  const status = useWizardStore((s) => s.stepStatuses[s.activeStep]);
  const laskelma = useWizardStore((s) => s.laskelma);

  const warnings = [
    ...messages,
    ...(activeStep === 8 || activeStep === 10 || activeStep === 11
      ? laskelma?.varoitukset ?? []
      : []),
  ];

  const ok = warnings.length === 0 && status !== "ei_aloitettu";

  return (
    <div className="border-t border-[var(--border)] bg-[var(--header)] px-6 py-3">
      <div className="flex items-start gap-3">
        {ok ? (
          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[var(--status-green)]" />
        ) : warnings.length > 0 ? (
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-[var(--status-yellow)]" />
        ) : (
          <Info className="mt-0.5 size-4 shrink-0 text-[var(--muted)]" />
        )}
        <div className="min-w-0 flex-1">
          <div className="text-xs font-medium text-[var(--fg)]">
            Validointi · vaihe {activeStep + 1}: {STEP_TITLES[activeStep]}
          </div>
          {warnings.length > 0 ? (
            <ul className="mt-1 space-y-0.5">
              {warnings.slice(0, 4).map((w) => (
                <li key={w} className="text-xs text-[var(--status-yellow)]">
                  {w}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-1 text-xs text-[var(--muted)]">
              {ok
                ? "Ei kriittisiä huomautuksia tällä hetkellä."
                : "Täytä pakolliset kentät jatkaaksesi."}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
