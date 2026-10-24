"use client";

import { create } from "zustand";
import {
  ajaLaskentamoottori,
  buildLaskentaInputFromWizard,
  mapita6B,
} from "@/lib/accounting";
import { todayIso } from "@/lib/format";
import type {
  Hyvaksynta,
  Kayttoomaisuuserä,
  Kentta6B,
  KirjanpitoRaportit,
  LaskelmaTulos,
  Liitetiedot,
  OmaPaaoma,
  Pankkitili,
  Reitti,
  Reititys,
  SaamisetVelat,
  StepStatus,
  ThemeMode,
  Toimitus,
  UploadCategory,
  UploadedFileMeta,
  VerotAlvPalkat,
  WizardState,
  Yritys,
} from "@/lib/types";
import { STEP_COUNT } from "@/lib/types";
import type { TilioteExtract } from "@/lib/ai/tiliote-schema";
import { fileToUploadedMeta } from "@/lib/uploads";

function emptyStatuses(): StepStatus[] {
  return Array.from({ length: STEP_COUNT }, () => "ei_aloitettu");
}

function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

const initialYritys: Yritys = {
  yTunnus: "",
  nimi: "",
  kotipaikka: "",
  toimiala: "",
  perustamispaiva: "",
  onOsakeyhtio: null,
};

const initialReititys: Reititys = {
  onEnsimmainenTilikausi: null,
  onNollatoiminta: null,
  onPalkkoja: null,
  onVarastoa: null,
  tilikausiAlku: `${new Date().getFullYear()}-01-01`,
  tilikausiLoppu: `${new Date().getFullYear()}-12-31`,
};

const initialKirjanpito: KirjanpitoRaportit = {
  nollatoiminta: false,
  paakirjaLadattu: false,
  tuloslaskelmaLadattu: false,
  taseLadattu: false,
  edellinenTpLadattu: false,
  liikevaihto: 0,
  materiaalitJaPalvelut: 0,
  henkilostokulut: 0,
  poistot: 0,
  liiketoiminnanMuutKulut: 0,
  rahoitustuotot: 0,
  rahoituskulut: 0,
  verot: 0,
};

const initialSaamiset: SaamisetVelat = {
  myyntisaamiset: 0,
  ostovelat: 0,
  siirtosaamiset: 0,
  siirtovelat: 0,
  muutSaamiset: 0,
  muutVelat: 0,
};

const initialVerot: VerotAlvPalkat = {
  alvMyynnit: 0,
  alvOstot: 0,
  alvMaksettava: 0,
  ennakkoverot: 0,
  vahvistetutTappiot: 0,
  vahennyskelvottomat: 0,
  palkatYhteensa: 0,
};

const initialOmaPaaoma: OmaPaaoma = {
  osakepaaoma: 2500,
  svop: 0,
  edellinenVoittoTappio: 0,
  tilikaudenTulos: 0,
  osingot: 0,
  omatOsakkeet: 0,
};

const initialLiitteet: Liitetiedot = {
  henkilostoKeskimäärin: 0,
  palkatJaPalkkiot: 0,
  tilintarkastus: false,
  hallituksenKokousPvm: "",
  ykKokousPvm: "",
  allekirjoittajat: "",
};

const initialHyvaksynta: Hyvaksynta = {
  ristiintarkistusOk: false,
  allekirjoitettu: false,
  pdfValmis: false,
  hyvaksyja: "",
  hyvaksyttyPvm: "",
};

const initialToimitus: Toimitus = {
  ytjIlmoitettu: false,
  omaVeroLahetetty: false,
  arkistoLuotu: false,
  kuittausNumero: "",
  arkistoPolku: "",
};

function deriveReitti(r: Reititys): Reitti | null {
  if (r.onNollatoiminta === true) return "nolla";
  if (r.onEnsimmainenTilikausi === true) return "ensimmainen";
  if (r.onEnsimmainenTilikausi === false) return "jatkava";
  return null;
}

export function reittiLabel(r: Reitti | null): string {
  if (r === "ensimmainen") return "1. tilikausi";
  if (r === "jatkava") return "Jatkava tilikausi";
  if (r === "nolla") return "0-toiminta";
  return "—";
}

