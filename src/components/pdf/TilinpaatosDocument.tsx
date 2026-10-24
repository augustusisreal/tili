"use client";

import {
  Document,
  Font,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import type {
  Hyvaksynta,
  LaskelmaTulos,
  Liitetiedot,
  Reititys,
  Yritys,
} from "@/lib/types";

Font.register({
  family: "DejaVuSans",
  fonts: [
    { src: "/fonts/DejaVuSans.ttf", fontWeight: 400 },
    { src: "/fonts/DejaVuSans-Bold.ttf", fontWeight: 700 },
  ],
});

const styles = StyleSheet.create({
  page: {
    fontFamily: "DejaVuSans",
    fontSize: 10,
    paddingTop: 48,
    paddingBottom: 48,
    paddingHorizontal: 48,
    color: "#111827",
  },
  cover: {
    flex: 1,
    justifyContent: "center",
  },
  brand: {
    fontSize: 9,
    letterSpacing: 2,
    textTransform: "uppercase",
    color: "#0d7a6f",
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: 700,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#4b5563",
    marginBottom: 28,
  },
  meta: {
    fontSize: 11,
    marginBottom: 6,
    lineHeight: 1.5,
  },
  h1: {
    fontSize: 16,
    fontWeight: 700,
    marginBottom: 16,
    color: "#0d7a6f",
  },
  h2: {
    fontSize: 11,
    fontWeight: 700,
    marginTop: 14,
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    color: "#6b7280",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 3,
    borderBottomWidth: 0.5,
    borderBottomColor: "#e5e7eb",
  },
  rowStrong: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: "#111827",
    fontWeight: 700,
  },
  label: { flexGrow: 1, paddingRight: 12 },
  value: { width: 100, textAlign: "right" },
  footer: {
    position: "absolute",
    bottom: 28,
    left: 48,
    right: 48,
    fontSize: 8,
    color: "#9ca3af",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  sigBox: {
    marginTop: 28,
    paddingTop: 16,
    borderTopWidth: 0.5,
    borderTopColor: "#d1d5db",
  },
  sigLine: {
    marginTop: 36,
    borderBottomWidth: 0.75,
    borderBottomColor: "#9ca3af",
    width: "55%",
  },
  sigCaption: {
    marginTop: 4,
    fontSize: 9,
    color: "#6b7280",
  },
  note: {
    marginTop: 20,
    fontSize: 8,
    color: "#6b7280",
    lineHeight: 1.4,
  },
});

function euro(n: number): string {
  const neg = n < 0;
  const abs = Math.abs(n);
  const fixed = abs.toFixed(2).replace(".", ",");
  const [intPart, dec] = fixed.split(",");
  const withSpaces = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, "\u00a0");
  return `${neg ? "−" : ""}${withSpaces},${dec}\u00a0€`;
}

export type TilinpaatosPdfProps = {
  yritys: Yritys;
  reititys: Reititys;
  laskelma: LaskelmaTulos;
  liitetiedot: Liitetiedot;
  hyvaksynta: Hyvaksynta;
};

function PageFooter({
  yritys,
  page,
}: {
  yritys: Yritys;
  page: string;
}) {
  return (
    <View style={styles.footer} fixed>
      <Text>
        {yritys.nimi || "Yhtiö"} · {yritys.yTunnus || "Y-tunnus"}
      </Text>
      <Text>{page}</Text>
    </View>
  );
}

function MoneyRows({
  rows,
}: {
  rows: Array<{ label: string; value: number; strong?: boolean }>;
}) {
  return (
    <View>
      {rows.map((r) => (
        <View key={r.label} style={r.strong ? styles.rowStrong : styles.row}>
          <Text style={styles.label}>{r.label}</Text>
          <Text style={styles.value}>{euro(r.value)}</Text>
        </View>
      ))}
    </View>
  );
}

