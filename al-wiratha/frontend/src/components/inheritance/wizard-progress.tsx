'use client';
import { useWizardStore } from '@/store/wizard.store';
import { CheckCircle } from 'lucide-react';

const STEPS = [
  { id: 'madhhab',  label: 'المذهب' },
  { id: 'deceased', label: 'المتوفى' },
  { id: 'heirs',    label: 'الورثة' },
  { id: 'results',  label: 'النتيجة' },
] as const;

export function WizardProgress() {
  const { currentStep } = useWizardStore();
  const currentIndex = STEPS.findIndex((s) => s.id === currentStep);

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between relative">
        {/* Progress line */}
        <div className="absolute top-5 right-5 left-5 h-0.5 bg-gray-200 -z-10" />
        <div
          className="absolute top-5 right-5 h-0.5 bg-primary transition-all duration-500 -z-10"
          style={{ width: `${(currentIndex / (STEPS.length - 1)) * calc100}%` }}
        />

        {STEPS.map((step, i) => {
          const done    = i < currentIndex;
          const active  = i === currentIndex;
          return (
            <div key={step.id} className="flex flex-col items-center gap-2">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                  done
                    ? 'bg-primary text-white'
                    : active
                    ? 'bg-primary text-white ring-4 ring-primary/20'
                    : 'bg-white text-gray-400 border-2 border-gray-200'
                }`}
              >
                {done ? <CheckCircle className="w-5 h-5" /> : i + 1}
              </div>
              <span
                className={`text-xs font-medium ${
                  active ? 'text-primary' : done ? 'text-primary/70' : 'text-gray-400'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Small helper to avoid template-literal issues
const calc100 = 100;
