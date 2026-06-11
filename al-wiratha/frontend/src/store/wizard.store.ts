'use client';
import { create } from 'zustand';
import type { Madhhab, WizardStep, HeirsInput, InheritanceResult } from '@/types/inheritance';

interface WizardState {
  currentStep: WizardStep;
  madhhab: Madhhab | null;
  deceasedIsMale: boolean;
  grossEstate: number;
  debts: number;
  funeralCosts: number;
  wasiyya: number;
  heirs: HeirsInput;
  result: InheritanceResult | null;
  isCalculating: boolean;
  error: string | null;

  setMadhhab: (m: Madhhab) => void;
  setDeceasedGender: (isMale: boolean) => void;
  setEstate: (field: 'grossEstate' | 'debts' | 'funeralCosts' | 'wasiyya', value: number) => void;
  setHeir: (key: keyof HeirsInput, value: number | boolean) => void;
  setResult: (r: InheritanceResult | null) => void;
  setStep: (s: WizardStep) => void;
  setCalculating: (v: boolean) => void;
  setError: (e: string | null) => void;
  reset: () => void;
}

const initialHeirs: HeirsInput = {
  husbands: 0, wives: 0, sons: 0, daughters: 0,
  sonsOfSon: 0, daughtersOfSon: 0,
  fatherAlive: false, motherAlive: false,
  paternalGrandfatherAlive: false,
  paternalGrandmothers: 0, maternalGrandmothers: 0,
  fullBrothers: 0, fullSisters: 0,
  paternalBrothers: 0, paternalSisters: 0,
  maternalBrothers: 0, maternalSisters: 0,
  fullPaternalUncles: 0, sonsOfFullPaternalUncle: 0,
};

export const useWizardStore = create<WizardState>((set) => ({
  currentStep: 'madhhab',
  madhhab: null,
  deceasedIsMale: true,
  grossEstate: 0,
  debts: 0,
  funeralCosts: 0,
  wasiyya: 0,
  heirs: { ...initialHeirs },
  result: null,
  isCalculating: false,
  error: null,

  setMadhhab: (m) => set({ madhhab: m }),
  setDeceasedGender: (isMale) => set({ deceasedIsMale: isMale }),
  setEstate: (field, value) => set({ [field]: value }),
  setHeir: (key, value) =>
    set((s) => ({ heirs: { ...s.heirs, [key]: value } })),
  setResult: (r) => set({ result: r }),
  setStep: (s) => set({ currentStep: s }),
  setCalculating: (v) => set({ isCalculating: v }),
  setError: (e) => set({ error: e }),
  reset: () =>
    set({
      currentStep: 'madhhab',
      madhhab: null,
      deceasedIsMale: true,
      grossEstate: 0, debts: 0, funeralCosts: 0, wasiyya: 0,
      heirs: { ...initialHeirs },
      result: null,
      error: null,
    }),
}));
