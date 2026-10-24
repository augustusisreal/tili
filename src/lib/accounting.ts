/**
 * Deterministinen PMA-laskentamoottori.
 * Kaikki luvut TypeScript-aritmetiikasta — ei LLM-arvauksia.
 *
 * Taseen turvallisuussääntö: Vastaavaa === Vastattavaa sentin tarkkuudella.
 * Jos wizard-data ei täsmää, erotus kirjataan dokumentoituun tasauserään
 * (`muutSaamiset` tai `muutVelat`) — ei piiloteta.
 */
import type {
  Kayttoomaisuuserä,
  KirjanpitoRaportit,
  LaskelmaTulos,
  OmaPaaoma,
  Pankkitili,
  Reititys,
  SaamisetVelat,
  Tase,
  Tuloslaskelma,
  VerotAlvPalkat,
} from "./types";

const PIENHANKINTA_RAJA = 1200;
const CENT = 100;

/** Euro → sentit (kokonaisluku). */
export function toCents(n: number): number {
  return Math.round((n + Number.EPSILON) * CENT);
}

/** Sentit → euro. */
export function fromCents(c: number): number {
  return c / CENT;
}

/** Pyöristä senteiksi (pankkipyöristys lähimpään). */
export function roundEuro(n: number): number {
  return fromCents(toCents(n));
}

