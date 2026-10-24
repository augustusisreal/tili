"use client";

import {
  Check,
  Circle,
  CircleDashed,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { STEP_TITLES, type StepStatus } from "@/lib/types";
import { useWizardStore } from "@/store/wizard-store";

const STATUS_META: Record<
  StepStatus,
  { label: string; color: string; Icon: typeof Circle }
> = {
  ei_aloitettu: {
    label: "Ei aloitettu",
    color: "var(--status-gray)",
    Icon: Circle,
  },
  tietoja_kerataan: {
    label: "Tietoja kerätään",
    color: "var(--status-yellow)",
    Icon: CircleDashed,
  },
  valmis_aille: {
    label: "Valmis AI:lle",
    color: "var(--status-blue)",
    Icon: Sparkles,
  },
  tarkistettu: {
    label: "Tarkistettu",
    color: "var(--status-purple)",
    Icon: ShieldCheck,
  },
  valmis: {
    label: "Valmis",
    color: "var(--status-green)",
    Icon: Check,
  },
};

export function StepSidebar() {
  const activeStep = useWizardStore((s) => s.activeStep);
  const stepStatuses = useWizardStore((s) => s.stepStatuses);
  const setActiveStep = useWizardStore((s) => s.setActiveStep);

  return (
    <aside className="flex h-full w-[280px] shrink-0 flex-col border-r border-[var(--border)] bg-[var(--sidebar)]">
      <div className="border-b border-[var(--border)] px-5 py-5">
        <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
          Lavdesign
        </div>
        <div className="mt-1 text-base font-semibold tracking-tight text-[var(--fg)]">
          Tilinpäätös & 6B
        </div>
        <p className="mt-1 text-xs leading-relaxed text-[var(--muted)]">
          13 työvaihetta · PMA · OmaVero
        </p>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-3">
        <ol className="space-y-0.5">
          {STEP_TITLES.map((title, i) => {
            const status = stepStatuses[i];
            const meta = STATUS_META[status];
            const active = activeStep === i;
            const Icon = meta.Icon;
            return (
              <li key={title}>
                <button
                  type="button"
                  onClick={() => setActiveStep(i)}
                  className={`group flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition ${
                    active
                      ? "bg-[var(--accent-soft)]"
                      : "hover:bg-[var(--surface-hover)]"
                  }`}
                >
                  <span
                    className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full"
                    style={{
                      background: active ? "var(--accent)" : "transparent",
                      color: active ? "#fff" : meta.color,
                      boxShadow: active ? "none" : `inset 0 0 0 1.5px ${meta.color}`,
                    }}
                  >
                    {status === "valmis" && !active ? (
                      <Check className="size-3" strokeWidth={3} />
                    ) : active ? (
                      <span className="text-[10px] font-bold">{i + 1}</span>
                    ) : (
                      <Icon className="size-3" />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span
                      className={`block text-[13px] font-medium leading-snug ${
                        active ? "text-[var(--accent)]" : "text-[var(--fg)]"
                      }`}
                    >
                      {i + 1}. {title}
                    </span>
                    <span
                      className="mt-0.5 block text-[11px]"
                      style={{ color: meta.color }}
                    >
                      {meta.label}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </nav>

      <div className="border-t border-[var(--border)] px-4 py-3 text-[11px] text-[var(--muted)]">
        Laskenta 100 % determinististä TS-koodia
      </div>
    </aside>
  );
}
