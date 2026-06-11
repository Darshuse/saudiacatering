'use client';
import { useWizardStore } from '@/store/wizard.store';
import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { HeirsInput } from '@/types/inheritance';

export function StepHeirs() {
  const { heirs, setHeir, setStep, madhhab, grossEstate,
          debts, funeralCosts, wasiyya, deceasedIsMale,
          setResult, setCalculating, setError } = useWizardStore();

  const [open, setOpen] = useState<Record<string, boolean>>({
    spouse: true, children: true, parents: true, grandparents: false,
    siblings: false, other: false,
  });

  const toggle = (key: string) => setOpen((s) => ({ ...s, [key]: !s[key] }));
  const num = (k: keyof HeirsInput) => heirs[k] as number;
  const bool = (k: keyof HeirsInput) => heirs[k] as boolean;

  const hasSon = num('sons') > 0;

  const handleCalculate = async () => {
    setCalculating(true);
    setError(null);
    try {
      const payload = {
        madhhab,
        deceasedIsMale,
        grossEstate,
        debts,
        funeralCosts,
        wasiyya,
        ...heirs,
      };
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1'}/inheritance/calculate`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'خطأ في الحساب');
      }
      const data = await res.json();
      setResult(data);
      setStep('results');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'حدث خطأ غير متوقع');
    } finally {
      setCalculating(false);
    }
  };

  return (
    <div className="animate-fade-in space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-primary mb-2">الورثة الأحياء</h2>
        <p className="text-gray-500 text-sm">أدخل عدد كل نوع من الورثة الأحياء وقت الوفاة</p>
      </div>

      {/* Spouses */}
      <Section title="الزوج / الزوجة" open={open.spouse} onToggle={() => toggle('spouse')}>
        {deceasedIsMale ? (
          <CounterRow label="عدد الزوجات" value={num('wives')} max={4}
            onChange={(v) => { setHeir('wives', v); setHeir('husbands', 0); }} />
        ) : (
          <ToggleRow label="يوجد زوج" value={bool('husbands') || num('husbands') > 0}
            onChange={(v) => { setHeir('husbands', v ? 1 : 0); setHeir('wives', 0); }} />
        )}
      </Section>

      {/* Children */}
      <Section title="الأبناء والبنات" open={open.children} onToggle={() => toggle('children')}>
        <CounterRow label="عدد الأبناء" value={num('sons')}
          onChange={(v) => setHeir('sons', v)} />
        <CounterRow label="عدد البنات" value={num('daughters')}
          onChange={(v) => setHeir('daughters', v)} />
        {!hasSon && (
          <>
            <CounterRow label="أبناء الابن (أحفاد)" value={num('sonsOfSon')}
              onChange={(v) => setHeir('sonsOfSon', v)} />
            <CounterRow label="بنات الابن (أحفاد)" value={num('daughtersOfSon')}
              onChange={(v) => setHeir('daughtersOfSon', v)} />
          </>
        )}
        {hasSon && (
          <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
            الابن يحجب أبناء الابن وبناته
          </p>
        )}
      </Section>

      {/* Parents */}
      <Section title="الوالدان" open={open.parents} onToggle={() => toggle('parents')}>
        <ToggleRow label="الأب حي" value={bool('fatherAlive')}
          onChange={(v) => setHeir('fatherAlive', v)} />
        <ToggleRow label="الأم حية" value={bool('motherAlive')}
          onChange={(v) => setHeir('motherAlive', v)} />
      </Section>

      {/* Grandparents */}
      <Section title="الأجداد والجدات" open={open.grandparents} onToggle={() => toggle('grandparents')}>
        {!bool('fatherAlive') && (
          <ToggleRow label="الجد لأب حي" value={bool('paternalGrandfatherAlive')}
            onChange={(v) => setHeir('paternalGrandfatherAlive', v)} />
        )}
        {!bool('motherAlive') && (
          <CounterRow label="عدد الجدات" value={num('paternalGrandmothers') + num('maternalGrandmothers')}
            max={2}
            onChange={(v) => {
              setHeir('paternalGrandmothers', v > 0 ? 1 : 0);
              setHeir('maternalGrandmothers', v > 1 ? 1 : 0);
            }} />
        )}
      </Section>

      {/* Siblings */}
      <Section title="الإخوة والأخوات" open={open.siblings} onToggle={() => toggle('siblings')}>
        {!bool('fatherAlive') && !hasSon && (
          <>
            <CounterRow label="إخوة أشقاء" value={num('fullBrothers')}
              onChange={(v) => setHeir('fullBrothers', v)} />
            <CounterRow label="أخوات شقيقات" value={num('fullSisters')}
              onChange={(v) => setHeir('fullSisters', v)} />
            <CounterRow label="إخوة لأب" value={num('paternalBrothers')}
              onChange={(v) => setHeir('paternalBrothers', v)} />
            <CounterRow label="أخوات لأب" value={num('paternalSisters')}
              onChange={(v) => setHeir('paternalSisters', v)} />
          </>
        )}
        {!hasSon && (
          <>
            <CounterRow label="إخوة لأم" value={num('maternalBrothers')}
              onChange={(v) => setHeir('maternalBrothers', v)} />
            <CounterRow label="أخوات لأم" value={num('maternalSisters')}
              onChange={(v) => setHeir('maternalSisters', v)} />
          </>
        )}
        {(hasSon || bool('fatherAlive')) && (
          <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
            {hasSon ? 'الابن يحجب الإخوة الأشقاء والإخوة لأب' : 'الأب يحجب الإخوة الأشقاء والإخوة لأب'}
          </p>
        )}
      </Section>

      {/* Other */}
      <Section title="الأعمام وأبناؤهم" open={open.other} onToggle={() => toggle('other')}>
        <CounterRow label="عدد الأعمام الأشقاء" value={num('fullPaternalUncles')}
          onChange={(v) => setHeir('fullPaternalUncles', v)} />
        <CounterRow label="عدد أبناء العم الشقيق" value={num('sonsOfFullPaternalUncle')}
          onChange={(v) => setHeir('sonsOfFullPaternalUncle', v)} />
      </Section>

      <div className="flex gap-3 pt-2">
        <button onClick={() => setStep('deceased')}
          className="flex-1 py-3 rounded-xl border-2 border-gray-200 font-semibold text-gray-600 hover:border-primary/40 transition-all">
          ← السابق
        </button>
        <button onClick={handleCalculate}
          className="flex-grow-[2] btn-primary">
          احسب التركة ⚖️
        </button>
      </div>
    </div>
  );
}

