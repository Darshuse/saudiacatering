'use client';
import { useWizardStore } from '@/store/wizard.store';
import { WizardProgress } from '@/components/inheritance/wizard-progress';
import { StepMadhhab } from '@/components/inheritance/step-madhhab';
import { StepDeceased } from '@/components/inheritance/step-deceased';
import { StepHeirs } from '@/components/inheritance/step-heirs';
import { StepResults } from '@/components/inheritance/step-results';

export default function InheritancePage() {
  const { currentStep } = useWizardStore();

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Header */}
      <div className="bg-primary px-6 pt-8 pb-6">
        <h1 className="text-white font-bold text-xl text-center">حاسبة المواريث الشرعية</h1>
        <p className="text-emerald-200 text-xs text-center mt-1">وفق أحكام المذاهب الأربعة</p>
      </div>

      <div className="max-w-xl mx-auto px-4 py-8">
        <WizardProgress />

        {currentStep === 'madhhab'  && <StepMadhhab />}
        {currentStep === 'deceased' && <StepDeceased />}
        {currentStep === 'heirs'    && <StepHeirs />}
        {currentStep === 'results'  && <StepResults />}
      </div>
    </div>
  );
}
