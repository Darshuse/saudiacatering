'use client';
import { useWizardStore } from '@/store/wizard.store';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ChevronDown, ChevronUp, RotateCcw } from 'lucide-react';
import { useState } from 'react';

const COLORS = ['#0F4C3A','#C9A227','#16735A','#E3BB2C','#1A9470','#a77c11','#0d3d2f','#f5e7b3','#2d6b52','#b8911e'];

const CLASSIFICATION_LABELS: Record<string, string> = {
  SAHIB_FARD: 'صاحب فرض',
  ASABA: 'عاصب',
  SAHIB_FARD_AND_ASABA: 'فرض وعصبة',
  MAHJUB: 'محجوب',
};
const CLASSIFICATION_COLORS: Record<string, string> = {
  SAHIB_FARD: 'bg-blue-100 text-blue-700',
  ASABA: 'bg-emerald-100 text-emerald-700',
  SAHIB_FARD_AND_ASABA: 'bg-purple-100 text-purple-700',
  MAHJUB: 'bg-red-100 text-red-700',
};

function formatFraction(f?: { numerator: number; denominator: number }) {
  if (!f) return '—';
  if (f.denominator === 1) return String(f.numerator);
  return `${f.numerator}/${f.denominator}`;
}

export function StepResults() {
  const { result, reset, isCalculating, error } = useWizardStore();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  if (isCalculating) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        <p className="text-gray-500">جارٍ احتساب النصيب الشرعي…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <div className="text-5xl mb-4">⚠️</div>
        <p className="text-red-600 font-semibold mb-2">حدث خطأ</p>
        <p className="text-gray-500 text-sm mb-6">{error}</p>
        <button onClick={() => useWizardStore.getState().setStep('heirs')} className="btn-primary">
          ← الرجوع
        </button>
      </div>
    );
  }

  if (!result) return null;

  const pieData = result.heirs.map((h) => ({
    name: h.arabicName,
    value: parseFloat(h.percentage.toFixed(2)),
  }));

  return (
    <div className="animate-fade-in space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-primary mb-1">نتيجة التوزيع الشرعي</h2>
        <p className="text-gray-500 text-sm">وفق المذهب {result.madhhab === 'HANBALI' ? 'الحنبلي' : result.madhhab === 'HANAFI' ? 'الحنفي' : result.madhhab === 'MALIKI' ? 'المالكي' : 'الشافعي'}</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card text-center">
          <p className="text-xs text-gray-500 mb-1">صافي التركة</p>
          <p className="text-xl font-bold text-primary">
            {result.netEstate.toLocaleString('ar-SA')} ر.س
          </p>
        </div>
        <div className="card text-center">
          <p className="text-xs text-gray-500 mb-1">أصل المسألة</p>
          <p className="text-xl font-bold text-gray-800">{result.aslAlMasala}</p>
        </div>
      </div>

      {/* Special cases */}
      {(result.awlApplied || result.raddApplied || result.specialCaseNote) && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-1">
          {result.awlApplied && (
            <p className="text-amber-800 text-sm">⚠️ <strong>تمت العول:</strong> مجموع الفروض تجاوز التركة فخُفِّضت النصيب نسبياً</p>
          )}
          {result.raddApplied && (
            <p className="text-amber-800 text-sm">↩️ <strong>تم الرد:</strong> الفاضل رُدَّ على أصحاب الفروض</p>
          )}
          {result.specialCaseNote && (
            <p className="text-amber-800 text-sm">📌 {result.specialCaseNote}</p>
          )}
        </div>
      )}

      {/* Pie chart */}
      {pieData.length > 0 && (
        <div className="card">
          <h3 className="font-semibold text-gray-800 mb-4">توزيع التركة</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={90}
                dataKey="value" paddingAngle={2}>
                {pieData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v: number) => `${v.toFixed(2)}%`} />
              <Legend formatter={(v) => <span className="text-xs">{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Heirs table */}
      <div className="card p-0 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">الورثة وأنصبتهم</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {result.heirs.map((heir, i) => (
            <div key={i}>
              <div className="px-5 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-gray-900">{heir.arabicName}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${CLASSIFICATION_COLORS[heir.classification] || 'bg-gray-100 text-gray-600'}`}>
                        {CLASSIFICATION_LABELS[heir.classification] || heir.classification}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center gap-3 text-sm text-gray-600">
                      <span className="font-bold text-primary text-base">
                        {formatFraction(heir.totalGroupShare)}
                      </span>
                      <span className="text-gray-400">|</span>
                      <span>{heir.percentage.toFixed(1)}%</span>
                      <span className="text-gray-400">|</span>
                      <span className="font-semibold">
                        {heir.monetaryAmount.toLocaleString('ar-SA')} ر.س
                      </span>
                    </div>
                    {/* Progress bar */}
                    <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${heir.percentage}%`, backgroundColor: COLORS[i % COLORS.length] }}
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => setExpanded((s) => ({ ...s, [String(i)]: !s[String(i)] }))}
                    className="text-gray-400 hover:text-primary transition-colors mt-1"
                  >
                    {expanded[String(i)] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
                {expanded[String(i)] && heir.fiqhExplanation && (
                  <div className="mt-3 bg-primary/5 rounded-xl p-3 text-sm text-gray-700 leading-relaxed font-quran">
                    {heir.fiqhExplanation}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Blocked heirs */}
      {result.blockedHeirs.length > 0 && (
        <div className="card p-0 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 bg-red-50">
            <h3 className="font-semibold text-red-700">المحجوبون عن الإرث</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {result.blockedHeirs.map((h, i) => (
              <div key={i} className="px-5 py-3 flex items-center justify-between">
                <span className="text-gray-700">{h.arabicName}</span>
                <span className="text-xs text-red-500 bg-red-50 px-2 py-1 rounded-lg">
                  {h.blockedBy || 'محجوب'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="bg-amber-50 border border-amber-300 rounded-2xl p-5">
        <p className="text-amber-800 text-sm text-center leading-relaxed">
          ⚖️ <strong>تنبيه شرعي وقانوني:</strong> {result.disclaimer}
        </p>
      </div>

      {/* Actions */}
      <button onClick={reset}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-primary text-primary font-semibold hover:bg-primary hover:text-white transition-all duration-200">
        <RotateCcw className="w-4 h-4" />
        حسبة جديدة
      </button>
    </div>
  );
}
