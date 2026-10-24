"use client";

import { Moon, Sun, Building2, CalendarRange, Route } from "lucide-react";
import { reittiLabel, useWizardStore } from "@/store/wizard-store";

export function ProgressHeader() {
  const progress = useWizardStore((s) => s.getProgress());
  const theme = useWizardStore((s) => s.theme);
  const toggleTheme = useWizardStore((s) => s.toggleTheme);
  const yritys = useWizardStore((s) => s.yritys);
  const reititys = useWizardStore((s) => s.reititys);
  const reitti = useWizardStore((s) => s.getReitti());

  return (
    <header className="border-b border-[var(--border)] bg-[var(--header)] px-6 py-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-medium text-[var(--muted)]">
              Edistyminen
            </span>
            <span className="text-sm font-semibold tabular-nums text-[var(--fg)]">
              {progress} %
            </span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--track)]">
            <div
              className="h-full rounded-full bg-[var(--accent)] transition-[width] duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <button
          type="button"
          onClick={toggleTheme}
          className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--fg)] transition hover:bg-[var(--surface-hover)]"
          aria-label={theme === "dark" ? "Vaalea teema" : "Tumma teema"}
        >
          {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </button>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
        <Snapshot
          icon={<Building2 className="size-3.5" />}
          label="Y-tunnus"
          value={yritys.yTunnus || "—"}
          sub={yritys.nimi || "Ei haettu"}
        />
        <Snapshot
          icon={<CalendarRange className="size-3.5" />}
          label="Tilikausi"
          value={
            reititys.tilikausiAlku && reititys.tilikausiLoppu
              ? `${reititys.tilikausiAlku} → ${reititys.tilikausiLoppu}`
              : "—"
          }
        />
        <Snapshot
          icon={<Route className="size-3.5" />}
          label="Reitti"
          value={reittiLabel(reitti)}
        />
      </div>
    </header>
  );
}

function Snapshot({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2.5">
      <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-[var(--muted)]">
        {icon}
        {label}
      </div>
      <div className="mt-1 truncate text-sm font-medium text-[var(--fg)]">
        {value}
      </div>
      {sub ? (
        <div className="mt-0.5 truncate text-xs text-[var(--muted)]">{sub}</div>
      ) : null}
    </div>
  );
}