function Section({ title, open, onToggle, children }: {
  title: string; open: boolean; onToggle: () => void; children: React.ReactNode;
}) {
  return (
    <div className="card p-0 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-4 text-right font-semibold text-gray-800 hover:bg-gray-50 transition-colors"
      >
        <span>{title}</span>
        {open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>
      {open && <div className="px-5 pb-5 space-y-4">{children}</div>}
    </div>
  );
}

function CounterRow({ label, value, onChange, max = 99 }: {
  label: string; value: number; onChange: (v: number) => void; max?: number;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-700">{label}</span>
      <div className="flex items-center gap-3">
        <button onClick={() => onChange(Math.max(0, value - 1))}
          className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 font-bold text-lg leading-none transition-colors">
          −
        </button>
        <span className="w-8 text-center font-bold text-primary">{value}</span>
        <button onClick={() => onChange(Math.min(max, value + 1))}
          className="w-8 h-8 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary font-bold text-lg leading-none transition-colors">
          +
        </button>
      </div>
    </div>
  );
}

function ToggleRow({ label, value, onChange }: {
  label: string; value: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-700">{label}</span>
      <button
        onClick={() => onChange(!value)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
          value ? 'bg-primary' : 'bg-gray-200'
        }`}
      >
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${
          value ? 'translate-x-1' : 'translate-x-6'
        }`} />
      </button>
    </div>
  );
}