interface WizardActions {
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  setActiveStep: (step: number) => void;
  setStepStatus: (step: number, status: StepStatus) => void;
  markCollecting: (step: number) => void;
  markDone: (step: number) => void;
  patchYritys: (p: Partial<Yritys>) => void;
  patchReititys: (p: Partial<Reititys>) => void;
  patchKirjanpito: (p: Partial<KirjanpitoRaportit>) => void;
  setPankit: (pankit: Pankkitili[]) => void;
  addPankki: () => void;
  updatePankki: (id: string, p: Partial<Pankkitili>) => void;
  removePankki: (id: string) => void;
  patchSaamiset: (p: Partial<SaamisetVelat>) => void;
  setKayttoomaisuus: (items: Kayttoomaisuuserä[]) => void;
  addKayttoomaisuus: () => void;
  updateKayttoomaisuus: (id: string, p: Partial<Kayttoomaisuuserä>) => void;
  removeKayttoomaisuus: (id: string) => void;
  setPoistoProsentti: (n: number) => void;
  patchVerot: (p: Partial<VerotAlvPalkat>) => void;
  patchOmaPaaoma: (p: Partial<OmaPaaoma>) => void;
  runEngine: () => LaskelmaTulos;
  patchLiitetiedot: (p: Partial<Liitetiedot>) => void;
  patchHyvaksynta: (p: Partial<Hyvaksynta>) => void;
  setLomake6B: (rows: Kentta6B[]) => void;
  build6B: () => void;
  patchToimitus: (p: Partial<Toimitus>) => void;
  addUploadedFiles: (category: UploadCategory, files: File[]) => Promise<string | null>;
  removeUploadedFile: (id: string) => void;
  filesByCategory: (category: UploadCategory) => UploadedFileMeta[];
  /** Täyttää pankkitilin AI-poiminnan perusteella (IBAN + loppusaldo). */
  applyTilioteExtract: (data: TilioteExtract) => void;
  setPrhLataa: (v: boolean) => void;
  setPrhVirhe: (v: string | null) => void;
  getReitti: () => Reitti | null;
  getProgress: () => number;
}

export type WizardStore = WizardState & WizardActions;

