"use client";

import { useEffect, useState } from "react";
import { pdf } from "@react-pdf/renderer";
import { Download, Loader2 } from "lucide-react";
import {
  TilinpaatosDocument,
  type TilinpaatosPdfProps,
} from "@/components/pdf/TilinpaatosDocument";
import { btnPrimary } from "@/lib/ui-classes";

type Props = TilinpaatosPdfProps & {
  onGenerated?: () => void;
};

export function DownloadTilinpaatosPdf({
  onGenerated,
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
      const blob = await pdf(<TilinpaatosDocument {...docProps} />).toBlob();
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
        e instanceof Error
          ? e.message
          : "PDF:n muodostus epäonnistui.",
      );
    } finally {
      setBusy(false);
    }
  }

  if (!ready) return null;

  return (
    <div className="space-y-2">
      <button
        type="button"
        className={btnPrimary}
        disabled={busy}
        onClick={() => void handleDownload()}
      >
        {busy ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Download className="size-4" />
        )}
        {busy ? "Muodostetaan PDF…" : "Lataa tilinpäätös-PDF"}
      </button>
      {error ? (
        <p className="text-xs text-[var(--status-yellow)]">{error}</p>
      ) : (
        <p className="text-xs text-[var(--muted)]">
          Sisältää kansilehden, tuloslaskelman, taseen ja allekirjoitukset.
        </p>
      )}
    </div>
  );
}
