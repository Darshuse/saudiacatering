'use client';
import { useWizardStore } from '@/store/wizard.store';
import type { Madhhab } from '@/types/inheritance';
import { CheckCircle } from 'lucide-react';

const MADHHABS: { id: Madhhab; name: string; note: string; flag: string }[] = [
  {
    id: 'HANBALI',
    name: 'الحنبلي',
    note: 'المذهب الرسمي للمحاكم السعودية',
    flag: '🇸🇦',
  },
  {
    id: 'HANAFI',
    name: 'الحنفي',
    note: 'أساس قانون المواريث المصري',
    flag: '🇪🇬',
  },
  {
    id: 'MALIKI',
    name: 'المالكي',
    note: 'السائد في شمال أفريقيا وغرب أفريقيا',
    flag: '🌍',
  },
  {
    id: 'SHAFII',
    name: 'الشافعي',
    note: 'السائد في جنوب شرق آسيا وشرق أفريقيا',
    flag: '🌏',
  },
];

export function StepMadhhab() {
  const { madhhab, setMadhhab, setStep } = useWizardStore();

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-primary mb-2">اختر المذهب الفقهي</h2>
        <p className="text-gray-500 text-sm">
          تختلف المذاهب في بعض المسائل — اختر المذهب المعمول به في بلدك أو الذي تريد التحسب وفقه
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {MADHHABS.map((m) => {
          const selected = madhhab === m.id;
          return (
            <button
              key={m.id}
              onClick={() => setMadhhab(m.id)}
              className={`relative text-right p-5 rounded-2xl border-2 transition-all duration-200 ${
                selected
                  ? 'border-primary bg-primary/5 shadow-sm'
                  : 'border-gray-200 bg-white hover:border-primary/40 hover:shadow-sm'
              }`}
            >
              {selected && (
                <CheckCircle className="absolute top-3 left-3 w-5 h-5 text-primary" />
              )}
              <div className="flex items-start gap-3">
                <span className="text-3xl">{m.flag}</span>
                <div>
                  <div className="text-lg font-bold text-gray-900">{m.name}</div>
                  <div className="text-xs text-gray-500 mt-1">{m.note}</div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <button
        disabled={!madhhab}
        onClick={() => setStep('deceased')}
        className="w-full btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
      >
        التالي ←
      </button>
    </div>
  );
}