export const useWizardStore = create<WizardStore>((set, get) => ({
  theme: "dark",
  activeStep: 0,
  stepStatuses: emptyStatuses(),
  yritys: initialYritys,
  reititys: initialReititys,
  kirjanpito: initialKirjanpito,
  pankit: [
    {
      id: uid(),
      nimi: "Käyttötili",
      iban: "",
      loppusaldo: 0,
      kirjanpidonSaldo: 0,
    },
  ],
  saamisetVelat: initialSaamiset,
  kayttoomaisuus: [],
  poistoProsentti: 25,
  verot: initialVerot,
  omaPaaoma: initialOmaPaaoma,
  laskelma: null,
  liitetiedot: initialLiitteet,
  hyvaksynta: initialHyvaksynta,
  lomake6B: [],
  toimitus: initialToimitus,
  uploadedFiles: [],
  prhLataa: false,
  prhVirhe: null,

  setTheme: (theme) => set({ theme }),
  toggleTheme: () =>
    set((s) => ({ theme: s.theme === "dark" ? "light" : "dark" })),

  setActiveStep: (step) =>
    set({ activeStep: Math.max(0, Math.min(STEP_COUNT - 1, step)) }),

  setStepStatus: (step, status) =>
    set((s) => {
      const stepStatuses = [...s.stepStatuses];
      stepStatuses[step] = status;
      return { stepStatuses };
    }),

  markCollecting: (step) => {
    const cur = get().stepStatuses[step];
    if (cur === "ei_aloitettu") get().setStepStatus(step, "tietoja_kerataan");
  },

  markDone: (step) => get().setStepStatus(step, "valmis"),

  patchYritys: (p) => {
    set((s) => ({ yritys: { ...s.yritys, ...p } }));
    get().markCollecting(1);
  },

  patchReititys: (p) => {
    set((s) => {
      const reititys = { ...s.reititys, ...p };
      const kirjanpito = { ...s.kirjanpito };
      if (p.onNollatoiminta === true) kirjanpito.nollatoiminta = true;
      if (p.onNollatoiminta === false) kirjanpito.nollatoiminta = false;
      return { reititys, kirjanpito };
    });
    get().markCollecting(0);
  },

  patchKirjanpito: (p) => {
    set((s) => ({ kirjanpito: { ...s.kirjanpito, ...p } }));
    get().markCollecting(2);
  },

  setPankit: (pankit) => set({ pankit }),
  addPankki: () => {
    set((s) => ({
      pankit: [
        ...s.pankit,
        { id: uid(), nimi: "", iban: "", loppusaldo: 0, kirjanpidonSaldo: 0 },
      ],
    }));
    get().markCollecting(3);
  },
  updatePankki: (id, p) => {
    set((s) => ({
      pankit: s.pankit.map((x) => (x.id === id ? { ...x, ...p } : x)),
    }));
    get().markCollecting(3);
  },
  removePankki: (id) =>
    set((s) => ({ pankit: s.pankit.filter((x) => x.id !== id) })),

  patchSaamiset: (p) => {
    set((s) => ({ saamisetVelat: { ...s.saamisetVelat, ...p } }));
    get().markCollecting(4);
  },

  setKayttoomaisuus: (items) => set({ kayttoomaisuus: items }),
  addKayttoomaisuus: () => {
    set((s) => ({
      kayttoomaisuus: [
        ...s.kayttoomaisuus,
        {
          id: uid(),
          nimi: "",
          hankintahinta: 0,
          menojannosAlku: 0,
          hankintapaiva: todayIso(),
          onPienhankinta: false,
        },
      ],
    }));
    get().markCollecting(5);
  },
  updateKayttoomaisuus: (id, p) => {
    set((s) => ({
      kayttoomaisuus: s.kayttoomaisuus.map((x) =>
        x.id === id ? { ...x, ...p } : x,
      ),
    }));
    get().markCollecting(5);
  },
  removeKayttoomaisuus: (id) =>
    set((s) => ({
      kayttoomaisuus: s.kayttoomaisuus.filter((x) => x.id !== id),
    })),

  setPoistoProsentti: (n) => {
    set({ poistoProsentti: n });
    get().markCollecting(5);
  },

  patchVerot: (p) => {
    set((s) => {
      const verot = { ...s.verot, ...p };
      if (p.alvMyynnit !== undefined || p.alvOstot !== undefined) {
        verot.alvMaksettava = Math.max(0, verot.alvMyynnit - verot.alvOstot);
      }
      return { verot };
    });
    get().markCollecting(6);
  },

  patchOmaPaaoma: (p) => {
    set((s) => ({ omaPaaoma: { ...s.omaPaaoma, ...p } }));
    get().markCollecting(7);
  },

  runEngine: () => {
    const s = get();
    const laskelma = ajaLaskentamoottori(buildLaskentaInputFromWizard(s));
    set({
      laskelma,
      omaPaaoma: {
        ...s.omaPaaoma,
        tilikaudenTulos: laskelma.kuluva.tilikaudenTulos,
      },
    });
    get().setStepStatus(8, "valmis");
    return laskelma;
  },

  patchLiitetiedot: (p) => {
    set((s) => ({ liitetiedot: { ...s.liitetiedot, ...p } }));
    get().markCollecting(9);
  },

  patchHyvaksynta: (p) => {
    set((s) => ({ hyvaksynta: { ...s.hyvaksynta, ...p } }));
    get().markCollecting(10);
  },

  setLomake6B: (rows) => set({ lomake6B: rows }),

  build6B: () => {
    const s = get();
    if (!s.laskelma) get().runEngine();
    const laskelma = get().laskelma;
    if (!laskelma) return;
    const rows = mapita6B(laskelma, get().omaPaaoma, get().verot);
    set({ lomake6B: rows });
    get().setStepStatus(11, "valmis");
  },

  patchToimitus: (p) => {
    set((s) => ({ toimitus: { ...s.toimitus, ...p } }));
    get().markCollecting(12);
  },

  addUploadedFiles: async (category, files) => {
    try {
      const metas: UploadedFileMeta[] = [];
      for (const f of files) {
        metas.push(await fileToUploadedMeta(f, category));
      }
      set((s) => ({ uploadedFiles: [...s.uploadedFiles, ...metas] }));

      // Synkkaa kirjanpito-/latausliput
      if (category === "paakirja") {
        get().patchKirjanpito({ paakirjaLadattu: true });
      } else if (category === "tuloslaskelma") {
        get().patchKirjanpito({ tuloslaskelmaLadattu: true });
      } else if (category === "tase") {
        get().patchKirjanpito({ taseLadattu: true });
      } else if (category === "edellinen_tp") {
        get().patchKirjanpito({ edellinenTpLadattu: true });
      } else if (category === "tiliote" || category === "kuitti") {
        get().markCollecting(3);
      }
      return null;
    } catch (e) {
      return e instanceof Error ? e.message : "Tiedoston lataus epäonnistui.";
    }
  },

  removeUploadedFile: (id) => {
    set((s) => {
      const removed = s.uploadedFiles.find((f) => f.id === id);
      const uploadedFiles = s.uploadedFiles.filter((f) => f.id !== id);
      const kirjanpito = { ...s.kirjanpito };
      if (removed) {
        const still = (c: UploadCategory) =>
          uploadedFiles.some((f) => f.category === c);
        if (removed.category === "paakirja" && !still("paakirja")) {
          kirjanpito.paakirjaLadattu = false;
        }
        if (removed.category === "tuloslaskelma" && !still("tuloslaskelma")) {
          kirjanpito.tuloslaskelmaLadattu = false;
        }
        if (removed.category === "tase" && !still("tase")) {
          kirjanpito.taseLadattu = false;
        }
        if (removed.category === "edellinen_tp" && !still("edellinen_tp")) {
          kirjanpito.edellinenTpLadattu = false;
        }
      }
      return { uploadedFiles, kirjanpito };
    });
  },

  filesByCategory: (category) =>
    get().uploadedFiles.filter((f) => f.category === category),

  applyTilioteExtract: (data) => {
    const iban = (data.iban || "").replace(/\s+/g, "").toUpperCase();
    const saldo = Number.isFinite(data.loppusaldo) ? data.loppusaldo : 0;
    const nimi = data.tilinNimi?.trim() || "";

    set((s) => {
      const pankit = [...s.pankit];
      const norm = (v: string) => v.replace(/\s+/g, "").toUpperCase();

      const byIban =
        iban.length > 0
          ? pankit.findIndex((p) => norm(p.iban) === iban)
          : -1;

      if (byIban >= 0) {
        const cur = pankit[byIban];
        pankit[byIban] = {
          ...cur,
          iban: iban || cur.iban,
          loppusaldo: saldo,
          kirjanpidonSaldo: saldo,
          nimi: nimi || cur.nimi,
        };
      } else {
        const emptyIdx = pankit.findIndex(
          (p) => !p.iban.trim() && p.loppusaldo === 0 && p.kirjanpidonSaldo === 0,
        );
        if (emptyIdx >= 0) {
          const cur = pankit[emptyIdx];
          pankit[emptyIdx] = {
            ...cur,
            iban,
            loppusaldo: saldo,
            kirjanpidonSaldo: saldo,
            nimi: nimi || cur.nimi || "Käyttötili",
          };
        } else {
          pankit.push({
            id: uid(),
            nimi: nimi || "Käyttötili (AI)",
            iban,
            loppusaldo: saldo,
            kirjanpidonSaldo: saldo,
          });
        }
      }

      return { pankit };
    });
    // AI-poiminta → pankkikentät syöttävät moottorille (vaihe 9) rahatJaPankkisaamiset.
    get().setStepStatus(3, "valmis");
    get().markCollecting(8);
  },

  setPrhLataa: (v) => set({ prhLataa: v }),
  setPrhVirhe: (v) => set({ prhVirhe: v }),

  getReitti: () => deriveReitti(get().reititys),

  getProgress: () => {
    const statuses = get().stepStatuses;
    const weights: Record<StepStatus, number> = {
      ei_aloitettu: 0,
      tietoja_kerataan: 0.35,
      valmis_aille: 0.6,
      tarkistettu: 0.85,
      valmis: 1,
    };
    const sum = statuses.reduce((acc, st) => acc + weights[st], 0);
    return Math.round((sum / STEP_COUNT) * 100);
  },
}));
