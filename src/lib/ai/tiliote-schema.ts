import { z } from "zod";

/** Strukturoitu tulos tiliotteen AI-poiminnasta (ei kirjanpidon inventointia). */
export const tilioteExtractSchema = z.object({
  iban: z
    .string()
    .describe(
      "Tilin IBAN ilman välilyöntejä jos mahdollista, esim. FI2112345600000785. Tyhjä jos ei löydy.",
    ),
  loppusaldo: z
    .number()
    .describe(
      "Tilikauden päätöspäivän (tyypillisesti 31.12.) loppusaldo euroina. Käytä negatiivista jos tili on miinuksella. 0 jos ei löydy.",
    ),
  tilinNimi: z
    .string()
    .optional()
    .describe("Tilin tai tilinimen kuvaus jos dokumentissa mainittu."),
  paatospaiva: z
    .string()
    .optional()
    .describe("Päätöspäivä ISO-muodossa YYYY-MM-DD jos tunnistettavissa."),
  luottamus: z
    .enum(["korkea", "keskitaso", "matala"])
    .describe("Kuinka varma malli on poiminnasta."),
  huomautus: z
    .string()
    .optional()
    .describe("Lyhyt suomenkielinen huomautus jos tieto on epävarma tai puuttuu."),
});

export type TilioteExtract = z.infer<typeof tilioteExtractSchema>;

export const TILIOTE_SYSTEM_PROMPT = `Olet KLT-kirjanpitäjä. Etsi tästä tiliotteesta vain tilikauden päätöspäivän (31.12.) loppusaldo ja tilinumero (IBAN) ja palauta ne strukturoidussa JSON-muodossa.

Säännöt:
- Älä keksi lukuja. Jos IBAN tai loppusaldo ei näy tekstissä, palauta iban="" ja/tai loppusaldo=0 sekä luottamus="matala" ja lyhyt huomautus.
- Suosi nimenomaan tilikauden viimeisen päivän (31.12. tai dokumentin period end) saldoa, ei satunnaista päiväsaldia.
- IBAN suomalaisessa muodossa FI….
- Vastaa vain skeeman mukaisilla kentillä.`;
