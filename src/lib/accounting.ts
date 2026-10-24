/**
 * Deterministinen PMA-laskentamoottori.
 * Kaikki luvut TypeScript-aritmetiikasta — ei LLM-arvauksia.
 */
import type {
  Kayttoomaisuuserä,
  KirjanpitoRaportit,
  LaskelmaTulos,
  OmaPaaoma,
  Pankkitili,
  SaamisetVelat,
  Tase,
  Tuloslaskelma,
  VerotAlvPalkat,
} from "./types";

const PIENHANKINTA_RAJA = 1200;
const CENT = 100;

/** Pyöristä senteiksi (pankkipyöristys lähimpään). */
export function roundEuro(n: number): number {
  return Math.round((n + Number.EPSILON) * CENT) / CENT;
}

export function laskePoistot(
  erät: Kayttoomaisuuserä[],
  poistoProsentti: number,
): { poistotYhteensa: number; menojannosLoppu: number; varoitukset: string[] } {
  const varoitukset: string[] = [];
  let poistotYhteensa = 0;
  let menojannosLoppu = 0;

  for (const erä of erät) {
    if (erä.hankintahinta > 0 && erä.hankintahinta < PIENHANKINTA_RAJA && !erä.onPienhankinta) {
      varoitukset.push(
        `„${erä.nimi}” hankintahinta ${erä.hankintahinta.toFixed(2)} € on alle ${PIENHANKINTA_RAJA} € — harkitse pienhankintaa (KPL).`,
      );
    }
    if (erä.onPienhankinta) {
      poistotYhteensa = roundEuro(poistotYhteensa + erä.hankintahinta);
      continue;
    }
    const pohja = erä.menojannosAlku > 0 ? erä.menojannosAlku : erä.hankintahinta;
    const poisto = roundEuro(pohja * (poistoProsentti / 100));
    poistotYhteensa = roundEuro(poistotYhteensa + poisto);
    menojannosLoppu = roundEuro(menojannosLoppu + (pohja - poisto));
  }

  return { poistotYhteensa, menojannosLoppu, varoitukset };
}

function emptyTulos(): Tuloslaskelma {
  return {
    liikevaihto: 0,
    materiaalitJaPalvelut: 0,
    henkilostokulut: 0,
    poistot: 0,
    liiketoiminnanMuutKulut: 0,
    liiketulos: 0,
    rahoitustuotot: 0,
    rahoituskulut: 0,
    tulosEnnenVeroja: 0,
    verot: 0,
    tilikaudenTulos: 0,
  };
}

function buildTulos(
  kp: KirjanpitoRaportit,
  poistotOverride: number,
  verot: VerotAlvPalkat,
  nollatoiminta: boolean,
): Tuloslaskelma {
  if (nollatoiminta) {
    const t = emptyTulos();
    t.verot = roundEuro(verot.ennakkoverot > 0 ? -verot.ennakkoverot : 0);
    t.tulosEnnenVeroja = 0;
    t.tilikaudenTulos = roundEuro(t.verot);
    return t;
  }

  const liikevaihto = roundEuro(kp.liikevaihto);
  const materiaalitJaPalvelut = roundEuro(kp.materiaalitJaPalvelut);
  const henkilostokulut = roundEuro(
    kp.henkilostokulut > 0 ? kp.henkilostokulut : verot.palkatYhteensa,
  );
  const poistot = roundEuro(poistotOverride > 0 ? poistotOverride : kp.poistot);
  const liiketoiminnanMuutKulut = roundEuro(kp.liiketoiminnanMuutKulut);
  const liiketulos = roundEuro(
    liikevaihto - materiaalitJaPalvelut - henkilostokulut - poistot - liiketoiminnanMuutKulut,
  );
  const rahoitustuotot = roundEuro(kp.rahoitustuotot);
  const rahoituskulut = roundEuro(kp.rahoituskulut);
  const tulosEnnenVeroja = roundEuro(liiketulos + rahoitustuotot - rahoituskulut);
  const verotSumma = roundEuro(kp.verot > 0 ? kp.verot : Math.max(0, tulosEnnenVeroja) * 0.2);
  const tilikaudenTulos = roundEuro(tulosEnnenVeroja - verotSumma);

  return {
    liikevaihto,
    materiaalitJaPalvelut,
    henkilostokulut,
    poistot,
    liiketoiminnanMuutKulut,
    liiketulos,
    rahoitustuotot,
    rahoituskulut,
    tulosEnnenVeroja,
    verot: verotSumma,
    tilikaudenTulos,
  };
}

