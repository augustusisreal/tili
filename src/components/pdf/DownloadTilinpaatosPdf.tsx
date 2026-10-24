"use client";

import { useEffect, useState } from "react";
import { pdf } from "@react-pdf/renderer";
import { Download, Loader2 } from "lucide-react";
import {
  TilinpaatosDocument,
  type TilinpaatosPdfProps,
} from "@/components/pdf/TilinpaatosDocument";
import type { LaskelmaTulos } from "@/lib/types";
import { btnCta } from "@/lib/ui-classes";

type Props = TilinpaatosPdfProps & {
  onGenerated?: () => void;
  /** Aja laskentamoottori juuri ennen PDF:ää — palauttaa tuoreen laskelman. */
  refreshLaskelma?: () => LaskelmaTulos | null;
  /** Näytä pankkisaldo CTA:n alla (esim. AI-poimittu 15432). */
  pankkiYhteensa?: number;
};

export function DownloadTilinpaatosPdf({
  onGenerated,
  refreshLaskelma,
  pankkiYhteensa,
  ...docProps
}: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  async function handleDownload() {
    setBusy(true);
    setError(null);
    try {
      const fresh = refreshLaskelma?.() ?? docProps.laskelma;
      if (!fresh) {
        throw new Error("Laskelma puuttuu — aja vaihe 9 ensin.");
      }
      if (
        Math.abs(
          fresh.taseKuluva.vastaavaaYhteensa -
            fresh.taseKuluva.vastattavaaYhteensa,
        ) >= 0.005
      ) {
        throw new Error("Tase ei ole tasapainossa — PDF:ää ei muodosteta.");
      }

      const blob = await pdf(
        <TilinpaatosDocument {...docProps} laskelma={fresh} />,
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const safeName = (docProps.yritys.nimi || "tilinpaatos")
        .replace(/[^\w\-äöåÄÖÅ]+/gi, "_")
        .slice(0, 60);
      a.href = url;
      a.download = `${safeName}_tilinpaatos_${docProps.reititys.tilikausiLoppu || "tp"}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      onGenerated?.();
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "PDF:n muodostus epäonnistui.",
      );
    } finally {
      setBusy(false);
    }
  }

  if (!ready) return null;

  const bs = docProps.laskelma.taseKuluva;
  const pankit =
    pankkiYhteensa ?? bs.rahatJaPankkisaamiset;

  return (
    <div className="space-y-3">
      <button
        type="button"
        className={btnCta}
        disabled={busy}
        onClick={() => void handleDownload()}
      >
        {busy ? (
          <Loader2 className="size-5 animate-spin" />
        ) : (
          <Download className="size-5" />
        )}
        {busy ? "Muodostetaan PDF…" : "Lataa Tilinpäätös PDF"}
      </button>
      {error ? (
        <p className="text-xs text-[var(--status-yellow)]">{error}</p>
      ) : (
        <p className="text-sm text-[var(--muted)]">
          Kansilehti · Tuloslaskelma · Tase · Allekirjoitukset — moottorin
          luvuista. Rahat ja pankit{" "}
          <strong className="text-[var(--fg)]">
            {pankit.toLocaleString("fi-FI", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}{" "}
            €
          </strong>
          {" · "}
          Vastaavaa = Vastattavaa{" "}
          {bs.vastaavaaYhteensa.toLocaleString("fi-FI", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}{" "}
          €
        </p>
      )}
    </div>
  );
}
