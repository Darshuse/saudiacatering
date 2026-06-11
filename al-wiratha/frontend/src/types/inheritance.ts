export type Madhhab = 'HANAFI' | 'MALIKI' | 'SHAFII' | 'HANBALI';
export type WizardStep = 'madhhab' | 'deceased' | 'heirs' | 'results';

export interface FractionValue {
  numerator: number;
  denominator: number;
}

export interface HeirResult {
  heirType: string;
  arabicName: string;
  count: number;
  classification: string;
  sharePerHeir: FractionValue;
  totalGroupShare: FractionValue;
  percentage: number;
  monetaryAmount: number;
  fiqhExplanation: string;
  blockedBy?: string;
}

export interface InheritanceResult {
  madhhab: string;
  netEstate: number;
  aslAlMasala: number;
  awlApplied: boolean;
  raddApplied: boolean;
  awlFactor?: FractionValue;
  heirs: HeirResult[];
  blockedHeirs: HeirResult[];
  specialCaseNote?: string;
  disclaimer: string;
}

export interface HeirsInput {
  husbands: number;
  wives: number;
  sons: number;
  daughters: number;
  sonsOfSon: number;
  daughtersOfSon: number;
  fatherAlive: boolean;
  motherAlive: boolean;
  paternalGrandfatherAlive: boolean;
  paternalGrandmothers: number;
  maternalGrandmothers: number;
  fullBrothers: number;
  fullSisters: number;
  paternalBrothers: number;
  paternalSisters: number;
  maternalBrothers: number;
  maternalSisters: number;
  fullPaternalUncles: number;
  sonsOfFullPaternalUncle: number;
}