function buildTase(args: {
  menojannos: number;
  onVarastoa: boolean;
  saamiset: SaamisetVelat;
  pankit: Pankkitili[];
  omaPaaoma: OmaPaaoma;
  tilikaudenTulos: number;
  vaihtoOmaisuusEdellinen?: number;
}): Tase {
  const rahat = roundEuro(args.pankit.reduce((s, p) => s + p.loppusaldo, 0));
  const aineelliset = roundEuro(args.menojannos);
  const vaihtoOmaisuus = args.onVarastoa ? roundEuro(args.vaihtoOmaisuusEdellinen ?? 0) : 0;
  const myyntisaamiset = roundEuro(args.saamiset.myyntisaamiset);
  const muutSaamiset = roundEuro(
    args.saamiset.siirtosaamiset + args.saamiset.muutSaamiset,
  );

  const vastaavaaYhteensa = roundEuro(
    aineelliset + vaihtoOmaisuus + myyntisaamiset + muutSaamiset + rahat,
  );

  const osakepaaoma = roundEuro(args.omaPaaoma.osakepaaoma);
  const svop = roundEuro(args.omaPaaoma.svop);
  const edellisten = roundEuro(
    args.omaPaaoma.edellinenVoittoTappio - args.omaPaaoma.osingot,
  );
  const tilikaudenTulos = roundEuro(args.tilikaudenTulos);
  const ostovelat = roundEuro(args.saamiset.ostovelat);
  const siirtovelat = roundEuro(args.saamiset.siirtovelat);
  const muutVelat = roundEuro(args.saamiset.muutVelat);

  let vastattavaaYhteensa = roundEuro(
    osakepaaoma +
      svop +
      edellisten +
      tilikaudenTulos +
      ostovelat +
      siirtovelat +
      muutVelat,
  );

  // Jos tase ei täsmää (puuttuvaa dataa), erotus näkyy — ei peitetä automaattisesti.
  const erotus = roundEuro(vastaavaaYhteensa - vastattavaaYhteensa);
  const tasapainossa = Math.abs(erotus) < 0.005;

  return {
    aineellisetHyodykkeet: aineelliset,
    vaihtoOmaisuus,
    myyntisaamiset,
    muutSaamiset,
    rahatJaPankkisaamiset: rahat,
    vastaavaaYhteensa,
    osakepaaoma,
    svop,
    edellistenTilienVoitto: edellisten,
    tilikaudenTulos,
    ostovelat,
    siirtovelat,
    muutVelat,
    vastattavaaYhteensa,
    tasapainossa,
    erotus,
  };
}

export interface LaskentaInput {
  nollatoiminta: boolean;
  onVarastoa: boolean;
  kirjanpito: KirjanpitoRaportit;
  kayttoomaisuus: Kayttoomaisuuserä[];
  poistoProsentti: number;
  saamisetVelat: SaamisetVelat;
  pankit: Pankkitili[];
  omaPaaoma: OmaPaaoma;
  verot: VerotAlvPalkat;
  /** Edellisen tilikauden vertailuluvut (jatkava). */
  edellinen?: {
    tulos: Partial<Tuloslaskelma>;
    tase: Partial<Tase>;
  };
}

