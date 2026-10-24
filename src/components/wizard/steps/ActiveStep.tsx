"use client";

import { useWizardStore } from "@/store/wizard-store";
import { Step01Aloitus } from "./Step01Aloitus";
import { Step02Perustiedot } from "./Step02Perustiedot";
import { Step03Kirjanpito } from "./Step03Kirjanpito";
import { Step04Pankit } from "./Step04Pankit";
import { Step05Saamiset } from "./Step05Saamiset";
import { Step06Kayttoomaisuus } from "./Step06Kayttoomaisuus";
import { Step07Verot } from "./Step07Verot";
import { Step08OmaPaaoma } from "./Step08OmaPaaoma";
import { Step09Laskenta } from "./Step09Laskenta";
import { Step10Liitetiedot } from "./Step10Liitetiedot";
import { Step11Hyvaksynta } from "./Step11Hyvaksynta";
import { Step12KuusiB } from "./Step12KuusiB";
import { Step13Toimitus } from "./Step13Toimitus";

const STEPS = [
  Step01Aloitus,
  Step02Perustiedot,
  Step03Kirjanpito,
  Step04Pankit,
  Step05Saamiset,
  Step06Kayttoomaisuus,
  Step07Verot,
  Step08OmaPaaoma,
  Step09Laskenta,
  Step10Liitetiedot,
  Step11Hyvaksynta,
  Step12KuusiB,
  Step13Toimitus,
] as const;

export function ActiveStep() {
  const activeStep = useWizardStore((s) => s.activeStep);
  const Comp = STEPS[activeStep] ?? Step01Aloitus;
  return <Comp />;
}
