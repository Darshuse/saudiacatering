"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { calculateInheritance, getMadhabDifferences, MADHABS, type HeirInput, type InheritanceResult, type Madhab } from "@/lib/inheritance";

const DRAFT_KEY = "wiratha-calc-draft";

const defaultInput: HeirInput = {
  husbands: 0, wives: 0, sons: 0, daughters: 0,
  father: false, mother: false,
  grandfatherPaternal: false, grandmotherPaternal: false, grandmotherMaternal: false,
  fullBrothers: 0, fullSisters: 0,
  halfBrothersPaternal: 0, halfSistersPaternal: 0,
  halfBrothersMaternal: 0, halfSistersMaternal: 0,
  sonsOfSon: 0, daughtersOfSon: 0,
};

export function InheritanceCalculator({ variant }: { variant: "public" | "dashboard" }) {
  const [input, setInput] = useState<HeirInput>(defaultInput);
  const [estateValue, setEstateValue] = useState("");
  const [selectedMadhab, setSelectedMadhab] = useState<Madhab | "ALL">("ALL");
  const [results, setResults] = useState<InheritanceResult[] | null>(null);
  const [showDiffs, setShowDiffs] = useState(false);

  // Dashboard: restore a draft saved from the public calculator before signup.
  useEffect(() => {
    if (variant !== "dashboard") return;
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      localStorage.removeItem(DRAFT_KEY);
      const draft = JSON.parse(raw) as { input: HeirInput; estateValue: string; selectedMadhab: Madhab | "ALL" };
      setInput(draft.input);
      setEstateValue(draft.estateValue);
      setSelectedMadhab(draft.selectedMadhab);
      const value = draft.estateValue ? parseFloat(draft.estateValue) : undefined;
      const madhabs: Madhab[] = draft.selectedMadhab === "ALL" ? ["HANAFI", "MALIKI", "SHAFII", "HANBALI"] : [draft.selectedMadhab];
      setResults(madhabs.map((m) => calculateInheritance(draft.input, m, value)));
    } catch {
      // corrupt draft — ignore
    }
  }, [variant]);

  function setNum(field: keyof HeirInput, value: string) {
    setInput((prev) => ({ ...prev, [field]: parseInt(value) || 0 }));
  }
  function setBool(field: keyof HeirInput, value: boolean) {
    setInput((prev) => ({ ...prev, [field]: value }));
  }

  function calculate() {
    const value = estateValue ? parseFloat(estateValue) : undefined;
    const madhabs: Madhab[] = selectedMadhab === "ALL" ? ["HANAFI", "MALIKI", "SHAFII", "HANBALI"] : [selectedMadhab];
    const res = madhabs.map((m) => calculateInheritance(input, m, value));
    setResults(res);
  }

  function reset() {
    setInput(defaultInput);
    setEstateValue("");
    setResults(null);
  }

  function saveDraft() {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ input, estateValue, selectedMadhab }));
    } catch {
      // storage unavailable — signup still works, just without the draft
    }
  }

  const diffs = getMadhabDifferences();

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="bg-gradient-to-l from-blue-900 to-blue-700 text-white rounded-2xl p-6">
        <h1 className="text-2xl font-bold mb-1">⚖️ حاسبة المواريث الشرعية</h1>
        <p className="text-blue-200 text-sm">
          وفق المذاهب الأربعة — الحنفي والمالكي والشافعي والحنبلي
        </p>
        {variant === "public" && (
          <p className="text-blue-300 text-xs mt-2">
            🔒 يتم الحساب داخل متصفحك بالكامل — لا تُرسل بياناتك إلى أي خادم
          </p>
        )}
      </div>

      {/* Madhab selector */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <h2 className="font-bold text-gray-900 mb-4">اختر المذهب</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <button
            onClick={() => setSelectedMadhab("ALL")}
            className={`rounded-xl p-3 text-sm font-semibold border-2 transition-all ${selectedMadhab === "ALL" ? "border-blue-600 bg-blue-50 text-blue-800" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}
          >
            🔄 كل المذاهب
          </button>
          {MADHABS.map((m) => (
            <button
              key={m.value}
              onClick={() => setSelectedMadhab(m.value)}
              className={`rounded-xl p-3 text-sm font-semibold border-2 transition-all ${selectedMadhab === m.value ? "border-blue-600 bg-blue-50 text-blue-800" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}
            >
              {m.label}
              <span className="block text-xs font-normal text-gray-400 mt-0.5 truncate">{m.description.split("—")[0]}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Form */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h2 className="font-bold text-gray-900 mb-4">من ترك المتوفى؟</h2>

            {/* Estate value */}
            <div className="mb-5 p-3 bg-gray-50 rounded-lg">
              <label className="text-sm font-semibold text-gray-700 block mb-1.5">قيمة التركة (ريال) — اختياري</label>
              <input
                type="number"
                value={estateValue}
                onChange={(e) => setEstateValue(e.target.value)}
                placeholder="مثال: 1000000"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* Spouse */}
            <Section title="الزوج / الزوجة">
              <NumberField label="زوج" value={input.husbands} max={1} onChange={(v) => setNum("husbands", v)} />
              <NumberField label="زوجات" value={input.wives} max={4} onChange={(v) => setNum("wives", v)} />
            </Section>

            {/* Children */}
            <Section title="الأبناء والبنات">
              <NumberField label="أبناء ذكور" value={input.sons} onChange={(v) => setNum("sons", v)} />
              <NumberField label="بنات" value={input.daughters} onChange={(v) => setNum("daughters", v)} />
              <NumberField label="أبناء الابن" value={input.sonsOfSon} onChange={(v) => setNum("sonsOfSon", v)} />
              <NumberField label="بنات الابن" value={input.daughtersOfSon} onChange={(v) => setNum("daughtersOfSon", v)} />
            </Section>

            {/* Parents */}
            <Section title="الوالدان">
              <BoolField label="الأب" value={input.father} onChange={(v) => setBool("father", v)} />
              <BoolField label="الأم" value={input.mother} onChange={(v) => setBool("mother", v)} />
              <BoolField label="الجد لأب (أب الأب)" value={input.grandfatherPaternal} onChange={(v) => setBool("grandfatherPaternal", v)} />
              <BoolField label="الجدة لأب" value={input.grandmotherPaternal} onChange={(v) => setBool("grandmotherPaternal", v)} />
              <BoolField label="الجدة لأم" value={input.grandmotherMaternal} onChange={(v) => setBool("grandmotherMaternal", v)} />
            </Section>

            {/* Siblings */}
            <Section title="الإخوة والأخوات">
              <NumberField label="إخوة أشقاء" value={input.fullBrothers} onChange={(v) => setNum("fullBrothers", v)} />
              <NumberField label="أخوات شقيقات" value={input.fullSisters} onChange={(v) => setNum("fullSisters", v)} />
              <NumberField label="إخوة لأب" value={input.halfBrothersPaternal} onChange={(v) => setNum("halfBrothersPaternal", v)} />
              <NumberField label="أخوات لأب" value={input.halfSistersPaternal} onChange={(v) => setNum("halfSistersPaternal", v)} />
              <NumberField label="إخوة لأم" value={input.halfBrothersMaternal} onChange={(v) => setNum("halfBrothersMaternal", v)} />
              <NumberField label="أخوات لأم" value={input.halfSistersMaternal} onChange={(v) => setNum("halfSistersMaternal", v)} />
            </Section>

            <div className="flex gap-2 mt-5">
              <button
                onClick={calculate}
                className="flex-1 bg-blue-700 text-white py-3 rounded-xl font-bold text-sm hover:bg-blue-800 transition-colors shadow-sm"
              >
                احسب التوزيع ⚖️
              </button>
              <button
                onClick={reset}
                className="px-4 py-3 rounded-xl text-sm font-medium text-gray-600 border border-gray-300 hover:bg-gray-50"
              >
                إعادة
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-2 space-y-4">
          {!results ? (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center text-gray-400">
              <p className="text-5xl mb-3">⚖️</p>
              <p className="font-medium">أدخل بيانات الورثة ثم اضغط &quot;احسب التوزيع&quot;</p>
              <p className="text-sm mt-1">سيتم الحساب وفق أحكام الفقه الإسلامي</p>
            </div>
          ) : (
            <>
              {results.map((result) => <ResultCard key={result.madhab} result={result} />)}

              {/* Freemium hook — public variant only, after results appear */}
              {variant === "public" && (
                <div className="bg-gradient-to-l from-amber-500 to-amber-600 text-white rounded-2xl p-6 shadow-xl">
                  <h3 className="text-xl font-bold mb-1">احفظ النتيجة وابدأ إدارة التركة</h3>
                  <p className="text-amber-100 text-sm mb-4 leading-relaxed">
                    أنشئ حساباً مجانياً خلال دقيقة لحفظ هذه القسمة، وإضافة العقارات،
                    وتوزيع إيرادات الإيجار على الورثة تلقائياً بحسب أنصبتهم.
                  </p>
                  <div className="flex gap-3 flex-wrap">
                    <Link
                      href="/auth/register"
                      onClick={saveDraft}
                      className="bg-white text-amber-700 px-6 py-3 rounded-xl font-bold hover:bg-amber-50 transition-colors"
                    >
                      احفظ النتيجة وأنشئ التركة ←
                    </Link>
                    <button
                      onClick={() => window.print()}
                      className="border border-white/40 px-5 py-3 rounded-xl font-semibold hover:bg-white/10 transition-colors"
                    >
                      🖨️ اطبع النتيجة
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Madhab differences */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <button
          className="w-full px-6 py-4 flex items-center justify-between text-right font-bold text-gray-900 hover:bg-gray-50"
          onClick={() => setShowDiffs(!showDiffs)}
        >
          <span>📚 الفروق بين المذاهب في أحكام المواريث</span>
          <span>{showDiffs ? "▲" : "▼"}</span>
        </button>
        {showDiffs && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-t border-gray-100">
                  <th className="px-4 py-3 text-right font-semibold text-gray-700">المسألة</th>
                  <th className="px-4 py-3 text-right font-semibold text-blue-700">الحنفي</th>
                  <th className="px-4 py-3 text-right font-semibold text-green-700">المالكي</th>
                  <th className="px-4 py-3 text-right font-semibold text-purple-700">الشافعي</th>
                  <th className="px-4 py-3 text-right font-semibold text-orange-700">الحنبلي</th>
                </tr>
              </thead>
              <tbody>
                {diffs.map((d, i) => (
                  <tr key={i} className={`border-t border-gray-100 ${i % 2 === 0 ? "" : "bg-gray-50"}`}>
                    <td className="px-4 py-3 font-semibold text-gray-800">{d.topic}</td>
                    <td className="px-4 py-3 text-gray-600">{d.hanafi}</td>
                    <td className="px-4 py-3 text-gray-600">{d.maliki}</td>
                    <td className="px-4 py-3 text-gray-600">{d.shafii}</td>
                    <td className="px-4 py-3 text-gray-600">{d.hanbali}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Disclaimer */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
        <strong>⚠️ تنبيه هام:</strong> هذه الحاسبة للأغراض التعليمية والاستئناسية فقط. لا تُعتمد نتائجها في تقسيم التركات الفعلية دون الرجوع إلى قاضٍ شرعي أو عالم متخصص في الفرائض.
      </div>
    </div>
  );
}

function ResultCard({ result }: { result: InheritanceResult }) {
  const madhabColors: Record<string, string> = {
    HANAFI: "border-blue-300 bg-blue-50",
    MALIKI: "border-green-300 bg-green-50",
    SHAFII: "border-purple-300 bg-purple-50",
    HANBALI: "border-orange-300 bg-orange-50",
  };
  const headerColors: Record<string, string> = {
    HANAFI: "bg-blue-700",
    MALIKI: "bg-green-700",
    SHAFII: "bg-purple-700",
    HANBALI: "bg-orange-700",
  };

  return (
    <div className={`rounded-xl border-2 shadow-sm overflow-hidden ${madhabColors[result.madhab]}`}>
      <div className={`px-5 py-3 text-white ${headerColors[result.madhab]}`}>
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg">المذهب {result.madhabLabel}</h3>
          <div className="flex gap-2">
            {result.awl && <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full">عول</span>}
            {result.radd && <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full">رد</span>}
          </div>
        </div>
      </div>

      <div className="p-5">
        {result.heirs.length === 0 ? (
          <p className="text-gray-400 text-sm">لا يوجد ورثة</p>
        ) : (
          <div className="space-y-3">
            {result.heirs.map((heir, i) => (
              <div key={i} className="bg-white rounded-lg p-3 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="font-bold text-gray-900">{heir.nameAr}</span>
                    {heir.count > 1 && <span className="text-xs text-gray-400 mr-1">({heir.count} أشخاص)</span>}
                    <p className="text-xs text-gray-400 mt-0.5">{heir.basis.length > 60 ? heir.basis.substring(0, 60) + "..." : heir.basis}</p>
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-blue-700">{heir.fraction}</p>
                    <p className="text-xs text-gray-500">{heir.percentage.toFixed(2)}%</p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="h-1.5 bg-gray-100 rounded-full">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min(heir.percentage, 100)}%` }} />
                </div>

                {heir.totalAmount !== undefined && (
                  <div className="mt-2 flex justify-between text-xs text-gray-500">
                    <span>إجمالي النصيب: <strong className="text-green-700">{new Intl.NumberFormat("ar-SA", { style: "currency", currency: "SAR", minimumFractionDigits: 0 }).format(heir.totalAmount)}</strong></span>
                    {heir.count > 1 && heir.amountPerPerson && (
                      <span>للفرد: <strong>{new Intl.NumberFormat("ar-SA", { style: "currency", currency: "SAR", minimumFractionDigits: 0 }).format(heir.amountPerPerson)}</strong></span>
                    )}
                  </div>
                )}

                {heir.notes && <p className="text-xs text-amber-600 mt-1">⚠️ {heir.notes}</p>}
              </div>
            ))}
          </div>
        )}

        {/* Blocked heirs */}
        {result.blockedHeirs.length > 0 && (
          <div className="mt-4 bg-gray-100 rounded-lg p-3">
            <p className="text-xs font-semibold text-gray-600 mb-1">محجوبون في هذه المسألة:</p>
            {result.blockedHeirs.map((b, i) => (
              <p key={i} className="text-xs text-gray-500">• {b.name} — محجوب بـ{b.blockedBy}</p>
            ))}
          </div>
        )}

        {/* Notes */}
        {result.notes.length > 0 && (
          <div className="mt-3 space-y-1">
            {result.notes.map((n, i) => (
              <p key={i} className="text-xs text-amber-700 bg-amber-50 rounded px-2 py-1">📌 {n}</p>
            ))}
          </div>
        )}

        {result.awlDetails && (
          <p className="mt-2 text-xs text-red-600 bg-red-50 rounded px-2 py-1">⚖️ {result.awlDetails}</p>
        )}
        {result.raddDetails && (
          <p className="mt-2 text-xs text-green-600 bg-green-50 rounded px-2 py-1">↩️ {result.raddDetails}</p>
        )}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 border-b pb-1">{title}</h3>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function NumberField({ label, value, max = 10, onChange }: { label: string; value: number; max?: number; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center justify-between py-1">
      <label className="text-sm text-gray-600">{label}</label>
      <div className="flex items-center gap-1">
        <button onClick={() => onChange(String(Math.max(0, value - 1)))} className="w-6 h-6 rounded text-gray-600 hover:bg-gray-100 text-sm font-bold">−</button>
        <span className="w-8 text-center text-sm font-bold text-gray-900">{value}</span>
        <button onClick={() => onChange(String(Math.min(max, value + 1)))} className="w-6 h-6 rounded text-gray-600 hover:bg-gray-100 text-sm font-bold">+</button>
      </div>
    </div>
  );
}

function BoolField({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between py-1">
      <label className="text-sm text-gray-600">{label}</label>
      <button
        onClick={() => onChange(!value)}
        className={`w-10 h-6 rounded-full transition-colors ${value ? "bg-blue-600" : "bg-gray-200"} relative`}
      >
        <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${value ? "translate-x-0.5" : "translate-x-4"}`} />
      </button>
    </div>
  );
}