export function ajaLaskentamoottori(input: LaskentaInput): LaskelmaTulos {
  const varoitukset: string[] = [];

  const { poistotYhteensa, menojannosLoppu, varoitukset: poistoVar } = laskePoistot(
    input.kayttoomaisuus,
    input.poistoProsentti,
  );
  varoitukset.push(...poistoVar);

  for (const p of input.pankit) {
    const ero = roundEuro(p.loppusaldo - p.kirjanpidonSaldo);
    if (Math.abs(ero) >= 0.01) {
      varoitukset.push(
        `Pankkitili ${p.nimi || p.iban}: loppusaldo ja kirjanpito eroavat ${ero.toFixed(2)} €.`,
      );
    }
  }

  if (input.omaPaaoma.osakepaaoma + input.omaPaaoma.svop + input.omaPaaoma.edellinenVoittoTappio < 0) {
    varoitukset.push(
      "Oma pääoma on negatiivinen — tarkista OYL 20:23 § (rekisteröimismenettely) ja TVL 53a §.",
    );
  }

  const kuluva = buildTulos(
    input.kirjanpito,
    poistotYhteensa,
    input.verot,
    input.nollatoiminta,
  );

  const edellinenTulos: Tuloslaskelma = {
    ...emptyTulos(),
    ...input.edellinen?.tulos,
  };

  const taseKuluva = buildTase({
    menojannos: input.nollatoiminta ? 0 : menojannosLoppu,
    onVarastoa: input.onVarastoa,
    saamiset: input.saamisetVelat,
    pankit: input.pankit,
    omaPaaoma: { ...input.omaPaaoma, tilikaudenTulos: kuluva.tilikaudenTulos },
    tilikaudenTulos: kuluva.tilikaudenTulos,
  });

  if (!taseKuluva.tasapainossa) {
    varoitukset.push(
      `Tase ei täsmää: Vastaavaa − Vastattavaa = ${taseKuluva.erotus.toFixed(2)} €. Täydennä saamiset/velat tai omaa pääomaa.`,
    );
  }

  const taseEdellinen: Tase = {
    aineellisetHyodykkeet: 0,
    vaihtoOmaisuus: 0,
    myyntisaamiset: 0,
    muutSaamiset: 0,
    rahatJaPankkisaamiset: 0,
    vastaavaaYhteensa: 0,
    osakepaaoma: input.omaPaaoma.osakepaaoma,
    svop: input.omaPaaoma.svop,
    edellistenTilienVoitto: 0,
    tilikaudenTulos: edellinenTulos.tilikaudenTulos,
    ostovelat: 0,
    siirtovelat: 0,
    muutVelat: 0,
    vastattavaaYhteensa: 0,
    tasapainossa: true,
    erotus: 0,
    ...input.edellinen?.tase,
  };

  return {
    kuluva,
    edellinen: edellinenTulos,
    taseKuluva,
    taseEdellinen,
    varoitukset,
  };
}

/** Mapita laskelma Verohallinnon 6B-kenttiin (ydinjoukko). */
export function mapita6B(laskelma: LaskelmaTulos, omaPaaoma: OmaPaaoma, verot: VerotAlvPalkat) {
  const t = laskelma.kuluva;
  const bs = laskelma.taseKuluva;
  return [
    { koodi: "500", otsikko: "Liikevaihto", arvo: t.liikevaihto, lahde: "Tuloslaskelma" },
    {
      koodi: "505",
      otsikko: "Materiaalit ja palvelut",
      arvo: t.materiaalitJaPalvelut,
      lahde: "Tuloslaskelma",
    },
    {
      koodi: "510",
      otsikko: "Henkilöstökulut",
      arvo: t.henkilostokulut,
      lahde: "Tuloslaskelma",
    },
    { koodi: "520", otsikko: "Poistot", arvo: t.poistot, lahde: "Käyttöomaisuus" },
    {
      koodi: "530",
      otsikko: "Liiketoiminnan muut kulut",
      arvo: t.liiketoiminnanMuutKulut,
      lahde: "Tuloslaskelma",
    },
    {
      koodi: "550",
      otsikko: "Tilikauden tulos",
      arvo: t.tilikaudenTulos,
      lahde: "Laskentamoottori",
    },
    { koodi: "600", otsikko: "Osakepääoma", arvo: bs.osakepaaoma, lahde: "Oma pääoma" },
    { koodi: "605", otsikko: "SVOP-rahasto", arvo: bs.svop, lahde: "Oma pääoma" },
    {
      koodi: "610",
      otsikko: "Edellisten tilikausien voitto/tappio",
      arvo: bs.edellistenTilienVoitto,
      lahde: "Oma pääoma",
    },
    {
      koodi: "700",
      otsikko: "Vähennyskelvottomat kulut",
      arvo: verot.vahennyskelvottomat,
      lahde: "Verot",
    },
    {
      koodi: "710",
      otsikko: "Vahvistetut tappiot",
      arvo: verot.vahvistetutTappiot,
      lahde: "Verot",
    },
    {
      koodi: "720",
      otsikko: "Ennakkoverot",
      arvo: verot.ennakkoverot,
      lahde: "Verot",
    },
    {
      koodi: "800",
      otsikko: "Vastaavaa yhteensä",
      arvo: bs.vastaavaaYhteensa,
      lahde: "Tase",
    },
    {
      koodi: "810",
      otsikko: "Vastattavaa yhteensä",
      arvo: bs.vastattavaaYhteensa,
      lahde: "Tase",
    },
    {
      koodi: "900",
      otsikko: "OYL/TVL-varoitus (oma pääoma)",
      arvo:
        omaPaaoma.osakepaaoma + omaPaaoma.svop + omaPaaoma.edellinenVoittoTappio + t.tilikaudenTulos,
      lahde: "Oma pääoma",
    },
  ];
}

export { PIENHANKINTA_RAJA };
