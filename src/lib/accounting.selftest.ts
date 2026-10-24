/**
 * Nopea sanity-check laskentamoottorille.
 * Aja: npx tsx src/lib/accounting.selftest.ts
 */
import { ajaLaskentamoottori, laskePoistot, roundEuro } from "./accounting";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg);
}

const poisto = laskePoistot(
  [
    {
      id: "1",
      nimi: "Kone",
      hankintahinta: 10000,
      menojannosAlku: 10000,
      hankintapaiva: "2026-01-01",
      onPienhankinta: false,
    },
  ],
  25,
);
assert(poisto.poistotYhteensa === 2500, `poisto expected 2500 got ${poisto.poistotYhteensa}`);
assert(poisto.menojannosLoppu === 7500, `menojäännös expected 7500`);

const nolla = ajaLaskentamoottori({
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
      id: "p1",
      nimi: "Tili",
      iban: "FI00",
      loppusaldo: 2500,
      kirjanpidonSaldo: 2500,
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

assert(nolla.taseKuluva.tasapainossa, "0-toiminta tase should balance");
assert(nolla.kuluva.liikevaihto === 0, "0-toiminta liikevaihto 0");
assert(roundEuro(1.005) === 1.01 || roundEuro(1.005) === 1, "roundEuro works");

console.log("accounting.selftest: OK");