export function laskePoistot(
  erät: Kayttoomaisuuserä[],
  poistoProsentti: number,
): { poistotYhteensa: number; menojannosLoppu: number; varoitukset: string[] } {
  const varoitukset: string[] = [];
  let poistotC = 0;
  let menojannosC = 0;

  for (const erä of erät) {
    if (erä.hankintahinta > 0 && erä.hankintahinta < PIENHANKINTA_RAJA && !erä.onPienhankinta) {
      varoitukset.push(
        `„${erä.nimi}” hankintahinta ${erä.hankintahinta.toFixed(2)} € on alle ${PIENHANKINTA_RAJA} € — harkitse pienhankintaa (KPL).`,
      );
    }
    if (erä.onPienhankinta) {
      poistotC += toCents(erä.hankintahinta);
      continue;
    }
    const pohja = erä.menojannosAlku > 0 ? erä.menojannosAlku : erä.hankintahinta;
    const poisto = roundEuro(pohja * (poistoProsentti / 100));
    poistotC += toCents(poisto);
    menojannosC += toCents(pohja) - toCents(poisto);
  }

  return {
    poistotYhteensa: fromCents(poistotC),
    menojannosLoppu: fromCents(menojannosC),
    varoitukset,
  };
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

function emptyTase(): Tase {
  return {
    aineellisetHyodykkeet: 0,
    vaihtoOmaisuus: 0,
    myyntisaamiset: 0,
    muutSaamiset: 0,
    rahatJaPankkisaamiset: 0,
    vastaavaaYhteensa: 0,
    osakepaaoma: 0,
    svop: 0,
    edellistenTilienVoitto: 0,
    tilikaudenTulos: 0,
    ostovelat: 0,
    siirtovelat: 0,
    muutVelat: 0,
    vastattavaaYhteensa: 0,
    tasapainossa: true,
    erotus: 0,
    tasausEra: 0,
    tasausKohde: null,
    tasausSelite: null,
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
    // 0-toiminta: ei liiketoimintaa; ennakkoverojen palautus ei inventoida tulokseen.
    t.verot = 0;
    t.tulosEnnenVeroja = 0;
    t.tilikaudenTulos = 0;
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

  // Verot: käytä kirjanpidon veroa, muuten 20 % yhteisövero positiivisesta tuloksesta.
  // Vähennyskelvottomat eivät muuta kirjanpidon tulosta tässä PMA-näkymässä (ne menevät 6B:lle).
  let verotSumma: number;
  if (kp.verot !== 0) {
    verotSumma = roundEuro(kp.verot);
  } else if (tulosEnnenVeroja > 0) {
    verotSumma = roundEuro(tulosEnnenVeroja * 0.2);
  } else {
    verotSumma = 0;
  }

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
  verot: VerotAlvPalkat;
  vaihtoOmaisuusEdellinen?: number;
}): { tase: Tase; varoitukset: string[] } {
  const varoitukset: string[] = [];

  const aineellisetC = toCents(args.menojannos);
  const vaihtoC = args.onVarastoa
    ? toCents(args.vaihtoOmaisuusEdellinen ?? 0)
    : 0;
  const myyntiC = toCents(args.saamiset.myyntisaamiset);
  // Ennakkoverot = saaminen Verohallinnolta (siirtosaaminen)
  const muutSaamisetC =
    toCents(args.saamiset.siirtosaamiset) +
    toCents(args.saamiset.muutSaamiset) +
    toCents(args.verot.ennakkoverot);
  const rahatC = args.pankit.reduce((s, p) => s + toCents(p.loppusaldo), 0);

  let vastaavaaC =
    aineellisetC + vaihtoC + myyntiC + muutSaamisetC + rahatC;

  const osakeC = toCents(args.omaPaaoma.osakepaaoma);
  const svopC = toCents(args.omaPaaoma.svop);
  const edellistenC = toCents(
    args.omaPaaoma.edellinenVoittoTappio - args.omaPaaoma.osingot,
  );
  const tulosC = toCents(args.tilikaudenTulos);
  const ostoC = toCents(args.saamiset.ostovelat);
  // ALV-maksettava + kirjatut siirtovelat
  const siirtoVelatC =
    toCents(args.saamiset.siirtovelat) + toCents(args.verot.alvMaksettava);
  let muutVelatC = toCents(args.saamiset.muutVelat);

  let vastattavaaC =
    osakeC + svopC + edellistenC + tulosC + ostoC + siirtoVelatC + muutVelatC;

  const erotusC = vastaavaaC - vastattavaaC;
  let tasausEra = 0;
  let tasausKohde: Tase["tasausKohde"] = null;
  let tasausSelite: string | null = null;
  let muutSaamisetFinalC = muutSaamisetC;

  if (erotusC !== 0) {
    // Deterministinen tasauserä: dokumentoitu riville, jotta Vastaavaa === Vastattavaa.
    if (erotusC > 0) {
      // Liikaa vastaavaa → tasaus vastattaviin (muut velat)
      tasausEra = fromCents(erotusC);
      tasausKohde = "muutVelat";
      tasausSelite =
        "Automaattinen tasauserä (muut velat): wizard-datan Vastaavaa > Vastattavaa. Täydennä saamiset/velat poistaaksesi erän.";
      muutVelatC += erotusC;
      vastattavaaC += erotusC;
    } else {
      // Liikaa vastattavaa → tasaus vastaaviin (muut saamiset)
      const abs = -erotusC;
      tasausEra = fromCents(abs);
      tasausKohde = "muutSaamiset";
      tasausSelite =
        "Automaattinen tasauserä (muut saamiset): wizard-datan Vastattavaa > Vastaavaa. Täydennä saamiset/velat poistaaksesi erän.";
      muutSaamisetFinalC += abs;
      vastaavaaC += abs;
    }
    varoitukset.push(tasausSelite);
  }

  // Turvallisuustarkistus sentteinä
  if (vastaavaaC !== vastattavaaC) {
    throw new Error(
      `Taselaskenta epäonnistui: Vastaavaa ${vastaavaaC} ≠ Vastattavaa ${vastattavaaC} senttiä.`,
    );
  }

  const tase: Tase = {
    aineellisetHyodykkeet: fromCents(aineellisetC),
    vaihtoOmaisuus: fromCents(vaihtoC),
    myyntisaamiset: fromCents(myyntiC),
    muutSaamiset: fromCents(muutSaamisetFinalC),
    rahatJaPankkisaamiset: fromCents(rahatC),
    vastaavaaYhteensa: fromCents(vastaavaaC),
    osakepaaoma: fromCents(osakeC),
    svop: fromCents(svopC),
    edellistenTilienVoitto: fromCents(edellistenC),
    tilikaudenTulos: fromCents(tulosC),
    ostovelat: fromCents(ostoC),
    siirtovelat: fromCents(siirtoVelatC),
    muutVelat: fromCents(muutVelatC),
    vastattavaaYhteensa: fromCents(vastattavaaC),
    tasapainossa: true,
    erotus: fromCents(erotusC),
    tasausEra,
    tasausKohde,
    tasausSelite,
  };

  return { tase, varoitukset };
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

/** Rakenna moottorin syöte wizard-tilasta (vaiheet 3–8). */
export function buildLaskentaInputFromWizard(state: {
  reititys: Reititys;
  kirjanpito: KirjanpitoRaportit;
  kayttoomaisuus: Kayttoomaisuuserä[];
  poistoProsentti: number;
  saamisetVelat: SaamisetVelat;
  pankit: Pankkitili[];
  omaPaaoma: OmaPaaoma;
  verot: VerotAlvPalkat;
}): LaskentaInput {
  return {
    nollatoiminta:
      state.reititys.onNollatoiminta === true || state.kirjanpito.nollatoiminta,
    onVarastoa: state.reititys.onVarastoa === true,
    kirjanpito: state.kirjanpito,
    kayttoomaisuus: state.kayttoomaisuus,
    poistoProsentti: state.poistoProsentti,
    saamisetVelat: state.saamisetVelat,
    pankit: state.pankit,
    omaPaaoma: state.omaPaaoma,
    verot: state.verot,
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

  const omaPaaomaSumma =
    input.omaPaaoma.osakepaaoma +
    input.omaPaaoma.svop +
    input.omaPaaoma.edellinenVoittoTappio;
  if (omaPaaomaSumma < 0) {
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

  const { tase: taseKuluva, varoitukset: taseVar } = buildTase({
    menojannos: input.nollatoiminta ? 0 : menojannosLoppu,
    onVarastoa: input.onVarastoa,
    saamiset: input.saamisetVelat,
    pankit: input.pankit,
    omaPaaoma: { ...input.omaPaaoma, tilikaudenTulos: kuluva.tilikaudenTulos },
    tilikaudenTulos: kuluva.tilikaudenTulos,
    verot: input.verot,
  });
  varoitukset.push(...taseVar);

  const taseEdellinen: Tase = {
    ...emptyTase(),
    osakepaaoma: roundEuro(input.omaPaaoma.osakepaaoma),
    svop: roundEuro(input.omaPaaoma.svop),
    tilikaudenTulos: edellinenTulos.tilikaudenTulos,
    ...input.edellinen?.tase,
    tasapainossa: true,
    erotus: 0,
    tasausEra: input.edellinen?.tase?.tasausEra ?? 0,
    tasausKohde: input.edellinen?.tase?.tasausKohde ?? null,
    tasausSelite: input.edellinen?.tase?.tasausSelite ?? null,
  };

  const pankkiYhteensa = roundEuro(
    input.pankit.reduce((s, p) => s + p.loppusaldo, 0),
  );

  return {
    kuluva,
    edellinen: edellinenTulos,
    taseKuluva,
    taseEdellinen,
    varoitukset,
    inputYhteenveto: {
      nollatoiminta: input.nollatoiminta,
      poistotLasketut: poistotYhteensa,
      menojannosLoppu,
      pankkiYhteensa,
    },
  };
}

/** Mapita laskelma Verohallinnon 6B-kenttiin (ydinjoukko). */
export function mapita6B(
  laskelma: LaskelmaTulos,
  omaPaaoma: OmaPaaoma,
  verot: VerotAlvPalkat,
) {
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
        omaPaaoma.osakepaaoma +
        omaPaaoma.svop +
        omaPaaoma.edellinenVoittoTappio +
        t.tilikaudenTulos,
      lahde: "Oma pääoma",
    },
  ];
}

export { PIENHANKINTA_RAJA, emptyTulos, emptyTase };
