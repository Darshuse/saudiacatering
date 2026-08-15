"use client";
import { useState, useEffect, use } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatHalalas } from "@/lib/money";
import Link from "next/link";

interface Distribution { id: string; userId: string; amount: number; sharePercentage: number; status: string; paidAt?: string; paymentRef?: string; user: { id: string; name: string } }
interface RentalIncome { id: string; amount: number; period: string; date: string; description?: string; status: string; distributions: Distribution[] }
function formatDate(d: string) {
  return new Intl.DateTimeFormat("ar-SA", { year: "numeric", month: "long", day: "numeric" }).format(new Date(d));
}

export default function IncomePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [incomes, setIncomes] = useState<RentalIncome[]>([]);
  const [estateName, setEstateName] = useState("");
  const [myId, setMyId] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [form, setForm] = useState({ amount: "", period: "", date: new Date().toISOString().split("T")[0], description: "" });

  useEffect(() => {
    Promise.all([
      fetch(`/api/estates/${id}/income`).then((r) => r.json()),
      fetch(`/api/estates/${id}`).then((r) => r.json()),
      fetch(`/api/auth/me`).then((r) => r.json()),
    ]).then(([incData, estData, meData]) => {
      setIncomes(incData.incomes ?? []);
      setEstateName(estData.estate?.name ?? "");
      setMyId(meData.user?.id ?? "");
      setIsAdmin(!!meData.user?.id && estData.estate?.adminId === meData.user.id);
      setLoading(false);
    });
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const res = await fetch(`/api/estates/${id}/income`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: parseFloat(form.amount),
        period: form.period,
        date: form.date,
        description: form.description || undefined,
      }),
    });

    const data = await res.json();
    setSubmitting(false);

    if (!res.ok) { setError(data.error ?? "حدث خطأ"); return; }
    setForm({ amount: "", period: "", date: new Date().toISOString().split("T")[0], description: "" });

    const r = await fetch(`/api/estates/${id}/income`);
    const d = await r.json();
    setIncomes(d.incomes ?? []);
  }

  async function markPaid(distId: string, paid: boolean) {
    const res = await fetch(`/api/estates/${id}/distributions/${distId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paid }),
    });
    if (res.ok) {
      const r = await fetch(`/api/estates/${id}/income`);
      const d = await r.json();
      setIncomes(d.incomes ?? []);
    }
  }

  if (loading) return <div className="text-center py-12 text-gray-400">جاري التحميل...</div>;

  const totalIncome = incomes.reduce((s, i) => s + i.amount, 0);
  const myDists = incomes.flatMap((i) => i.distributions.filter((d) => d.userId === myId));
  const myDue = myDists.reduce((s, d) => s + d.amount, 0);
  const myPaid = myDists.filter((d) => d.status === "PAID").reduce((s, d) => s + d.amount, 0);

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <Link href={`/estates/${id}`} className="text-sm text-gray-500 hover:text-gray-700 block mb-2">← {estateName}</Link>
        <h1 className="text-2xl font-bold text-gray-900">الإيرادات والتوزيعات</h1>
        <p className="text-gray-500 mt-1">تسجيل إيرادات الإيجار وتوزيعها تلقائياً على الورثة</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-xl p-5">
          <p className="text-sm text-green-600 mb-1">إجمالي الإيرادات المسجلة</p>
          <p className="text-3xl font-bold text-green-800">{formatHalalas(totalIncome)}</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
          <p className="text-sm text-blue-600 mb-1">نصيبي: {formatHalalas(myDue)}</p>
          <p className="text-lg font-bold text-blue-800">
            استلمت {formatHalalas(myPaid)}
            {myDue - myPaid > 0 && <span className="text-amber-700"> — متبقٍ {formatHalalas(myDue - myPaid)}</span>}
          </p>
          <Link href="/statement" className="text-xs text-blue-600 hover:underline">كشف حسابي الكامل ←</Link>
        </div>
      </div>

      {/* Add form — admin only (API enforces this too) */}
      {isAdmin && (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">تسجيل إيراد جديد</h2>
        </div>
        <div className="px-6 py-5">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="المبلغ (ريال) *"
                type="number"
                min="1"
                value={form.amount}
                onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                placeholder="5000"
                required
              />
              <Input
                label="الفترة *"
                value={form.period}
                onChange={(e) => setForm((f) => ({ ...f, period: e.target.value }))}
                placeholder="يناير 2025"
                required
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="التاريخ *"
                type="date"
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                required
              />
              <Input
                label="ملاحظات"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="مثال: إيجار الطابق الأول"
              />
            </div>
            <Button type="submit" loading={submitting} className="w-full">
              💰 تسجيل الإيراد وتوزيعه تلقائياً
            </Button>
          </form>
        </div>
      </div>
      )}

      {/* Incomes list */}
      <div className="space-y-3">
        {incomes.map((income) => (
          <div key={income.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <button
              className="w-full px-6 py-4 flex items-center gap-4 text-right hover:bg-gray-50 transition-colors"
              onClick={() => setExpanded(expanded === income.id ? null : income.id)}
            >
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold text-gray-900">{income.period}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${income.status === "DISTRIBUTED" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                    {income.status === "DISTRIBUTED" ? "موزع" : "معلق"}
                  </span>
                </div>
                <p className="text-sm text-gray-400 mt-0.5">{formatDate(income.date)} {income.description ? `• ${income.description}` : ""}</p>
              </div>
              <div className="text-left">
                <p className="text-lg font-bold text-green-700">{formatHalalas(income.amount)}</p>
                <p className="text-xs text-gray-400">{income.distributions.length} توزيع</p>
              </div>
              <span className="text-gray-400">{expanded === income.id ? "▲" : "▼"}</span>
            </button>

            {expanded === income.id && income.distributions.length > 0 && (
              <div className="border-t border-gray-100 bg-gray-50 px-6 py-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">توزيع الإيراد على الورثة:</h4>
                <div className="space-y-2">
                  {income.distributions.map((d) => (
                    <div key={d.id} className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 text-xs flex items-center justify-center font-bold">
                          {d.user.name.charAt(0)}
                        </div>
                        <span className="text-sm text-gray-700">{d.user.name}</span>
                        <span className="text-xs text-gray-400">({d.sharePercentage.toFixed(1)}%)</span>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-gray-900">{formatHalalas(d.amount)}</span>
                        {d.status === "PAID" ? (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                            ✓ مدفوع {d.paidAt ? `— ${formatDate(d.paidAt)}` : ""}
                          </span>
                        ) : (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">معلق</span>
                        )}
                        {isAdmin && d.status !== "PAID" && (
                          <button
                            onClick={() => markPaid(d.id, true)}
                            className="text-xs font-bold bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg transition-colors"
                          >
                            ✓ تم التحويل
                          </button>
                        )}
                        {isAdmin && d.status === "PAID" && (
                          <button
                            onClick={() => markPaid(d.id, false)}
                            className="text-xs text-gray-400 hover:text-gray-600 px-1"
                            title="تراجع عن تأكيد الدفع"
                          >
                            تراجع
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}

        {incomes.length === 0 && (
          <div className="text-center py-12 text-gray-400 bg-white rounded-xl border border-gray-200">
            <p className="text-4xl mb-2">💰</p>
            <p>لا توجد إيرادات مسجلة بعد</p>
          </div>
        )}
      </div>
    </div>
  );
}
