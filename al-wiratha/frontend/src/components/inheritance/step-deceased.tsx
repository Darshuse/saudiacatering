'use client';
import { useWizardStore } from '@/store/wizard.store';
import { useState } from 'react';

export function StepDeceased() {
  const { deceasedIsMale, grossEstate, debts, funeralCosts, wasiyya,
          setDeceasedGender, setEstate, setStep } = useWizardStore();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const maxWasiyya = ((grossEstate - debts - funeralCosts) / 3);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!grossEstate || grossEstate <= 0) e.grossEstate = 'أدخل قيمة التركة';
    if (wasiyya > 0 && wasiyya > maxWasiyya)
      e.wasiyya = `الوصية تتجاوز الثلث (الحد: ${maxWasiyya.toLocaleString('ar-SA')} ر.س)`;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => { if (validate()) setStep('heirs'); };

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-primary mb-2">بيانات المتوفى</h2>
        <p className="text-gray-500 text-sm">تؤثر هذه البيانات على نصيب الزوج/الزوجة</p>
      </div>

      {/* Gender */}
      <div className="card mb-6">
        <label className="label">جنس المتوفى</label>
        <div className="flex gap-3">
          {[{ val: true, label: 'ذكر', icon: '👨' }, { val: false, label: 'أنثى', icon: '👩' }].map(({ val, label, icon }) => (
            <button
              key={String(val)}
              onClick={() => setDeceasedGender(val)}
              className={`flex-1 py-3 rounded-xl border-2 font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                deceasedIsMale === val
                  ? 'border-primary bg-primary text-white'
                  : 'border-gray-200 text-gray-600 hover:border-primary/40'
              }`}
            >
              <span>{icon}</span> {label}
            </button>
          ))}
        </div>
      </div>

      {/* Estate fields */}
      <div className="card space-y-5">
        <NumberField
          label="إجمالي التركة (ريال سعودي)"
          value={grossEstate}
          onChange={(v) => setEstate('grossEstate', v)}
          error={errors.grossEstate}
          required
          hint="القيمة الإجمالية لكل الأصول قبل الخصومات"
        />
        <NumberField
          label="الديون"
          value={debts}
          onChange={(v) => setEstate('debts', v)}
          hint="تُخصم قبل التوزيع"
        />
        <NumberField
          label="تكاليف الجنازة والتجهيز"
          value={funeralCosts}
          onChange={(v) => setEstate('funeralCosts', v)}
        />
        <NumberField
          label="الوصية"
          value={wasiyya}
          onChange={(v) => setEstate('wasiyya', v)}
          error={errors.wasiyya}
          hint={grossEstate > 0 ? `الحد الأقصى: ${maxWasiyya.toLocaleString('ar-SA')} ر.س (ثلث الباقي)` : ''}
        />

        {grossEstate > 0 && (
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
            <div className="text-sm text-gray-600">صافي التركة للتوزيع</div>
            <div className="text-2xl font-bold text-primary mt-1">
              {Math.max(0, grossEstate - debts - funeralCosts - wasiyya).toLocaleString('ar-SA')} ر.س
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-3 mt-6">
        <button onClick={() => setStep('madhhab')} className="flex-1 py-3 rounded-xl border-2 border-gray-200 font-semibold text-gray-600 hover:border-primary/40 transition-all">
          ← السابق
        </button>
        <button onClick={handleNext} className="flex-2 flex-grow btn-primary">
          التالي ←
        </button>
      </div>
    </div>
  );
}

function NumberField({
  label, value, onChange, error, hint, required,
}: {
  label: string; value: number; onChange: (v: number) => void;
  error?: string; hint?: string; required?: boolean;
}) {
  return (
    <div>
      <label className="label">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <input
          type="number"
          min="0"
          step="1000"
          value={value || ''}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          className={`input-field pe-16 ${error ? 'border-red-400 focus:ring-red-200' : ''}`}
          placeholder="0"
        />
        <span className="absolute top-1/2 -translate-y-1/2 left-4 text-gray-400 text-sm pointer-events-none">
          ر.س
        </span>
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      {hint && !error && <p className="text-gray-400 text-xs mt-1">{hint}</p>}
    </div>
  );
}
