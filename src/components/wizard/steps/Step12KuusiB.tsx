"use client";

import { Copy, RefreshCw } from "lucide-react";
import { StepChrome } from "@/components/wizard/StepChrome";
import { formatEuro } from "@/lib/format";
import { btnPrimary, btnSoft, cardRow } from "@/lib/ui-classes";
import { useWizardStore } from "@/store/wizard-store";

export function Step12KuusiB() {
  const build = useWizardStore((s) => s.build6B);
  const rows = useWizardStore((s) => s.lomake6B);

  return (
    <StepChrome
      checklist={[
        "Mapitus OmaVero 6B -kenttiin",
        "Kopioi-napit arvoille",
        "Lähde näkyy jokaisella rivillä",
      ]}
      onComplete={build}
      completeLabel="Päivitä 6B & merkitse"
    >
      <div className="flex flex-wrap gap-2">
        <button type="button" className={btnPrimary} onClick={build}>
          <RefreshCw className="size-4" />
          Muodosta 6B-kentät
        </button>
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">
          Muodosta kentät laskelman pohjalta. Stub: ei suoraa OmaVero-API:a.
        </p>
      ) : (
        <div className={`${cardRow} overflow-hidden p-0`}>
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[var(--border)] bg-[var(--surface-2)] text-xs uppercase tracking-wide text-[var(--muted)]">
              <tr>
                <th className="px-4 py-2.5 font-medium">Koodi</th>
                <th className="px-4 py-2.5 font-medium">Kenttä</th>
                <th className="px-4 py-2.5 font-medium">Arvo</th>
                <th className="px-4 py-2.5 font-medium">Lähde</th>
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {rows.map((r) => {
                const display =
                  typeof r.arvo === "number" ? formatEuro(r.arvo) : String(r.arvo);
                const raw =
                  typeof r.arvo === "number"
                    ? r.arvo.toFixed(2).replace(".", ",")
                    : String(r.arvo);
                return (
                  <tr key={r.koodi} className="hover:bg-[var(--surface-hover)]">
                    <td className="px-4 py-2.5 font-mono text-xs text-[var(--accent)]">
                      {r.koodi}
                    </td>
                    <td className="px-4 py-2.5 text-[var(--fg)]">{r.otsikko}</td>
                    <td className="px-4 py-2.5 tabular-nums text-[var(--fg)]">
                      {display}
                    </td>
                    <td className="px-4 py-2.5 text-xs text-[var(--muted)]">
                      {r.lahde}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <button
                        type="button"
                        className={btnSoft}
                        onClick={() => navigator.clipboard.writeText(raw)}
                        title="Kopioi"
                      >
                        <Copy className="size-3.5" />
                        Kopioi
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </StepChrome>
  );
}
