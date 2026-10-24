/**
 * E2E smoke: AI bank saldo → PMA engine → PDF blob.
 * npm run test:e2e-pdf
 */
import { writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import React from "react";
import {
  Document,
  Font,
  Page,
  Text,
  StyleSheet,
  pdf,
} from "@react-pdf/renderer";
import { PDFParse } from "pdf-parse";
import { ajaLaskentamoottori } from "../src/lib/accounting.ts";

Font.register({
  family: "DejaVuSans",
  fonts: [
    { src: `${process.cwd()}/public/fonts/DejaVuSans.ttf`, fontWeight: 400 },
    { src: `${process.cwd()}/public/fonts/DejaVuSans-Bold.ttf`, fontWeight: 700 },
  ],
});

const worker = path.join(
  process.cwd(),
  "node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs",
);
if (existsSync(worker)) PDFParse.setWorker(pathToFileURL(worker).href);

const SALDO = 15432;
const laskelma = ajaLaskentamoottori({
  nollatoiminta: true,
  onVarastoa: false,
  kirjanpito: {
    nollatoiminta: true,
    paakirjaLadattu: true,
    tuloslaskelmaLadattu: true,
    taseLadattu: true,
    edellinenTpLadattu: false,
    liikevaihto: 0,
    materiaalitJaPalvelut: 0,
    henkilostokulut: 0,
    poistot: 0,
    liiketoiminnanMuutKulut: 0,
    rahoitustuotot: 0,
    rahoituskulut: 0,
    verot: 0,
  },
  kayttoomaisuus: [],
  poistoProsentti: 25,
  saamisetVelat: {
    myyntisaamiset: 0,
    ostovelat: 0,
    siirtosaamiset: 0,
    siirtovelat: 0,
    muutSaamiset: 0,
    muutVelat: 0,
  },
  pankit: [
    {
      id: "ai",
      nimi: "Käyttötili (AI)",
      iban: "FI1234567890123456",
      loppusaldo: SALDO,
      kirjanpidonSaldo: SALDO,
    },
  ],
  omaPaaoma: {
    osakepaaoma: 2500,
    svop: 0,
    edellinenVoittoTappio: 0,
    tilikaudenTulos: 0,
    osingot: 0,
    omatOsakkeet: 0,
  },
  verot: {
    alvMyynnit: 0,
    alvOstot: 0,
    alvMaksettava: 0,
    ennakkoverot: 0,
    vahvistetutTappiot: 0,
    vahennyskelvottomat: 0,
    palkatYhteensa: 0,
  },
});

if (!laskelma.taseKuluva.tasapainossa) throw new Error("tase not balanced");
if (laskelma.taseKuluva.rahatJaPankkisaamiset !== SALDO) {
  throw new Error(`bank ${laskelma.taseKuluva.rahatJaPankkisaamiset} !== ${SALDO}`);
}
if (
  laskelma.taseKuluva.vastaavaaYhteensa !==
  laskelma.taseKuluva.vastattavaaYhteensa
) {
  throw new Error("Vastaavaa !== Vastattavaa");
}

const styles = StyleSheet.create({
  page: { fontFamily: "DejaVuSans", fontSize: 12, padding: 40 },
});
const euro = (n) =>
  n.toLocaleString("fi-FI", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }) + " EUR";

const doc = React.createElement(
  Document,
  null,
  React.createElement(
    Page,
    { size: "A4", style: styles.page },
    React.createElement(Text, null, "TILINPÄÄTÖS"),
    React.createElement(
      Text,
      null,
      "Rahat ja pankkisaamiset: " + euro(laskelma.taseKuluva.rahatJaPankkisaamiset),
    ),
    React.createElement(
      Text,
      null,
      "Vastaavaa: " + euro(laskelma.taseKuluva.vastaavaaYhteensa),
    ),
    React.createElement(
      Text,
      null,
      "Vastattavaa: " + euro(laskelma.taseKuluva.vastattavaaYhteensa),
    ),
  ),
);

const blob = await pdf(doc).toBlob();
const buf = Buffer.from(await blob.arrayBuffer());
if (buf.slice(0, 4).toString() !== "%PDF") throw new Error("bad magic");
writeFileSync("/tmp/e2e-tilinpaatos.pdf", buf);

const parser = new PDFParse({ data: new Uint8Array(buf) });
const extracted = await parser.getText();
await parser.destroy();
const text = extracted.text.replace(/\s+/g, " ");
if (!text.includes("15") || !text.includes("432")) {
  throw new Error("saldo missing in PDF: " + text);
}

console.log("e2e-pdf.smoke: OK");
console.log("  bank", SALDO, "→ rahat", laskelma.taseKuluva.rahatJaPankkisaamiset);
console.log("  vastaavaa", laskelma.taseKuluva.vastaavaaYhteensa);
console.log("  pdf_bytes", buf.length);
console.log("  wrote /tmp/e2e-tilinpaatos.pdf");