export function TilinpaatosDocument({
  yritys,
  reititys,
  laskelma,
  liitetiedot,
  hyvaksynta,
}: TilinpaatosPdfProps) {
  const t = laskelma.kuluva;
  const bs = laskelma.taseKuluva;
  const allekirjoittajat =
    liitetiedot.allekirjoittajat || hyvaksynta.hyvaksyja || "—";

  return (
    <Document
      title={`Tilinpäätös ${yritys.nimi || ""} ${reititys.tilikausiLoppu}`}
      author="Lavdesign Tilinpäätös & 6B-Apuri"
      language="fi"
    >
      {/* Kansilehti */}
      <Page size="A4" style={styles.page}>
        <View style={styles.cover}>
          <Text style={styles.brand}>Lavdesign Tilinpäätös</Text>
          <Text style={styles.title}>TILINPÄÄTÖS</Text>
          <Text style={styles.subtitle}>
            Mikroyrityksen PMA-tilinpäätös (KPL / PMA)
          </Text>
          <Text style={styles.meta}>{yritys.nimi || "[Yrityksen nimi]"}</Text>
          <Text style={styles.meta}>
            Y-tunnus: {yritys.yTunnus || "—"}
          </Text>
          <Text style={styles.meta}>
            Kotipaikka: {yritys.kotipaikka || "—"}
          </Text>
          <Text style={styles.meta}>
            Toimiala: {yritys.toimiala || "—"}
          </Text>
          <Text style={[styles.meta, { marginTop: 16 }]}>
            Tilikausi: {reititys.tilikausiAlku} – {reititys.tilikausiLoppu}
          </Text>
          <Text style={styles.note}>
            Luvut on laskettu deterministisellä TypeScript-moottorilla
            (PMA). Vastaavaa = Vastattavaa sentin tarkkuudella. Tämä
            asiakirja on muodostettu wizard-tilasta — ei LLM-lukuja.
          </Text>
          {bs.tasausEra > 0 && bs.tasausSelite ? (
            <Text style={[styles.note, { marginTop: 8 }]}>
              Huom: {bs.tasausSelite}
            </Text>
          ) : null}
        </View>
        <PageFooter yritys={yritys} page="Kansilehti" />
      </Page>

      {/* Tuloslaskelma */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.h1}>Tuloslaskelma</Text>
        <Text style={{ marginBottom: 12, color: "#6b7280" }}>
          {reititys.tilikausiAlku} – {reititys.tilikausiLoppu}
        </Text>
        <MoneyRows
          rows={[
            { label: "Liikevaihto", value: t.liikevaihto },
            { label: "Materiaalit ja palvelut", value: -t.materiaalitJaPalvelut },
            { label: "Henkilöstökulut", value: -t.henkilostokulut },
            { label: "Poistot ja arvonalentumiset", value: -t.poistot },
            {
              label: "Liiketoiminnan muut kulut",
              value: -t.liiketoiminnanMuutKulut,
            },
            { label: "Liiketulos", value: t.liiketulos, strong: true },
            { label: "Rahoitustuotot", value: t.rahoitustuotot },
            { label: "Rahoituskulut", value: -t.rahoituskulut },
            {
              label: "Tulos ennen tilinpäätössiirtoja ja veroja",
              value: t.tulosEnnenVeroja,
              strong: true,
            },
            { label: "Tuloverot", value: -t.verot },
            {
              label: "Tilikauden voitto (tappio)",
              value: t.tilikaudenTulos,
              strong: true,
            },
          ]}
        />
        <PageFooter yritys={yritys} page="Tuloslaskelma" />
      </Page>

      {/* Tase */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.h1}>Tase</Text>
        <Text style={{ marginBottom: 8, color: "#6b7280" }}>
          {reititys.tilikausiLoppu}
          {" · Vastaavaa = Vastattavaa"}
          {bs.tasausEra > 0
            ? ` · tasauserä ${euro(bs.tasausEra)}`
            : ""}
        </Text>

        <Text style={styles.h2}>Vastaavaa</Text>
        <MoneyRows
          rows={[
            {
              label: "Aineelliset hyödykkeet",
              value: bs.aineellisetHyodykkeet,
            },
            { label: "Vaihto-omaisuus", value: bs.vaihtoOmaisuus },
            { label: "Myyntisaamiset", value: bs.myyntisaamiset },
            {
              label:
                bs.tasausKohde === "muutSaamiset" && bs.tasausEra > 0
                  ? "Muut saamiset (sis. tasauserä)"
                  : "Muut saamiset",
              value: bs.muutSaamiset,
            },
            {
              label: "Rahat ja pankkisaamiset",
              value: bs.rahatJaPankkisaamiset,
            },
            {
              label: "Vastaavaa yhteensä",
              value: bs.vastaavaaYhteensa,
              strong: true,
            },
          ]}
        />

        <Text style={styles.h2}>Vastattavaa</Text>
        <MoneyRows
          rows={[
            { label: "Osakepääoma", value: bs.osakepaaoma },
            { label: "SVOP-rahasto", value: bs.svop },
            {
              label: "Edellisten tilikausien voitto (tappio)",
              value: bs.edellistenTilienVoitto,
            },
            { label: "Tilikauden voitto (tappio)", value: bs.tilikaudenTulos },
            { label: "Ostovelat", value: bs.ostovelat },
            { label: "Siirtovelat (sis. ALV)", value: bs.siirtovelat },
            {
              label:
                bs.tasausKohde === "muutVelat" && bs.tasausEra > 0
                  ? "Muut velat (sis. tasauserä)"
                  : "Muut velat",
              value: bs.muutVelat,
            },
            {
              label: "Vastattavaa yhteensä",
              value: bs.vastattavaaYhteensa,
              strong: true,
            },
          ]}
        />
        {bs.tasausSelite ? (
          <Text style={styles.note}>{bs.tasausSelite}</Text>
        ) : null}
        <PageFooter yritys={yritys} page="Tase" />
      </Page>

      {/* Allekirjoitukset */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.h1}>Allekirjoitukset</Text>
        <Text style={styles.meta}>
          Paikka ja aika: {yritys.kotipaikka || "—"},{" "}
          {hyvaksynta.hyvaksyttyPvm ||
            liitetiedot.hallituksenKokousPvm ||
            "____.__.______"}
        </Text>
        <Text style={[styles.meta, { marginTop: 8 }]}>
          Hallitus on tänään hyväksynyt oheisen tilinpäätöksen.
        </Text>

        {allekirjoittajat.split(",").map((name) => {
          const n = name.trim();
          if (!n) return null;
          return (
            <View key={n} style={styles.sigBox} wrap={false}>
              <View style={styles.sigLine} />
              <Text style={styles.sigCaption}>{n}</Text>
              <Text style={styles.sigCaption}>Hallituksen jäsen</Text>
            </View>
          );
        })}

        {liitetiedot.tilintarkastus ? (
          <View style={[styles.sigBox, { marginTop: 40 }]}>
            <Text style={{ fontWeight: 700, marginBottom: 8 }}>
              Tilintarkastajan merkintä
            </Text>
            <View style={styles.sigLine} />
            <Text style={styles.sigCaption}>Tilintarkastaja</Text>
          </View>
        ) : (
          <Text style={styles.note}>
            Tilintarkastus ei ole merkitty pakolliseksi / suoritetuksi tässä
            wizardissa.
          </Text>
        )}

        <Text style={styles.note}>
          Hyväksyjä: {hyvaksynta.hyvaksyja || "—"}
          {hyvaksynta.allekirjoitettu ? " · Allekirjoitettu wizardissa" : ""}
        </Text>
        <PageFooter yritys={yritys} page="Allekirjoitukset" />
      </Page>
    </Document>
  );
}
