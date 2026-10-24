/** Lavdesign Tilinpäätös — jaetut tyypit (deterministinen malli). */

export type StepStatus =
  | "ei_aloitettu"
  | "tietoja_kerataan"
  | "valmis_aille"
  | "tarkistettu"
  | "valmis";

export type Reitti = "ensimmainen" | "jatkava" | "nolla";

export type ThemeMode = "dark" | "light";

export interface Yritys {
  yTunnus: string;
  nimi: string;
  kotipaikka: string;
  toimiala: string;
  perustamispaiva: string;
  onOsakeyhtio: boolean | null;
}

export interface Reititys {
  onEnsimmainenTilikausi: boolean | null;
  onNollatoiminta: boolean | null;
  onPalkkoja: boolean | null;
  onVarastoa: boolean | null;
  tilikausiAlku: string;
  tilikausiLoppu: string;
}

export interface KirjanpitoRaportit {
  nollatoiminta: boolean;
  paakirjaLadattu: boolean;
  tuloslaskelmaLadattu: boolean;
  taseLadattu: boolean;
  edellinenTpLadattu: boolean;
  liikevaihto: number;
  materiaalitJaPalvelut: number;
  henkilostokulut: number;
  poistot: number;
  liiketoiminnanMuutKulut: number;
  rahoitustuotot: number;
  rahoituskulut: number;
  verot: number;
}

export interface Pankkitili {
  id: string;
  nimi: string;
  iban: string;
  loppusaldo: number;
  kirjanpidonSaldo: number;
}

export interface SaamisetVelat {
  myyntisaamiset: number;
  ostovelat: number;
  siirtosaamiset: number;
  siirtovelat: number;
  muutSaamiset: number;
  muutVelat: number;
}

export interface Kayttoomaisuuserä {
  id: string;
  nimi: string;
  hankintahinta: number;
  menojannosAlku: number;
  hankintapaiva: string;
  onPienhankinta: boolean;
}

export interface VerotAlvPalkat {
  alvMyynnit: number;
  alvOstot: number;
  alvMaksettava: number;
  ennakkoverot: number;
  vahvistetutTappiot: number;
  vahennyskelvottomat: number;
  palkatYhteensa: number;
}

export interface OmaPaaoma {
  osakepaaoma: number;
  svop: number;
  edellinenVoittoTappio: number;
  tilikaudenTulos: number;
  osingot: number;
  omatOsakkeet: number;
}

export interface Tuloslaskelma {
  liikevaihto: number;
  materiaalitJaPalvelut: number;
  henkilostokulut: number;
  poistot: number;
  liiketoiminnanMuutKulut: number;
  liiketulos: number;
  rahoitustuotot: number;
  rahoituskulut: number;
  tulosEnnenVeroja: number;
  verot: number;
  tilikaudenTulos: number;
}

export interface Tase {
  /** Vastaavaa */
  aineellisetHyodykkeet: number;
  vaihtoOmaisuus: number;
  myyntisaamiset: number;
  muutSaamiset: number;
  rahatJaPankkisaamiset: number;
  vastaavaaYhteensa: number;
  /** Vastattavaa */
  osakepaaoma: number;
  svop: number;
  edellistenTilienVoitto: number;
  tilikaudenTulos: number;
  ostovelat: number;
  siirtovelat: number;
  muutVelat: number;
  vastattavaaYhteensa: number;
  tasapainossa: boolean;
  erotus: number;
}

export interface LaskelmaTulos {
  kuluva: Tuloslaskelma;
  edellinen: Tuloslaskelma;
  taseKuluva: Tase;
  taseEdellinen: Tase;
  varoitukset: string[];
}

export interface Liitetiedot {
  henkilostoKeskimäärin: number;
  palkatJaPalkkiot: number;
  tilintarkastus: boolean;
  hallituksenKokousPvm: string;
  ykKokousPvm: string;
  allekirjoittajat: string;
}

export interface Hyvaksynta {
  ristiintarkistusOk: boolean;
  allekirjoitettu: boolean;
  pdfValmis: boolean;
  hyvaksyja: string;
  hyvaksyttyPvm: string;
}

export interface Kentta6B {
  koodi: string;
  otsikko: string;
  arvo: number | string;
  lahde: string;
}

export interface Toimitus {
  ytjIlmoitettu: boolean;
  omaVeroLahetetty: boolean;
  arkistoLuotu: boolean;
  kuittausNumero: string;
  arkistoPolku: string;
}

export interface WizardState {
  theme: ThemeMode;
  activeStep: number;
  stepStatuses: StepStatus[];
  yritys: Yritys;
  reititys: Reititys;
  kirjanpito: KirjanpitoRaportit;
  pankit: Pankkitili[];
  saamisetVelat: SaamisetVelat;
  kayttoomaisuus: Kayttoomaisuuserä[];
  poistoProsentti: number;
  verot: VerotAlvPalkat;
  omaPaaoma: OmaPaaoma;
  laskelma: LaskelmaTulos | null;
  liitetiedot: Liitetiedot;
  hyvaksynta: Hyvaksynta;
  lomake6B: Kentta6B[];
  toimitus: Toimitus;
  prhLataa: boolean;
  prhVirhe: string | null;
}

export const STEP_COUNT = 13;

export const STEP_TITLES: string[] = [
  "Aloitustarkistus & Reititys",
  "Yrityksen perustiedot",
  "Kirjanpidon perusraportit",
  "Pankit ja rahoitus",
  "Avoimet saamiset, velat ja jaksotukset",
  "Käyttöomaisuus ja poistot",
  "Verot, ALV ja palkat",
  "Oma pääoma ja omistajatapahtumat",
  "Laskentamoottori",
  "Liitetiedot ja pöytäkirjat",
  "Tarkistus, hyväksyntä, allekirjoitus",
  "Veroilmoitus 6B -apuri",
  "Toimitus & arkistointi",
];
